// backend/services/userSettingsService.js
// MySQL-backed service for Profile & Preferences (no language).
// All comments in English.

const { getPool } = require("../config/mysql");

// ---------- helpers ----------
function toRowOrDefaultProfile(row, userId) {
  if (!row) {
    return {
      user_id: userId,
      display_name: "",
      bio: "",
      avatar_url: ""
    };
  }
  return row;
}

function toRowOrDefaultPrefs(row, userId) {
  if (!row) {
    return {
      user_id: userId,
      theme: "system",
      notif_email: 1,
      notif_inapp: 1,
      interests: "[]"
    };
  }
  return row;
}

function normalizePrefs(row) {
  // Shape for API response
  return {
    userId: row.user_id,
    theme: row.theme || "system",
    notifications: {
      email: !!row.notif_email,
      inApp: !!row.notif_inapp
    },
    interests: row.interests ? JSON.parse(row.interests) : []
  };
}

function normalizeProfile(row) {
  return {
    userId: row.user_id,
    displayName: row.display_name || "",
    bio: row.bio || "",
    avatarUrl: row.avatar_url || ""
  };
}

// ---------- Profile ----------
async function getProfile(userId) {
  const pool = getPool();
  const [rows] = await pool.query("SELECT * FROM profiles WHERE user_id = ?", [userId]);
  const row = toRowOrDefaultProfile(rows[0], userId);

  // Auto-create empty row if not exists
  if (!rows[0]) {
    await pool.query("INSERT INTO profiles (user_id) VALUES (?)", [userId]);
  }
  return normalizeProfile(row);
}

async function updateProfile(userId, partial) {
  const pool = getPool();
  const current = await getProfile(userId);
  const toSave = {
    display_name: partial.displayName ?? current.displayName,
    bio: partial.bio ?? current.bio,
    avatar_url: partial.avatarUrl ?? current.avatarUrl
  };

  await pool.query(
    `INSERT INTO profiles (user_id, display_name, bio, avatar_url)
     VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE
       display_name=VALUES(display_name),
       bio=VALUES(bio),
       avatar_url=VALUES(avatar_url)`,
    [userId, toSave.display_name, toSave.bio, toSave.avatar_url]
  );

  return getProfile(userId);
}

// ---------- Preferences (NO language) ----------
async function getPreferences(userId) {
  const pool = getPool();
  const [rows] = await pool.query("SELECT * FROM preferences WHERE user_id = ?", [userId]);
  const row = toRowOrDefaultPrefs(rows[0], userId);

  if (!rows[0]) {
    await pool.query("INSERT INTO preferences (user_id) VALUES (?)", [userId]);
  }
  return normalizePrefs(row);
}

async function updatePreferences(userId, partial) {
  const pool = getPool();
  const current = await getPreferences(userId);

  const merged = {
    theme: partial.theme ?? current.theme,
    notif_email:
      partial.notifications?.email !== undefined ? !!partial.notifications.email : current.notifications.email,
    notif_inapp:
      partial.notifications?.inApp !== undefined ? !!partial.notifications.inApp : current.notifications.inApp,
    interests: JSON.stringify(Array.isArray(partial.interests) ? partial.interests : current.interests)
  };

  await pool.query(
    `INSERT INTO preferences (user_id, theme, notif_email, notif_inapp, interests)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       theme=VALUES(theme),
       notif_email=VALUES(notif_email),
       notif_inapp=VALUES(notif_inapp),
       interests=VALUES(interests)`,
    [userId, merged.theme, merged.notif_email, merged.notif_inapp, merged.interests]
  );

  return getPreferences(userId);
}

module.exports = {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences
};