import React, { useState, useEffect } from 'react';
import { Users, Send, Reply, Flame, DatabaseBackup } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const chartData = [
    { name: 'Day 1', outreach: 40, replies: 2 },
    { name: 'Day 5', outreach: 120, replies: 13 },
    { name: 'Day 10', outreach: 200, replies: 48 },
    { name: 'Day 15', outreach: 278, replies: 69 },
];

const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex items-center justify-between">
        <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-100 mt-2">{value !== null ? value : '...'}</p>
        </div>
        <div className="w-12 h-12 bg-slate-900 rounded-full flex justify-center items-center text-brand-primary">
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ leadsScraped: null, messagesSent: null, replyRate: null, hotLeads: null });
    const [recentActivity, setRecentActivity] = useState([]);
    const [isSeeding, setIsSeeding] = useState(false);

    const loadData = async () => {
        try {
            const data = await api.getDashboard();
            setStats({
                leadsScraped: data.leadsScraped || 0,
                messagesSent: data.messagesSent || 0,
                replyRate: data.replyRate || 0,
                hotLeads: data.hotLeads || 0
            });

            // Fetch recent conversations for activity feed
            const convos = await api.getConversations();
            if (Array.isArray(convos)) {
                const mapped = convos.slice(0, 5).map(c => ({
                    id: c.id,
                    type: c.intent_score >= 40 ? 'hot' : 'reply',
                    lead: c.lead_name || 'Lead',
                    company: c.company || 'Company',
                    time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: c.content
                }));
                setRecentActivity(mapped);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSetupDb = async () => {
        setIsSeeding(true);
        try {
            const data = await api.setupSystem();
            if (data.success) {
                alert('Database seeded successfully!');
                loadData();
            } else {
                alert('Database setup failed: ' + data.message);
            }
        } catch (err) {
            alert('Error connecting to setup endpoint. Ensure backend is running.');
        }
        setIsSeeding(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Live Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1">Monitor your lead acquisition and automated outreach.</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={handleSetupDb} disabled={isSeeding} className="px-4 py-2 border border-brand-accent text-brand-accent rounded-lg hover:bg-brand-accent/10 transition-colors flex items-center space-x-2">
                        <DatabaseBackup size={16} />
                        <span>{isSeeding ? 'Setting up...' : 'Setup / Seed DB'}</span>
                    </button>
                    <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40">
                        + New Campaign
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Leads Scraped" value={stats.leadsScraped} icon={Users} />
                <StatCard title="Messages Sent" value={stats.messagesSent} icon={Send} />
                <StatCard title="Reply Rate" value={stats.replyRate !== null ? `${stats.replyRate}%` : null} icon={Reply} />
                <StatCard title="Hot Leads" value={stats.hotLeads} icon={Flame} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-100">Outreach vs Replies</h2>
                        <select className="bg-slate-900 border border-dark-border text-slate-300 text-sm rounded-lg px-2 py-1">
                            <option>Last 30 Days</option>
                            <option>This Week</option>
                        </select>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Line type="monotone" dataKey="outreach" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="replies" stroke="#10b981" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col pt-0">
                    <div className="sticky top-0 bg-dark-card pt-6 pb-4 border-b border-dark-border z-10">
                        <h2 className="text-lg font-bold text-slate-100">Recent Activity (Live DB)</h2>
                    </div>
                    <div className="mt-4 space-y-4 overflow-y-auto flex-1 h-[280px] custom-scrollbar">
                        {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                            <div key={activity.id || i} className="relative pl-6 border-l-2 border-dark-border pb-4 last:border-l-0 last:pb-0">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-dark-card ${activity.type === 'hot' ? 'bg-red-500' :
                                    activity.type === 'reply' ? 'bg-brand-accent' : 'bg-brand-primary'
                                    }`} />
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{activity.lead} <span className="text-xs text-slate-500 font-normal">({activity.company})</span></p>
                                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{activity.text}</p>
                                    </div>
                                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{activity.time}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm text-center mt-10">No recent database activity to show.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

