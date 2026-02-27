const express = require('express');
const router = express.Router();
const { processFollowUps } = require('../services/followupScheduler');

// POST /api/scheduler/run — Manually trigger follow-up processing
router.post('/run', async (req, res) => {
    const result = await processFollowUps();
    res.json({ success: true, ...result });
});

module.exports = router;
