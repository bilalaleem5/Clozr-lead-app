const fs = require('fs');
const path = require('path');
const db = require('./config');

async function seedDatabase() {
    console.log('Starting CLOZR Database Setup...');

    try {
        // 1. Run init.sql to create tables
        const initSqlPath = path.join(__dirname, 'init.sql');
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        await db.query(initSql);
        console.log('✅ Tables created successfully.');

        // 2. Clear existing entries for a fresh seed
        await db.query('DELETE FROM alerts');
        await db.query('DELETE FROM conversations');
        await db.query('DELETE FROM messages');
        await db.query('DELETE FROM campaigns');
        await db.query('DELETE FROM leads');

        // 3. Insert real dummy data for the user to see frontend updates

        // Campaigns
        const c1 = await db.query(`INSERT INTO campaigns (name, service_description, tone, status) VALUES ('Initial Outreach', 'B2B Lead Generation', 'professional', 'active') RETURNING id`);
        const cId = c1.rows[0].id;

        // Leads
        const l1 = await db.query(`INSERT INTO leads (name, company, industry, email, phone, icp_score, status, source) VALUES ('Elon Musk', 'SpaceX', 'Aerospace', 'elon@spacex.com', '+1-555-0001', 95, 'qualified', 'linkedin') RETURNING id`);
        const l2 = await db.query(`INSERT INTO leads (name, company, industry, email, phone, icp_score, status, source) VALUES ('Tim Cook', 'Apple', 'Technology', 'tim@apple.com', '+1-555-0002', 85, 'qualified', 'google_maps') RETURNING id`);

        const lead1 = l1.rows[0].id;
        const lead2 = l2.rows[0].id;

        // Messages
        await db.query(`INSERT INTO messages (lead_id, campaign_id, channel, content, type, status) VALUES ($1, $2, 'email', 'Hi Elon, impressive work on Starship.', 'initial', 'sent')`, [lead1, cId]);
        await db.query(`INSERT INTO messages (lead_id, campaign_id, channel, content, type, status) VALUES ($1, $2, 'linkedin', 'Hi Tim, love the new Vision Pro.', 'initial', 'pending')`, [lead2, cId]);

        // Conversations (Replies)
        await db.query(`INSERT INTO conversations (lead_id, channel, direction, content, intent_score, escalation_flag) VALUES ($1, 'email', 'inbound', 'Sounds interesting. Can we explore this next week?', 45, true)`, [lead1]);

        // Alerts
        await db.query(`INSERT INTO alerts (lead_id, type, message) VALUES ($1, 'hot_lead', '🚨 HOT LEAD: Elon Musk (SpaceX) — Intent: 45')`, [lead1]);

        console.log('✅ Database seeded with initial data.');
        return { success: true, message: 'Database setup and seeding complete!' };

    } catch (error) {
        console.error('❌ Error during setup:', error);
        return { success: false, message: error.message };
    }
}

// Allow running from CLI directly
if (require.main === module) {
    seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDatabase };
