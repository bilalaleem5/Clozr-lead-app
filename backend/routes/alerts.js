const express = require('express');
const router = express.Router();
const db = require('../db/config');

// POST /api/alerts
router.post('/', async (req, res) => {
    const { lead_id, type, message } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO alerts (lead_id, type, message) VALUES ($1, $2, $3) RETURNING *',
            [lead_id, type, message]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create alert', details: error.message });
    }
});

// GET /api/alerts (unseen alerts)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM alerts WHERE seen = false ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.json([]);
    }
});

module.exports = router;
