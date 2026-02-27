import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, Linkedin, Megaphone, MessagesSquare, Settings } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Google Maps', path: '/google-scraper', icon: MapPin },
        { name: 'LinkedIn', path: '/linkedin-scraper', icon: Linkedin },
        { name: 'Campaign Builder', path: '/campaigns', icon: Megaphone },
        { name: 'Reply Center', path: '/replies', icon: MessagesSquare },
    ];

    return (
        <div className="w-64 bg-dark-card border-r border-dark-border flex flex-col h-full">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                    CLOZR
                </h1>
                <p className="text-xs text-slate-400 mt-1">AI Lead Acquisition</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-brand-primary/10 text-brand-primary font-medium'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                )
                            }
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-dark-border">
                <button className="flex items-center space-x-3 text-slate-400 hover:text-slate-200 w-full px-4 py-3 rounded-lg transition-colors">
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
