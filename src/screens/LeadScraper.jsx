import React, { useState } from 'react';
import { Search, Loader2, Download, Play, Filter, Globe2 } from 'lucide-react';
import api from '../services/api';

const getIcpColor = (score) => {
    if (score >= 80) return 'text-brand-accent bg-brand-accent/10 border-brand-accent/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
};

const LeadScraper = () => {
    const [isScraping, setIsScraping] = useState(false);
    const [progress, setProgress] = useState(0);
    const [category, setCategory] = useState('');
    const [country, setCountry] = useState('');
    const [leads, setLeads] = useState([]);
    const [totalFound, setTotalFound] = useState(0);

    const handleScrape = async () => {
        if (!category || !country) {
            alert('Please enter both Category and Country!');
            return;
        }

        setIsScraping(true);
        setProgress(0);
        setLeads([]);

        // Progress animation
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 500);

        try {
            // Call backend → backend calls n8n webhook
            const result = await api.triggerScraper({ category, country });

            clearInterval(interval);
            setProgress(100);

            // If we got leads back (from mock or n8n)
            if (result.error) {
                alert(`Scraper Error: ${result.error}\n\nPlease check your n8n workflow.`);
            } else {
                let extractedLeads = null;
                let dataToParse = result.data || result;

                // If n8n returned a stringified JSON body
                if (typeof dataToParse === 'string') {
                    try { dataToParse = JSON.parse(dataToParse); } catch (e) { }
                }

                // Try to find the leads array in various expected structures
                if (Array.isArray(dataToParse) && dataToParse[0] && Array.isArray(dataToParse[0].leads)) {
                    extractedLeads = dataToParse[0].leads;
                } else if (dataToParse && Array.isArray(dataToParse.leads)) {
                    extractedLeads = dataToParse.leads;
                } else if (Array.isArray(result.leads)) {
                    extractedLeads = result.leads;
                } else if (Array.isArray(dataToParse) && dataToParse.length > 0 && dataToParse[0].name) {
                    extractedLeads = dataToParse; // n8n directly returned array of leads
                }

                if (extractedLeads && extractedLeads.length > 0) {
                    setLeads(extractedLeads);
                    setTotalFound(extractedLeads.length);
                } else {
                    const responseSnippet = JSON.stringify(result).substring(0, 200);
                    alert(`No leads found. N8n returned: \n${responseSnippet}`);
                }
            }

            setTimeout(() => setIsScraping(false), 500);
        } catch (error) {
            clearInterval(interval);
            setProgress(0);
            setIsScraping(false);
            console.error('Scraping failed:', error);
        }
    };

    // Use scraped leads or show placeholder
    const displayLeads = leads.length > 0 ? leads : [];

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
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
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
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
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
                                    <span>Scraping {category} in {country}...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                                    <div className="bg-brand-primary h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 flex items-center">
                                <Filter size={16} className="mr-2" />
                                {leads.length > 0
                                    ? `✅ Found ${totalFound} leads matching your ICP criteria`
                                    : 'Ready to extract leads matching your ICP score.'
                                }
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
                        Results <span className="ml-3 text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded-full border border-dark-border">{totalFound || displayLeads.length} Found</span>
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
                            {displayLeads.length > 0 ? displayLeads.map((lead, idx) => (
                                <tr key={lead.id || idx} className="border-b border-dark-border last:border-0 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{lead.name || lead.company}</td>
                                    <td className="px-6 py-4">{lead.contact || lead.name || '-'}</td>
                                    <td className="px-6 py-4">{lead.email || '-'}</td>
                                    <td className="px-6 py-4">{lead.phone || '-'}</td>
                                    <td className="px-6 py-4 text-slate-400">⭐ {(lead.rating || 0).toFixed ? (lead.rating || 0).toFixed(1) : lead.rating || '–'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getIcpColor(lead.icp_score || lead.icp || 0)}`}>
                                                {lead.icp_score || lead.icp || 0}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Enter a category & country, then click "Start Scraper" to begin.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeadScraper;
