// --- duration parser: supports "30m", "24h", "7d", "1w", or plain number as hours ---
function parseWindow(q) {
  const s = (q ?? '24h').toString().trim();
  const m = s.match(/^(\d+)\s*([smhdw]?)$/i); // seconds/minutes/hours/days/weeks
  if (!m) return '24h';
  const n = m[1];
  const unit = (m[2] || 'h').toLowerCase(); // default to hours if unit omitted
  return `${n}${unit}`;
}

const express = require('express');
const router = express.Router();
const { queryApi } = require('../services/influxClient');

const INFLUX_URL    = process.env.INFLUXDB_URL    || process.env.INFLUX_URL;
const INFLUX_ORG    = process.env.INFLUXDB_ORG    || process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
const INFLUX_TOKEN  = process.env.INFLUXDB_TOKEN  || process.env.INFLUX_TOKEN;

// Server-side extra safety: strip sensitive keys from objects
function scrubSensitive(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const o = { ...obj };
  delete o.password;
  delete o.password_hash;
  delete o.pass;
  delete o.pwd;
  return o;
}

router.get('/data', async (req, res) => {
  const bucket = INFLUX_BUCKET;
  const duration = parseWindow(req.query.h ?? req.query.range);
  const measurement = (req.query.m || 'weather').trim();

  // optional tag for pivot, e.g. tag=location
  const rawTag = String(req.query.tag || '').trim();
  const tag = /^[A-Za-z0-9_]+$/.test(rawTag) ? rawTag : '';

  // Flux-side guard for users measurement
  const fieldsGuard =
    measurement === 'users'
      ? `|> filter(fn: (r) => r._field != "password" and r._field != "password_hash" and r._field != "pass" and r._field != "pwd")`
      : '';

  const keepCols = ['_time', '_field', '_value', ...(tag ? [tag] : [])];
  const rowKey = tag ? `["_time","${tag}"]` : '["_time"]';

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: -${duration})
      |> filter(fn: (r) => r._measurement == "${measurement}")
      ${fieldsGuard}
      |> keep(columns: ${JSON.stringify(keepCols)})
      |> pivot(rowKey:${rowKey}, columnKey: ["_field"], valueColumn: "_value")
      |> drop(columns: ["password","password_hash","pass","pwd"])  // unconditional drop after pivot
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

    // Node side scrub (second safety net)
    const cleanRows = rows.map(scrubSensitive);

    if (cleanRows.length === 0) {
      return res.status(200).json({
        count: 0,
        message: `No points found in bucket "${bucket}" for measurement "${measurement}" in last ${duration}.`
      });
    }

    return res.json({
      count: cleanRows.length,
      latest: cleanRows[0],     // newest first due to sort desc
      rows: cleanRows
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