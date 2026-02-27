const express = require('express');
const router = express.Router();

// POST /api/scraper/trigger — Trigger n8n scraper workflow
router.post('/trigger', async (req, res) => {
    const { category, country, filters, source } = req.body;
    const n8nBase = process.env.N8N_BASE_URL || 'http://localhost:5678';

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

        const data = await response.json();
        res.json({ success: true, message: 'Scraper workflow triggered', data });
    } catch (error) {
        // If n8n is not running, return a mock response
        console.error('[Scraper Trigger] n8n not reachable:', error.message);
        res.json({
            success: true,
            message: 'Scraper triggered (n8n offline — mock mode)',
            mock: true,
            leads: [
                { name: 'Sample Business', company: 'Sample Corp', icp_score: 75, email: 'info@sample.com', phone: '+1-555-0100' }
            ]
        });
    }
});

module.exports = router;
