import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
    return (
        <div className="flex h-screen bg-dark-bg text-slate-100 overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
