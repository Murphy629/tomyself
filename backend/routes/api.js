const express = require('express');
const router = express.Router();
const { queryApi } = require('../services/influxClient');

router.get('/data', async (req, res) => {
  const bucket = process.env.INFLUXDB_BUCKET;
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

router.get('/health', (_req, res) => {
  res.json({ ok: true, mode: (process.env.INFLUX_MODE || 'remote') });
});

module.exports = router;