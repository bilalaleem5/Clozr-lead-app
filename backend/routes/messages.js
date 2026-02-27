const express = require('express');
const router = express.Router();
const db = require('../db/config');

// GET /api/messages (filter by status and channel)
router.get('/', async (req, res) => {
    const { status, channel } = req.query;
    let query = 'SELECT m.*, l.email as lead_email, l.phone as lead_phone FROM messages m JOIN leads l ON m.lead_id = l.id WHERE 1=1';
    const params = [];

    if (status) {
        params.push(status);
        query += ` AND m.status = $${params.length}`;
    }
    if (channel) {
        params.push(channel);
        query += ` AND m.channel = $${params.length}`;
    }
    query += ' ORDER BY m.scheduled_at ASC NULLS LAST';

    try {
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.json([]);
    }
});

// POST /api/messages
router.post('/', async (req, res) => {
    const { lead_id, campaign_id, channel, content, type, status, scheduled_at } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO messages (lead_id, campaign_id, channel, content, type, status, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [lead_id, campaign_id, channel, content, type, status || 'pending', scheduled_at || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save message', details: error.message });
    }
});

// PATCH /api/messages/:id
router.patch('/:id', async (req, res) => {
    const { status, sent_at } = req.body;
    try {
        const result = await db.query(
            'UPDATE messages SET status = $1, sent_at = $2 WHERE id = $3 RETURNING *',
            [status, sent_at || new Date().toISOString(), req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update message', details: error.message });
    }
});

module.exports = router;
