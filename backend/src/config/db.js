const mysql = require("mysql2");
require("dotenv").config();

function getCaCert() {
  if (process.env.DB_CA_CERT_PATH) {
    return require("fs").readFileSync(process.env.DB_CA_CERT_PATH, "utf8");
  }
  if (process.env.DB_CA_CERT) {
    return process.env.DB_CA_CERT.replace(/\\n/g, "\n");
  }
  return undefined;
}

const sslConfig =
  process.env.DB_SSL === "true"
    ? { ca: getCaCert(), rejectUnauthorized: true }
    : undefined;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: sslConfig,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
    return;
  }

  if (connection) connection.release();
  console.log("✅ Connected to MySQL database");
});

module.exports = db;