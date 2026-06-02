const { Client } = require('pg');
require('dotenv').config();

// Parse the connection string to replace the DB name
const connectionString = process.env.DATABASE_URL;
const baseConnectionString = connectionString.replace(/\/stella_mobiles$/, '/postgres');

const client = new Client({
  connectionString: baseConnectionString,
});

async function createDb() {
  try {
    await client.connect();
    console.log('🔗 Connected to postgres system database...');
    
    // Check if db exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'stella_mobiles'");
    if (res.rows.length === 0) {
      console.log('🏗️ Creating database "stella_mobiles"...');
      await client.query('CREATE DATABASE stella_mobiles');
      console.log('✅ Database created.');
    } else {
      console.log('ℹ️ Database "stella_mobiles" already exists.');
    }
    
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create database:', err);
    await client.end();
    process.exit(1);
  }
}

createDb();
