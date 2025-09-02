const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

module.exports = function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({
      ok: false,
      error: 'missing_or_invalid_token',
      message: 'Login status: failed; Reason: missing_or_invalid_token',
      prompt: 'Please login'
    });
  }
  try {
    req.user = jwt.verify(m[1], JWT_SECRET);
    return next();
  } catch (e) {
    const reason = e?.name === 'TokenExpiredError' ? 'token_expired' : 'invalid_token';
    return res.status(401).json({
      ok: false,
      error: reason,
      message: `Login status: failed; Reason: ${reason}`,
      prompt: 'Please try again'
    });
  }
};
