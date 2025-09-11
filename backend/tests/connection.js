// Express routes to test MySQL, InfluxDB, Grafana, and backend connectivity

const express = require('express');
const router = express.Router();
const { pool, query } = require('../config/mysql');
const { queryApi, writeApi } = require('../services/influxClient');
const { Point } = require('@influxdata/influxdb-client');
const axios = require('axios');

// ===== envs (only those defined in your .env) =====
const HOST_IP = process.env.HOST_IP || '127.0.0.1';

const MYSQL_PORT = process.env.MYSQL_HOST_PORT;              // 3306
const INFLUX_PORT = process.env.INFLUXDB_HOST_PORT;          // 8086
const GRAFANA_PORT = process.env.GRAFANA_HOST_PORT;          // 5000

const MYSQL_DB = process.env.MYSQL_DATABASE;                 // sepdb
const MYSQL_USER = process.env.MYSQL_USER;                   // sep

const INFLUX_ORG = process.env.DOCKER_INFLUXDB_INIT_ORG;     // my-org
const INFLUX_BUCKET = process.env.DOCKER_INFLUXDB_INIT_BUCKET; // default

const BACKEND_PORT = process.env.BACKEND_PORT;

// Grafana base URL = host:hostPort (container port is internal)
const GRAFANA_BASE_URL = `http://${HOST_IP}:${GRAFANA_PORT}`;

// ------------------ MySQL test ------------------
router.get('/mysql-status', async (_req, res) => {
  try {
    const rows = await query('SELECT 1 AS status');
    const status = Array.isArray(rows) && rows[0]?.status === 1;

    res.json({
      status,
      port: MYSQL_PORT,
      host: HOST_IP,
      db: MYSQL_DB,
      user: MYSQL_USER,
      details: rows,
    });
  } catch (err) {
    console.error('[test] ❌ MySQL connection failed:', err.message);
    res.status(500).json({ status: false, port: MYSQL_PORT, error: err.message });
  }
});

// ------------------ InfluxDB status ------------------
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
      host: HOST_IP,
      org: INFLUX_ORG,
      bucket: INFLUX_BUCKET,
      bucketCount: names.length,
      bucketsPreview: names.slice(0, 20),
    });
  } catch (err) {
    console.error('[influx] connection-status failed:', err?.message || err);
    res.status(500).json({
      status: false,
      port: INFLUX_PORT,
      host: HOST_IP,
      error: String(err?.message || err),
    });
  }
});

// Simple write test to the configured org/bucket (from your client setup)
router.post('/influx-write-test', async (_req, res) => {
  try {
    if (!writeApi) {
      return res.status(400).json({
        status: false,
        error: 'writeApi not initialized (missing token/org/bucket?)',
      });
    }

    const p = new Point('diagnostic')
      .tag('source', 'backend-test')
      .floatField('ping', 1)
      .timestamp(BigInt(Date.now()) * 1000000n); // ns

    writeApi.writePoint(p);
    await writeApi.flush();

    res.json({ status: true, wrote: 1 });
  } catch (err) {
    const detail = {
      message: err?.message,
      name: err?.name,
      statusCode: err?.statusCode ?? err?.response?.status,
      body: err?.body ?? err?.response?.data,
      stack: err?.stack?.split('\n').slice(0, 3).join('\n'),
    };
    console.error('[influx] write-test failed detail:', detail);
    res.status(500).json({ status: false, error: detail });
  }
});

// ------------------ Backend self test ------------------
router.get('/backend-status', (_req, res) => {
  res.json({
    status: true,
    port: BACKEND_PORT,
    host: HOST_IP,
    message: 'backend is running',
  });
});

// ------------------ Grafana test ------------------
// No GRAFANA_TOKEN in env: keep headers empty
const grafanaHeaders = {};

router.get('/grafana-status', async (_req, res) => {
  try {
    const url = `${GRAFANA_BASE_URL}/api/health`;
    const r = await axios.get(url, { headers: grafanaHeaders, timeout: 5000 });

    res.json({
      status: true,
      port: GRAFANA_PORT,
      baseUrl: GRAFANA_BASE_URL,
      health: r.data, // {commit, database, version}
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