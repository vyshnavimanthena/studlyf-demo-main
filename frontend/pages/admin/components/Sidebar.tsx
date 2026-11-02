
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Trophy,
    Mic2,
    FileText,
    Briefcase,
    UserCheck,
    Building2,
    CreditCard,
    BarChart3,
    Settings,
    History,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell,
    PenTool,
    LogOut,
    Layers,
    Megaphone,
    ShieldCheck,
    CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { name: 'Course Projects', icon: Trophy, path: '/admin/course-projects' },
    { name: 'Assessments', icon: Trophy, path: '/admin/assessments' },
    { name: 'SDL Projects', icon: Layers, path: '/admin/sdl-projects' },
    { name: 'Resumes', icon: FileText, path: '/admin/resumes' },
    { name: 'Mentors', icon: UserCheck, path: '/admin/mentors' },
    { name: 'Opportunities', icon: Briefcase, path: '/admin/opportunities' },
    { name: 'Organizers', icon: ShieldCheck, path: '/admin/organizers' },
    // Shown only while ORGANIZER_PUBLISH_RESULTS is on (the config probe answers 200)
    { name: 'Published Results', icon: CheckCircle2, path: '/admin/published-results', requiresResultsPublishing: true },
    { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { name: 'Advertisements', icon: Megaphone, path: '/admin/ads' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
];

const contentItems = [
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
    { name: 'Audit Logs', icon: History, path: '/admin/audit-logs' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);
    const [resultsPublishing, setResultsPublishing] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetch(`${API_BASE_URL}/api/v1/organizer/results/config`)
            .then(res => { if (!cancelled) setResultsPublishing(res.ok); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/opportunities/admin/pending`, { headers: authHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setPendingCount(data.length);
                }
            } catch {}
        };
        fetchPending();
        const interval = setInterval(fetchPending, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? '80px' : '280px' }}
            className="h-screen w-[280px] bg-white border-r border-[#e8e3f5] flex flex-col md:sticky top-0 z-50 transition-all duration-300 ease-in-out"
        >
            {/* Header / Logo */}
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-[#14102b] font-bold">S</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#14102b]">StudLyf <span className="text-[#7C3AED]">Admin</span></span>
                    </motion.div>
                )}
                <button
                    onClick={toggleCollapse}
                    className="p-1.5 rounded-lg bg-white hover:bg-[#f6f3ff] text-slate-600 hover:text-[#14102b] transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Nav Items */}
            <div className="flex-grow overflow-y-auto px-4 py-2 no-scrollbar">
                <nav className="space-y-1.5">
                    {navItems.filter(item => !item.requiresResultsPublishing || resultsPublishing).map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-[#7C3AED]/10 text-[#6D28D9]'
                                        : 'text-slate-600 hover:text-[#14102b] hover:bg-[#f6f3ff]'}
                                `}
                            >
                                <item.icon size={20} className={isActive ? 'text-[#7C3AED]' : 'text-inherit'} />
                                {!isCollapsed && (
                                    <span className="font-medium text-sm">{item.name}</span>
                                )}

                                {!isCollapsed && item.name === 'Opportunities' && pendingCount > 0 && (
                                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-red-500/30">
                                        {pendingCount}
                                    </span>
                                )}

                                {isActive && (
                                    <motion.div
                                        layoutId="activeGlow"
                                        className="absolute inset-0 bg-[#7C3AED]/5 blur-md rounded-xl -z-10"
                                    />
                                )}
                                {isActive && !isCollapsed && (
                                    <div className="absolute right-3 w-1.5 h-1.5 bg-[#7C3AED] rounded-full shadow-[0_0_8px_#7C3AED]" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-[#e8e3f5] space-y-2">
                <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${isCollapsed ? 'justify-center' : 'bg-white'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-[#e8e3f5] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                        {user?.full_name?.[0] || 'A'}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-[#14102b] truncate">{user?.full_name || 'Super Admin'}</span>
                            <span className="text-xs text-slate-500 truncate">{user?.email || import.meta.env.VITE_ADMIN_EMAIL || 'admin@studlyf.com'}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={async () => {
                        await logout();
                        navigate('/login');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                    title="Logout"
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;

