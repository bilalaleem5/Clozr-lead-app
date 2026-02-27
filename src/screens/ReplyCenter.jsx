import React, { useState } from 'react';
import { AlertTriangle, Send, MoreVertical, CheckCircle2, Phone, Mail, Globe, MapPin, Building2, Zap } from 'lucide-react';
import clsx from 'clsx';

const mockConversations = [
    { id: 1, name: 'Mike Johnson', company: 'Digital Agency', channel: 'LinkedIn', intent: 85, lastMessage: "Let's have a call tomorrow.", status: 'hot', time: '10m ago' },
    { id: 2, name: 'Sarah Smith', company: 'RealEstate Pro', channel: 'WhatsApp', intent: 35, lastMessage: "How does the pricing work?", status: 'warm', time: '1h ago' },
    { id: 3, name: 'John Doe', company: 'Apex Real Estate', channel: 'Email', intent: 15, lastMessage: "Not right now, thanks.", status: 'cold', time: '3h ago' },
    { id: 4, name: 'Emily Chen', company: 'SaaS Corp', channel: 'WhatsApp', intent: 45, lastMessage: "Can you send over more info?", status: 'hot', time: '5h ago' },
];

const mockThread = [
    { sender: 'ai', text: 'Hey Mike, noticed Digital Agency is scaling fast. Most agencies we work with struggle to keep their pipeline full without relying on referrals. What does your current outbound process look like?', time: 'Yesterday, 10:00 AM' },
    { sender: 'lead', text: 'We mostly do inbound and referrals. Outbound has never worked for us.', time: 'Yesterday, 2:30 PM' },
    { sender: 'ai', text: 'Makes sense. Outbound is tough when it sounds like a template. We use AI to personalize every message based on the prospect\'s recent activity, getting reply rates above 15%. Worth a 5-min look?', time: 'Today, 9:15 AM' },
    { sender: 'lead', text: 'Actually yes. Let\'s have a call tomorrow to discuss pricing.', time: 'Today, 10:45 AM' },
];

const getIntentColor = (intent) => {
    if (intent >= 41) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (intent >= 21) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
};

const ContextBadge = ({ icon: Icon, text }) => (
    <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
        <Icon size={14} className="text-slate-500" />
        <span>{text}</span>
    </div>
);

const ReplyCenter = () => {
    const [activeChat, setActiveChat] = useState(mockConversations[0]);
    const [replyText, setReplyText] = useState("Mike, glad to hear it. How does 2 PM EST tomorrow work for a quick 15-min chat? I'll send over a calendar invite.");

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">

            {/* Alert Banner */}
            {activeChat.intent >= 41 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <div className="bg-red-500/20 p-2 rounded-full mt-0.5">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-red-500 font-bold text-sm">HOT LEAD DETECTED (Intent: {activeChat.intent})</h3>
                            <p className="text-slate-300 text-sm mt-1">Lead has requested a meeting. Human takeover is recommended to close.</p>
                        </div>
                    </div>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20">
                        Take Over Conversation
                    </button>
                </div>
            )}

            <div className="flex-1 flex space-x-6 overflow-hidden">

                {/* Left Panel: Conversations List */}
                <div className="w-80 flex flex-col bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-dark-border bg-slate-900/50">
                        <h2 className="font-bold text-slate-100">Inbox</h2>
                        <div className="flex space-x-2 mt-3">
                            <button className="px-3 py-1 bg-slate-800 text-slate-200 text-xs font-medium rounded-full border border-dark-border">All</button>
                            <button className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded-full border border-red-500/20">Hot (2)</button>
                            <button className="px-3 py-1 bg-transparent text-slate-400 hover:text-slate-300 text-xs font-medium rounded-full">Unread</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {mockConversations.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChat(chat)}
                                className={clsx(
                                    "p-4 border-b border-dark-border cursor-pointer transition-colors",
                                    activeChat.id === chat.id ? "bg-slate-800/50" : "hover:bg-white/5"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-200 text-sm">{chat.name}</h3>
                                    <span className="text-xs text-slate-500">{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-medium text-slate-400">{chat.company}</span>
                                    <span className={clsx("text-[10px] px-2 py-0.5 rounded border font-bold", getIntentColor(chat.intent))}>
                                        {chat.intent} INTENT
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-1">{chat.lastMessage}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Panel: Thread */}
                <div className="flex-1 flex flex-col bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-dark-border bg-slate-900/50 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-slate-100">{activeChat.name}</h2>
                            <p className="text-xs text-slate-400 mt-0.5">via {activeChat.channel}</p>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-200"><MoreVertical size={18} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-900/30">
                        {mockThread.map((msg, i) => (
                            <div key={i} className={clsx("flex flex-col max-w-[80%]", msg.sender === 'ai' ? "items-end self-end ml-auto" : "items-start")}>
                                <div className={clsx(
                                    "p-4 rounded-2xl text-sm leading-relaxed",
                                    msg.sender === 'ai'
                                        ? "bg-brand-primary text-white rounded-tr-sm"
                                        : "bg-slate-800 text-slate-200 border border-dark-border rounded-tl-sm"
                                )}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-2 flex items-center">
                                    {msg.time} {msg.sender === 'ai' && <CheckCircle2 size={12} className="ml-1 text-slate-500" />}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-dark-border bg-slate-900/50">
                        <div className="relative">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full bg-slate-800 border border-dark-border text-slate-200 text-sm rounded-xl pl-4 pr-12 py-3 focus:ring-1 focus:ring-brand-primary outline-none resize-none min-h-[80px]"
                                placeholder="Type a reply..."
                            />
                            <button className="absolute right-3 bottom-3 p-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-brand-primary/20">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Lead Info & AI Insights */}
                <div className="w-72 flex flex-col space-y-6">

                    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
                        <h3 className="font-bold text-sm text-slate-100 mb-4 pb-3 border-b border-dark-border">Lead Details</h3>
                        <div className="space-y-4">
                            <ContextBadge icon={Building2} text="Digital Agency" />
                            <ContextBadge icon={Globe} text="digitalagency.io" />
                            <ContextBadge icon={MapPin} text="London, UK" />
                            <ContextBadge icon={Mail} text="mike@digitalagency.io" />
                            <ContextBadge icon={Phone} text="+44 20 7123 4567" />
                        </div>
                    </div>

                    <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex-1 border-t-2 border-t-brand-secondary">
                        <div className="flex items-center space-x-2 text-brand-secondary mb-4 pb-3 border-b border-dark-border">
                            <Zap size={16} />
                            <h3 className="font-bold text-sm">AI Suggested Reply</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed mb-4 bg-slate-900 border border-dark-border p-3 rounded-lg">
                            {replyText}
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => setReplyText("Mike, glad to hear it. How does 2 PM EST tomorrow work for a quick 15-min chat? I'll send over a calendar invite.")}
                                className="w-full text-left px-3 py-2 text-xs text-slate-400 bg-slate-900 border border-dark-border rounded hover:border-slate-500 hover:text-slate-300 transition-colors"
                            >
                                Accept and insert (Default)
                            </button>
                            <button
                                onClick={() => setReplyText("Great! Is there anything specific you'd like to cover on the call regarding pricing or features?")}
                                className="w-full text-left px-3 py-2 text-xs text-slate-400 bg-slate-900 border border-dark-border rounded hover:border-slate-500 hover:text-slate-300 transition-colors"
                            >
                                Alternative: Ask for specific focus
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReplyCenter;
