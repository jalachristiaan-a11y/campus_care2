const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const missingSettings = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
  .filter((name) => !process.env[name]);

if (!connectionString && missingSettings.length > 0) {
  throw new Error(`Database configuration is incomplete. Set DATABASE_URL or ${missingSettings.join(', ')}.`);
}

const pool = new Pool(connectionString
  ? { connectionString }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionTimeoutMillis: 5000,
    });

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

module.exports = pool;