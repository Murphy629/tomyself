// Influx bootstrap (CommonJS)
const { InfluxDB } = require("@influxdata/influxdb-client");

const INFLUX_URL   = process.env.INFLUX_URL   || "http://localhost:8086";
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || process.env.DOCKER_INFLUXDB_INIT_ADMIN_TOKEN;
const INFLUX_ORG   = process.env.INFLUX_ORG   || process.env.DOCKER_INFLUXDB_INIT_ORG || "my-org";
const BUCKET_USERS  = process.env.INFLUX_BUCKET_USERS  || process.env.DOCKER_INFLUXDB_INIT_BUCKET || "default";
const BUCKET_TOKENS = process.env.INFLUX_BUCKET_TOKENS || process.env.DOCKER_INFLUXDB_INIT_BUCKET || "default";

if (!INFLUX_TOKEN) {
  throw new Error("Missing INFLUX_TOKEN / DOCKER_INFLUXDB_INIT_ADMIN_TOKEN");
}

const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeUsers  = influx.getWriteApi(INFLUX_ORG, BUCKET_USERS,  "ms");
const writeTokens = influx.getWriteApi(INFLUX_ORG, BUCKET_TOKENS, "ms");
const queryUsers  = influx.getQueryApi(INFLUX_ORG);
const queryTokens = influx.getQueryApi(INFLUX_ORG);

module.exports = { writeUsers, writeTokens, queryUsers, queryTokens, BUCKET_USERS, BUCKET_TOKENS };