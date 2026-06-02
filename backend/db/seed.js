const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Read schema
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Schema initialized.');

    // Read seed data
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await pool.query(seedSql);
    console.log('✅ Dummy data seeded.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
