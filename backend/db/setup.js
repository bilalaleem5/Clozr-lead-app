const db = require('./config');

async function seedDatabase() {
    console.log('Starting CLOZR Database Setup...');

    try {
        // 1. Run init.sql to create tables (Inlined for Vercel Serverless compatibility)
        const initSql = `
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS leads (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                company VARCHAR(255),
                industry VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                website VARCHAR(255),
                address TEXT,
                rating DECIMAL(3,2),
                icp_score INTEGER DEFAULT 0,
                source VARCHAR(50),
                category VARCHAR(100),
                country VARCHAR(100),
                status VARCHAR(50) DEFAULT 'new',
                scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS campaigns (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                service_description TEXT,
                tone VARCHAR(50),
                special_offer TEXT,
                channels JSONB,
                status VARCHAR(50) DEFAULT 'draft',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
                campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
                channel VARCHAR(50),
                content TEXT NOT NULL,
                type VARCHAR(50),
                status VARCHAR(50) DEFAULT 'pending',
                sent_at TIMESTAMP WITH TIME ZONE,
                scheduled_at TIMESTAMP WITH TIME ZONE
            );

            CREATE TABLE IF NOT EXISTS conversations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
                channel VARCHAR(50),
                direction VARCHAR(20),
                content TEXT NOT NULL,
                intent_score INTEGER DEFAULT 0,
                escalation_flag BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
                type VARCHAR(50),
                message TEXT NOT NULL,
                seen BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_leads_icp_score ON leads(icp_score);
            CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
            CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
            CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);
        `;
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
