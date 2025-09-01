const express = require('express');
const router = express.Router();
const { queryApi } = require('../services/influxClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const requireAuth = require('../middleware/auth');


router.use(express.json());

// 健康检查
router.get('/ping', (req, res) => {
  res.json({ ok: true, service: 'auth' });
});

// 调试
router.get('/_debug/measurements', async (req, res) => {
  try {
    const bucket = req.query.bucket || process.env.INFLUXDB_BUCKET || process.env.INFLUX_BUCKET;
    const flux = `
      import "influxdata/influxdb/schema"
      schema.measurements(bucket: "${bucket}")
    `;
    const list = [];
    await new Promise((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (values, meta) => list.push(meta.toObject(values)._value),
        error: reject,
        complete: resolve,
      });
    });
    res.json({ ok: true, measurements: list });
  } catch (err) {
    console.error('[auth/_debug/measurements] error:', err);
    res.status(500).json({ ok: false, error: 'debug failed' });
  }
});

// 调试
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
        next: (values, meta) => keys.push(meta.toObject(values)._value),
        error: reject,
        complete: resolve,
      });
    });
    res.json({ ok: true, keys });
  } catch (err) {
    console.error('[auth/_debug/users-schema] error:', err);
    res.status(500).json({ ok: false, error: 'debug failed' });
  }
});

// 登录：支持 bcrypt 哈希($2...) 或历史明文；成功后返回 JWT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'username/password required' });
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
        complete: resolve,
      });
    });

    if (!row) return res.status(401).json({ ok: false, error: 'user not found' });

    const stored = row.password || row.pass || row.pwd;
    if (!stored) return res.status(500).json({ ok: false, error: 'user record missing password field' });

    // 两种存储：1) bcrypt 哈希($2...) 2) 旧明文
    let passOK = false;
    if (typeof stored === 'string' && stored.startsWith('$2')) {
      passOK = await bcrypt.compare(String(password), stored);
    } else {
      passOK = String(stored) === String(password);
    }
    if (!passOK) return res.status(401).json({ ok: false, error: 'invalid credentials' });

    // 生成 JWT 7天
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign(
      { sub: String(username), role: row.role || 'user' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      ok: true,
      user: { username, role: row.role || 'user' },
      token
    });
  } catch (err) {
    console.error('[auth/login] error:', err);
    return res.status(500).json({ ok: false, error: 'internal error' });
  }
});

// 受保护：需要携带 Bearer JWT，成功后返回 token 里的用户信息
router.get('/me', requireAuth, (req, res) => {
    res.json({ ok: true, user: req.user });
  });
  

module.exports = router;
