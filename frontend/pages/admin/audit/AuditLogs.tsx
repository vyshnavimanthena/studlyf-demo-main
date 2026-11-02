import React, { useEffect, useState, useCallback } from 'react';
import { History, Search, Terminal, User, Clock, ShieldAlert, Filter, MoreVertical, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

interface AuditLog {
    id: string;
    action: string;
    user: string;
    timestamp: string;
}

const AuditLogs: React.FC = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/audit-logs`, { headers: { 'X-Admin-Email': user?.email || '' } });
            if (!response.ok) return;
            const data = await response.json();
            if (Array.isArray(data)) setLogs(data);
        } catch (error) {
            try { console.error('Failed to fetch audit logs:', error instanceof Error ? error.message : String(error)); } catch (_) {}
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter(l => 
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.user.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
                <div>
                    <h1 className="text-xl sm:text-3xl font-black text-[#14102b] tracking-tight uppercase">System Audit Logs</h1>
                    <p className="text-slate-600 text-sm mt-1">Immutable trace of institutional administrative actions and system modifications.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <History size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[#14102b] tabular-nums">{logs.length}</div>
                            <div className="text-[10px] text-blue-700 uppercase tracking-widest font-black">Captured Logs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search system actions or user emails..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-[#e8e3f5] rounded-2xl py-3.5 pl-12 pr-4 text-[#14102b] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm tracking-tight"
                    />
                </div>
                <button className="bg-white border border-[#e8e3f5] text-slate-500 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:text-[#14102b] transition-all shadow-sm active:scale-95">
                    <Filter size={18} /> Filter Logs
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white shadow-sm border border-[#e8e3f5] rounded-[2.5rem] overflow-hidden backdrop-blur-sm border-t-2 border-t-blue-500/20">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#e8e3f5] bg-white">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">System Action</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Authentication Level</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Signature</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Audit Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8e3f5]">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                                            <span className="text-slate-500 text-sm font-black uppercase tracking-tighter">Initializing Audit Trace...</span>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                                            No audit trails found matching the current search parameters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log, idx) => (
                                        <motion.tr 
                                            key={log.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-blue-500/[0.03] transition-all duration-300"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6] opacity-60" />
                                                    <span className="text-xs font-black text-slate-500 font-mono tracking-wider tabular-nums">{log.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-bold text-[#14102b] group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                                                    {log.action}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                                                    <span className="text-xs font-semibold text-slate-600">{log.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-slate-500 font-mono">
                                                    <Clock size={13} className="opacity-40" />
                                                    <span className="text-[11px] font-medium tracking-tighter italic">{log.timestamp}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 text-slate-500 hover:text-[#14102b] hover:bg-slate-100 rounded-xl transition-all shadow-md">
                                                    <Database size={15} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;

