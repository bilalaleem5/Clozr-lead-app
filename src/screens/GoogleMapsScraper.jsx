import React, { useState } from 'react';
import { Search, Loader2, Download, Play, Filter, Globe2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const getIcpColor = (score) => {
    if (score >= 80) return 'text-brand-accent bg-brand-accent/10 border-brand-accent/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
};

const GoogleMapsScraper = () => {
    const [isScraping, setIsScraping] = useState(false);
    const [progress, setProgress] = useState(0);
    const [category, setCategory] = useState('');
    const [country, setCountry] = useState('');
    const [leads, setLeads] = useState([]);
    const [totalFound, setTotalFound] = useState(0);

    const navigate = useNavigate();

    const exportToCSV = () => {
        if (leads.length === 0) return;

        const headers = ["Business", "Email", "Phone", "Website", "Address", "Rating", "Review Count", "Category", "ICP Score"];
        const csvRows = [headers.join(",")];

        leads.forEach(lead => {
            const row = [
                `"${(lead.name || lead.company || '').replace(/"/g, '""')}"`,
                `"${lead.email || ''}"`,
                `"${lead.phone || ''}"`,
                `"${lead.website || ''}"`,
                `"${(lead.address || '').replace(/"/g, '""')}"`,
                lead.rating || '',
                lead.review_count || '',
                `"${lead.category || ''}"`,
                lead.icp_score || lead.icp || 0
            ];
            csvRows.push(row.join(","));
        });

        const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `leads_${category}_${country.replace(/ /g, '_')}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleStartCampaign = () => {
        if (leads.length === 0) {
            alert("No leads to start a campaign. Please scrape leads first.");
            return;
        }
        navigate('/campaign-builder', { state: { importedLeads: leads } });
    };

    const handleScrape = async () => {
        if (!category || !country) {
            alert('Please enter both Category and Country!');
            return;
        }

        setIsScraping(true);
        setProgress(0);
        setLeads([]);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) { clearInterval(interval); return 90; }
                return prev + Math.random() * 15;
            });
        }, 500);

        try {
            const result = await api.triggerScraper({ category, country, source: 'google_maps' });
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
            console.error('Scraping failed:', error);
        }
    };

    const displayLeads = leads.length > 0 ? leads : [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <MapPin size={24} className="text-brand-primary" />
                        Google Maps Scraper
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Extract business leads from Google Maps by category &amp; location.</p>
                </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Business Category</label>
                        <input
                            type="text"
                            list="gm-categories"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Real Estate, Dentists..."
                            className="w-full bg-slate-900 border border-dark-border text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                        />
                        <datalist id="gm-categories">
                            <option value="Real Estate" />
                            <option value="Dentists" />
                            <option value="Restaurants" />
                            <option value="Gyms & Fitness" />
                            <option value="Plumbers" />
                            <option value="SaaS Companies" />
                            <option value="Marketing Agency" />
                            <option value="Law Firms" />
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Country / City</label>
                        <div className="relative">
                            <Globe2 size={16} className="absolute left-3 top-2.5 text-slate-500" />
                            <input
                                type="text"
                                list="gm-countries"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="e.g. United States, London..."
                                className="w-full bg-slate-900 border border-dark-border text-slate-200 text-sm rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                            />
                            <datalist id="gm-countries">
                                <option value="United States" />
                                <option value="United Kingdom" />
                                <option value="Canada" />
                                <option value="Australia" />
                                <option value="UAE" />
                                <option value="Pakistan" />
                            </datalist>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-slate-300">Must Have Filters</label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {['Email', 'Phone', 'Website', 'Rating 4+', 'Photos Available'].map((filter) => (
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
                                {leads.length > 0 ? `✅ Found ${totalFound} leads` : 'Enter category & country to start scraping Google Maps.'}
                            </div>
                        )}
                    </div>
                    <button onClick={handleScrape} disabled={isScraping}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${isScraping ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-primary text-white hover:bg-blue-600 shadow-lg shadow-brand-primary/20'}`}>
                        {isScraping ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        <span>{isScraping ? 'Scraping Maps...' : 'Start Google Scraper'}</span>
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
                        <button onClick={exportToCSV} disabled={displayLeads.length === 0} className="flex items-center space-x-2 px-4 py-2 border border-dark-border text-slate-300 text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
                            <Download size={16} /><span>Export CSV</span>
                        </button>
                        <button onClick={handleStartCampaign} disabled={displayLeads.length === 0} className="flex items-center space-x-2 px-4 py-2 bg-brand-secondary text-white text-sm rounded-lg hover:bg-violet-600 transition-colors shadow-lg shadow-brand-secondary/20 disabled:opacity-50">
                            <Play size={16} /><span>Start Campaign</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 font-medium border-b border-dark-border">
                            <tr>
                                <th className="px-6 py-3">Business</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Website</th>
                                <th className="px-6 py-3">Address</th>
                                <th className="px-6 py-3 text-center">Reviews/Rating</th>
                                <th className="px-6 py-3 text-center">ICP Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayLeads.length > 0 ? displayLeads.map((lead, idx) => (
                                <tr key={lead.id || idx} className="border-b border-dark-border last:border-0 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">
                                        {lead.name || lead.company}
                                        {lead.category && <div className="text-xs text-slate-500 font-normal">{lead.category}</div>}
                                    </td>
                                    <td className="px-6 py-4">{lead.email && lead.email !== 'empty' ? lead.email : '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{lead.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        {lead.website ? (
                                            <a href={lead.website} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline max-w-[150px] truncate block">
                                                {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{lead.address || lead.city || '-'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-slate-300">⭐ {lead.rating ? Number(lead.rating).toFixed(1) : '–'}</div>
                                        {lead.review_count && <div className="text-xs text-slate-500 mt-1">{lead.review_count} revs</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getIcpColor(lead.icp_score || lead.icp || 0)}`}>
                                                {lead.icp_score || lead.icp || 0}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Enter a category & country, then click "Start Google Scraper" to begin.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GoogleMapsScraper;
