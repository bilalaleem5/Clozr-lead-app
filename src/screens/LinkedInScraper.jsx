import React, { useState } from 'react';
import { Search, Loader2, Download, Play, Filter, Linkedin, User, Briefcase } from 'lucide-react';
import api from '../services/api';

const getIcpColor = (score) => {
    if (score >= 80) return 'text-brand-accent bg-brand-accent/10 border-brand-accent/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
};

const LinkedInScraper = () => {
    const [isScraping, setIsScraping] = useState(false);
    const [progress, setProgress] = useState(0);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [leads, setLeads] = useState([]);
    const [totalFound, setTotalFound] = useState(0);

    const handleScrape = async () => {
        if (!category) {
            alert('Please enter at least a Category!');
            return;
        }

        setIsScraping(true);
        setProgress(0);
        setLeads([]);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) { clearInterval(interval); return 90; }
                return prev + Math.random() * 12;
            });
        }, 600);

        try {
            const result = await api.triggerScraper({
                category,
                country: '',
                source: 'linkedin',
                title: title || 'CEO',
            });
            clearInterval(interval);
            setProgress(100);

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
            console.error('LinkedIn scraping failed:', error);
        }
    };

    const displayLeads = leads.length > 0 ? leads : [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <Linkedin size={24} className="text-blue-400" />
                        LinkedIn Scraper
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Find decision-makers by industry and job title from LinkedIn.</p>
                </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                            <Briefcase size={14} /> Industry / Category
                        </label>
                        <input
                            type="text"
                            list="li-categories"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Real Estate, SaaS, Healthcare..."
                            className="w-full bg-slate-900 border border-dark-border text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-400 outline-none"
                        />
                        <datalist id="li-categories">
                            <option value="Real Estate" />
                            <option value="SaaS / Tech" />
                            <option value="Healthcare" />
                            <option value="Marketing Agency" />
                            <option value="E-Commerce" />
                            <option value="Legal" />
                            <option value="Finance" />
                            <option value="Construction" />
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                            <User size={14} /> Decision-Maker Title
                        </label>
                        <input
                            type="text"
                            list="li-titles"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. CEO, Founder, CMO..."
                            className="w-full bg-slate-900 border border-dark-border text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-400 outline-none"
                        />
                        <datalist id="li-titles">
                            <option value="CEO" />
                            <option value="Founder" />
                            <option value="Co-Founder" />
                            <option value="CTO" />
                            <option value="CMO" />
                            <option value="COO" />
                            <option value="VP of Sales" />
                            <option value="Marketing Director" />
                            <option value="Head of Growth" />
                            <option value="Managing Director" />
                            <option value="Owner" />
                        </datalist>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-slate-300">Filters</label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {['Has Email', 'Has Company Website', 'Decision Maker Only', 'Company 10+ Employees', 'Active Profile'].map((filter) => (
                                <label key={filter} className="flex items-center space-x-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-dark-border hover:border-blue-400/40 cursor-pointer transition-colors">
                                    <input type="checkbox" className="rounded bg-slate-800 border-slate-600 text-blue-400 focus:ring-blue-400 focus:ring-offset-slate-900"
                                        defaultChecked={['Decision Maker Only', 'Has Email'].includes(filter)} />
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
                                    <span>Searching {title || 'Decision Makers'} in {category}...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                                    <div className="bg-blue-400 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 flex items-center">
                                <Filter size={16} className="mr-2" />
                                {leads.length > 0 ? `✅ Found ${totalFound} decision-makers` : 'Select an industry and title to find decision-makers.'}
                            </div>
                        )}
                    </div>
                    <button onClick={handleScrape} disabled={isScraping}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${isScraping ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20'}`}>
                        {isScraping ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        <span>{isScraping ? 'Extracting...' : 'Find Decision Makers'}</span>
                    </button>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                <div className="px-6 py-4 flex justify-between items-center border-b border-dark-border bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center">
                        Results <span className="ml-3 text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded-full border border-dark-border">{totalFound || displayLeads.length} Found</span>
                    </h2>
                    <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 border border-dark-border text-slate-300 text-sm rounded-lg hover:bg-slate-800 transition-colors">
                            <Download size={16} /><span>Export CSV</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-brand-secondary text-white text-sm rounded-lg hover:bg-violet-600 transition-colors shadow-lg shadow-brand-secondary/20">
                            <Play size={16} /><span>Start Campaign</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 font-medium border-b border-dark-border">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Company</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Industry</th>
                                <th className="px-6 py-3 text-center">ICP Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayLeads.length > 0 ? displayLeads.map((lead, idx) => (
                                <tr key={lead.id || idx} className="border-b border-dark-border last:border-0 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{lead.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-500/10 text-blue-400 text-xs font-medium px-2 py-0.5 rounded border border-blue-500/20">
                                            {lead.title || lead.contact || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{lead.company || '-'}</td>
                                    <td className="px-6 py-4">{lead.email || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">{lead.industry || lead.category || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getIcpColor(lead.icp_score || lead.icp || 0)}`}>
                                                {lead.icp_score || lead.icp || 0}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Select an industry & decision-maker title, then click "Find Decision Makers".</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LinkedInScraper;
