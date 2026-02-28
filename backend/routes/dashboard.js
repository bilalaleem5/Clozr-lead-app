const express = require('express');
const router = express.Router();
const db = require('../db/config');

router.get('/', async (req, res) => {
    const stats = {
        leadsScraped: 12450,
        messagesSent: 8230,
        replyRate: 18.5,
        hotLeads: 142
    };

    try {
        // Execute aggregation queries against the PostgreSQL DB
        const leadsRes = await db.query('SELECT COUNT(*) FROM leads');
        const msgRes = await db.query('SELECT COUNT(*) FROM messages WHERE status = $1', ['sent']);
        const hotLeadsRes = await db.query('SELECT COUNT(DISTINCT lead_id) FROM conversations WHERE intent_score >= 41');

        stats.leadsScraped = parseInt(leadsRes.rows[0].count, 10) || 0;
        stats.messagesSent = parseInt(msgRes.rows[0].count, 10) || 0;
        stats.hotLeads = parseInt(hotLeadsRes.rows[0].count, 10) || 0;

        // Calculate a basic reply rate if there are sent messages
        const replyRes = await db.query('SELECT COUNT(*) FROM conversations WHERE direction = $1', ['inbound']);
        const replies = parseInt(replyRes.rows[0].count, 10) || 0;

        if (stats.messagesSent > 0) {
            stats.replyRate = ((replies / stats.messagesSent) * 100).toFixed(1);
        } else {
            stats.replyRate = 0;
        }

        res.json(stats);
    } catch (error) {
        console.error("Dashboard error:", error);
        // Fallback if DB not populated or failing entirely
        res.json({ leadsScraped: 0, messagesSent: 0, replyRate: 0, hotLeads: 0, error: 'Database not connected or empty' });
    }
});

module.exports = router;
