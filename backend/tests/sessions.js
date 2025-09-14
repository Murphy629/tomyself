// WARNING: This route should be disabled in production

// Express routes to test MySQL, InfluxDB, Grafana, and backend connectivity

const express = require('express');
const router = express.Router();

// GET /tests/sessions - return current session content (for testing only)
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.type('application/json');
  res.status(200).json({
    sessionID: req.sessionID,
    session: req.session || {}
  });
});



module.exports = router;