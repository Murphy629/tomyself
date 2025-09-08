const express = require('express');
const router = express.Router();

const rateLimit = require('express-rate-limit'); // 限流
const SC = require('../auth/statusCodes');
const { recordLoginEvent } = require('../services/audit');

// ========== 简单锁定策略（内存版）可调整 ==========
const MAX_ATTEMPTS = 5;           // 连续失败阈值
const WINDOW_MINUTES = 15;        // 统计窗口（分钟）
const LOCK_MINUTES = 15;          // 锁定时长（分钟）

const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;
const LOCK_MS = LOCK_MINUTES * 60 * 1000;

// 记失败/锁定的内存表（进程重启会清零，够联调前后端）
const attempts = new Map(); // key -> { count, firstTs, lockedUntil }

// 小工具：生成 traceId（仅限本文件使用）
function genTraceId() {
  return (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)).toUpperCase();
}
// 状态码 -> HTTP
function mapAuthCodeToHttp(code) {
  switch (code) {
    case SC.AuthCodes.OK: return 200;
    case SC.AuthCodes.INVALID_CREDENTIALS:
    case SC.AuthCodes.TOKEN_INVALID:
    case SC.AuthCodes.TOKEN_EXPIRED: return 401;
    case SC.AuthCodes.ACCOUNT_LOCKED:
    case SC.AuthCodes.EMAIL_NOT_VERIFIED:
    case SC.AuthCodes.MFA_REQUIRED: return 403;
    case SC.AuthCodes.TOO_MANY_ATTEMPTS: return 429;
    default: return 400;
  }
}
// 统一响应
function respondOk(res, data = {}, context = {}) {
  const traceId = genTraceId();
  return res.status(200).json({ status: 'ok', code: SC.AuthCodes.OK, message: 'OK', traceId, data, context });
}
function respondFail(res, code, clientMessage, context = {}, httpStatus, prompt) {
  const traceId = genTraceId();
  const status = httpStatus || mapAuthCodeToHttp(code);
  const messages = {
    [SC.AuthCodes.INVALID_CREDENTIALS]: 'Email or password is incorrect.',
    [SC.AuthCodes.ACCOUNT_LOCKED]: 'Your account is temporarily locked. Please try again later.',
    [SC.AuthCodes.EMAIL_NOT_VERIFIED]: 'Please verify your email before logging in.',
    [SC.AuthCodes.MFA_REQUIRED]: 'Additional verification required.',
    [SC.AuthCodes.TOO_MANY_ATTEMPTS]: 'Too many attempts. Please wait and try again.',
    [SC.AuthCodes.TOKEN_INVALID]: 'Invalid or missing token.',
    [SC.AuthCodes.TOKEN_EXPIRED]: 'Your session has expired. Please login again.',
  };
  const message = clientMessage || messages[code] || 'Request failed';
  const body = { status: 'fail', code, message, traceId, context };
  if (prompt) body.prompt = prompt;
  return res.status(status).json(body);
}

// 以 email 为主键；没有 email 时退回到 IP
function getKey(email, req) {
  const ip = (req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '').toString();
  return (email && email.toLowerCase()) || `ip:${ip}`;
}
function isLocked(key) {
  const rec = attempts.get(key);
  if (!rec || !rec.lockedUntil) return false;
  return Date.now() < rec.lockedUntil;
}
function currentLockedUntil(key) {
  const rec = attempts.get(key);
  return rec?.lockedUntil || null;
}
function resetAttempts(key) {
  attempts.delete(key);
}
function noteFailure(key) {
  const now = Date.now();
  let rec = attempts.get(key);
  if (!rec) rec = { count: 0, firstTs: now, lockedUntil: null };
  if (now - rec.firstTs > WINDOW_MS) rec = { count: 0, firstTs: now, lockedUntil: null };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCK_MS;
    rec.count = 0;
    rec.firstTs = now;
  }
  attempts.set(key, rec);
  return rec.lockedUntil || null;
}

// 登录接口限流（演示用 10 秒内最多 3 次）
const loginLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res /*, next*/) => {
    // 429 时也记录一次审计
    recordLoginEvent({
      req,
      usernameInput: (req.body && req.body.email) || '',
      userId: null,
      code: SC.AuthCodes.TOO_MANY_ATTEMPTS,
      success: false,
      serverReason: 'rate limit exceeded'
    });
    return respondFail(
      res,
      SC.AuthCodes.TOO_MANY_ATTEMPTS,
      undefined,
      {},
      429,
      'Too many attempts. Please wait a moment.'
    );
  },
});

// ----------- 登录路由 -----------
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const usernameInput = email || '';
    const key = getKey(email, req);

    // A) 已锁定：直接拦住
    if (isLocked(key)) {
      const lockedUntil = currentLockedUntil(key);
      await recordLoginEvent({
        req, usernameInput, userId: null,
        code: SC.AuthCodes.ACCOUNT_LOCKED, success: false,
        serverReason: 'account temporarily locked'
      });
      return respondFail(
        res,
        SC.AuthCodes.ACCOUNT_LOCKED,
        undefined,
        { lockedUntil },
        403,
        'Too many attempts. Try again later.'
      );
    }

    // B) 缺字段
    if (!email || !password) {
      await recordLoginEvent({
        req, usernameInput, userId: null,
        code: SC.AuthCodes.INVALID_CREDENTIALS, success: false,
        serverReason: 'missing email or password'
      });
      return respondFail(
        res,
        SC.AuthCodes.INVALID_CREDENTIALS,
        undefined,
        {},
        undefined,
        'Please enter both email and password.'
      );
    }

    // C) 演示账号（只为打通链路）
    const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@example.com';
    const DEMO_PASS  = process.env.DEMO_USER_PASSWORD || 'demo123';

    // D) 校验失败 → 计数/可能触发锁定
    if (email !== DEMO_EMAIL || password !== DEMO_PASS) {
      const lockedUntil = noteFailure(key);
      const code = lockedUntil ? SC.AuthCodes.ACCOUNT_LOCKED : SC.AuthCodes.INVALID_CREDENTIALS;

      await recordLoginEvent({
        req, usernameInput, userId: null, code,
        success: false,
        serverReason: lockedUntil ? 'locked after too many attempts' : 'email/password mismatch'
      });

      return respondFail(
        res,
        code,
        undefined,
        lockedUntil ? { lockedUntil } : {},
        lockedUntil ? 403 : undefined,
        lockedUntil ? 'Too many attempts. Try again later.' : 'Forgot password? Reset it to continue.'
      );
    }

    // E) 成功 → 清空失败计数
    resetAttempts(key);

    await recordLoginEvent({
      req, usernameInput, userId: 'demo-user',
      code: SC.AuthCodes.OK, success: true,
      serverReason: 'mock success'
    });

    return respondOk(res, { userId: 'demo-user' });
  } catch (err) {
    console.error('[auth.login.error]', err);
    return res.status(500).json({
      status: 'fail',
      code: 'INTERNAL_ERROR',
      message: 'Internal error. Please try again later.',
    });
  }
});

module.exports = router;
