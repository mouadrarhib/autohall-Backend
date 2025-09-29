// src/config/database.js
import { Sequelize } from 'sequelize';

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 1433);

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mssql',
  logging: false,
  pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  dialectOptions: {
    options: {
      encrypt: false,               // set to true if your server requires TLS (e.g., Azure SQL)
      trustServerCertificate: true, // handy for local dev
      requestTimeout: 30000
    }
  },
  define: {
    freezeTableName: true,
    timestamps: false
  }
});
