import React from 'react';
import { Users, Send, Reply, Flame } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Day 1', outreach: 400, replies: 24 },
    { name: 'Day 5', outreach: 1200, replies: 139 },
    { name: 'Day 10', outreach: 2000, replies: 480 },
    { name: 'Day 15', outreach: 2780, replies: 690 },
    { name: 'Day 20', outreach: 1890, replies: 480 },
    { name: 'Day 25', outreach: 2390, replies: 780 },
    { name: 'Day 30', outreach: 3490, replies: 930 },
];

const activityFeed = [
    { id: 1, type: 'reply', lead: 'John Doe', company: 'TechNova', time: '10 mins ago', text: 'Sounds interesting. Can we explore this?' },
    { id: 2, type: 'followup', lead: 'Sarah Smith', company: 'RealEstate Pro', time: '30 mins ago', text: 'Day 3 Follow-up sent via WhatsApp.' },
    { id: 3, type: 'hot', lead: 'Mike Johnson', company: 'Digital Agency', time: '1 hour ago', text: 'Replied: Let\'s have a call tomorrow to discuss pricing.' },
    { id: 4, type: 'reply', lead: 'Emily Chen', company: 'SaaS Corp', time: '2 hours ago', text: 'Can you send over more info on how this works?' }
];

const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex items-center justify-between">
        <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-100 mt-2">{value}</p>
            <span className={`text-xs mt-2 inline-block ${trend > 0 ? 'text-brand-accent' : 'text-red-400'}`}>
                {trend > 0 ? '+' : ''}{trend}% from last month
            </span>
        </div>
        <div className="w-12 h-12 bg-slate-900 rounded-full flex justify-center items-center text-brand-primary">
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Live Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1">Monitor your lead acquisition and automated outreach.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-dark-border text-slate-200 rounded-lg hover:bg-slate-800 transition-colors">
                        View Hot Leads
                    </button>
                    <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40">
                        + New Campaign
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Leads Scraped" value="12,450" icon={Users} trend={14} />
                <StatCard title="Messages Sent" value="8,230" icon={Send} trend={23} />
                <StatCard title="Reply Rate" value="18.5%" icon={Reply} trend={4.2} />
                <StatCard title="Hot Leads" value="142" icon={Flame} trend={32} />
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
                            <LineChart data={data}>
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
                        <h2 className="text-lg font-bold text-slate-100">Live Activity</h2>
                    </div>
                    <div className="mt-4 space-y-4 overflow-y-auto flex-1 h-[280px] custom-scrollbar">
                        {activityFeed.map((activity) => (
                            <div key={activity.id} className="relative pl-6 border-l-2 border-dark-border pb-4 last:border-l-0 last:pb-0">
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
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
