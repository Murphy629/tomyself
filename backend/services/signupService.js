// Signup business logic (InfluxDB + Argon2 + token storage)
const { Point } = require("@influxdata/influxdb-client");
const { writeUsers, writeTokens, queryUsers, queryTokens, BUCKET_USERS, BUCKET_TOKENS } = require("../config/influx");
const argon2 = require("argon2");
const crypto = require("crypto");
const { nanoid } = require("nanoid");
const mailer = require("./signupMailer");

const VERIFY_HOURS = Number(process.env.VERIFY_TOKEN_HOURS || 24);
const nowMs = () => Date.now();
const expiresInMs = (h) => nowMs() + h * 60 * 60 * 1000;
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Return { email, username, password_hash, email_verified } or null
async function findUserByEmail(email) {
  const flux = `
    from(bucket: "${BUCKET_USERS}")
      |> range(start: -30y)
      |> filter(fn: (r) => r._measurement == "users" and r.email == "${email}")
      |> keep(columns: ["_time","_field","_value","email"])
      |> group(columns: ["_field","email"])
      |> sort(columns: ["_time"], desc: true)
      |> unique(column: "_time")
      |> pivot(rowKey:["_time"], columnKey:["_field"], valueColumn:"_value")
      |> keep(columns: ["email","username","password_hash","email_verified"])
      |> limit(n: 1)
  `;
  const rows = [];
  await queryUsers.collectRows(flux, rows);
  if (rows.length === 0) return null;
  const r = rows[0];
  const obj = {
    email: r.email,
    username: r.username,
    password_hash: r.password_hash,
    email_verified: !!r.email_verified,
  };
  return obj.password_hash ? obj : null;
}

async function createUserPending({ email, username, password }) {
  const exists = await findUserByEmail(email);
  if (exists) return { ok: false, code: "EMAIL_EXISTS" };

  const password_hash = await argon2.hash(password, { type: argon2.argon2id });
  writeUsers.writePoint(new Point("users")
    .tag("email", email)
    .tag("username", username)
    .stringField("username", username)
    .stringField("password_hash", password_hash)
    .booleanField("email_verified", false)
  );
  await writeUsers.flush();

  const raw = `${nanoid(12)}.${nanoid(18)}`;
  const tokenHash = sha256(raw);
  writeTokens.writePoint(new Point("tokens")
    .tag("email", email)
    .tag("type", "verify")
    .stringField("token", tokenHash)
    .intField("expires_at", expiresInMs(VERIFY_HOURS))
    .booleanField("used", false)
  );
  await writeTokens.flush();

  await mailer.sendVerification(email, raw);
  return { ok: true };
}

async function getVerifyTokenMeta(hashedToken) {
  const q1 = `
    from(bucket: "${BUCKET_TOKENS}")
      |> range(start: -14d)
      |> filter(fn: (r) => r._measurement == "tokens" and r.type == "verify" and r._field == "token" and r.token == "${hashedToken}")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n:1)
      |> keep(columns:["email"])
  `;
  const rows = [];
  await queryTokens.collectRows(q1, rows);
  if (rows.length === 0) return null;
  const email = rows[0].email;

  const q2 = `
    from(bucket: "${BUCKET_TOKENS}")
      |> range(start: -14d)
      |> filter(fn: (r) => r._measurement == "tokens" and r.type == "verify" and r.email == "${email}")
      |> filter(fn: (r) => r._field == "expires_at" or r._field == "used")
      |> sort(columns: ["_time"], desc: true)
      |> pivot(rowKey:["_time"], columnKey:["_field"], valueColumn:"_value")
      |> keep(columns:["expires_at","used"])
      |> limit(n:1)
  `;
  const metaRows = [];
  await queryTokens.collectRows(q2, metaRows);
  if (metaRows.length === 0) return { email, expiresAt: 0, used: false };

  const m = metaRows[0];
  const expiresAt = Number(m.expires_at) || 0;
  const used = !!m.used;
  return { email, expiresAt, used };
}

async function verifyEmail(rawToken) {
  const tokenHash = sha256(rawToken);
  const meta = await getVerifyMeta(tokenHash);
  if (!meta) return { ok: false, code: "TOKEN_INVALID" };
  if (meta.used) return { ok: false, code: "TOKEN_USED" };
  if (Date.now() > meta.expiresAt) return { ok: false, code: "TOKEN_EXPIRED" };

  writeTokens.writePoint(new Point("tokens").tag("email", meta.email).tag("type", "verify").booleanField("used", true));
  writeUsers.writePoint(new Point("users").tag("email", meta.email).booleanField("email_verified", true));
  await writeTokens.flush();
  await writeUsers.flush();
  return { ok: true };
}

async function resendVerification(email) {
  const user = await findUserByEmail(email);
  if (!user || user.email_verified) return { ok: true };

  const raw = `${nanoid(12)}.${nanoid(18)}`;
  const tokenHash = sha256(raw);
  writeTokens.writePoint(new Point("tokens")
    .tag("email", email).tag("type", "verify")
    .stringField("token", tokenHash)
    .intField("expires_at", expiresInMs(VERIFY_HOURS))
    .booleanField("used", false));
  await writeTokens.flush();
  await mailer.sendVerification(email, raw);
  return { ok: true };
}

module.exports = { findUserByEmail, createUserPending, verifyEmail, resendVerification };