const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const requireAuth = require('../middleware/auth');
const { queryApi } = require('../services/influxClient');
const { logAuthEvent } = require('../services/audit');

router.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/** User-facing prompts (English) */
const prompts = {
  missing_fields: 'Please provide username and password.',
  user_not_found: 'User does not exist.',
  invalid_credentials: 'Incorrect username or password.',
  no_password_field: 'Account configuration is invalid. Please contact the administrator.',
  rate_limited: 'Too many attempts. Try again later.',
  missing_or_invalid_token: 'Please sign in first.',
  invalid_token: 'Please sign in again.',
  token_expired: 'Session expired. Please sign in again.',
  exception: 'Service error. Please try again later.'
};

/** Standard failure helper */
function fail(res, http, reason, errorText) {
  return res.status(http).json({
    ok: false,
    error: errorText || reason,
    message: `Login status: failed; Reason: ${reason}`,
    prompt: prompts[reason] || undefined
  });
}

/** Rate limit: max 10 login attempts per IP per 15 minutes */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const xff = req.headers['x-forwarded-for'];
    return typeof xff === 'string' && xff.length ? xff.split(',')[0].trim() : req.ip;
  },
  handler: async (req, res, _next, opts) => {
    try {
      await logAuthEvent(req, {
        event: 'login_block',
        username: req.body?.username,
        ok: false,
        reason: 'rate_limited'
      });
    } catch {}
    return fail(res, opts.statusCode || 429, 'rate_limited', 'too many attempts');
  }
});

/* Health */
router.get('/ping', (_req, res) => res.json({ ok: true, service: 'auth' }));

/* Debug: list measurements in the bucket */
router.get('/_debug/measurements', async (req, res) => {
  try {
    const bucket = req.query.bucket || process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
    const flux = `import "influxdata/influxdb/schema" schema.measurements(bucket: "${bucket}")`;
    const list = [];
    await new Promise((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (v, meta) => list.push(meta.toObject(v)._value),
        error: reject,
        complete: resolve
      });
    });
    res.json({ ok: true, measurements: list });
  } catch (err) {
    console.error('[auth/_debug/measurements] error:', err);
    res.status(500).json({ ok: false, error: 'debug failed' });
  }
});

/* Debug: view tag/field keys under measurement=users */
router.get('/_debug/users-schema', async (req, res) => {
  try {
    const bucket = req.query.bucket || process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
    const flux = `
      import "influxdata/influxdb/schema"
      union(tables: [
        schema.measurementTagKeys(bucket: "${bucket}", measurement: "users"),
        schema.measurementFieldKeys(bucket: "${bucket}", measurement: "users")
      ])
    `;
    const keys = [];
    await new Promise((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (v, meta) => keys.push(meta.toObject(v)._value),
        error: reject,
        complete: resolve
      });
    });
    res.json({ ok: true, keys });
  } catch (err) {
    console.error('[auth/_debug/users-schema] error:', err);
    res.status(500).json({ ok: false, error: 'debug failed' });
  }
});

/* Inspect current JWT */
router.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return fail(res, 401, 'missing_or_invalid_token');
  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    return res.json({ ok: true, user: payload });
  } catch (e) {
    const reason = e?.name === 'TokenExpiredError' ? 'token_expired' : 'invalid_token';
    return fail(res, 401, reason);
  }
});

/* Login (supports bcrypt password_hash; falls back to plain password fields if needed) */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      await logAuthEvent(req, { event: 'login_attempt', username, ok: false, reason: 'missing_fields' });
      return fail(res, 400, 'missing_fields', 'username/password required');
    }

    const bucket = process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
    const flux = `
      from(bucket: "${bucket}")
        |> range(start: -90d)
        |> filter(fn: (r) => r._measurement == "users")
        |> filter(fn: (r) => r.user == "${username}" or r.username == "${username}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: 1)
    `;

    let row;
    await new Promise((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (values, meta) => { row = meta.toObject(values); },
        error: reject,
        complete: resolve
      });
    });

    if (!row) {
      await logAuthEvent(req, { event: 'login_failure', username, ok: false, reason: 'user_not_found' });
      return fail(res, 401, 'user_not_found', 'invalid credentials');
    }

    const hashed = row.password_hash || row.hash;
    if (hashed) {
      const ok = await bcrypt.compare(String(password), String(hashed));
      if (!ok) {
        await logAuthEvent(req, { event: 'login_failure', username, ok: false, reason: 'invalid_credentials' });
        return fail(res, 401, 'invalid_credentials', 'invalid credentials');
      }
    } else {
      const stored = row.password || row.pass || row.pwd;
      if (!stored) {
        await logAuthEvent(req, { event: 'login_failure', username, ok: false, reason: 'no_password_field' });
        return fail(res, 500, 'no_password_field', 'user record missing password field');
      }
      if (String(stored) !== String(password)) {
        await logAuthEvent(req, { event: 'login_failure', username, ok: false, reason: 'invalid_credentials' });
        return fail(res, 401, 'invalid_credentials', 'invalid credentials');
      }
    }

    const role = row.role || 'user';
    const token = jwt.sign({ sub: username, role }, JWT_SECRET, { expiresIn: '7d' });

    await logAuthEvent(req, { event: 'login_success', username, ok: true });

    return res.json({
      ok: true,
      user: { username, role },
      token,
      message: 'Login status: success'
    });
  } catch (err) {
    console.error('[auth/login] error:', err);
    try {
      await logAuthEvent(req, {
        event: 'login_failure',
        username: req?.body?.username,
        ok: false,
        reason: 'exception',
        extra: { msg: String(err?.message || err) }
      });
    } catch {}
    return fail(res, 500, 'exception', 'internal error');
  }
});

/* Logout (stateless; just record audit) */
router.post('/logout', async (req, res) => {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  let username;
  if (m) { try { username = jwt.verify(m[1], JWT_SECRET)?.sub; } catch {} }
  await logAuthEvent(req, { event: 'logout', username, ok: true });
  return res.json({ ok: true });
});

/* Audit: recent auth events (requires login) */
router.get('/audit/recent', requireAuth, async (req, res) => {
  try {
    const bucket = process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
    const hours = Number(req.query.h || 24);
    const limit = Number(req.query.limit || 50);

    const flux = `
      from(bucket: "${bucket}")
        |> range(start: -${hours}h)
        |> filter(fn: (r) => r._measurement == "auth_events")
        |> keep(columns: [
            "_time","_field","_value",
            "event","ok","os","browser","device","username"
        ])
        |> pivot(
            rowKey: ["_time","event","ok","os","browser","device","username"],
            columnKey: ["_field"],
            valueColumn: "_value"
        )
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: ${limit})
    `;


    const rows = [];
    await new Promise((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (r, meta) => rows.push(meta.toObject(r)),
        error: reject,
        complete: resolve
      });
    });

    return res.json({ count: rows.length, rows });
  } catch (e) {
    console.error('[auth/audit/recent] error:', e);
    return res.status(500).json({ ok: false, error: 'audit query failed' });
  }
});

module.exports = router;
