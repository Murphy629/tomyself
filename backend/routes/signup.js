// Express routes for signup only
const express = require("express");
const router = express.Router();
const { findUserByEmail, createUserPending, verifyEmail, resendVerification } = require("../services/signupService");

// POST /signup/check-email
router.post("/check-email", async (req, res) => {
  const { email } = req.body || {};
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
  const { email, password, fullname } = req.body || {};
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

module.exports = router;