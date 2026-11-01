
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    Target,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Layout,
    Briefcase,
    Download,
    TrendingUp
} from 'lucide-react';
import AIInsightsPanel from '../components/AIInsightsPanel';

import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

const DashboardOverview: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.email) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                    headers: { 'X-Admin-Email': user.email }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                try { console.error("Failed to fetch admin stats:", error instanceof Error ? error.message : String(error)); } catch (_) {}
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    // --- KPI data with safe fallbacks ---
    const kpis = stats ? [
        { title: 'Total Students', value: (stats.totalStudents ?? 0).toLocaleString(), trend: stats.studentGrowth || '+0%', icon: Users, color: 'text-blue-500', path: '/admin/students' },
        { title: 'Active Courses', value: String(stats.activeCourses ?? 0), trend: stats.courseGrowth || '+0%', icon: BookOpen, color: 'text-purple-500', path: '/admin/courses' },
        { title: 'Completed Assessments', value: (stats.completedAssessments ?? 0).toLocaleString(), trend: stats.assessmentGrowth || '+0%', icon: Layout, color: 'text-green-500', path: '/admin/assessments' },
        { title: 'Hiring Conversions', value: (stats.hiringConversions ?? 0).toLocaleString(), trend: stats.hiringGrowth || '+0%', icon: Briefcase, color: 'text-red-500', path: '/admin/analytics' },
        { title: 'Revenue', value: stats.revenue ?? '$0', trend: '+24.8%', icon: DollarSign, color: 'text-emerald-500', path: '/admin/payments' },
    ] : [
        { title: 'Total Students', value: '...', trend: '...', icon: Users, color: 'text-blue-500', path: '/admin/students' },
        { title: 'Active Courses', value: '...', trend: '...', icon: BookOpen, color: 'text-purple-500', path: '/admin/courses' },
        { title: 'Completed Assessments', value: '...', trend: '...', icon: Layout, color: 'text-green-500', path: '/admin/assessments' },
        { title: 'Hiring Conversions', value: '...', trend: '...', icon: Briefcase, color: 'text-red-500', path: '/admin/analytics' },
        { title: 'Revenue', value: '...', trend: '...', icon: DollarSign, color: 'text-emerald-500', path: '/admin/payments' },
    ];

    const enrollmentData = stats?.monthlyData || [];

    const funnelColors = ['bg-[#7C3AED]/20', 'bg-[#7C3AED]/40', 'bg-[#7C3AED]/60', 'bg-[#7C3AED]/80', 'bg-[#7C3AED]'];
    const hiringFunnel = stats?.funnel?.map((item: any, i: number) => ({
        ...item,
        color: funnelColors[i] || 'bg-[#7C3AED]'
    })) || [
            { label: 'Total Candidates', value: 1200, color: 'bg-[#7C3AED]/20' },
            { label: 'Ready for Hiring', value: 850, color: 'bg-[#7C3AED]/40' },
            { label: 'Interviewed', value: 420, color: 'bg-[#7C3AED]/60' },
            { label: 'Offer Received', value: 180, color: 'bg-[#7C3AED]/80' },
            { label: 'Hired', value: 145, color: 'bg-[#7C3AED]' },
        ];

    // --- Download Report: exports all visible dashboard data as CSV ---
    const handleDownloadReport = () => {
        const rows: string[] = [];
        const timestamp = new Date().toISOString().split('T')[0];

        // Section 1: KPI Summary
        rows.push('=== STUDLYF ADMIN DASHBOARD REPORT ===');
        rows.push(`Generated: ${new Date().toLocaleString()}`);
        rows.push('');
        rows.push('--- KPI SUMMARY ---');
        rows.push('Metric,Value,Trend');
        kpis.forEach(kpi => {
            rows.push(`${kpi.title},${kpi.value},${kpi.trend}`);
        });

        // Section 2: Monthly Enrollment Data
        rows.push('');
        rows.push('--- MONTHLY ENROLLMENT ---');
        rows.push('Month,Students');
        if (enrollmentData.length > 0) {
            enrollmentData.forEach((data: any) => {
                rows.push(`${data.month ?? 'N/A'},${data.students ?? 0}`);
            });
        } else {
            rows.push('No enrollment data available');
        }

        // Section 3: Hiring Funnel
        rows.push('');
        rows.push('--- HIRING SUCCESS FUNNEL ---');
        rows.push('Stage,Count');
        hiringFunnel.forEach((item: any) => {
            rows.push(`${item.label},${item.value ?? 0}`);
        });

        // Section 4: Other metrics
        rows.push('');
        rows.push('--- OTHER METRICS ---');
        rows.push(`Course Completion Rate,${stats?.courseCompletion || '84%'}`);
        rows.push(`Goal Achievement,${stats?.goalAchievement || '115%'}`);

        // Create and download the CSV file
        const csvContent = rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `studlyf_admin_report_${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto custom-scrollbar overflow-y-auto h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
                    <p className="text-white/50 text-sm mt-1">Monitor the entire StudLyf ecosystem in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadReport}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Download size={14} /> Download Report
                    </button>
                    <button onClick={() => navigate('/admin/courses')} className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-purple-500/20 active:scale-95">
                        + Add New Course
                    </button>
                </div>
            </div>

            {/* KPI Grid — each card is now clickable */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(kpi.path)}
                        className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-2xl hover:bg-white/[0.07] transition-all group cursor-pointer active:scale-[0.97]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-white/5 ${kpi.color}`}>
                                <kpi.icon size={20} />
                            </div>
                            <div className={`text-xs font-bold flex items-center gap-1 ${String(kpi.trend).startsWith('+') ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {kpi.trend} {String(kpi.trend).startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                        <div className="text-xs text-white/40 uppercase tracking-widest font-bold">{kpi.title}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                {/* Enrollment Chart */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white">Student Enrollment & Growth</h3>
                            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Last 12 Months</p>
                        </div>
                        <select className="bg-[#1A1A1A] border border-white/10 rounded-lg text-xs font-bold text-white px-3 py-1.5 outline-none">
                            <option>2024 (Current Year)</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full flex items-end justify-between gap-3 px-2">
                        {enrollmentData.length > 0 ? (
                            enrollmentData.map((data: any, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${((data.students ?? 0) / Math.max((stats?.totalStudents ?? 1) * 1.2, 10)) * 100}%` }}
                                        className="w-full bg-gradient-to-t from-[#7C3AED]/20 to-[#7C3AED] rounded-t-lg group-hover:from-[#7C3AED]/40 group-hover:to-[#9F67FF] transition-all relative"
                                    />
                                    <span className="text-[10px] font-bold text-white/30 uppercase">{data.month}</span>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {(data.students ?? 0).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
                                No enrollment data available yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Insights Panel */}
                <div className="lg:col-span-1">
                    <AIInsightsPanel />
                </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {/* Hiring Success Funnel */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white">Hiring Success Funnel</h3>
                        <div className="p-2 rounded-lg bg-white/5 text-purple-500">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="space-y-5">
                        {hiringFunnel.map((item: any, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-white/40 uppercase tracking-widest">{item.label}</span>
                                    <span className="text-white">{(item.value ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((item.value ?? 0) / 1200) * 100}%` }}
                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                        className={`${item.color} h-full rounded-full transition-all`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Completion Meter */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 mb-6">
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="64" cy="64" r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-white/5"
                            />
                            <motion.circle
                                cx="64" cy="64" r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray="364.4"
                                initial={{ strokeDashoffset: 364.4 }}
                                animate={{ strokeDashoffset: 364.4 - (364.4 * (parseInt(stats?.courseCompletion || '84') / 100)) }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                strokeLinecap="round"
                                className="text-[#7C3AED]"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">{stats?.courseCompletion || '84%'}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs">Course Completion</h4>
                        <p className="text-white/30 text-[10px] mt-2">Average success across all tracks</p>
                    </div>
                </div>

                {/* Goal Achievement Card */}
                <div className="bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-3xl p-4 sm:p-8 text-white flex flex-col justify-between shadow-2xl shadow-purple-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all" />
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                            <Target size={24} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold leading-tight">Goal Achievement</h3>
                        <p className="text-white/80 text-sm mt-3">We are on track to hit Q1 hiring goals by <span className="text-white font-bold">{stats?.goalAchievement || '115%'}</span>.</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/analytics')}
                        className="w-full mt-8 py-3 bg-white text-[#7C3AED] rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg active:scale-95"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;

