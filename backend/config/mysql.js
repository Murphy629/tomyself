// backend/config/mysql.js
// MySQL connection pool using mysql2/promise and your .env values

const mysql = require('mysql2/promise');
require('dotenv').config(); // loads .env at project root

const {
  MYSQL_HOST = '127.0.0.1', // assign default value, can be dropped
  MYSQL_PORT = '3306', // same
  MYSQL_DATABASE,
  MYSQL_USER,
  MYSQL_PASSWORD,
  // Optional pool tuning
  MYSQL_CONN_LIMIT = '10',
  MYSQL_QUEUE_LIMIT = '0',
  MYSQL_WAIT_FOR_CONNECTIONS = 'true',
} = process.env;

// Create a reusable pool
const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: MYSQL_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: Number(MYSQL_CONN_LIMIT),
  queueLimit: Number(MYSQL_QUEUE_LIMIT),
  // Helpful defaults
  dateStrings: true,           // return DATETIME as strings
  namedPlaceholders: true,     // support :name parameters
});

// Optional: quick connectivity check at boot
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`[mysql] ✅ Connected to ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE} as ${MYSQL_USER}`);
  } catch (err) {
    console.error('[mysql] ❌ Connection failed:', err.message);
  }
})();

// Helper for one-off queries
async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Graceful shutdown
function closePool() {
  return pool.end();
}

module.exports = { pool, query, closePool };
