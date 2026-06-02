require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function initDB() {
    try {
        console.log('Reading schema.sql...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        console.log('Executing schema to create tables...');
        await pool.query(schema);
        
        console.log('Database tables created successfully!');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await pool.end();
    }
}

initDB();
