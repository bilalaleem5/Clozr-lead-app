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
    const { name, service_description, tone, special_offer, channels, sender_name } = req.body;

    try {
        // Insert new campaign
        const result = await db.query(
            `INSERT INTO campaigns (name, service_description, tone, special_offer, channels, status)
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
            [name || 'New Campaign', service_description, tone, special_offer, channels]
        );

        const campaign = result.rows[0];

        // Fetch all new leads from the database to process in this campaign
        // Setting a limit in case there are thousands, but getting the latest 50 for the batch
        const leadsRes = await db.query(`SELECT name, company, industry, email, phone, website, country, source FROM leads WHERE status = 'new' LIMIT 50`);
        const leads = leadsRes.rows;

        // Construct the n8n Webhook Payload
        const payload = {
            campaign_id: campaign.id,
            service_description: service_description || "We build AI powered sales automation",
            tone: tone || "professional",
            special_offer: special_offer || "Free 30 day trial",
            channels: channels || ["email", "whatsapp", "linkedin"],
            sender_name: sender_name || "Ali Khan",
            leads: leads
        };

        // Fire the Webhook asynchronously so we don't block the frontend response
        fetch('https://n8n-production-adb97.up.railway.app/webhook/run-campaign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(res => res.json())
            .then(data => console.log('Successfully triggered n8n campaign webhook:', data))
            .catch(err => console.error('Error triggering n8n webhook:', err));

        res.status(201).json({ message: 'Campaign launched successfully', campaign, leadsIncluded: leads.length });
    } catch (error) {
        console.error('Failed to launch campaign:', error);
        res.status(500).json({ error: 'Failed to launch campaign', details: error.message });
    }
});

module.exports = router;
