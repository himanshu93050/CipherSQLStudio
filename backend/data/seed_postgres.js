require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const sql = fs.readFileSync(path.join(__dirname, 'pg_seed.sql'), 'utf8');

(async () => {
  try {
    console.log('Seeding Postgres...');
    await pool.query(sql);
    console.log('Postgres seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
