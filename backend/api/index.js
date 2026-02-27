// Vercel serverless entry — wraps the Express app into a single handler
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes — paths are relative to backend/ root (Vercel runs from backend/)
const leadsRouter = require('../routes/leads');
const campaignsRouter = require('../routes/campaigns');
const conversationsRouter = require('../routes/conversations');
const dashboardRouter = require('../routes/dashboard');
const messagesRouter = require('../routes/messages');
const alertsRouter = require('../routes/alerts');
const aiRouter = require('../routes/ai');
const replyRouter = require('../routes/reply');
const schedulerRouter = require('../routes/scheduler');
const scraperRouter = require('../routes/scraper');

app.use('/api/leads', leadsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/reply', replyRouter);
app.use('/api/scheduler', schedulerRouter);
app.use('/api/scraper', scraperRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CLOZR Engine is running on Vercel' });
});

// Export for Vercel serverless
module.exports = app;
