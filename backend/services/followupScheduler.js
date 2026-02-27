// CLOZR Follow-Up Scheduler
// Run this as a cron job: node services/followupScheduler.js
// Or trigger via n8n cron workflow

const db = require('../db/config');

async function processFollowUps() {
    console.log('[APEX Scheduler] Checking for due follow-ups...');

    try {
        // Find all scheduled messages that are due
        const result = await db.query(`
      SELECT m.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone
      FROM messages m
      JOIN leads l ON m.lead_id = l.id
      WHERE m.status = 'scheduled'
        AND m.scheduled_at <= NOW()
        AND m.lead_id NOT IN (
          SELECT DISTINCT lead_id FROM conversations WHERE direction = 'inbound'
        )
      ORDER BY m.scheduled_at ASC
      LIMIT 20
    `);

        const dueMessages = result.rows;
        console.log(`[APEX Scheduler] Found ${dueMessages.length} due follow-ups.`);

        for (const msg of dueMessages) {
            console.log(`[APEX Scheduler] Processing ${msg.type} for ${msg.lead_name} via ${msg.channel}`);

            // Mark as pending so the sender workflows can pick it up
            await db.query(
                "UPDATE messages SET status = 'pending' WHERE id = $1",
                [msg.id]
            );
        }

        console.log('[APEX Scheduler] Follow-up processing complete.');
        return { processed: dueMessages.length };
    } catch (error) {
        console.error('[APEX Scheduler] Error:', error.message);
        return { processed: 0, error: error.message };
    }
}

// If run directly
if (require.main === module) {
    processFollowUps().then((result) => {
        console.log('[APEX Scheduler] Result:', result);
        process.exit(0);
    });
}

module.exports = { processFollowUps };
