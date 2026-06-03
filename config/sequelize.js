const { Sequelize } = require('sequelize');
require('dotenv').config();

const sslEnabled = String(process.env.SSL || '').toLowerCase() === 'require';

const dbPort = Number(process.env.DB_PORT || process.env.MYSQL_PORT || process.env.DBPORT || 3306);

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  port: dbPort,
  dialect: 'mysql',
  logging: false,
  dialectOptions: sslEnabled
    ? {
        ssl: {
          rejectUnauthorized: true,
        },
      }
    : {},
});

module.exports = sequelize;