import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, FileSpreadsheet, KeyRound, MessageSquare, Send, Sparkles, Download } from 'lucide-react';
import clsx from 'clsx';

const steps = ['Data Source', 'Service Details', 'Tone', 'Channels', 'Preview & Launch'];

const mockMessages = [
    {
        lead: 'Apex Real Estate',
        channel: 'WhatsApp',
        message: 'Hey John, noticed Apex is expanding in downtown. Most real estate firms we work with are losing 20% of inbound leads due to slow follow-ups. What does your current response time look like?',
    },
    {
        lead: 'Dental Excellence',
        channel: 'Email',
        message: 'Subject: Scaling Dental Excellence\\n\\nHi Dr. Lee,\\n\\nFollowing your recent clinic opening, I noticed many practices struggle to keep chairs filled consistently, costing thousands in lost revenue.\\n\\nWe recently helped Urban Dentists increase bookings by 35% without ad spend. \\n\\nHow are you currently handling patient acquisition?',
    },
    {
        lead: 'Growth SaaS',
        channel: 'LinkedIn',
        message: 'Mike - great insights on your recent post about product-led growth. Curious about your opinion on churn reduction strategies for mid-market clients. Would love to hear your thoughts.',
    }
];

const CampaignBuilder = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTone, setSelectedTone] = useState('');
    const [channels, setChannels] = useState({ whatsapp: true, email: false, linkedin: false });

    // Form State
    const [serviceDescription, setServiceDescription] = useState("AI-powered lead generation and automated closing system");
    const [targetOutcome, setTargetOutcome] = useState("Book 15+ qualified sales meetings per month consistently");
    const [specialOffer, setSpecialOffer] = useState("Free lead list scrub for the first 100 leads");
    const [senderName, setSenderName] = useState("Ali Khan");
    const [isLaunching, setIsLaunching] = useState(false);

    const handleLaunchCampaign = async () => {
        setIsLaunching(true);
        try {
            const activeChannels = Object.keys(channels).filter(key => channels[key]);
            const payload = {
                name: "AI Outreach Campaign",
                service_description: serviceDescription + " - Target: " + targetOutcome,
                tone: selectedTone || "professional",
                special_offer: specialOffer,
                channels: activeChannels,
                sender_name: senderName
            };

            const response = await fetch('http://localhost:5000/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Campaign launched successfully! The n8n webhook has been triggered.");
                setCurrentStep(1); // Reset to beginning or handle navigation
            } else {
                const errData = await response.json();
                alert("Failed to launch campaign: " + (errData.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Launch error:", error);
            alert("Error launching campaign. Check console for details.");
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Builder</h1>
                <p className="text-slate-400 text-sm mt-1">Configure your AI-powered outreach sequence.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-8 px-4">
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isActive = currentStep === stepNum;
                    const isPast = currentStep > stepNum;

                    return (
                        <div key={step} className="flex items-center">
                            <div className={clsx(
                                "flex flex-col items-center",
                                isActive ? "text-brand-primary" : isPast ? "text-slate-300" : "text-slate-600"
                            )}>
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors",
                                    isActive ? "bg-brand-primary text-white border-2 border-brand-primary/20 ring-4 ring-brand-primary/10" :
                                        isPast ? "bg-slate-800 text-slate-300 border border-slate-600" : "bg-dark-bg border border-dark-border text-slate-600"
                                )}>
                                    {isPast ? <CheckCircle2 size={20} className="text-brand-accent" /> : stepNum}
                                </div>
                                <span className="text-xs font-medium">{step}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={clsx(
                                    "w-16 md:w-24 h-px mx-4 mt-[-24px]",
                                    isPast ? "bg-slate-600" : "bg-dark-border"
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-8 min-h-[400px]">
                {/* Step 1: Data Source */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-slate-100 mb-4">Select Data Source</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-2 border-brand-primary bg-brand-primary/5 rounded-xl p-6 cursor-pointer flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center mb-4 text-brand-primary">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <h3 className="font-bold text-slate-200">Last Scraped List</h3>
                                <p className="text-sm text-slate-400 mt-2">Use the 1,245 leads extracted today from Real Estate (US).</p>
                            </div>
                            <div className="border border-dark-border bg-slate-900 rounded-xl p-6 cursor-pointer flex flex-col items-center text-center hover:border-slate-600 transition-colors">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                    <Download size={24} />
                                </div>
                                <h3 className="font-bold text-slate-200">Import CSV/Sheet</h3>
                                <p className="text-sm text-slate-400 mt-2">Upload your own list of leads to start a campaign.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Service Details */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-slate-100 mb-4">Service Details</h2>
                        <div className="space-y-4 max-w-2xl">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-1 block">What do you sell?</label>
                                <input type="text" value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-slate-200 focus:ring-1 focus:ring-brand-primary outline-none" placeholder="e.g., AI lead generation software" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-1 block">Target Outcome for Lead</label>
                                <input type="text" value={targetOutcome} onChange={e => setTargetOutcome(e.target.value)} className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-slate-200 focus:ring-1 focus:ring-brand-primary outline-none" placeholder="e.g., Increase bookings by 30%" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-1 block">Special Offer / Hook (Optional)</label>
                                <input type="text" value={specialOffer} onChange={e => setSpecialOffer(e.target.value)} className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-slate-200 focus:ring-1 focus:ring-brand-primary outline-none" placeholder="e.g., Free 14-day trial" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-1 block">Sender Name</label>
                                <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2.5 text-slate-200 focus:ring-1 focus:ring-brand-primary outline-none" placeholder="e.g., Ali Khan" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Tone */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-slate-100 mb-4">Select AI Personality</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { id: 'bold', name: 'Bold', desc: 'Direct, confident, pattern-breaking' },
                                { id: 'friendly', name: 'Friendly', desc: 'Warm, conversational, peer-to-peer' },
                                { id: 'authority', name: 'Authority', desc: 'Consultative, expert, insight-led' },
                                { id: 'direct', name: 'Direct', desc: 'No fluff, straight to the point' },
                            ].map((tone) => (
                                <div
                                    key={tone.id}
                                    onClick={() => setSelectedTone(tone.id)}
                                    className={clsx(
                                        "border rounded-xl p-5 cursor-pointer transition-all",
                                        selectedTone === tone.id ? "border-brand-primary bg-brand-primary/10" : "border-dark-border bg-slate-900 hover:border-slate-500"
                                    )}
                                >
                                    <h3 className={clsx("font-bold", selectedTone === tone.id ? "text-brand-primary" : "text-slate-200")}>{tone.name}</h3>
                                    <p className="text-xs text-slate-400 mt-2">{tone.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Channels */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-slate-100 mb-4">Activate Channels</h2>
                        <p className="text-slate-400 text-sm mb-6">Select which channels AI should use. We handle message formatting automatically.</p>

                        <div className="space-y-4 max-w-xl">
                            {[
                                { id: 'whatsapp', name: 'WhatsApp', desc: 'Highest reply rate. Best for direct connection.', active: channels.whatsapp },
                                { id: 'email', name: 'Email Sequence', desc: 'Standard professional outreach. Good for volume.', active: channels.email },
                                { id: 'linkedin', name: 'LinkedIn', desc: 'Social selling and relationship building.', active: channels.linkedin },
                            ].map((ch) => (
                                <div key={ch.id} className="flex items-center justify-between p-4 border border-dark-border bg-slate-900 rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-slate-200">{ch.name}</h3>
                                        <p className="text-xs text-slate-400 mt-1">{ch.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={ch.active} onChange={() => setChannels({ ...channels, [ch.id]: !ch.active })} />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Preview */}
                {currentStep === 5 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-100">AI Message Preview</h2>
                            <span className="flex items-center text-brand-primary text-sm font-medium bg-brand-primary/10 px-3 py-1 rounded-full">
                                <Sparkles size={14} className="mr-1" /> AI Generated
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {mockMessages.map((msg, i) => (
                                <div key={i} className="bg-slate-900 border border-dark-border rounded-xl p-5 relative group">
                                    <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-bl-lg rounded-tr-xl font-medium">
                                        {msg.channel}
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">To: {msg.lead}</p>
                                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    className={clsx("px-6 py-2.5 rounded-lg font-medium transition-colors", currentStep === 1 ? "opacity-0 pointer-events-none" : "text-slate-300 hover:bg-slate-800 border border-dark-border")}
                >
                    Back
                </button>

                {currentStep < 5 ? (
                    <button
                        onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-slate-100 text-slate-900 font-bold rounded-lg hover:bg-white transition-colors"
                    >
                        <span>Next Step</span>
                        <ChevronRight size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleLaunchCampaign}
                        disabled={isLaunching}
                        className="flex items-center space-x-2 px-8 py-2.5 bg-brand-secondary text-white font-bold rounded-lg hover:bg-violet-600 transition-colors shadow-lg shadow-brand-secondary/20 disabled:opacity-50">
                        <Send size={18} />
                        <span>{isLaunching ? "Launching..." : "Launch Campaign"}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CampaignBuilder;
