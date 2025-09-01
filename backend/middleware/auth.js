// 用途：校验前端携带的 Bearer JWT；验证通过后把 payload 挂到 req.user。
// 依赖：dotenv(.env) 提供 JWT_SECRET；签发在 routes/auth.js 的 /login。
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ ok: false, error: 'missing or invalid Authorization header' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret); // { sub, role, iat, exp }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'invalid or expired token' });
  }
}

module.exports = requireAuth;
