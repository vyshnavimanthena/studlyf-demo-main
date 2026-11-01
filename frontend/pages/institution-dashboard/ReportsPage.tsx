import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    Users, 
    Award, 
    FileText, 
    Download, 
    Calendar, 
    BarChart3, 
    PieChart,
    ListFilter,
    ChevronDown,
    Building2,
    Briefcase
} from 'lucide-react';

interface AnalyticsSummary {
    total_events: number;
    total_participants: number;
    total_teams: number;
    average_score: number;
}

interface ReportsPageProps {
    institutionId?: string;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ institutionId }) => {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [timeline, setTimeline] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [scoreDist, setScoreDist] = useState<any[]>([]);
    const [subDist, setSubDist] = useState<any[]>([]);
    
    const [activeFilter, setActiveFilter] = useState('All Departments');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!institutionId) {
                setSummary(null);
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                // 1. Fetch KPI Summary
                const summaryRes = await fetch(`${API_BASE_URL}/api/v1/institution/summary/${institutionId}`, { headers: { ...authHeaders() } });
                if (summaryRes.ok) setSummary(await summaryRes.json());

                // 2. Fetch Extra Analytics
                const res1 = await fetch(`${API_BASE_URL}/api/v1/institution/analytics/${institutionId}/timeline`, { headers: { ...authHeaders() } });
                if (res1.ok) setTimeline(await res1.json());

                const res2 = await fetch(`${API_BASE_URL}/api/v1/institution/analytics/${institutionId}/departments`, { headers: { ...authHeaders() } });
                if (res2.ok) setDepartments(await res2.json());

                const res3 = await fetch(`${API_BASE_URL}/api/v1/institution/analytics/${institutionId}/score-distribution`, { headers: { ...authHeaders() } });
                if (res3.ok) setScoreDist(await res3.json());

                const res4 = await fetch(`${API_BASE_URL}/api/v1/institution/analytics/${institutionId}/submission-distribution`, { headers: { ...authHeaders() } });
                if (res4.ok) setSubDist(await res4.json());

            } catch (error) {
                try { console.error("Failed to fetch analytics:", error instanceof Error ? error.message : String(error)); } catch (_) {}
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [institutionId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const kpiCards = [
        { label: 'Total Events', value: summary?.total_events || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Participants', value: summary?.total_participants || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Teams', value: summary?.total_teams || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Average Score', value: `${summary?.average_score || 0}%`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Institutional Data...</p>
            </div>
        );
    }

    const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
        <div className="h-64 flex flex-col items-center justify-center text-center p-10 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <Icon size={32} className="text-slate-300 mb-4" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{message}</p>
        </div>
    );

    return (
        <div className="space-y-6 sm:space-y-8 pb-12 font-sans px-3 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-[#0f172a] tracking-tight">Reports & Analytics</h1>
                    <p className="text-gray-500 mt-1 font-medium">Real-time performance metrics and institutional insights.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative" ref={filterRef}>
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-3 px-6 py-3 border rounded-xl font-bold text-sm transition-all ${isFilterOpen ? 'bg-purple-50 border-[#6C3BFF] text-[#6C3BFF]' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            <ListFilter size={18} />
                            {activeFilter}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] border border-slate-100 shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Filter</p>
                                    </div>
                                    <div className="p-2">
                                        {['All Departments', 'Computer Science', 'Business Admin', 'Design & Arts'].map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    setActiveFilter(opt);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-3 ${activeFilter === opt ? 'bg-purple-50 text-[#6C3BFF]' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                {opt === 'All Departments' ? <Building2 size={16} /> : <Briefcase size={16} />}
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button 
                        type="button"
                        onClick={async () => {
                            try {
                                const r = await fetch(`${API_BASE_URL}/api/v1/institution/export-summary/${institutionId}`, { headers: { ...authHeaders() } });
                                if (!r.ok) return;
                                const blob = await r.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `institution-summary-${institutionId}.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-all shadow-lg"
                    >
                        <Download size={18} />
                        Export executive summary
                    </button>
                </div>
            </div>

            {/* Date Range Picker */}
            <div className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <Calendar size={20} />
                </div>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest text-[10px]">Timeframe:</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-4 py-2 border border-gray-100 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-50 focus:border-purple-600 focus:outline-none transition-all" />
                <span className="text-gray-400 font-bold text-xs">TO</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-4 py-2 border border-gray-100 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-50 focus:border-purple-600 focus:outline-none transition-all" />
                <button className="px-6 py-2 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 sm:ml-auto w-full sm:w-auto">Sync View</button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {kpiCards.map((card, idx) => (
                    <motion.div 
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/20 group transition-all"
                    >
                        <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <card.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{card.label}</p>
                        <h3 className="text-4xl font-black text-[#0f172a] mt-1 tracking-tight text-2xl sm:text-4xl">{card.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {/* Participation Trends */}
                <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-200/20">
                    <h3 className="text-xl font-black text-[#0f172a] mb-8 tracking-tight">Participation Trends</h3>
                    {timeline.length > 0 ? (
                        <div className="h-64 flex items-end justify-between gap-4">
                            {timeline.slice(-7).map((val: any, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                    <div className="w-full relative group">
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max((val.count || 0) * 10, 5)}%` }}
                                            className="w-full bg-gradient-to-t from-purple-600 to-indigo-400 rounded-2xl shadow-lg shadow-purple-100 group-hover:from-purple-500 group-hover:to-indigo-300 transition-all cursor-pointer"
                                        />
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {val.count || 0} Students
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter truncate w-full text-center">
                                        {val.date?.split('-').slice(1).join('/') || `Day ${i+1}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={TrendingUp} message="No participation trends recorded" />
                    )}
                </div>

                {/* Department Distribution */}
                <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-200/20">
                    <h3 className="text-xl font-black text-[#0f172a] mb-8 tracking-tight">Departmental Breakdown</h3>
                    {departments.length > 0 ? (
                        <div className="space-y-6">
                            {departments.map((dept, idx) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between text-xs font-black text-slate-600 uppercase tracking-widest">
                                        <span>{dept.label}</span>
                                        <span className="text-slate-900">{dept.value} Students</span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(dept.value / (summary?.total_participants || 1)) * 100}%` }}
                                            className={`h-full rounded-full shadow-sm ${idx % 2 === 0 ? 'bg-purple-500' : 'bg-blue-500'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={PieChart} message="No departmental data found" />
                    )}
                </div>
            </div>

            {/* Score Distribution & Submission Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {/* Score Distribution Histogram */}
                <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-200/20">
                    <h3 className="text-xl font-black text-[#0f172a] mb-8 tracking-tight">Score Distribution</h3>
                    <div className="h-64 flex items-end justify-between gap-4">
                        {scoreDist.some(b => b.count > 0) ? scoreDist.map((bucket, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div className="w-full relative group">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.min((bucket.count || 0) * 15, 100)}%` }}
                                        className="w-full bg-gradient-to-t from-amber-500 to-orange-300 rounded-2xl shadow-lg shadow-amber-50 cursor-pointer"
                                    />
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {bucket.count} Entries
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{bucket.range}</span>
                            </div>
                        )) : (
                            <div className="w-full"><EmptyState icon={BarChart3} message="Awaiting evaluation results" /></div>
                        )}
                    </div>
                </div>

                {/* Submission Distribution Bar Chart */}
                <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-200/20">
                    <h3 className="text-xl font-black text-[#0f172a] mb-8 tracking-tight">Submissions by Event</h3>
                    {subDist.length > 0 ? (
                        <div className="space-y-5">
                            {subDist.map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-xs font-black text-slate-600 uppercase tracking-widest">
                                        <span className="truncate max-w-[200px]">{item.event}</span>
                                        <span className="text-slate-900">{item.count} Submissions</span>
                                    </div>
                                    <div className="h-5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((item.count / (subDist[0]?.count || 1)) * 100, 100)}%` }}
                                            className={`h-full rounded-full shadow-sm ${idx % 3 === 0 ? 'bg-emerald-500' : idx % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={FileText} message="No submissions recorded yet" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;

