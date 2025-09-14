var path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
var testConnectionRouter = require('./tests/connection');
var testSessionsRouter = require('./tests/sessions');

var app = express();

// Trust proxy if behind a reverse proxy (Nginx/Cloudflare/etc.)
if (String(process.env.TRUST_PROXY || '0') === '1') {
  app.set('trust proxy', 1);
}

// fast-fail favicon to avoid hanging network tab in browsers
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(logger('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ----- CORS (Dev) -----
const whitelist = (process.env.CORS_WHITELIST || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin || whitelist.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  maxAge: 86400
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // fast preflight

function parseSecrets(input) {
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (_) {}
  if (input) return input;
  // fallback dev-only random
  return require('crypto').randomBytes(32).toString('hex');
}
const sessionSecrets = parseSecrets(process.env.SESSION_SECRETS || process.env.SESSION_SECRET);

const cookieSecure = String(process.env.SESSION_COOKIE_SECURE || '').toLowerCase() === 'true';
const cookieSameSite = (process.env.SESSION_COOKIE_SAMESITE || 'lax');
const cookieMaxAge = Number(process.env.SESSION_COOKIE_MAXAGE_MS || (1000 * 60 * 60 * 24 * 7));

// ----- Cookie-based session (stateless) -----

// Use __Host- cookie name only when Secure is true; otherwise browsers will reject it.
const cookieName = cookieSecure
  ? (process.env.SESSION_NAME || '__Host-bif.sid')
  : (process.env.SESSION_NAME || 'bif.sid');

// Normalize keys for cookie-session: array of secrets/keys
const sessionKeys = Array.isArray(sessionSecrets) ? sessionSecrets : [String(sessionSecrets || '')].filter(Boolean);
if (sessionKeys.length === 0) {
  // dev-only fallback to avoid crashing if no env provided
  sessionKeys.push(crypto.randomBytes(32).toString('hex'));
}

app.use(cookieSession({
  name: cookieName,
  keys: sessionKeys,
  // proxy trust still matters for Secure cookies behind reverse proxies
  // (leave app.set('trust proxy', 1) controlled by TRUST_PROXY above)
  maxAge: cookieMaxAge,
  httpOnly: true,
  secure: cookieSecure,
  sameSite: cookieSameSite,
  path: '/',
}));

// Seed guest role in every fresh session
app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = { role: 'guest', role_id: '0' };
  }
  next();
});

// ----- Security headers -----
app.use(
  helmet({
    frameguard: false, // allow iframe embeds (Grafana)
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'frame-src': ["'self'", 'http://localhost:5000', 'http://localhost:5173'],
        'img-src': ["'self'", 'data:', 'http://localhost:5000', 'http://localhost:5173']
      }
    }
  })
);

// quick health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/test-connection', testConnectionRouter);
app.use('/tests/sessions', testSessionsRouter);


// catch 404 and error handler (left as generated)
app.use(function(req, res, next) { next(createError(404)); });
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: res.locals.message });
});

module.exports = app;