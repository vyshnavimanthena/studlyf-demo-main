
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

interface Insight {
    type: 'risk' | 'opportunity' | 'warning' | 'achievement';
    title: string;
    description: string;
    actionLabel?: string;
}

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

interface Insight {
    type: 'risk' | 'opportunity' | 'warning' | 'achievement';
    title: string;
    description: string;
    actionLabel?: string;
}

const AIInsightsPanel: React.FC = () => {
    const { user } = useAuth();
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            if (!user?.email) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/insights`, {
                    headers: { 'X-Admin-Email': user.email }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setInsights(data);
                    }
                }
            } catch (error) {
                try { console.error("Error fetching insights:", error instanceof Error ? error.message : String(error)); } catch (_) {}
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [user]);

    if (loading) return <div className="p-12 text-center text-white/30 text-xs font-mono animate-pulse">Scanning Neural Network...</div>;

    return (
        <div className="bg-[#1A0B2E]/50 border border-[#7C3AED]/20 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/20 blur-3xl -mr-16 -mt-16 group-hover:bg-[#7C3AED]/30 transition-all" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#C084FC] flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Brain size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight">System Intelligence</h3>
                        <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest mt-0.5">Real-time AI Synthesis</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">Analyzing</span>
                </div>
            </div>

            <div className="space-y-4">
                {insights.map((insight, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#7C3AED]/30 hover:bg-white/[0.08] transition-all"
                    >
                        <div className="flex gap-4">
                            <div className={`flex-shrink-0 mt-1 ${insight.type === 'risk' ? 'text-red-400' :
                                insight.type === 'opportunity' ? 'text-green-400' :
                                    insight.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                                }`}>
                                {insight.type === 'risk' ? <AlertTriangle size={18} /> :
                                    insight.type === 'opportunity' ? <Zap size={18} /> :
                                        insight.type === 'warning' ? <AlertTriangle size={18} /> : <TrendingUp size={18} />}
                            </div>
                            <div className="flex-grow">
                                <div className="text-sm font-bold text-white mb-1">{insight.title}</div>
                                <p className="text-xs text-white/50 leading-relaxed mb-3">{insight.description}</p>
                                {insight.actionLabel && (
                                    <button className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest hover:text-[#9F67FF] transition-colors flex items-center gap-1 group/btn">
                                        {insight.actionLabel}
                                        <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1 }}>→</motion.span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <button className="w-full mt-6 py-2 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 border border-[#7C3AED]/20 text-[#7C3AED] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                <Sparkles size={14} /> Full System Audit
            </button>
        </div>
    );
};

export default AIInsightsPanel;

