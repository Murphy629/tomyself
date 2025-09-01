// Express routes to test MySQL, Influx, and backend connectivity

const express = require('express');
const router = express.Router();
const { pool, query } = require('../config/mysql');
const { queryApi, writeApi } = require('../services/influxClient');
const { Point } = require('@influxdata/influxdb-client');
const axios = require('axios');


const BACKEND_PORT = process.env.BACKEND_PORT;
const MYSQL_PORT = process.env.MYSQL_PORT;
const INFLUX_PORT = process.env.LOCAL_FORWARD_PORT || process.env.REMOTE_INFLUX_PORT;
// const GRAFANA_PORT = process.env.GRAFANA_PORT;

const GRAFANA_HOST = process.env.GRAFANA_HOST;
const GRAFANA_PORT = process.env.GRAFANA_PORT;
const GRAFANA_BASE_URL = process.env.GRAFANA_BASE_URL || `http://${GRAFANA_HOST}:${GRAFANA_PORT}`;



// ------------------ mysql test ------------------
router.get('/mysql-status', async (_req, res) => {
  try {
    const rows = await query('SELECT 1 AS status');
    const status = Array.isArray(rows) && rows[0]?.status === 1;

    res.json({
      status,
      port: MYSQL_PORT,
      details: rows,
      host: process.env.MYSQL_HOST,
      db: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
    });
  } catch (err) {
    console.error('[test] ❌ MySQL connection failed:', err.message);
    res.status(500).json({ status: false, port: MYSQL_PORT, error: err.message });
  }
});

// ------------------ influx test ------------------
router.get('/influx-status', async (_req, res) => {
  try {
    const names = [];
    await new Promise((resolve, reject) => {
      queryApi.queryRows('buckets()', {
        next: (row, meta) => {
          const obj = meta.toObject(row);
          if (obj?.name) names.push(obj.name);
        },
        error: reject,
        complete: resolve,
      });
    });

    res.json({
      status: true,
      port: INFLUX_PORT,
      mode: process.env.INFLUX_MODE || 'remote',
      org: process.env.INFLUXDB_ORG || process.env.INFLUX_ORG,
      bucket: process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET,
      bucketCount: names.length,
      bucketsPreview: names.slice(0, 20),
    });
  } catch (err) {
    console.error('[influx] connection-status failed:', err?.message || err);
    res.status(500).json({ status: false, port: INFLUX_PORT, error: String(err?.message || err) });
  }
});

router.post('/influx-write-test', async (_req, res) => {
  try {
    if (!writeApi) {
      return res.status(400).json({
        status: false,
        port: INFLUX_PORT,
        error: 'writeApi not initialized (missing token/org/bucket?)',
      });
    }

    const p = new Point('diagnostic')
      .tag('source', 'backend-test')
      .floatField('ping', 1)
      .timestamp(Date.now() * 1e6);

    writeApi.writePoint(p);
    await writeApi.flush();

    res.json({ status: true, port: INFLUX_PORT, wrote: 1, measurement: 'diagnostic' });
  } catch (err) {
    console.error('[influx] write-test failed:', err?.message || err);
    res.status(500).json({ status: false, port: INFLUX_PORT, error: String(err?.message || err) });
  }
});

// ------------------ backend self test ------------------
router.get('/backend-status', (_req, res) => {
  res.json({
    status: true,
    port: BACKEND_PORT,
    message: 'backend is running',
    env: process.env.NODE_ENV || 'development',
  });
});



// ------------------ Grafana test ------------------

const grafanaHeaders = process.env.GRAFANA_TOKEN
  ? { Authorization: `Bearer ${process.env.GRAFANA_TOKEN}` }
  : {};

router.get('/grafana-status', async (_req, res) => {
  try {
    const url = `${GRAFANA_BASE_URL}/api/health`;
    const r = await axios.get(url, {
      headers: grafanaHeaders,
      timeout: 5000,
    });

    res.json({
      status: true,
      port: GRAFANA_PORT,
      baseUrl: GRAFANA_BASE_URL,
      health: r.data, // Grafana usually returns {commit, database, version}
    });
  } catch (err) {
    console.error('[grafana] health check failed:', err?.message || err);
    res.status(500).json({
      status: false,
      port: GRAFANA_PORT,
      baseUrl: GRAFANA_BASE_URL,
      error: err?.message || err,
    });
  }
});




module.exports = router;