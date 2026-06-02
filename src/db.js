const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

function validateDatabaseConfig() {
  const requiredFields = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER'];
  const missingFields = requiredFields.filter((field) => !process.env[field]);

  if (missingFields.length > 0) {
    throw new Error(`Mangler miljoverdier: ${missingFields.join(', ')}`);
  }

  if (process.env.DB_PASSWORD === 'sett_ditt_passord_her' || process.env.DB_PASSWORD === 'your_postgres_password') {
    throw new Error('Fjern plassholderen i DB_PASSWORD i .env. Bruk det faktiske PostgreSQL-passordet ditt, eller la feltet være tomt hvis databasen din ikke bruker passord lokalt.');
  }
}

async function testConnection() {
  await pool.query('SELECT 1');
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS names (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  initializeDatabase,
  query,
  testConnection,
  validateDatabaseConfig,
};