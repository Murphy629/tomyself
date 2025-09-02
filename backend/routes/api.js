const express = require('express');
const router = express.Router();
const axios = require('axios');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { queryApi } = require('../services/influxClient');
const requireAuth = require('../middleware/auth');

// 读取 env（保持与你现有的服务一致）
const INFLUX_URL_ENV   = () => process.env.INFLUXDB_URL    || process.env.INFLUX_URL;
const INFLUX_ORG_ENV   = () => process.env.INFLUXDB_ORG    || process.env.INFLUX_ORG;
const INFLUX_BUCKET_ENV= () => process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
const INFLUX_TOKEN_ENV = () => process.env.INFLUXDB_TOKEN  || process.env.INFLUX_TOKEN;

// ---------- 按需创建 writeApi，避免启动时 env 未就绪 ----------
let _writeApi = null;
function ensureWriteApi() {
  if (_writeApi) return _writeApi;

  const url    = INFLUX_URL_ENV();
  const org    = INFLUX_ORG_ENV();
  const bucket = INFLUX_BUCKET_ENV();
  const token  = INFLUX_TOKEN_ENV();

  if (!url)    throw new Error('INFLUXDB_URL/INFLUX_URL not set');
  if (!org)    throw new Error('INFLUXDB_ORG/INFLUX_ORG not set');
  if (!bucket) throw new Error('INFLUXDB_BUCKET/INFLUX_BUCKET not set');
  if (!token)  throw new Error('INFLUXDB_TOKEN/INFLUX_TOKEN not set');

  const influx = new InfluxDB({ url, token });
  _writeApi = influx.getWriteApi(org, bucket, 'ns');
  return _writeApi;
}

// ---- Grafana HTTP client（保持不变）----
const grafana = axios.create({
  baseURL: process.env.GRAFANA_BASE_URL,
  headers: process.env.GRAFANA_TOKEN
    ? { Authorization: `Bearer ${process.env.GRAFANA_TOKEN}` }
    : undefined,
  timeout: 15000
});

// 读取数据：支持可选 tag 作为 pivot 维度（如果没传 tag，就只按 _time pivot）
router.get('/data', requireAuth, async (req, res) => {
  const bucket = INFLUX_BUCKET_ENV();
  const hours = Number(req.query.h || 24);
  const measurement = (req.query.m || 'weather').trim();
  const tagCol = (req.query.tag || '').trim(); // 可选：比如 tag=location

  // 动态 keep/pivot（如果没 tag，就不把 tag 放到 keep 和 rowKey 里）
  const keepCols = ['_time', '_field', '_value'].concat(tagCol ? [tagCol] : []);
  const rowKey = ['_time'].concat(tagCol ? [tagCol] : []);

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: -${hours}h)
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> keep(columns: ${JSON.stringify(keepCols)})
      |> pivot(rowKey:${JSON.stringify(rowKey)}, columnKey: ["_field"], valueColumn: "_value")
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
      latest: rows[0],
      rows
    });
  } catch (err) {
    console.error('[influx] /data query failed:', err);
    return res.status(500).json({ error: String(err) });
  }
});

// 写数据（按需拿 writeApi）
router.post('/influx/write', requireAuth, async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [];
    const writeApi = ensureWriteApi();

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

// Grafana 面板渲染
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

// Grafana dashboard 元数据
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
