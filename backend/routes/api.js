const express = require('express');
const router = express.Router();
const { queryApi } = require('../influxClient');

router.get('/data', async (req, res) => {
  const flux = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
    |> range(start: -1h)
    |> limit(n: 20)`;

  const out = [];
  try {
    await queryApi.queryRows(flux, {
      next(row, tableMeta) { out.push(tableMeta.toObject(row)); },
      error(err) { console.error(err); res.status(500).send(String(err)); },
      complete() { res.json(out); }
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get('/health', (_req, res) => {
  res.json({ ok: true, mode: (process.env.INFLUX_MODE || 'remote') });
});

module.exports = router;