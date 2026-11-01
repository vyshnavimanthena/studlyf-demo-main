
import React, { useState, useEffect } from 'react';
import {
    Mic2,
    Search,
    Filter,
    Play,
    CheckCircle2,
    Clock,
    BarChart3,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

const MockInterviews: React.FC = () => {
    const { user } = useAuth();
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInterviews = async () => {
            if (!user?.email) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/hiring`, {
                    headers: { 'X-Admin-Email': user.email }
                });
                if (response.ok) {
                    const data = await response.json();
                    setInterviews(data);
                } else {
                    try { console.error("Interviews fetch failed:", response.status, await response.text()); } catch (_) {}
                }
            } catch (error) {
                try { console.error("Error fetching interviews:", error instanceof Error ? error.message : String(error)); } catch (_) {}
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, [user]);

    const filteredInterviews = interviews.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.matches?.[0]?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">AI Interview Monitor</h1>
                    <p className="text-white/50 mt-1">Review real-time AI-moderated interview sessions and scores.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white w-64 focus:ring-1 focus:ring-purple-500"
                            placeholder="Search sessions..."
                        />
                    </div>
                </div>
            </div>

            {/* Session List */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-xs font-semibold text-white/30 uppercase tracking-widest border-b border-white/10">
                                <th className="px-6 py-4">Candidate</th>
                                <th className="px-6 py-4">Company Context</th>
                                <th className="px-6 py-4 text-center">AI Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-white/20 font-mono text-xs">Accessing Session Logs...</td>
                                </tr>
                            ) : filteredInterviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-white/20">No active interview sessions found.</td>
                                </tr>
                            ) : (
                                filteredInterviews.map((session) => (
                                    <tr key={session.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center text-[#7C3AED]">
                                                    <Mic2 size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{session.name}</div>
                                                    <div className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{session.tier}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white/70">{session.matches?.[0] || 'General Technical'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <div className="text-lg font-bold text-white">{session.score}%</div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${session.status === 'Interviewing' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                    session.status === 'Ready' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                        'bg-white/5 text-white/40 border border-white/10'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all shadow-sm">
                                                    <BarChart3 size={16} />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all shadow-sm">
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Analytics Alert Footer */}
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={24} className="text-blue-400" />
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">System Latency Optimizer</h4>
                    <p className="text-white/50 text-xs">AI Interview agents are currently operating at 98.4% efficiency with a 240ms response floor.</p>
                </div>
                <button className="md:ml-auto px-6 py-2 bg-white text-black rounded-xl text-xs font-bold active:scale-95 transition-all">
                    Agent Settings
                </button>
            </div>
        </div>
    );
};

export default MockInterviews;

