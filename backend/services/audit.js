// backend/services/audit.js
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

function getClientIp(req) {
  const xff = req.headers?.['x-forwarded-for'];
  let ip = Array.isArray(xff) ? xff[0] : (xff || '');
  ip = ip.split(',')[0].trim();
  if (!ip) ip = req.socket?.remoteAddress || '';
  return ip.replace('::ffff:', '');
}

function parseUa(uaString = '') {
  const parser = new UAParser(uaString);
  const r = parser.getResult();
  const os = [r.os?.name, r.os?.version].filter(Boolean).join(' ').trim() || null;
  const browser = [r.browser?.name, r.browser?.version].filter(Boolean).join(' ').trim() || null;
  const deviceType = r.device?.type || ''; // mobile/tablet/...
  const platform = (deviceType === 'mobile' || deviceType === 'tablet') ? 'mobile' : 'desktop';
  return { os, browser, platform };
}

function lookupGeo(ip) {
  try {
    const g = geoip.lookup(ip);
    if (!g) return { country: null, region: null, city: null };
    return {
      country: g.country || null,
      region: g.region || null,
      city: g.city || null,
    };
  } catch {
    return { country: null, region: null, city: null };
  }
}

//记录一次登录事件（当前打印，后面你愿意的话再写 DB）
async function recordLoginEvent(opts = {}) {
  const { req, usernameInput, userId, code, success, serverReason } = opts;

  const ip = getClientIp(req);
  const ua = req.headers?.['user-agent'] || '';
  const uaParsed = parseUa(ua);
  const geo = ip ? lookupGeo(ip) : { country: null, region: null, city: null };

  const event = {
    ts: new Date().toISOString(),
    userId: userId || null,
    usernameInput: usernameInput || '',
    resultCode: code || '',
    success: Boolean(success),
    ip,
    userAgent: ua,
    os: uaParsed.os,
    browser: uaParsed.browser,
    platform: uaParsed.platform,
    location: geo, // { country, region, city }
    serverReason: serverReason || '',
  };

  console.log('[login_event]', JSON.stringify(event));
}

module.exports = { recordLoginEvent };
