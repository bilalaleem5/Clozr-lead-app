// APEX Frontend API Helper
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = {
    // Dashboard
    getDashboard: () => fetch(`${API_BASE}/dashboard`).then(r => r.json()),

    // Leads
    getLeads: () => fetch(`${API_BASE}/leads`).then(r => r.json()),
    createLead: (data) => fetch(`${API_BASE}/leads`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),

    // Campaigns
    getCampaigns: () => fetch(`${API_BASE}/campaigns`).then(r => r.json()),
    createCampaign: (data) => fetch(`${API_BASE}/campaigns`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),

    // AI Generation
    generateMessages: (data) => fetch(`${API_BASE}/ai/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),

    // Conversations
    getConversations: () => fetch(`${API_BASE}/conversations`).then(r => r.json()),

    // Reply/Intent Scoring
    scoreReply: (data) => fetch(`${API_BASE}/reply/score`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),

    // Alerts
    getAlerts: () => fetch(`${API_BASE}/alerts`).then(r => r.json()),

    // Scraper trigger (calls n8n webhook)
    triggerScraper: (data) => fetch(`${API_BASE}/scraper/trigger`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),

    // Follow-up scheduler
    runScheduler: () => fetch(`${API_BASE}/scheduler/run`, { method: 'POST' }).then(r => r.json()),
};

export default api;
