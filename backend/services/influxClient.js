const { InfluxDB } = require('@influxdata/influxdb-client');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mode = (process.env.INFLUX_MODE || 'remote').toLowerCase();

const localScheme = process.env.LOCAL_INFLUXDB_SCHEME || 'http';
const localHost   = process.env.LOCAL_INFLUXDB_HOST   || 'host.docker.internal';
const localPort   = process.env.LOCAL_INFLUXDB_PORT   || '8086';
const remotePort  = process.env.LOCAL_FORWARD_PORT    || '8086';

const url = mode === 'local'
  ? `${localScheme}://${localHost}:${localPort}`
  : `http://localhost:${remotePort}`;

const token  = process.env.INFLUXDB_TOKEN;
const org    = process.env.INFLUXDB_ORG;
const bucket = process.env.INFLUXDB_BUCKET;

if (!token || !org || !bucket) {
  console.warn('[influx] Missing INFLUXDB_TOKEN/ORG/BUCKET');
}

const influxDB = new InfluxDB({ url, token });
const queryApi = influxDB.getQueryApi(org);
const writeApi = influxDB.getWriteApi(org, bucket);

console.log(`[influx] mode=${mode} url=${url} org=${org} bucket=${bucket}`);

// --- Connection test ---
(async () => {
  try {
    let found = false;
    await new Promise((resolve, reject) => {
      queryApi.queryRows('buckets()', {
        next: () => { found = true; },
        error: reject,
        complete: resolve
      });
    });
    if (found) {
      console.log(`[influx] ✅ Connected successfully to "${org}" and bucket "${bucket}"`);
    } else {
      console.warn('[influx] ⚠ No data returned from connection test');
    }
  } catch (err) {
    console.error('[influx] ❌ Connection test failed:', err.message);
  }
})();

module.exports = { queryApi, writeApi };