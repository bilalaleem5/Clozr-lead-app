import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, MoreVertical, CheckCircle2, Phone, Mail, Globe, MapPin, Building2, Zap } from 'lucide-react';
import clsx from 'clsx';
import api from '../services/api';

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
    const [conversations, setConversations] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await api.getConversations();

                // Group by lead_id so we have threaded conversations
                const grouped = {};
                if (Array.isArray(data)) {
                    data.forEach(msg => {
                        if (!grouped[msg.lead_id]) {
                            grouped[msg.lead_id] = {
                                id: msg.lead_id,
                                name: msg.name || 'Unknown Lead',
                                company: msg.company || 'Unknown Company',
                                channel: msg.channel || 'Email',
                                intent: msg.intent_score || 0,
                                isHot: msg.escalation_flag || msg.intent_score >= 41,
                                lastMessage: msg.content,
                                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                raw_date: new Date(msg.created_at),
                                thread: []
                            };
                        }
                        // Add to thread
                        grouped[msg.lead_id].thread.push({
                            sender: msg.direction === 'inbound' ? 'lead' : 'ai',
                            text: msg.content,
                            time: new Date(msg.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                        });

                        // Keep highest intent score
                        if (msg.intent_score > grouped[msg.lead_id].intent) {
                            grouped[msg.lead_id].intent = msg.intent_score;
                        }
                        // Keep latest time for inbox sorting
                        if (new Date(msg.created_at) > grouped[msg.lead_id].raw_date) {
                            grouped[msg.lead_id].raw_date = new Date(msg.created_at);
                            grouped[msg.lead_id].lastMessage = msg.content;
                            grouped[msg.lead_id].time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    });
                }

                // Convert grouped obj to array and sort by most recent 
                const sortedThreads = Object.values(grouped).sort((a, b) => b.raw_date - a.raw_date);

                // Sort messages within each thread chronologically
                sortedThreads.forEach(chat => {
                    chat.thread.reverse(); // Assuming our SQL query returns DESC, reverse to make it ASC for UI
                });

                setConversations(sortedThreads);
                if (sortedThreads.length > 0) {
                    setActiveChatId(sortedThreads[0].id);
                }
            } catch (error) {
                console.error('Failed to load conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, []);

    const activeChat = conversations.find(c => c.id === activeChatId);

    const suggestReply = () => {
        if (!activeChat) return;
        const name = activeChat.name.split(' ')[0];
        setReplyText(`${name}, glad to hear it. How does 2 PM EST tomorrow work for a quick chat? I'll send over a calendar invite.`);
    };

    if (isLoading) {
        return <div className="p-8 text-slate-400">Loading live conversations from database...</div>;
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Mail size={32} className="text-slate-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-200">Inbox Zero!</h2>
                <p className="text-slate-400 mt-2 max-w-sm">No live replies have been captured yet. Start a campaign to generate inbound responses!</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">

            {/* Alert Banner for Hot leads */}
            {activeChat?.intent >= 41 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <div className="bg-red-500/20 p-2 rounded-full mt-0.5">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-red-500 font-bold text-sm">HOT LEAD DETECTED (Intent: {activeChat.intent})</h3>
                            <p className="text-slate-300 text-sm mt-1">Lead has responded positively. Human takeover is recommended to close the deal.</p>
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
                        <h2 className="font-bold text-slate-100">Live Inbox</h2>
                        <div className="flex space-x-2 mt-3">
                            <button className="px-3 py-1 bg-brand-primary/20 text-brand-primary text-xs font-medium rounded-full border border-brand-primary/30">All ({conversations.length})</button>
                            <button className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded-full border border-red-500/20">Hot ({conversations.filter(c => c.intent >= 41).length})</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {conversations.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                className={clsx(
                                    "p-4 border-b border-dark-border cursor-pointer transition-colors",
                                    activeChatId === chat.id ? "bg-slate-800/50" : "hover:bg-white/5"
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
                {activeChat && (
                    <div className="flex-1 flex flex-col bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-dark-border bg-slate-900/50 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-slate-100">{activeChat.name}</h2>
                                <p className="text-xs text-slate-400 mt-0.5">via {activeChat.channel}</p>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-slate-200"><MoreVertical size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-900/30 flex flex-col-reverse">
                            <div className="space-y-6 flex flex-col">
                                {activeChat.thread.map((msg, i) => (
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
                )}

                {/* Right Panel: Lead Info & AI Insights */}
                {activeChat && (
                    <div className="w-72 flex flex-col space-y-6">
                        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
                            <h3 className="font-bold text-sm text-slate-100 mb-4 pb-3 border-b border-dark-border">Lead Context</h3>
                            <div className="space-y-4">
                                <ContextBadge icon={Building2} text={activeChat.company} />
                                <ContextBadge icon={Globe} text="Website Available" />
                                <ContextBadge icon={Zap} text={`Intent Score: ${activeChat.intent}`} />
                            </div>
                        </div>

                        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex-1 border-t-2 border-t-brand-secondary">
                            <div className="flex items-center space-x-2 text-brand-secondary mb-4 pb-3 border-b border-dark-border">
                                <Zap size={16} />
                                <h3 className="font-bold text-sm">AI Suggested Actions</h3>
                            </div>
                            <div className="space-y-2">
                                <button
                                    onClick={suggestReply}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-400 bg-slate-900 border border-dark-border rounded hover:border-brand-primary hover:text-white transition-colors"
                                >
                                    Suggest Meeting Time
                                </button>
                                <button
                                    onClick={() => setReplyText(`Hi ${activeChat.name.split(' ')[0]}, let me find some exact pricing docs for you and send them over today.`)}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-400 bg-slate-900 border border-dark-border rounded hover:border-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Provide Pricing Info
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReplyCenter;
