// Minimal mailer; if SMTP_USER is empty -> mock to console
const nodemailer = require("nodemailer");

const mock = !process.env.SMTP_USER;

let transporter = null;
if (!mock) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function appBase() { return process.env.APP_BASE_URL || "http://localhost:5173"; }
function backendBase() { return process.env.BACKEND_BASE_URL || ""; }
const VERIFY_HOURS = Number(process.env.VERIFY_TOKEN_HOURS || 24);

async function sendVerification(to, rawToken) {
  const link = backendBase()
    ? `${backendBase()}/signup/verify?token=${encodeURIComponent(rawToken)}`
    : `${appBase()}/verify?token=${encodeURIComponent(rawToken)}`;
  if (mock) {
    console.log("=== MOCK VERIFY EMAIL ===");
    console.log("To:", to);
    console.log("Link:", link);
    console.log("(Set SMTP_USER/SMTP_PASS to actually send email.)");
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Verify your email",
    html: `<p>Please verify your email:</p><p><a href="${link}">${link}</a></p><p>Expires in ${VERIFY_HOURS}h.</p>`,
  });
}

module.exports = { sendVerification };