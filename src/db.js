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

  if (
    process.env.DB_PASSWORD === 'sett_ditt_passord_her' ||
    process.env.DB_PASSWORD === 'your_postgres_password'
  ) {
    throw new Error(
      'Fjern plassholderen i DB_PASSWORD i .env. Bruk det faktiske PostgreSQL-passordet ditt, eller la feltet være tomt hvis databasen din ikke bruker passord lokalt.'
    );
  }
}

async function testConnection() {
  await pool.query('SELECT 1');
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name     VARCHAR(255) NOT NULL,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      price       NUMERIC(10,2) NOT NULL,
      image_path  VARCHAR(255),
      stock       INTEGER NOT NULL DEFAULT 0,
      category    VARCHAR(50) NOT NULL
                  CHECK (category IN ('musikere','blomster','kake','bordkort')),
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status      VARCHAR(50) NOT NULL DEFAULT 'pending',
      total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id          SERIAL PRIMARY KEY,
      order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
      quantity    INTEGER NOT NULL DEFAULT 1,
      unit_price  NUMERIC(10,2) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id            SERIAL PRIMARY KEY,
      username      VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);
}

function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  initializeDatabase,
  query,
  pool,
  testConnection,
  validateDatabaseConfig,
};
