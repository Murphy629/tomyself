// Express routes for signup only
const express = require("express");
const router = express.Router();
const { findUserByEmail, createUserPending, verifyEmail, resendVerification } = require("../services/signupService");

const crypto = require("crypto");

// Minimal HS256 signer for session token
function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function signHS256(payloadObj, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = b64url(JSON.stringify(header));
  const payloadB64 = b64url(JSON.stringify(payloadObj));
  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${data}.${sig}`;
}

// POST /signup/check-email
router.post("/check-email", async (req, res) => {
  let { email } = req.body || {};
  email = (email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    const user = await findUserByEmail(email);
    res.json({ exists: !!user, verified: user?.email_verified || false });
  } catch (e) {
    console.error(e); res.status(500).json({ message: "Internal error" });
  }
});

// POST /signup
router.post("/", async (req, res) => {
  let { email, password, fullname } = req.body || {};
  email = (email || "").trim().toLowerCase();
  fullname = (fullname || "").trim();
  if (!email || !password || !fullname) return res.status(400).json({ message: "email, password and fullname are required" });
  try {
    const out = await createUserPending({ email, username: fullname, password });
    if (!out.ok && out.code === "EMAIL_EXISTS") return res.status(409).json({ message: "Email already exists" });
    res.json({ message: "Verification email sent" });
  } catch (e) {
    console.error("[/signup] error:", e?.stack || e);
    return res.status(500).json({ message: "Internal error" });
  }
});

// POST /signup/verify-email
router.post("/verify-email", async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ message: "token is required" });
  try {
    const out = await verifyEmail(token);
    if (!out.ok) return res.status(400).json({ message: out.code });
    res.json({ message: "Email verified" });
  } catch (e) {
    console.error(e); res.status(500).json({ message: "Internal error" });
  }
});

// POST /signup/resend
router.post("/resend", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    await resendVerification(email);
    res.json({ message: "If the account exists and is unverified, a new email was sent." });
  } catch (e) {
    console.error(e); res.status(500).json({ message: "Internal error" });
  }
});

// GET /signup/verify?token=...
router.get("/verify", async (req, res) => {
  const base = process.env.APP_BASE_URL || "http://localhost:5173";
  const okPath = process.env.VERIFY_REDIRECT_OK || "/verify/success";   // success page
  const failPath = process.env.VERIFY_REDIRECT_FAIL || "/verify/fail";  // fail page
  const toOk = `${base}${okPath}`;
  const toFail = `${base}${failPath}`;

  const token = req.query?.token;
  if (!token) {
    console.warn(`[verify] missing token, redirect -> ${toFail}`);
    return res.redirect(toFail);
  }

  try {
    const out = await verifyEmail(token); // expected to return { ok: boolean, email?: string }
    if (!out || !out.ok) {
      console.warn(`[verify] failed verification, redirect -> ${toFail}`);
      return res.redirect(toFail);
    }

    // Build a simple session token and set cookie (login after verify)
    const secret = process.env.SESSION_SECRET || "dev_secret_change_me";
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: out.email || "user", // if service returns email, include it
      iat: now,
      exp: now + 7 * 24 * 3600, // 7 days
      scope: "user"
    };
    const session = signHS256(payload, secret);

    const cookieName = process.env.COOKIE_NAME || "sid";
    const cookieSecure = String(process.env.COOKIE_SECURE || "").toLowerCase() === "true";
    const cookieDomain = (process.env.COOKIE_DOMAIN || "").trim() || undefined;

    res.cookie(cookieName, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure,
      domain: cookieDomain,
      path: "/",
      maxAge: 7 * 24 * 3600 * 1000,
    });

    console.log(`[verify] success, set cookie and redirect -> ${toOk}`);
    return res.redirect(toOk);
  } catch (e) {
    console.error("[/signup/verify] error:", e?.stack || e);
    console.warn(`[verify] exception, redirect -> ${toFail}`);
    return res.redirect(toFail);
  }
});

module.exports = router;