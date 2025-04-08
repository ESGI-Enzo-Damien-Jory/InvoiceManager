require('dotenv').config();
const mysql = require('mysql2/promise');

/* istanbul ignore next */
const pool = mysql.createPool({
  host: process.env.TEST_DB_HOST || process.env.DB_HOST,
  user: process.env.TEST_DB_USER || process.env.DB_USER,
  password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.TEST_DB_NAME || process.env.DB_NAME,
  port: process.env.TEST_DB_PORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
module.exports = pool;
