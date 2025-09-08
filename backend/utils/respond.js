const express = require('express');
const router = express.Router();

const { respondOk, respondFail } = require('../utils/respond');
const { AuthCodes } = require('../auth/statusCodes');
const { recordLoginEvent } = require('../services/audit');

// 简化版登录：先用 demo 账号跑通链路，之后再接真实 DB
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const usernameInput = email || '';

  // 1) 基本校验：缺字段
  if (!email || !password) {
    await recordLoginEvent({
      req, usernameInput, userId: null,
      code: AuthCodes.INVALID_CREDENTIALS, success: false,
      serverReason: 'missing email or password'
    });
    return respondFail(
      res,
      AuthCodes.INVALID_CREDENTIALS,
      undefined,
      {},
      undefined,
      'Please enter both email and password.'
    );
  }

  // 2) 模拟账号（仅用于跑通）
  const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@example.com';
  const DEMO_PASS  = process.env.DEMO_USER_PASSWORD || 'demo123';

  // 3) 校验失败 → 返回明确原因码 + 提示
  if (email !== DEMO_EMAIL || password !== DEMO_PASS) {
    await recordLoginEvent({
      req, usernameInput, userId: null,
      code: AuthCodes.INVALID_CREDENTIALS, success: false,
      serverReason: 'email/password mismatch'
    });
    return respondFail(
      res,
      AuthCodes.INVALID_CREDENTIALS,
      undefined,          // 用默认 message
      {},                 // context
      undefined,          // httpStatus 自动映射 401
      'Forgot password? Reset it to continue.' // ✅ 提示
    );
  }

  // 4) 成功
  await recordLoginEvent({
    req, usernameInput, userId: 'demo-user',
    code: AuthCodes.OK, success: true,
    serverReason: 'mock success'
  });

  return respondOk(res, { userId: 'demo-user' });
});

module.exports = router;
