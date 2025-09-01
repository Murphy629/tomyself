const express = require('express');
const router = express.Router();
const { queryApi } = require('../services/influxClient');

const INFLUX_URL = process.env.INFLUXDB_URL || process.env.INFLUX_URL;
const INFLUX_ORG = process.env.INFLUXDB_ORG || process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
const INFLUX_TOKEN = process.env.INFLUXDB_TOKEN || process.env.INFLUX_TOKEN;


router.get('/data', async (req, res) => {
  const bucket = INFLUX_BUCKET;
  const hours = Number(req.query.h || 24);
  const measurement = (req.query.m || 'weather').trim();

  // 可选：指定做 pivot 的 tag 名（例如 weather 用 tag=location）
  const rawTag = String(req.query.tag || '').trim();
  // 简单白名单，避免把奇怪字符拼进 Flux
  const tag = /^[A-Za-z0-9_]+$/.test(rawTag) ? rawTag : '';

  const keepCols = ['_time', '_field', '_value', ...(tag ? [tag] : [])];
  const rowKey = tag ? `["_time","${tag}"]` : '["_time"]';

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: -${hours}h)
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> keep(columns: ${JSON.stringify(keepCols)})
      |> pivot(rowKey:${rowKey}, columnKey: ["_field"], valueColumn: "_value")
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

router.get('/health', (_req, res) => {
  res.json({ ok: true, mode: (process.env.INFLUX_MODE || 'remote') });
});

module.exports = router;