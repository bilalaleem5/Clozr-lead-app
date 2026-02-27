import { Bell, Search, UserCircle } from 'lucide-react';

const Topbar = () => {
    return (
        <header className="h-16 bg-dark-card border-b border-dark-border flex items-center justify-between px-6 z-10">
            {/* Search */}
            <div className="relative w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search size={18} />
                </span>
                <input
                    type="text"
                    placeholder="Search leads, campaigns..."
                    className="w-full bg-slate-900 text-slate-200 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary border border-dark-border"
                />
            </div>

            {/* Right actions */}
            <div className="flex items-center space-x-4">
                <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="h-8 w-px bg-dark-border mx-2"></div>
                <button className="flex items-center flex-row space-x-2 text-slate-300 hover:text-white transition-colors">
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-medium">Auto Closer</span>
                        <span className="text-xs text-slate-500">Admin</span>
                    </div>
                    <UserCircle size={32} className="text-slate-400" />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
