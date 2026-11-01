import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Gavel,
    LayoutDashboard,
    LogOut,
    Settings,
    Trophy,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react';
import { useAuth } from '../../AuthContext';

const JudgeSidebar: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/judge-portal' },
        { icon: Gavel, label: 'Assignments', path: '/judge-portal/assignments' },
        { icon: Trophy, label: 'Leaderboards', path: '/judge-portal/leaderboards' },
        { icon: Settings, label: 'Settings', path: '/judge-portal/settings' },
    ];

    const sidebarContent = (
        <>
            <div className={`p-5 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
                    <Gavel size={18} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <h1 className="text-sm font-extrabold text-white tracking-tight">Judge Portal</h1>
                        <p className="text-[10px] font-semibold text-violet-400/70 uppercase tracking-widest">StudLyf</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex mx-4 mb-2 items-center justify-center p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-500 hover:text-slate-300 transition-colors"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <nav className="flex-1 px-3 mt-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/judge-portal'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                                collapsed ? 'justify-center' : ''
                            } ${
                                isActive
                                    ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-white shadow-md shadow-violet-500/10 border border-violet-500/20'
                                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 border border-transparent'
                            }`
                        }
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon size={18} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className={`p-4 border-t border-white/[0.06] ${collapsed ? 'px-2' : ''}`}>
                <div
                    className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-3 ${
                        collapsed ? 'justify-center px-0' : ''
                    }`}
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-sm shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.full_name?.charAt(0)?.toUpperCase() || 'J'}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-[13px] font-bold text-white truncate">{user?.full_name || user?.name || 'Judge'}</p>
                            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all ${
                        collapsed ? 'justify-center' : ''
                    }`}
                    title={collapsed ? 'Sign Out' : undefined}
                >
                    <LogOut size={18} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0c0a2a] border border-white/[0.1] rounded-xl text-white shadow-lg"
            >
                <Menu size={20} />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`md:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-gradient-to-b from-[#0c0a2a] via-[#0f0d2e] to-[#08071e] border-r border-white/[0.06] flex flex-col shrink-0 transition-transform duration-300 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.06] text-slate-400 hover:text-white"
                >
                    <X size={16} />
                </button>
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside
                className={`hidden md:flex h-screen bg-gradient-to-b from-[#0c0a2a] via-[#0f0d2e] to-[#08071e] border-r border-white/[0.06] flex-col shrink-0 transition-all duration-300 ${
                    collapsed ? 'w-[72px]' : 'w-[260px]'
                }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default JudgeSidebar;
