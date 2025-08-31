const express = require('express');
const router = express.Router();
const axios = require('axios');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { queryApi } = require('../services/influxClient');

// Resolve env var names across INFLUXDB_* and INFLUX_* prefixes
const INFLUX_URL = process.env.INFLUXDB_URL || process.env.INFLUX_URL;
const INFLUX_ORG = process.env.INFLUXDB_ORG || process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
const INFLUX_TOKEN = process.env.INFLUXDB_TOKEN || process.env.INFLUX_TOKEN;

// ---- Influx write client (server-side only; do not expose token to browser) ----
const influx = new InfluxDB({
  url: INFLUX_URL,
  token: INFLUX_TOKEN
});
const writeApi = influx.getWriteApi(
  INFLUX_ORG,
  INFLUX_BUCKET,
  'ns' // precision
);

// ---- Grafana HTTP client (token optional if anonymous viewer is enabled) ----
const grafana = axios.create({
  baseURL: process.env.GRAFANA_BASE_URL,
  headers: process.env.GRAFANA_TOKEN
    ? { Authorization: `Bearer ${process.env.GRAFANA_TOKEN}` }
    : undefined,
  timeout: 15000
});

router.get('/data', async (req, res) => {
  const bucket = INFLUX_BUCKET;
  const hours = Number(req.query.h || 24);
  const measurement = (req.query.m || 'weather').trim();

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: -${hours}h)
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> keep(columns: ["_time","_field","_value","location"])
      |> pivot(rowKey:["_time","location"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 50)
  `;

  const rows = [];
  try {
    await new Promise((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, meta) => rows.push(meta.toObject(row)),
        error: reject,
        complete: resolve
      });
    });

    if (rows.length === 0) {
      return res.status(200).json({
        count: 0,
        message: `No points found in bucket "${bucket}" for measurement "${measurement}" in last ${hours}h.`
      });
    }

    return res.json({
      count: rows.length,
      latest: rows[0],     // newest first due to sort desc
      rows
    });
  } catch (err) {
    console.error('[influx] /data query failed:', err);
    return res.status(500).json({ error: String(err) });
  }
});

// ---- Influx: write points ----
// Body: [{ measurement, tags: {...}, fields: {...}, timestamp? }, ...]
router.post('/influx/write', async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [];
    for (const r of rows) {
      const p = new Point(r.measurement);
      if (r.tags) for (const [k, v] of Object.entries(r.tags)) p.tag(k, String(v));
      if (r.fields) {
        for (const [k, v] of Object.entries(r.fields)) {
          typeof v === 'number' ? p.floatField(k, v) : p.stringField(k, String(v));
        }
      }
      if (r.timestamp) p.timestamp(r.timestamp); // ns if number
      writeApi.writePoint(p);
    }
    await writeApi.flush();
    res.json({ ok: true, wrote: rows.length });
  } catch (e) {
    console.error('Influx write error:', e?.message || e);
    res.status(500).json({ error: 'influx write failed' });
  }
});

// ---- Grafana: render single panel as PNG ----
// GET /api/grafana/panel.png?dashboardUid=xxx&panelId=2&width=1200&height=500&theme=light
router.get('/grafana/panel.png', async (req, res) => {
  try {
    const { dashboardUid, panelId, width = 1200, height = 500, theme = 'light' } = req.query;
    if (!dashboardUid || !panelId) return res.status(400).json({ error: 'missing params' });
    const url = `/render/d-solo/${dashboardUid}/_?panelId=${panelId}&width=${width}&height=${height}&theme=${theme}`;
    const r = await grafana.get(url, { responseType: 'arraybuffer' });
    res.set('Content-Type', 'image/png').send(r.data);
  } catch (e) {
    console.error('Grafana render error:', e?.response?.status, e?.response?.data || e?.message);
    res.status(500).json({ error: 'render failed' });
  }
});

// ---- Grafana: dashboard metadata (optional) ----
// GET /api/grafana/dashboards/:uid
router.get('/grafana/dashboards/:uid', async (req, res) => {
  try {
    const r = await grafana.get(`/api/dashboards/uid/${req.params.uid}`);
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: 'dashboard fetch failed' });
  }
});

router.get('/health', (_req, res) => {
  res.json({ ok: true, mode: (process.env.INFLUX_MODE || 'remote') });
});

module.exports = router;