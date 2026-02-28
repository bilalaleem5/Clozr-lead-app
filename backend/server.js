const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const leadsRouter = require('./routes/leads');
const campaignsRouter = require('./routes/campaigns');
const conversationsRouter = require('./routes/conversations');
const dashboardRouter = require('./routes/dashboard');
const messagesRouter = require('./routes/messages');
const alertsRouter = require('./routes/alerts');
const aiRouter = require('./routes/ai');
const replyRouter = require('./routes/reply');
const schedulerRouter = require('./routes/scheduler');
const scraperRouter = require('./routes/scraper');

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

app.get('/api/system/setup', async (req, res) => {
    const { seedDatabase } = require('./db/setup');
    const result = await seedDatabase();
    res.json(result);
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CLOZR Engine is running' });
});

app.listen(PORT, () => {
    console.log(`CLOZR Backend Server running on port ${PORT}`);
});
