# Auth Login API（后端返回规范）
> 版本：v1.0  
> 最近更新：2025-09-08

本接口用于登录校验，并将**统一的 JSON 结构**返回给前端。无论成功或失败，格式都一致，便于前端按 `code` 分支展示。

---

## 1. 基本信息

- **Method**：POST  
- **URL**：`/api/auth/login`
- **Headers**
  - `Content-Type: application/json`
- **CORS**：需将前端地址加入后端 `CORS_WHITELIST`（例如 `http://localhost:5173`）。

### 请求体（Request Body）
```json
{
  "email": "string",
  "password": "string"
}


## 2. 统一响应结构（Response Shape）

所有响应均包含以下字段：

字段	 类型	 说明
status	string	"ok" 或 "fail"
code	string	机器可读的原因码（前端据此分支 UI）
message	string	面向用户的简短提示
traceId	string	用于后端排查（日志里可搜到同一 ID）
data	object	成功时返回的业务数据（失败时通常为空对象）
context	object	额外上下文信息（如 lockedUntil）
prompt	string?	（可选）给用户的下一步引导文案

说明：prompt 仅在某些失败场景下返回，用于让前端更友好地引导用户（例如“忘记密码？”）。


## 3. 示例
3.1 成功示例
{
  "status": "ok",
  "code": "OK",
  "message": "OK",
  "traceId": "K7KZ1N-3F8Q9R",
  "data": {
    "userId": "u_123"
  },
  "context": {}
}
3.2 失败示例：账号或密码错误

HTTP：401 Unauthorized

{
  "status": "fail",
  "code": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect.",
  "traceId": "K7KZ1N-3F8Q9R",
  "context": {},
  "prompt": "Forgot password? Reset it to continue."
}

3.3 失败示例：连续失败过多，被临时锁定
HTTP：403 Forbidden

{
  "status": "fail",
  "code": "ACCOUNT_LOCKED",
  "message": "Your account is temporarily locked. Please try again later.",
  "traceId": "K7KZ1N-3F8Q9R",
  "context": {
    "lockedUntil": "2025-09-08T09:15:00.000Z"
  },
  "prompt": "Too many attempts. Try again later."
}

3.4 失败示例：接口限流（短时间内请求过快）

HTTP：429 Too Many Requests

{
  "status": "fail",
  "code": "TOO_MANY_ATTEMPTS",
  "message": "Too many attempts. Please wait and try again.",
  "traceId": "K7KZ1N-3F8Q9R",
  "context": {},
  "prompt": "Too many attempts. Please wait a moment."
}


## 4. 错误码与 HTTP 对照
code	            HTTP	                   含义
OK	                200	                       成功
INVALID_CREDENTIALS	401	                  账号或密码不正确
TOKEN_INVALID	    401	           无效/缺失令牌（用于需要鉴权的接口）
TOKEN_EXPIRED	    401	             令牌过期（用于需要鉴权的接口）
ACCOUNT_LOCKED	    403	   登录失败过多，被临时锁定（context.lockedUntil 告知何时可重试）
EMAIL_NOT_VERIFIED	403	            邮箱未验证（暂未在演示路由中启用）
MFA_REQUIRED	    403	            需要二次验证（暂未在演示路由中启用）
TOO_MANY_ATTEMPTS	429	               接口限流（短时间内请求过快）

后端会根据 code 自动映射 HTTP 状态码，前端可直接根据 code 做 UI 分支。



## 5. 行为策略（当前后端实现）
5.1 连续失败锁定（示例实现）

阈值：同一邮箱（或无邮箱则按 IP）在 15 分钟内连续失败 ≥ 5 次，将被锁定。

锁定时长：15 分钟。

返回：403 + code=ACCOUNT_LOCKED，并在 context.lockedUntil 告知前端解锁时间。

成功登录：清空该邮箱（或 IP）的失败计数。

注：以上为内存版策略，服务重启后计数会清零；用于本地开发与联调。生产可改为持久化方案。

5.2 接口限流（示例实现）

规则（演示值）：10 秒内最多 3 次请求，超出返回 429 + code=TOO_MANY_ATTEMPTS。

该值仅为方便开发/测试演示，实际可按产品要求调整更合理的阈值与时间窗。



## 6. 前端集成建议（重要）

以 code 为准 做分支，而非仅依赖文案：

INVALID_CREDENTIALS：表单上方展示 message，可结合 prompt 显示“忘记密码”入口。

ACCOUNT_LOCKED：根据 context.lockedUntil 做倒计时或禁用按钮，展示 message/prompt。

TOO_MANY_ATTEMPTS：短提示“操作过快”，在提示后若干秒允许再次尝试。

国际化（i18n）：

可本地维护 code → 文案 的映射；

或直接使用后端返回的 message/prompt（当前为英文，可按需改造）。

错误兜底：

未知错误或网络异常：统一做“稍后重试”的兜底文案，便于用户理解。


## 7. 审计 & 隐私
后端已记录以下信息（后台日志或后续入库）：时间、邮箱输入、成功/失败、原因码、IP、User-Agent（解析为 OS/浏览器/平台）、基于 IP 的 country/region/city。

这些审计信息不会返回给前端，仅用于安全风控与问题排查。必要时仅在 context 返回极少量业务上下文（如锁定到期时间）。


## 8. 变更记录（Changelog）

v1.0（2025-09-08）：定义统一响应结构与错误码；新增 prompt；提供示例锁定策略与限流策略；补充调试示例与前端集成建议。