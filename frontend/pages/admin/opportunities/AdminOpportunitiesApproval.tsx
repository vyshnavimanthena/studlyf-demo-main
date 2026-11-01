import React, { useState, useEffect } from 'react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import { CheckCircle, XCircle, Trophy, Briefcase, Target, Award, Sparkles, Globe, Zap, ChevronRight, Eye, Clock, Users, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const categories = [
    { key: 'hackathon', label: 'Hackathons', icon: Trophy, color: 'from-purple-500 to-indigo-600', lightColor: 'bg-purple-500/10 text-purple-400', match: (t: string) => /hackathon|coding challenge|challenge/i.test(t) },
    { key: 'job', label: 'Jobs', icon: Briefcase, color: 'from-emerald-500 to-green-600', lightColor: 'bg-emerald-500/10 text-emerald-400', match: (t: string) => /job|role|career|hiring/i.test(t) },
    { key: 'internship', label: 'Internships', icon: Target, color: 'from-blue-500 to-cyan-600', lightColor: 'bg-blue-500/10 text-blue-400', match: (t: string) => /internship|trainee|apprentice/i.test(t) },
    { key: 'competition', label: 'Competitions', icon: Award, color: 'from-orange-500 to-red-600', lightColor: 'bg-orange-500/10 text-orange-400', match: (t: string) => /competition|case competition|ideathon/i.test(t) },
    { key: 'workshop', label: 'Workshops', icon: Sparkles, color: 'from-pink-500 to-rose-600', lightColor: 'bg-pink-500/10 text-pink-400', match: (t: string) => /workshop|bootcamp|masterclass/i.test(t) },
    { key: 'conference', label: 'Conferences', icon: Globe, color: 'from-cyan-500 to-teal-600', lightColor: 'bg-cyan-500/10 text-cyan-400', match: (t: string) => /conference|summit|expo|forum/i.test(t) },
];

const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending_approval: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const AdminOpportunitiesApproval = () => {
    const [allOpps, setAllOpps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/opportunities/admin/all`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                setAllOpps(Array.isArray(data) ? data : []);
            }
        } catch { /* silent */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAction = async (id: string, status: 'active' | 'rejected') => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/opportunities/admin/${id}/status`, {
                method: 'PATCH',
                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setAllOpps(prev => prev.map(o => o._id === id ? { ...o, status } : o));
            }
        } catch { /* silent */ }
    };

    const groupByCategory = (opps: any[]) => {
        const grouped: Record<string, any[]> = {};
        categories.forEach(c => { grouped[c.key] = []; });
        const other: any[] = [];
        opps.forEach(opp => {
            const t = String(opp.type || '').toLowerCase();
            const cat = categories.find(c => c.match(t));
            if (cat) grouped[cat.key].push(opp);
            else other.push(opp);
        });
        return { grouped, other };
    };

    const { grouped, other } = groupByCategory(allOpps);
    const totalPending = allOpps.filter(o => o.status === 'pending_approval').length;

    // Detail view
    if (selectedCategory) {
        const cat = categories.find(c => c.key === selectedCategory);
        const items = grouped[selectedCategory] || [];
        const pendingInCat = items.filter((o: any) => o.status === 'pending_approval').length;

        return (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to All Categories
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {cat && <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}><cat.icon size={20} className="text-white" /></div>}
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{cat?.label || 'Other'}</h1>
                            <p className="text-sm text-slate-400">{items.length} total &middot; {pendingInCat} pending</p>
                        </div>
                    </div>
                    {pendingInCat > 0 && (
                        <span className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-bold border border-amber-500/30">
                            {pendingInCat} need approval
                        </span>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-lg font-bold">No opportunities in this category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                        {items.map((opp: any) => (
                            <motion.div key={opp._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-5 hover:bg-white/[0.06] transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-white truncate">{opp.title}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">{opp.organization || 'Unknown org'}</p>
                                    </div>
                                    <span className={`shrink-0 ml-3 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${statusColors[opp.status] || statusColors.draft}`}>
                                        {opp.status?.replace('_', ' ')}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{opp.description || 'No description'}</p>

                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {opp.location && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-white/[0.04] text-slate-400 border border-white/[0.06]">{opp.location}</span>}
                                    {opp.prize_pool && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{opp.prize_pool}</span>}
                                    {opp.participationType && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">{opp.participationType}</span>}
                                </div>

                                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                                    <span className="text-[10px] text-slate-500">
                                        {opp.deadline ? new Date(opp.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No deadline'}
                                    </span>
                                    {opp.status === 'pending_approval' ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAction(opp._id, 'active')}
                                                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 flex items-center gap-1">
                                                <CheckCircle size={12} /> Approve
                                            </button>
                                            <button onClick={() => handleAction(opp._id, 'rejected')}
                                                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/30 transition-colors border border-red-500/30 flex items-center gap-1">
                                                <XCircle size={12} /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${opp.status === 'active' || opp.status === 'live' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {opp.status === 'active' || opp.status === 'live' ? 'Live' : opp.status}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Category grid view
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white">Opportunities</h1>
                    <p className="text-sm text-slate-400 mt-1">{allOpps.length} total &middot; {totalPending} pending approval</p>
                </div>
                {totalPending > 0 && (
                    <span className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-bold border border-amber-500/30 animate-pulse">
                        {totalPending} pending
                    </span>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-48 bg-white/[0.03] rounded-2xl border border-white/[0.06] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat, idx) => {
                        const items = grouped[cat.key] || [];
                        const pending = items.filter((o: any) => o.status === 'pending_approval').length;
                        const active = items.filter((o: any) => o.status === 'active' || o.status === 'live').length;

                        return (
                            <motion.div key={cat.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                                onClick={() => setSelectedCategory(cat.key)}
                                className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                                        <cat.icon size={22} className="text-white" />
                                    </div>
                                    {pending > 0 && (
                                        <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse">
                                            {pending}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-lg font-extrabold text-white mb-1 group-hover:text-violet-300 transition-colors">{cat.label}</h2>
                                <p className="text-xs text-slate-500">{items.length} total &middot; {active} live</p>
                                <div className="mt-4 flex items-center gap-1 text-xs text-slate-500 group-hover:text-violet-400 transition-colors">
                                    View all <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        );
                    })}

                    {other.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            onClick={() => setSelectedCategory('other')}
                            className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-lg">
                                    <Zap size={22} className="text-white" />
                                </div>
                                {other.filter((o: any) => o.status === 'pending_approval').length > 0 && (
                                    <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30">
                                        {other.filter((o: any) => o.status === 'pending_approval').length}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-lg font-extrabold text-white mb-1 group-hover:text-violet-300 transition-colors">Other</h2>
                            <p className="text-xs text-slate-500">{other.length} total</p>
                            <div className="mt-4 flex items-center gap-1 text-xs text-slate-500 group-hover:text-violet-400 transition-colors">
                                View all <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminOpportunitiesApproval;
