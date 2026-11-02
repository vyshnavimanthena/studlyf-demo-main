import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Search, Download, CheckCircle2, AlertCircle, Trash2, XCircle, MoreVertical, Star, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

interface Resume {
    id: string;
    name: string;
    status: string;
    score: number;
}

const ResumeManagement: React.FC = () => {
    const { user } = useAuth();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchResumes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/resumes`, { headers: { 'X-Admin-Email': user?.email || '' } });
            if (!response.ok) return;
            const data = await response.json();
            if (Array.isArray(data)) setResumes(data);
        } catch (error) {
            try { console.error('Failed to fetch resumes:', error instanceof Error ? error.message : String(error)); } catch (_) {}
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);

    const filteredResumes = resumes.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#14102b] tracking-tight uppercase italics">Resume Registry</h1>
                    <p className="text-slate-600 text-sm mt-1">Management and scoring of candidate professional profiles.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                            <FileSearch size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[#14102b] tabular-nums tracking-tighter">{resumes.length}</div>
                            <div className="text-[10px] text-amber-700 uppercase tracking-widest font-black">Submissions</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search resumes by candidate name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-[#e8e3f5] rounded-2xl py-3.5 pl-12 pr-4 text-[#14102b] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-bold tracking-tight"
                    />
                </div>
                <button className="bg-white border border-[#e8e3f5] text-slate-600 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:text-[#14102b] transition-all shadow-sm active:scale-95">
                    <Download size={18} /> Batch Process
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white shadow-sm border border-[#e8e3f5] rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#e8e3f5] bg-white">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidate Profile</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">ATS Score</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Review Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8e3f5]">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-24 text-center">
                                            <div className="w-12 h-12 border-2 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mx-auto mb-6" />
                                            <span className="text-slate-500 text-sm font-bold tracking-widest uppercase animate-pulse italic">Scanning Profiles...</span>
                                        </td>
                                    </tr>
                                ) : filteredResumes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-bold tracking-widest uppercase">
                                            No profile data available.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResumes.map((resume, idx) => (
                                        <motion.tr 
                                            key={resume.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-amber-500/[0.03] transition-all duration-300"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-amber-500 border border-[#e8e3f5] shadow-sm group-hover:scale-105 transition-all">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-[#14102b] group-hover:text-amber-400 transition-colors tracking-tight uppercase font-poppins">
                                                            {resume.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">Internal ID: {resume.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-[0.1em] uppercase border ${
                                                    resume.status === 'Approved' 
                                                        ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                                        : resume.status === 'Reviewing'
                                                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                }`}>
                                                    {resume.status === 'Approved' ? <CheckCircle2 size={12} /> : resume.status === 'Rejected' ? <XCircle size={12} /> : <AlertCircle size={12} />}
                                                    {resume.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="inline-flex items-center gap-2">
                                                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${resume.score}%` }}
                                                            transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                                                            className={`h-full ${resume.score > 80 ? 'bg-green-500' : resume.score > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-[#14102b]">{resume.score}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 text-slate-500 hover:text-[#14102b] hover:bg-slate-100 rounded-xl transition-all shadow-md active:scale-90">
                                                        <FileSearch size={16} />
                                                    </button>
                                                    <button className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all shadow-md active:scale-90">
                                                        <MoreVertical size={16} />
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

export default ResumeManagement;

