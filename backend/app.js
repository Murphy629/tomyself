var path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// console.log('Influx Org:', process.env.INFLUXDB_ORG);
// console.log('Influx Bucket:', process.env.INFLUXDB_BUCKET);
// console.log('Influx Token:', process.env.INFLUXDB_TOKEN);


var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// catch 404 and error handler (left as generated)
app.use(function(req, res, next) { next(createError(404)); });
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: res.locals.message });
});

module.exports = app;