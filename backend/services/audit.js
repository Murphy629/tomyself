const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const UAParser = require('ua-parser-js');

const INFLUX_URL = process.env.INFLUXDB_URL || process.env.INFLUX_URL;
const INFLUX_ORG = process.env.INFLUXDB_ORG || process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
const INFLUX_TOKEN = process.env.INFLUXDB_TOKEN || process.env.INFLUX_TOKEN;

let _writeApi;
function ensureWriteApi() {
  if (_writeApi) return _writeApi;
  if (!INFLUX_URL || !INFLUX_ORG || !INFLUX_BUCKET || !INFLUX_TOKEN) {
    throw new Error('influx env missing');
  }
  const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
  _writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ns');
  return _writeApi;
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function parseUA(uaString) {
  const p = new UAParser(uaString || '');
  const os = p.getOS()?.name || 'unknown';
  const browser = p.getBrowser()?.name || 'unknown';
  const device = p.getDevice()?.type || 'desktop';
  return { os, browser, device };
}

function pickGeo(req) {
  const h = req.headers || {};
  const country =
    h['x-geo-country'] ||
    h['cf-ipcountry'] ||
    h['x-appengine-country'] ||
    h['x-vercel-ip-country'] ||
    h['x-country-code'] ||
    'unknown';
  const region =
    h['x-geo-region'] ||
    h['x-vercel-ip-country-region'] ||
    h['x-appengine-region'] ||
    'unknown';
  const city =
    h['x-geo-city'] ||
    h['x-vercel-ip-city'] ||
    h['x-appengine-city'] ||
    'unknown';
  const platform =
    h['sec-ch-ua-platform'] ||
    h['x-platform'] ||
    parseUA(h['user-agent']).os ||
    'unknown';
  const lat = h['x-vercel-ip-latitude'] || h['x-geo-latitude'];
  const lon = h['x-vercel-ip-longitude'] || h['x-geo-longitude'];
  return { country, region, city, platform, lat, lon };
}

/**
 * @param {import('express').Request} req
 * @param {{event:'login_attempt'|'login_success'|'login_failure'|'login_block'|'logout',
 * username?:string, ok:boolean, reason?:string, extra?:Record<string, string|number>}} data
 */
async function logAuthEvent(req, { event, username, ok, reason, extra }) {
  const ip = getClientIp(req);
  const { os, browser, device } = parseUA(req.headers['user-agent']);
  const { country, region, city, platform, lat, lon } = pickGeo(req);

  const pt = new Point('auth_events')
    .tag('event', event)
    .tag('ok', String(ok))
    .tag('os', os)
    .tag('browser', browser)
    .tag('device', device)
    .tag('platform', platform)
    .tag('country', String(country))
    .tag('region', String(region))
    .tag('city', String(city))
    .stringField('ip', ip);

  if (username) pt.tag('username', String(username));
  if (reason) pt.stringField('reason', String(reason));
  if (lat) pt.floatField('lat', Number(lat));
  if (lon) pt.floatField('lon', Number(lon));

  if (extra && typeof extra === 'object') {
    for (const [k, v] of Object.entries(extra)) {
      if (v == null) continue;
      const key = `x_${k}`;
      typeof v === 'number' ? pt.floatField(key, v) : pt.stringField(key, String(v));
    }
  }

  try {
    const wa = ensureWriteApi();
    wa.writePoint(pt);
    await wa.flush();
  } catch (e) {
    console.error('[audit] write failed:', e?.message || e);
  }
}

module.exports = { logAuthEvent };
