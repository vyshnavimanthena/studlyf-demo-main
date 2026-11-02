
import React from 'react';
import {
    Briefcase,
    Building2,
    ArrowRightLeft,
    Zap,
    Search,
    Filter,
    ArrowUpRight,
    Trophy,
    Target
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

const HiringPipeline: React.FC = () => {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            if (!user?.email) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/hiring`, {
                    headers: { 'X-Admin-Email': user.email }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCandidates(data.pipeline || []);
                    setMetrics(data.metrics || null);
                } else {
                    try { console.error("Hiring pipeline fetch failed:", response.status, await response.text()); } catch (_) {}
                }
            } catch (error) {
                try { console.error("Error fetching hiring pipeline:", error instanceof Error ? error.message : String(error)); } catch (_) {}
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, [user]);

    const pipelineStats = [
        { label: 'Ready for Hiring', value: metrics?.readyForHiring || '...', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Active Interviews', value: metrics?.activeInterviews || '...', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Offers Released', value: metrics?.offersReleased || '...', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Placement Rate', value: metrics?.placementRate || '...', icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/10' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#14102b] tracking-tight">Hiring Pipeline</h1>
                    <p className="text-slate-500 mt-1">Manage partner integrations and candidate placements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#f6f3ff] border border-[#e8e3f5] rounded-xl text-sm font-medium transition-colors text-slate-600">
                        <Building2 size={18} />
                        Partner Companies
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-500/20">
                        <ArrowRightLeft size={18} />
                        Manual Placement
                    </button>
                </div>
            </div>

            {/* Pipeline Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {pipelineStats.map(stat => (
                    <div key={stat.label} className="bg-white shadow-sm border border-[#e8e3f5] rounded-2xl p-6 relative overflow-hidden group hover:bg-[#f6f3ff] transition-all">
                        <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color}`}>
                            <stat.icon size={120} />
                        </div>
                        <div className={`p-2 w-fit rounded-lg mb-4 ${stat.bg} ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div className="text-3xl font-bold text-[#14102b] mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Candidate List */}
            <div className="bg-white shadow-sm border border-[#e8e3f5] rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[#e8e3f5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-[#14102b]">Placement Pool</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input className="bg-white border border-[#e8e3f5] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#14102b] w-64 focus:ring-1 focus:ring-purple-500" placeholder="Search by name or company..." />
                        </div>
                        <button className="p-2 bg-white hover:bg-[#f6f3ff] border border-[#e8e3f5] rounded-xl text-slate-500 transition-all"><Filter size={16} /></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-[#e8e3f5]">
                                <th className="px-6 py-4">Candidate</th>
                                <th className="px-6 py-4 text-center">Trust Score</th>
                                <th className="px-6 py-4 text-center">Tier Authority</th>
                                <th className="px-6 py-4">Best Matches</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8e3f5]">
                            {candidates.map(candidate => (
                                <tr key={candidate.id} className="hover:bg-[#f6f3ff] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-[#e8e3f5] flex items-center justify-center font-bold text-xs text-slate-600">
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <div className="text-sm font-semibold text-[#14102b]">{candidate.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm font-bold text-purple-600">{candidate.score}%</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${candidate.tier === 'Tier 1' ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30' : 'bg-[#f6f3ff] text-slate-600'
                                            }`}>
                                            {candidate.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            {candidate.matches.map((company, i) => (
                                                <div key={i} className="w-7 h-7 rounded-full bg-[#f6f3ff] border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500 overflow-hidden" title={company}>
                                                    <Building2 size={12} />
                                                </div>
                                            ))}
                                            <div className="w-7 h-7 rounded-full bg-[#f6f3ff] border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                +2
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${candidate.status === 'Offer Received' ? 'text-green-500 bg-green-500/10 border border-green-500/20' :
                                            candidate.status === 'Interviewing' ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20' :
                                                candidate.status === 'Invited' ? 'text-purple-500 bg-purple-500/10 border border-purple-500/20' :
                                                    'text-slate-500 bg-white border border-[#e8e3f5]'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-3 py-1 bg-white hover:bg-[#f6f3ff] border border-[#e8e3f5] rounded-lg text-[10px] font-bold text-slate-600 hover:text-[#14102b] transition-all uppercase tracking-widest">
                                            Push Lead
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Partner Ecosystem - premium dark card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white border border-[#e8e3f5] rounded-2xl p-6 flex flex-col justify-between h-56">
                    <div>
                        <h4 className="text-[#14102b] font-bold opacity-30 text-xs uppercase tracking-widest mb-4">Partner Health</h4>
                        <div className="text-3xl font-bold text-[#14102b]">42 Active</div>
                        <p className="text-slate-500 text-xs mt-2">Companies actively recruiting through StudLyf protocol.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-grow bg-white h-1.5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5 }} className="h-full bg-[#7C3AED]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#7C3AED]">85% Capacity</span>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-gradient-to-br from-[#f6f3ff] to-white border border-[#e8e3f5] rounded-2xl p-8 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-[#14102b] mb-2">Automated Matching Engine</h3>
                        <p className="text-slate-500 text-sm max-w-md">Our algorithm predicts candidate-culture fit with 89% accuracy based on behavior logs and technical performance.</p>
                        <button className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-[#7C3AED] text-white rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all">
                            Run Re-matching <ArrowUpRight size={18} />
                        </button>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-32 h-32 relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0 border-2 border-dashed border-[#e8e3f5] rounded-full"
                            />
                            <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                                <Zap className="text-slate-400" size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HiringPipeline;

