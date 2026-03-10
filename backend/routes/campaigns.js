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
    const { name, service_description, tone, special_offer, channels, sender_name, leads: frontendLeads } = req.body;

    try {
        let campaignId = null;
        try {
            // Insert new campaign
            const result = await db.query(
                `INSERT INTO campaigns (name, service_description, tone, special_offer, channels, status)
           VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
                [name || 'New Campaign', service_description, tone, special_offer, JSON.stringify(channels || [])]
            );
            campaignId = result.rows[0].id;
        } catch (dbErr) {
            console.warn("DB insert failed, using fallback ID:", dbErr.message);
            campaignId = Math.floor(Math.random() * 10000);
        }

        // Use frontend CSV leads if provided, otherwise fetch from database
        let activeLeads = [];
        if (frontendLeads && Array.isArray(frontendLeads) && frontendLeads.length > 0) {
            activeLeads = frontendLeads;
        } else {
            try {
                const leadsRes = await db.query(`SELECT name, company, industry, email, phone, website, country, source FROM leads WHERE status = 'new' LIMIT 50`);
                activeLeads = leadsRes.rows;
            } catch (dbErr) {
                console.warn("DB select config failed:", dbErr.message);
            }
        }

        if (activeLeads.length === 0) {
            return res.status(400).json({ error: 'No leads found to run the campaign.' });
        }

        // Construct the n8n Webhook Payload
        const payload = {
            campaign_id: campaignId,
            service_description: service_description || "We build AI powered sales automation",
            tone: tone || "professional",
            special_offer: special_offer || "Free 30 day trial",
            channels: channels || ["email", "whatsapp", "linkedin"],
            sender_name: sender_name || "Ali Khan",
            leads: activeLeads
        };

        // Fire the Webhook asynchronously so we don't block the frontend response
        fetch('https://n8n-production-adb97.up.railway.app/webhook/run-campaign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(async res => {
            const text = await res.text();
            console.log('n8n webhook fired:', res.status, text.substring(0, 50));
        }).catch(err => console.error('Error triggering n8n webhook:', err));

        res.status(201).json({ message: 'Campaign launched successfully', campaignId: campaignId, leadsIncluded: activeLeads.length });
    } catch (error) {
        console.error('Failed to launch campaign:', error);
        res.status(500).json({ error: 'Failed to launch campaign backend router', details: error.message });
    }
});

module.exports = router;
