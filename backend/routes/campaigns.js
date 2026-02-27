const express = require('express');
const router = express.Router();
const db = require('../db/config');

// GET /api/campaigns
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM campaigns ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Database exception', details: error.message });
    }
});

// POST /api/campaigns
router.post('/', async (req, res) => {
    // Setup campaign details from Campaign Builder UI
    const { name, service_description, tone, special_offer, channels } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO campaigns (name, service_description, tone, special_offer, channels, status)
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
            [name, service_description, tone, special_offer, JSON.stringify(channels)]
        );

        // In Phase 5: Kickoff Campaign Launch logic (AI generation process)

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to launch campaign', details: error.message });
    }
});

module.exports = router;
