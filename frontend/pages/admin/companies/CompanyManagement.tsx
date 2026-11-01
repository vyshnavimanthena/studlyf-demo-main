import React, { useEffect, useState, useCallback } from 'react';
import { Building2, Search, Plus, ExternalLink, MoreVertical, Briefcase, Users, LayoutGrid, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

interface Company {
    id: string;
    name: string;
    sector: string;
    openings: number;
    placed: number;
}

const CompanyManagement: React.FC = () => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newOrg, setNewOrg] = useState({ name: '', sector: '', openings: 0, placed: 0 });

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/companies`, {
                headers: { 'X-Admin-Email': user?.email || '' }
            });
            if (!response.ok) return;
            const data = await response.json();
            if (Array.isArray(data)) setCompanies(data);
        } catch (error) {
            try { console.error('Failed to fetch companies:', error instanceof Error ? error.message : String(error)); } catch (_) {}
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleAddCompany = async () => {
        if (!newOrg.name || !newOrg.sector) return alert("All fields are required!");
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/companies`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Admin-Email': user?.email || ''
                },
                body: JSON.stringify(newOrg)
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewOrg({ name: '', sector: '', openings: 0, placed: 0 });
                fetchCompanies();
            }
        } catch (err) { }
    };

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const filteredCompanies = companies.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-sans">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
                <div>
                    <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase italics">Partner Ecosystem</h1>
                    <p className="text-zinc-500 text-sm mt-1">Management of institutional placement partners and corporate alliances.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all uppercase tracking-tighter"
                >
                    <Plus size={20} /> Register Partner
                </button>
            </div>

            {/* Add Company Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] p-5 sm:p-10 overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-3xl -mr-20 -mt-20" />
                            
                            <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-widest italic border-b border-white/5 pb-4">Onboard Corporate Partner</h2>
                            
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2 font-mono">Company Name</label>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                        placeholder="e.g. Anthropic AI"
                                        value={newOrg.name}
                                        onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2 font-mono">Industry Sector</label>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                        placeholder="e.g. LLM Infrastructure"
                                        value={newOrg.sector}
                                        onChange={(e) => setNewOrg({...newOrg, sector: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2 font-mono">Openings</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                            value={newOrg.openings}
                                            onChange={(e) => setNewOrg({...newOrg, openings: parseInt(e.target.value) || 0})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2 font-mono">Placed</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                            value={newOrg.placed}
                                            onChange={(e) => setNewOrg({...newOrg, placed: parseInt(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-grow py-5 bg-white/5 hover:bg-white/10 text-zinc-500 font-black uppercase text-xs rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddCompany}
                                    className="flex-grow py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
                                >
                                    Authorize Partner
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-indigo-500/30 transition-all duration-500">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <Building2 size={28} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white tabular-nums tracking-tighter">{companies.length}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black italic">Active Partners</div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-indigo-500/30 transition-all duration-500">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <Users size={28} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white tabular-nums tracking-tighter">
                            {companies.reduce((acc, curr) => acc + curr.placed, 0)}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black italic">Cumulative Placements</div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-indigo-500/30 transition-all duration-500">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white tabular-nums tracking-tighter">
                            {companies.reduce((acc, curr) => acc + curr.openings, 0)}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black italic">Active Openings</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search partners by name or sector..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-3xl py-4 pl-14 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-all font-bold tracking-tight text-lg"
                    />
                </div>
                <button className="bg-zinc-900 border border-white/5 text-zinc-500 px-8 py-4 rounded-3xl font-black text-sm flex items-center gap-2 hover:text-white transition-all shadow-xl active:scale-90">
                    <Filter size={20} /> Advanced Filter
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.03]">
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Partner Identity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Market Pillar</th>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">Talent Openings</th>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">Placed Human Capital</th>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Alliance Insight</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <div className="w-14 h-14 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6 shadow-2xl shadow-indigo-500/20" />
                                            <span className="text-zinc-600 text-sm font-black uppercase tracking-tighter animate-pulse italic">Synchronizing Ecosystem...</span>
                                        </td>
                                    </tr>
                                ) : filteredCompanies.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-zinc-600 font-black uppercase">
                                            No partner data found in institutional records.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCompanies.map((company, idx) => (
                                        <motion.tr 
                                            key={company.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-indigo-500/[0.03] transition-all duration-300"
                                        >
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-indigo-400 border border-white/5 shadow-lg group-hover:scale-105 transition-all">
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-black text-white group-hover:text-indigo-400 transition-colors tracking-tighter uppercase">
                                                            {company.name}
                                                        </div>
                                                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">Corporate ID: #{company.id.padStart(3, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="px-4 py-1.5 bg-zinc-800/80 border border-white/5 rounded-full text-xs font-black text-zinc-400 uppercase tracking-widest italic">
                                                    {company.sector}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className="text-lg font-black text-white tabular-nums tracking-tighter">{company.openings}</span>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className="text-lg font-black text-white tabular-nums tracking-tighter">{company.placed}</span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button className="p-3 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-2xl transition-all shadow-md active:scale-90">
                                                        <ExternalLink size={20} />
                                                    </button>
                                                    <button className="p-3 text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all shadow-md active:scale-90 font-black">
                                                        <MoreVertical size={20} />
                                                    </button>
                                                </div>
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

export default CompanyManagement;

