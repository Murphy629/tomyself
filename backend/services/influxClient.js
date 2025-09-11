// services/influxClient.js
const { InfluxDB } = require('@influxdata/influxdb-client');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ---- Env from your .env ----
const HOST_IP = process.env.HOST_IP || '127.0.0.1';
const INFLUX_PORT = process.env.INFLUXDB_HOST_PORT; // 8086

const url = `http://${HOST_IP}:${INFLUX_PORT}`;

const token  = process.env.DOCKER_INFLUXDB_INIT_ADMIN_TOKEN;
const org    = process.env.DOCKER_INFLUXDB_INIT_ORG;
const bucket = process.env.DOCKER_INFLUXDB_INIT_BUCKET;

if (!token || !org || !bucket) {
  console.warn('[influx] Missing DOCKER_INFLUXDB_INIT_ADMIN_TOKEN/ORG/BUCKET in .env');
}

const influxDB = new InfluxDB({ url, token });
const queryApi = influxDB.getQueryApi(org);
const writeApi = influxDB.getWriteApi(org, bucket);

console.log(`[influx] url=${url} org=${org} bucket=${bucket}`);

// --- Connection test ---
(async () => {
  try {
    let found = false;
    await new Promise((resolve, reject) => {
      queryApi.queryRows('buckets()', {
        next: () => { found = true; },
        error: reject,
        complete: resolve,
      });
    });
    if (found) {
      console.log(`[influx] ✅ Connected: org="${org}", bucket="${bucket}"`);
    } else {
      console.warn('[influx] ⚠ No data returned from connection test');
    }
  } catch (err) {
    console.error('[influx] ❌ Connection test failed:', err?.message || err);
  }
})();

module.exports = { queryApi, writeApi };