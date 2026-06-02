const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all site configurations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT config_key, config_value FROM site_config');
    const config = {};
    result.rows.forEach(row => {
      config[row.config_key] = row.config_value;
    });
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get configuration by key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query('SELECT config_value FROM site_config WHERE config_key = $1', [key]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.json(result.rows[0].config_value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update or create configuration
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const result = await pool.query(
      `INSERT INTO site_config (config_key, config_value) 
       VALUES ($1, $2) 
       ON CONFLICT (config_key) 
       DO UPDATE SET config_value = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, value]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
