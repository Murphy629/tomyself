var path = require('path');
const cors = require('cors');
const helmet = require('helmet');
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

var app = express();

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

// ----- Security headers -----
app.use(
  helmet({
    frameguard: false, // allow iframe embeds (Grafana)
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'frame-src': ["'self'", 'http://localhost:5000'],
        'img-src': ["'self'", 'data:', 'http://localhost:5000']
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


// catch 404 and error handler (left as generated)
app.use(function(req, res, next) { next(createError(404)); });
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: res.locals.message });
});

module.exports = app;