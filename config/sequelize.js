const { Sequelize } = require('sequelize');
require('dotenv').config();

const sslEnabled = String(process.env.SSL || '').toLowerCase() === 'require';

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  port: Number(process.env.PORT || 3306),
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