const express = require('express');
const router = express.Router();
const db = require('../db/config');

// Using mock data for local DB absence fallback
const mockLeads = [
    { id: '1', name: 'Apex Real Estate', contact: 'John Smith (CEO)', email: 'john@apexre.com', phone: '+1 234 567 8900', rating: 4.8, icp_score: 95 },
    { id: '2', name: 'Dental Excellence', contact: 'Dr. Sarah Lee', email: 'hello@dentalexc.com', phone: '+1 987 654 3210', rating: 4.5, icp_score: 85 }
];

// GET /api/leads
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leads ORDER BY icp_score DESC');
        res.json(result.rows);
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.message.includes('password')) {
            // Fallback for Phase 1/2 UI testing
            return res.json(mockLeads);
        }
        res.status(500).json({ error: 'Failed to fetch leads from database', details: error.message });
    }
});

// POST /api/leads
router.post('/', async (req, res) => {
    // Setup logic for adding new lead via n8n webhook or manual scrape
    const { name, company, industry, email, phone, website, rating, icp_score, category, country } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO leads (name, company, industry, email, phone, website, rating, icp_score, category, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [name, company, industry, email, phone, website, rating, icp_score, category, country]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to insert lead', details: error.message });
    }
});

module.exports = router;
