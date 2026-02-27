const express = require('express');
const router = express.Router();
const db = require('../db/config');
const { scoreIntent, generateReply } = require('../services/apexAI');

// POST /api/reply/score — Score intent of inbound reply
router.post('/score', async (req, res) => {
    const { leadId, replyText, channel } = req.body;

    try {
        // Fetch lead info 
        let lead;
        try {
            const result = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
            lead = result.rows[0];
        } catch (e) {
            lead = { id: leadId, name: 'Unknown Lead', company: 'Unknown' };
        }

        // Score intent
        const intentResult = await scoreIntent(lead, replyText);

        // Save conversation entry
        try {
            await db.query(
                'INSERT INTO conversations (lead_id, channel, direction, content, intent_score, escalation_flag) VALUES ($1, $2, $3, $4, $5, $6)',
                [leadId, channel || 'unknown', 'inbound', replyText, intentResult.intent_score, intentResult.escalation_flag]
            );
        } catch (e) {
            console.error('[Reply] DB save failed:', e.message);
        }

        // If hot lead, create alert
        if (intentResult.escalation_flag) {
            try {
                await db.query(
                    'INSERT INTO alerts (lead_id, type, message) VALUES ($1, $2, $3)',
                    [leadId, 'hot_lead', `🚨 HOT LEAD: ${lead.name} (${lead.company}) — Intent: ${intentResult.intent_score}. Reply: "${replyText}"`]
                );
            } catch (e) {
                console.error('[Reply] Alert creation failed:', e.message);
            }
        }

        // Generate strategic reply
        const replyResult = await generateReply(lead, replyText, null, intentResult);

        res.json({
            success: true,
            intent: intentResult,
            suggestedReply: replyResult,
            lead: { name: lead.name, company: lead.company },
        });
    } catch (error) {
        res.status(500).json({ error: 'Intent scoring failed', details: error.message });
    }
});

module.exports = router;
