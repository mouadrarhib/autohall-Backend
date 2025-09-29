// src/models/index.js
import { sequelize } from '../config/database.js';

export async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    // for production with existing schema, don’t alter:
    await sequelize.sync({ alter: false });
    console.log('✅ Database schema synchronized (no destructive changes).');
  } catch (error) {
    console.error('❌ Unable to connect to the database: ', error.message);
    throw error; // let app.js handle fatal error
  }
}

export default {};
