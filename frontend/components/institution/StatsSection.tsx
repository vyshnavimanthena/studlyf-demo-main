import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Trophy, ClipboardCheck, Lock } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { useDashboardCache } from '../../contexts/DashboardDataContext';

interface StatsSectionProps {
    institutionId?: string;
    onUpgrade?: () => void;
    onContact?: () => void;
    onNavigate?: (tab: string) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({ institutionId, onUpgrade, onContact, onNavigate }) => {
    const { cache, setCacheData, isLoading, setLoading } = useDashboardCache();
    const stats = cache['institutionStats'];
    const loading = isLoading['institutionStats'] ?? true;

    useEffect(() => {
        const fetchStats = async () => {
            if (!institutionId || stats) {
                if (loading) setLoading('institutionStats', false);
                return;
            }
            try {
                setLoading('institutionStats', true);
                const res = await fetch(
                    `${API_BASE_URL}/api/institution/dashboard/stats?institution_id=${encodeURIComponent(institutionId)}&_t=${Date.now()}`,
                    { headers: { ...authHeaders() }, cache: 'no-store' }
                );
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                setCacheData('institutionStats', data);
            } catch (err) {
                try { console.error("Failed to load dynamic stats:", err instanceof Error ? err.message : String(err)); } catch (_) {}
            } finally {
                setLoading('institutionStats', false);
            }
        };
        fetchStats();
    }, [institutionId, stats, loading, setCacheData, setLoading]);

    if (!institutionId) {
        return (
            <div className="mb-8 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">
                Stats load after your account is linked to an institution.
            </div>
        );
    }

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-50 rounded-2xl animate-pulse" />)}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 font-sans">
            {/* Total Candidates - Primary Blue Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0A2E5C] p-5 rounded-2xl flex flex-col justify-between text-white min-h-[160px] shadow-xl shadow-blue-900/10"
            >
                <div className="flex justify-between items-start">
                    <span className="text-3xl font-black">{stats?.total_participants || 0}</span>
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Users size={20} className="text-blue-300" />
                    </div>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Total Participants</p>
            </motion.div>

            {/* Active J&I */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => onNavigate?.('opportunities')}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer hover:shadow-md hover:border-blue-100 transition-all group"
            >
                <div className="flex justify-between items-start">
                    <span className="text-3xl font-black text-slate-900">{stats?.active_ji || 0}</span>
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                        <Briefcase size={20} className="text-pink-500" />
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2">Active Jobs & Internships</p>
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                        <span>Total</span>
                        <span className="font-bold text-slate-900">{stats?.active_ji || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                        <span>Registrations</span>
                        <span className="font-bold text-slate-900">{stats?.ji_registrations || 0}</span>
                    </div>
                </div>
            </motion.div>

            {/* Active Events */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => onNavigate?.('events')}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer hover:shadow-md hover:border-amber-100 transition-all group"
            >
                <div className="flex justify-between items-start">
                    <span className="text-3xl font-black text-slate-900">{stats?.active_events || 0}</span>
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Trophy size={20} className="text-amber-500" />
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2">Active Events</p>
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                        <span>Total</span>
                        <span className="font-bold text-slate-900">{stats?.active_events || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                        <span>Registrations</span>
                        <span className="font-bold text-slate-900">{stats?.opp_registrations || 0}</span>
                    </div>
                </div>
            </motion.div>

            {/* Cohort Intelligence - Elite High Fidelity Insight Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="xl:col-span-4 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Elite Insight Protocol</span>
                            </div>
                            <div className="h-px w-12 bg-white/10" />
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Cohort Intelligence</h3>
                        <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                            Deep-dive into your institution's talent velocity. Monitor skill entropy, placement readiness, and real-time candidate engagement across all active modules.
                        </p>
                    </div>

                    {!stats?.readiness_score && !stats?.avg_score ? (
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <p className="text-slate-400 text-xs font-semibold italic border-l-2 border-[#6C3BFF] pl-4 py-1.5 max-w-sm leading-relaxed">
                                Cohort insights will automatically aggregate here as soon as your students begin enrolling in courses and taking assessments.
                            </p>
                            <button
                                onClick={() => onNavigate?.('analytics')}
                                className="px-6 py-3.5 bg-white/10 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                            >
                                Explore Analytics
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-6 lg:gap-12">
                            <div className="text-center">
                                <span className="block text-4xl font-black text-white tracking-tighter">
                                    {stats.readiness_score}
                                </span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">Placement Readiness</span>
                            </div>
                            <div className="w-px h-12 bg-white/10 hidden sm:block" />
                            <div className="text-center">
                                <span className="block text-4xl font-black text-blue-400 tracking-tighter">
                                    {stats.avg_score}
                                </span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">Avg Studlyf Score</span>
                            </div>
                            <div className="w-px h-12 bg-white/10 hidden sm:block" />
                            <button
                                onClick={() => onNavigate?.('analytics')}
                                className="px-8 py-4 bg-white text-[#0F172A] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl shadow-white/5 active:scale-95"
                            >
                                Explore Analytics
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default StatsSection;

