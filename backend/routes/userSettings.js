// backend/routes/userSettings.js
// Single-file router for both Profile & User Preference.
//
// Endpoints:
//   GET    /api/user/settings/profile/me
//   PUT    /api/user/settings/profile
//   POST   /api/user/settings/profile/avatar   (multipart/form-data, field: avatar)
//   GET    /api/user/settings/preferences/me
//   PUT    /api/user/settings/preferences
//
// NOTE: Replace requireAuth with your actual auth middleware (JWT/session).
//       For demo, it reads req.headers['x-demo-user-id'] as user id.

const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");

const router = express.Router();

// ------------------------- Auth (stub) -------------------------
const requireAuth = (req, _res, next) => {
  if (!req.user) {
    // In production, replace with real JWT middleware and numeric user id from token.
    const raw = req.headers["x-demo-user-id"];
    const demoId = Number.isFinite(Number(raw)) ? Number(raw) : 1; // default to user_id = 1
    req.user = { id: demoId };
  }
  next();
};

// ------------------------- Upload (multer) -------------------------
const AVATAR_DIR = path.join(__dirname, "..", "public", "uploads", "avatars");
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".png");
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(png|jpeg|jpg|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error("Invalid file type"), ok);
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// ------------------------- Service (MySQL) -------------------------
const {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences
} = require("../services/userSettingsService");

// ------------------------- Routes -------------------------

// Profile
router.get("/profile/me", requireAuth, async (req, res, next) => {
  try {
    const doc = await getProfile(req.user.id);
    res.json(doc);
  } catch (e) { next(e); }
});

router.put("/profile", requireAuth, async (req, res, next) => {
  try {
    const { displayName, bio } = req.body || {};
    const doc = await updateProfile(req.user.id, { displayName, bio });
    res.json(doc);
  } catch (e) { next(e); }
});

router.post("/profile/avatar", requireAuth, upload.single("avatar"), async (req, res, next) => {
  try {
    // Serve via /uploads; app.js must expose static dir (see instruction below).
    const rel = path.join("uploads", "avatars", path.basename(req.file.path));
    const publicUrl = `/${rel.replace(/\\+/g, "/")}`;
    const doc = await updateProfile(req.user.id, { avatarUrl: publicUrl });
    res.json(doc);
  } catch (e) { next(e); }
});

// Preferences
router.get("/preferences/me", requireAuth, async (req, res, next) => {
  try {
    const doc = await getPreferences(req.user.id);
    res.json(doc);
  } catch (e) { next(e); }
});

router.put("/preferences", requireAuth, async (req, res, next) => {
  try {
    const doc = await updatePreferences(req.user.id, req.body || {});
    res.json(doc);
  } catch (e) { next(e); }
});

module.exports = router;