import React, { useEffect, useState, useCallback } from 'react';
import { CreditCard, Search, Download, CheckCircle2, AlertCircle, Clock, MoreVertical, TrendingUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

interface Payment {
    id: string;
    user: string;
    amount: string;
    status: string;
    date: string;
}

const PaymentManagement: React.FC = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/payments`, { headers: { 'X-Admin-Email': user?.email || '' } });
            if (!response.ok) return;
            const data = await response.json();
            if (Array.isArray(data)) setPayments(data);
        } catch (error) {
            try { console.error('Failed to fetch payments:', error instanceof Error ? error.message : String(error)); } catch (_) {}
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const filteredPayments = payments.filter(p => 
        p.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Export visible payment data as CSV
    const handleExportData = () => {
        const rows = ['Transaction ID,User,Amount,Date,Status'];
        filteredPayments.forEach(p => {
            rows.push(`${p.id},${p.user},"${p.amount}",${p.date},${p.status}`);
        });
        rows.push('');
        rows.push(`Total Revenue (Completed),$${totalRevenue}`);
        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `studlyf_payments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const totalRevenue = payments.reduce((acc, curr) => {
        if (curr.status === 'Completed') {
            const val = parseInt(curr.amount.replace('$', ''));
            return acc + (isNaN(val) ? 0 : val);
        }
        return acc;
    }, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with Financial Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
                <div>
                    <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase">Payment Ledger</h1>
                    <p className="text-zinc-400 text-sm mt-1">Institutional transaction monitoring and revenue attribution.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">${totalRevenue}</div>
                            <div className="text-[10px] text-emerald-500 uppercase tracking-widest font-black">Gross Revenue</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search transactions by user or txn hash..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                    />
                </div>
                <button onClick={handleExportData} className="whitespace-nowrap bg-zinc-900 border border-white/5 text-zinc-400 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:text-white transition-all shadow-lg active:scale-95">
                    <Download size={18} /> Export Data
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.03]">
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Transaction Trace</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">User Context</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-poppins">
                            <AnimatePresence mode='wait'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-32 text-center bg-zinc-900/10">
                                            <div className="relative w-12 h-12 mx-auto mb-6">
                                                <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                                                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest italic animate-pulse">Syncing Payments...</span>
                                        </td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center text-zinc-500 font-medium italic">
                                            No financial records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((p, idx) => (
                                        <motion.tr 
                                            key={p.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-emerald-500/[0.02] transition-all duration-300 border-l-2 border-transparent hover:border-emerald-500"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-black text-white/90 font-mono tracking-tighter uppercase group-hover:text-emerald-400 transition-colors">
                                                    {p.id}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-white/5">
                                                        {p.user[0]}
                                                    </div>
                                                    <span className="text-sm font-bold text-white tracking-tight">{p.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black text-white bg-zinc-800/50 px-3 py-1 rounded-lg border border-white/5">
                                                    {p.amount}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-zinc-500">
                                                    <Clock size={14} className="opacity-50" />
                                                    <span className="text-xs font-medium tabular-nums">{p.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                                    p.status === 'Completed' 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {p.status === 'Completed' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2.5 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-xl transition-all active:scale-90">
                                                    <MoreVertical size={16} />
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

export default PaymentManagement;

