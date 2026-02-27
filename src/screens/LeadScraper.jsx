import React, { useState } from 'react';
import { Search, Loader2, Download, Play, Filter, Globe2 } from 'lucide-react';

const mockLeads = [
    { id: 1, name: 'Apex Real Estate', contact: 'John Smith (CEO)', email: 'john@apexre.com', phone: '+1 234 567 8900', rating: 4.8, icp: 95 },
    { id: 2, name: 'Dental Excellence', contact: 'Dr. Sarah Lee', email: 'hello@dentalexc.com', phone: '+1 987 654 3210', rating: 4.5, icp: 85 },
    { id: 3, name: 'Growth SaaS', contact: 'Mike Johnson', email: '-', phone: '+44 20 7123 4567', rating: 3.9, icp: 65 },
    { id: 4, name: 'Digital Flow Agency', contact: 'Emily Chen (CMO)', email: 'emily@digitalflow.io', phone: '-', rating: 5.0, icp: 70 },
    { id: 5, name: 'Urban Dentists', contact: 'Unknown', email: 'info@urbandental.com', phone: '+1 555 123 4567', rating: 4.1, icp: 55 },
];

const getIcpColor = (score) => {
    if (score >= 80) return 'text-brand-accent bg-brand-accent/10 border-brand-accent/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
};

const LeadScraper = () => {
    const [isScraping, setIsScraping] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleScrape = () => {
        setIsScraping(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsScraping(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Lead Scraper engine</h1>
                    <p className="text-slate-400 text-sm mt-1">Extract high-intent B2B leads from Maps & LinkedIn.</p>
                </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Category</label>
                        <input
                            type="text"
                            list="categories"
                            placeholder="e.g. Real Estate, Dentists..."
                            className="w-full bg-slate-900 border border-dark-border text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                        />
                        <datalist id="categories">
                            <option value="Real Estate" />
                            <option value="Dentists" />
                            <option value="SaaS Companies" />
                            <option value="Marketing Agency" />
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Country</label>
                        <div className="relative">
                            <Globe2 size={16} className="absolute left-3 top-2.5 text-slate-500" />
                            <input
                                type="text"
                                list="countries"
                                placeholder="e.g. United States, UK..."
                                className="w-full bg-slate-900 border border-dark-border text-slate-200 text-sm rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                            />
                            <datalist id="countries">
                                <option value="United States" />
                                <option value="United Kingdom" />
                                <option value="Canada" />
                                <option value="Australia" />
                                <option value="UAE" />
                            </datalist>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-slate-300">Must Have Filters</label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {['Email', 'Phone', 'No Website', 'Rating 4+', 'Decision Maker'].map((filter) => (
                                <label key={filter} className="flex items-center space-x-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-dark-border hover:border-slate-500 cursor-pointer transition-colors">
                                    <input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-brand-primary focus:ring-brand-primary focus:ring-offset-slate-900"
                                        defaultChecked={['Email', 'Rating 4+'].includes(filter)} />
                                    <span>{filter}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                    <div className="flex-1 mr-8">
                        {isScraping ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-slate-300">
                                    <span>Scraping in progress...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                                    <div className="bg-brand-primary h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 flex items-center">
                                <Filter size={16} className="mr-2" />
                                Ready to extract leads matching your ICP score.
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleScrape}
                        disabled={isScraping}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${isScraping ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-primary text-white hover:bg-blue-600 shadow-lg shadow-brand-primary/20'
                            }`}
                    >
                        {isScraping ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        <span>{isScraping ? 'Extracting...' : 'Start Scraper'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden mt-6">
                <div className="px-6 py-4 flex justify-between items-center border-b border-dark-border bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center">
                        Results <span className="ml-3 text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded-full border border-dark-border">1,245 Found</span>
                    </h2>
                    <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 border border-dark-border text-slate-300 text-sm rounded-lg hover:bg-slate-800 transition-colors">
                            <Download size={16} />
                            <span>Export CSV</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-brand-secondary text-white text-sm rounded-lg hover:bg-violet-600 transition-colors shadow-lg shadow-brand-secondary/20">
                            <Play size={16} />
                            <span>Start Campaign</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 font-medium border-b border-dark-border">
                            <tr>
                                <th className="px-6 py-3">Business</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Rating</th>
                                <th className="px-6 py-3 text-center">ICP Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockLeads.map((lead) => (
                                <tr key={lead.id} className="border-b border-dark-border last:border-0 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{lead.name}</td>
                                    <td className="px-6 py-4">{lead.contact}</td>
                                    <td className="px-6 py-4">{lead.email}</td>
                                    <td className="px-6 py-4">{lead.phone}</td>
                                    <td className="px-6 py-4 text-slate-400">⭐ {lead.rating.toFixed(1)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getIcpColor(lead.icp)}`}>
                                                {lead.icp}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeadScraper;
