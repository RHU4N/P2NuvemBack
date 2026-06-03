const mysql = require('mysql2/promise');
require('dotenv').config();

const sslEnabled = String(process.env.SSL || '').toLowerCase() === 'require';

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.HOST,
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || process.env.DBPORT || 3306),
    user: process.env.USER,
    password: process.env.PASSWORD,
    ssl: sslEnabled ? { rejectUnauthorized: true } : undefined,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );

  await connection.end();
}

module.exports = {
  ensureDatabase,
};