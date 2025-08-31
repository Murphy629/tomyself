// Express bootstrap with CORS (dev), security headers, and stub APIs.
// All comments are in English.

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
app.use(express.json({ limit: '1mb' }))

// ----- CORS (Dev) -----
const whitelist = (process.env.CORS_WHITELIST || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const corsOptions = {
  origin(origin, cb) {
    if (!origin || whitelist.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  maxAge: 86400
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) // fast preflight

// ----- Security headers -----
// We allow <iframe> embedding because Grafana panels will be embedded.
app.use(helmet({ frameguard: false, crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' } }))

// ----- Health -----
app.get('/api/health', (_, res) => res.json({ ok: true }))

// ----- Influx write stub (will implement later) -----
app.post('/api/influx/write', async (req, res) => {
  // For now, just echo to prove CORS/JSON works:
  res.json({ ok: true, received: req.body })
})

// ----- Start -----
const PORT = Number(process.env.PORT || 3000)
app.listen(PORT, () => console.log(`API listening on :${PORT}`))