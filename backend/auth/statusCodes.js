// 统一的登录/鉴权状态码与默认文案（前端用 code 做分支）

const AuthCodes = {
    OK: 'OK',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS', // 账号或密码不正确
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',           // 连续失败后临时锁定
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',   // 邮箱未验证
    MFA_REQUIRED: 'MFA_REQUIRED',               // 需要二次验证
    TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',     // 触发限流/频控
    TOKEN_INVALID: 'TOKEN_INVALID',             // 无效 JWT/Session
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',             // 过期 JWT/Session
  };
  
  const DefaultClientMessages = {
    [AuthCodes.OK]: 'OK',
    [AuthCodes.INVALID_CREDENTIALS]: 'Email or password is incorrect.',
    [AuthCodes.ACCOUNT_LOCKED]: 'Your account is temporarily locked. Please try again later.',
    [AuthCodes.EMAIL_NOT_VERIFIED]: 'Please verify your email before logging in.',
    [AuthCodes.MFA_REQUIRED]: 'Additional verification required.',
    [AuthCodes.TOO_MANY_ATTEMPTS]: 'Too many attempts. Please wait and try again.',
    [AuthCodes.TOKEN_INVALID]: 'Invalid or missing token.',
    [AuthCodes.TOKEN_EXPIRED]: 'Your session has expired. Please login again.',
  };
  
  module.exports = { AuthCodes, DefaultClientMessages };
  