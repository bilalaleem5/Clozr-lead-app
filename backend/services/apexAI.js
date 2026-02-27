// CLOZR AI Brain — Full System Prompt & Gemini Integration
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const APEX_SYSTEM_PROMPT = `You are APEX — an AI Sales Intelligence and Autonomous Outreach Closing Agent. Your mission is to convert cold leads into warm conversations that result in booked meetings.
You write like a sharp, experienced human sales closer — never like a bot.

SECTION A — LEAD ANALYSIS:
For each lead, output:
LEAD_TYPE: [Individual / Company / Decision-Maker]
INDUSTRY: [Detected industry + sub-niche]
PAIN_PROBABILITY: [High / Medium / Low]
PRIMARY_PAIN: [Most likely business problem]
OUTREACH_ANGLE: [Specific hook for this lead]
ICP_SCORE: [0-100]
RECOMMENDED_CHANNEL: [WhatsApp / Email / LinkedIn / Multi]
TONE: [Friendly / Authority / Direct / Consultative]

SECTION B — MESSAGE RULES:
NEVER:
- Start with "Hi I am [name] from [company]"
- Use: synergy, leverage, hope this finds you well
- Pitch the service in message 1
- Sound like a template
- Use more than 4 lines on WhatsApp

ALWAYS:
- Open with something specific to their business
- Trigger curiosity or concern in line 1
- Use ONE pain point only
- End with ONE micro-question — never a pitch
- Sound like a peer, not a vendor

SECTION C — MESSAGE FORMAT:

WHATSAPP:
Line 1: Specific observation about their business
Line 2: Pain point in their world, not your product
Line 3: Social proof hint
Line 4: One micro-question CTA
Max 60 words. Conversational tone.

EMAIL:
Subject: Curiosity-based, max 7 words
Para 1: Specific observation about their business
Para 2: Pain point + what it costs them
Para 3: Brief proof from similar businesses
Para 4: One soft question CTA — no calendar link in message 1
Signature: First name only, no titles

LINKEDIN:
Line 1: Genuine observation about their work
Line 2: Connect to relevant insight
Line 3: Ask their opinion — not a meeting
Max 50 words. Zero pitch.

SECTION D — FOLLOW-UP SEQUENCE:
Day 3: Value-add — share one industry insight, NOT a pitch repeat
Day 6: Complete reframe — new angle, new pain, same service
Day 10: Takeaway close — withdraw interest to trigger FOMO
Day 45: Re-engage with fresh angle on different channel
Stop if: lead replies OR unsubscribes OR owner marks closed

SECTION E — INTENT SCORING:
+40 = Asks for call or meeting
+30 = Asks about price
+25 = Asks how it works
+20 = Describes their current problem
+15 = Says interesting or tell me more
+10 = Mentions dissatisfaction with current solution
+5  = One-word positive reply
-50 = Explicit not interested

Thresholds:
0-20  = Nurture, continue sequence
21-40 = Warm, send strong positioning reply
41+   = HOT, flag for human takeover NOW

SECTION F — OBJECTION SCRIPTS:
"Already have someone" → "Great. Most we work with did too. Question is whether results match expectations — what does that look like for you now?"
"Not the right time" → "Fair enough. Is it budget, priority, or something else? Helps me know the right time to follow up properly."
"Send more info" → "Happy to — which part was most relevant to you first? Helps me send the right thing."
"Too expensive" → "Compared to what you expected, or what this problem is currently costing you?"

RESPOND IN VALID JSON ONLY.`;

/**
 * Generate outreach messages for a lead
 */
async function generateMessages(lead, campaign) {
    const userPrompt = `Generate personalized outreach messages for this lead:

Lead Name: ${lead.name}
Company: ${lead.company || 'Unknown'}
Industry: ${lead.industry || campaign.category || 'General'}
Location: ${lead.country || 'Unknown'}
Service: ${campaign.service_description}
Special Offer: ${campaign.special_offer || 'None'}
Tone: ${campaign.tone || 'friendly'}
Channels: ${JSON.stringify(campaign.channels || ['email', 'whatsapp'])}
Context: Rating ${lead.rating || 'N/A'}, ICP Score ${lead.icp_score || 0}

OUTPUT FORMAT (respond in valid JSON only):
{
  "lead_analysis": { "lead_type": "", "industry": "", "pain_probability": "", "primary_pain": "", "outreach_angle": "", "recommended_channel": "", "tone": "" },
  "message_whatsapp": "",
  "message_email_subject": "",
  "message_email_body": "",
  "message_linkedin": "",
  "followup_day3": "",
  "followup_day6": "",
  "followup_day10": "",
  "objection_prep": { "likely_objection": "", "response": "" }
}`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: APEX_SYSTEM_PROMPT + '\n\n' + userPrompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 1500,
                responseMimeType: 'application/json',
            },
        });

        const content = result.response.text();
        return JSON.parse(content);
    } catch (error) {
        console.error('[APEX AI] Message generation failed:', error.message);
        return {
            lead_analysis: { lead_type: 'Unknown', industry: lead.industry || 'General', pain_probability: 'Medium', primary_pain: 'Growth', outreach_angle: 'Direct', recommended_channel: 'email', tone: campaign.tone || 'friendly' },
            message_whatsapp: `Hey ${lead.name}, noticed ${lead.company || 'your business'} is growing. Most in your space lose leads from slow responses. How are you handling that?`,
            message_email_subject: `Quick question for ${lead.company || 'you'}`,
            message_email_body: `Hi ${lead.name},\n\nNoticed ${lead.company || 'your company'} is in an interesting growth phase.\n\nMany businesses in ${lead.industry || 'your space'} leave revenue on the table from slow follow-ups.\n\nHow are you currently managing inbound leads?`,
            message_linkedin: `${lead.name} - interesting work at ${lead.company || 'your company'}. Curious about your take on lead response times in ${lead.industry || 'the industry'}.`,
            followup_day3: `Thought you might find this relevant — saw a trend in ${lead.industry || 'your industry'} around response optimization. Worth exploring?`,
            followup_day6: `Different angle — have you looked into how ${lead.industry || 'peers'} are automating their first-touch responses? Seeing some interesting results.`,
            followup_day10: `Don't want to keep interrupting if timing's off. If lead management becomes a priority next quarter, feel free to reach out.`,
            objection_prep: { likely_objection: 'Not the right time', response: 'Fair enough. Is it budget, priority, or something else? Helps me know when to circle back.' }
        };
    }
}

/**
 * Score the intent of a lead reply
 */
async function scoreIntent(lead, replyText, conversationHistory) {
    const prompt = `${APEX_SYSTEM_PROMPT}

Score the buying intent of this lead reply.

Lead: ${lead.name} (${lead.company || 'Unknown'})
Their reply: "${replyText}"
${conversationHistory ? `Conversation history: ${conversationHistory}` : ''}

SCORING RULES:
+40 = Asks for call or meeting
+30 = Asks about price
+25 = Asks how it works
+20 = Describes their current problem
+15 = Says interesting or tell me more
+10 = Mentions dissatisfaction with current solution
+5  = One-word positive reply
-50 = Explicit not interested

RESPOND IN VALID JSON:
{
  "intent_score": <number 0-100>,
  "intent_level": "hot|warm|cold",
  "detected_signals": ["list"],
  "objection_detected": "<or null>",
  "suggested_reply": "<strategic reply>",
  "escalation_flag": <true if >=41>,
  "escalation_message": "<alert message if hot>"
}`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500,
                responseMimeType: 'application/json',
            },
        });

        return JSON.parse(result.response.text());
    } catch (error) {
        console.error('[APEX AI] Intent scoring failed:', error.message);
        return {
            intent_score: 10,
            intent_level: 'cold',
            detected_signals: [],
            objection_detected: null,
            suggested_reply: 'Thanks for your reply! Would love to share more details. What aspect interests you most?',
            escalation_flag: false,
            escalation_message: null
        };
    }
}

/**
 * Generate a strategic reply to a lead's message
 */
async function generateReply(lead, replyText, campaign, intentResult) {
    const prompt = `${APEX_SYSTEM_PROMPT}

Generate a strategic reply to this lead.

Lead: ${lead.name} (${lead.company || 'Unknown'})
Industry: ${lead.industry || 'General'}
Their message: "${replyText}"
Intent Score: ${intentResult.intent_score}
Intent Level: ${intentResult.intent_level}
Detected Objection: ${intentResult.objection_detected || 'None'}
Service: ${campaign?.service_description || 'Lead generation services'}
Tone: ${campaign?.tone || 'friendly'}

Rules:
- If intent >= 41: This is the ONLY time to suggest a meeting
- If objection detected: Use the matching objection script
- Never pitch directly
- Keep it conversational

RESPOND IN VALID JSON:
{
  "reply_message": "<the reply to send>",
  "channel_recommendation": "whatsapp|email|linkedin",
  "next_action": "send_reply|schedule_followup|escalate_to_human"
}`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 400,
                responseMimeType: 'application/json',
            },
        });

        return JSON.parse(result.response.text());
    } catch (error) {
        console.error('[APEX AI] Reply generation failed:', error.message);
        return {
            reply_message: intentResult.suggested_reply || 'Thanks for your interest. What specific aspect would be most relevant for you?',
            channel_recommendation: 'email',
            next_action: 'send_reply'
        };
    }
}

module.exports = {
    generateMessages,
    scoreIntent,
    generateReply,
    APEX_SYSTEM_PROMPT,
};
