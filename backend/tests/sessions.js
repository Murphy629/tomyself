// WARNING: This route should be disabled in production

// Express routes to test MySQL, InfluxDB, Grafana, and backend connectivity

const express = require('express');
const router = express.Router();

// GET /tests/sessions - return current session content (for testing only)
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.type('application/json');
    req.session.viewedAt = Date.now(); // ensure an upsert happens
    res.status(200).json({
      sessionID: req.sessionID,
      session: req.session
    });
  } finally {
    if (!res.writableEnded) res.end();
  }
});



module.exports = router;