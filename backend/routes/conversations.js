const express = require('express');
const router = express.Router();
const db = require('../db/config');

const mockConversations = [
    { id: '1', name: 'Mike Johnson', company: 'Digital Agency', channel: 'LinkedIn', intent_score: 85, lastMessage: "Let's have a call tomorrow." },
];

router.get('/', async (req, res) => {
    try {
        // A real implementation would involve grouping messages by lead_id
        const result = await db.query(`
      SELECT c.*, l.name, l.company 
      FROM conversations c 
      JOIN leads l ON c.lead_id = l.id 
      ORDER BY c.intent_score DESC, c.created_at DESC
    `);
        res.json(result.rows);
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.message.includes('password')) {
            return res.json(mockConversations);
        }
        res.status(500).json({ error: 'Database exception', details: error.message });
    }
});

module.exports = router;
