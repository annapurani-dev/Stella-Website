const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all categories
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST new category
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const result = await db.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
            [name, description || '']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT update category
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const result = await db.query(
            'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE category
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
