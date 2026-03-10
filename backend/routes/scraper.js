const express = require('express');
const router = express.Router();

// POST /api/scraper/trigger — Trigger n8n scraper workflow
router.post('/trigger', async (req, res) => {
    const { category, country, filters, source } = req.body;
    const n8nBase = process.env.N8N_BASE_URL || 'https://n8n-production-adb97.up.railway.app';

    let webhookPath;
    if (source === 'linkedin') {
        webhookPath = process.env.N8N_LINKEDIN_WEBHOOK || '/webhook/scrape-linkedin';
    } else {
        webhookPath = process.env.N8N_SCRAPER_WEBHOOK || '/webhook/scrape-google-maps';
    }

    try {
        const response = await fetch(`${n8nBase}${webhookPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, country, filters }),
        });

        // If n8n returns an error status (like 404 Not Found), throw it to the catch block
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`n8n webhook failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        res.json({ success: true, message: 'Scraper workflow triggered', data });
    } catch (error) {
        // Log the real error and send it to frontend instead of using mock data
        console.error('[Scraper Trigger] n8n error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to trigger scraper',
            error: error.message
        });
    }
});

module.exports = router;
