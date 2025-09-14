// WARNING: This route should be disabled in production

// Express routes to test MySQL, InfluxDB, Grafana, and backend connectivity

const express = require('express');
const router = express.Router();

// GET /tests/sessions - return current session content (for testing only)
router.get('/', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session
  });
});




module.exports = router;