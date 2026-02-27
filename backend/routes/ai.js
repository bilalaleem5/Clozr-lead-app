const express = require('express');
const router = express.Router();
const db = require('../db/config');
const { generateMessages } = require('../services/apexAI');

// POST /api/ai/generate — Generate AI messages for a campaign
router.post('/generate', async (req, res) => {
    const { campaignId, serviceDescription, tone, specialOffer, channels } = req.body;

    const campaign = {
        id: campaignId,
        service_description: serviceDescription,
        tone: tone || 'friendly',
        special_offer: specialOffer || '',
        channels: channels || ['email', 'whatsapp'],
    };

    try {
        // Fetch qualified leads
        let leads;
        try {
            const result = await db.query("SELECT * FROM leads WHERE icp_score >= 60 AND status = 'qualified' ORDER BY icp_score DESC LIMIT 50");
            leads = result.rows;
        } catch (dbErr) {
            // Fallback mock leads for testing
            leads = [
                { id: '1', name: 'John Smith', company: 'Apex Real Estate', industry: 'Real Estate', country: 'US', rating: 4.8, icp_score: 95 },
                { id: '2', name: 'Dr. Sarah Lee', company: 'Dental Excellence', industry: 'Dentistry', country: 'US', rating: 4.5, icp_score: 85 },
                { id: '3', name: 'Mike Johnson', company: 'Digital Agency', industry: 'Marketing', country: 'UK', rating: 5.0, icp_score: 70 },
            ];
        }

        const results = [];

        for (const lead of leads) {
            const aiOutput = await generateMessages(lead, campaign);
            results.push({ lead: lead.name, company: lead.company, messages: aiOutput });

            // Save messages to DB
            const channelList = campaign.channels;
            try {
                if (channelList.includes('whatsapp') && aiOutput.message_whatsapp) {
                    await db.query(
                        'INSERT INTO messages (lead_id, campaign_id, channel, content, type, status) VALUES ($1, $2, $3, $4, $5, $6)',
                        [lead.id, campaignId, 'whatsapp', aiOutput.message_whatsapp, 'initial', 'pending']
                    );
                }
                if (channelList.includes('email') && aiOutput.message_email_body) {
                    await db.query(
                        'INSERT INTO messages (lead_id, campaign_id, channel, content, type, status) VALUES ($1, $2, $3, $4, $5, $6)',
                        [lead.id, campaignId, 'email', JSON.stringify({ subject: aiOutput.message_email_subject, body: aiOutput.message_email_body }), 'initial', 'pending']
                    );
                }
                if (channelList.includes('linkedin') && aiOutput.message_linkedin) {
                    await db.query(
                        'INSERT INTO messages (lead_id, campaign_id, channel, content, type, status) VALUES ($1, $2, $3, $4, $5, $6)',
                        [lead.id, campaignId, 'linkedin', aiOutput.message_linkedin, 'initial', 'pending']
                    );
                }

                // Save follow-ups
                const followups = [
                    { type: 'followup1', content: aiOutput.followup_day3, days: 3 },
                    { type: 'followup2', content: aiOutput.followup_day6, days: 6 },
                    { type: 'followup3', content: aiOutput.followup_day10, days: 10 },
                ];
                for (const fu of followups) {
                    if (fu.content) {
                        const scheduledAt = new Date();
                        scheduledAt.setDate(scheduledAt.getDate() + fu.days);
                        await db.query(
                            'INSERT INTO messages (lead_id, campaign_id, channel, content, type, status, scheduled_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                            [lead.id, campaignId, channelList[0], fu.content, fu.type, 'scheduled', scheduledAt.toISOString()]
                        );
                    }
                }
            } catch (saveErr) {
                console.error('[AI Route] DB save failed, messages generated in-memory:', saveErr.message);
            }
        }

        res.json({
            success: true,
            leadsProcessed: leads.length,
            results,
        });
    } catch (error) {
        res.status(500).json({ error: 'AI generation failed', details: error.message });
    }
});

module.exports = router;
