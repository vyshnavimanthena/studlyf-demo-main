import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Loader2, UserCheck, Briefcase, AlertCircle } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';

interface Judge {
    _id: string;
    name: string;
    email?: string;
    domain: string;
    institution_id: string;
}

interface JudgeManagerProps {
    /** Optional: if provided, creates a compact selector-only mode */
    onSelect?: (judge: Judge) => void;
    selectedId?: string;
}

const DOMAIN_SUGGESTIONS = ['AI / ML', 'Web Dev', 'Healthcare', 'Fintech', 'Blockchain', 'IoT', 'Cybersecurity', 'AR/VR', 'Data Science', 'Product'];

const JudgeManager: React.FC<JudgeManagerProps> = ({ onSelect, selectedId }) => {
    const [judges, setJudges] = useState<Judge[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', email: '', domain: '' });
    const [adding, setAdding] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchJudges = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/judging/judges`, { headers: { ...authHeaders() } });
            if (res.ok) setJudges(await res.json());
        } catch { /* non-fatal */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchJudges(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.domain.trim()) {
            setError('Name, email, and domain are all required.');
            return;
        }
        setError(null);
        setAdding(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/judging/judges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ name: form.name.trim(), email: form.email.trim().toLowerCase(), domain: form.domain.trim() }),
            });
            if (res.ok) {
                await fetchJudges();
                setForm({ name: '', email: '', domain: '' });
                setShowAdd(false);
            } else {
                const d = await res.json();
                setError(d.detail || 'Failed to add judge.');
            }
        } catch { setError('Network error.'); }
        finally { setAdding(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this judge?')) return;
        await fetch(`${API_BASE_URL}/api/judging/judges/${id}`, {
            method: 'DELETE',
            headers: { ...authHeaders() },
        });
        setJudges(prev => prev.filter(j => j._id !== id));
    };

    // Compact selector mode (used in bulk-assign modal)
    if (onSelect) {
        return (
            <div className="space-y-2">
                {loading ? (
                    <div className="flex items-center gap-2 py-4 text-slate-400">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm font-medium">Loading judges...</span>
                    </div>
                ) : judges.length === 0 ? (
                    <p className="text-sm text-slate-400 font-medium py-4 text-center">
                        No judges added yet. Go to Judge Management to add judges first.
                    </p>
                ) : (
                    judges.map(j => (
                        <button
                            key={j._id}
                            type="button"
                            onClick={() => onSelect(j)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                                selectedId === j._id
                                    ? 'bg-[#6C3BFF]/5 border-[#6C3BFF]/30 ring-2 ring-[#6C3BFF]/20'
                                    : 'bg-white border-slate-100 hover:border-[#6C3BFF]/20 hover:bg-slate-50'
                            }`}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-[#6C3BFF] to-purple-700 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                                {j.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-slate-900 text-sm">{j.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{j.domain}</p>
                            </div>
                            {selectedId === j._id && (
                                <UserCheck size={16} className="text-[#6C3BFF] shrink-0" />
                            )}
                        </button>
                    ))
                )}
            </div>
        );
    }

    // Full management mode (used in Judge Management tab)
    return (
        <div className="space-y-4 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Judge Management</h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        Add subject-matter experts to evaluate project submissions.
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(v => !v)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-[#6C3BFF] transition-all shadow-xl shadow-slate-900/10"
                >
                    <Plus size={14} /> Add Judge
                </button>
            </div>

            {/* Add Judge Form */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form
                            onSubmit={handleAdd}
                            className="p-4 sm:p-8 bg-white border-2 border-[#6C3BFF]/20 rounded-[2.5rem] space-y-6 shadow-xl shadow-purple-900/5"
                        >
                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">New Judge</p>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                                    <AlertCircle size={14} className="text-red-500" />
                                    <p className="text-sm font-bold text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Judge Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Sarah Chen"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-purple-50 focus:border-[#6C3BFF]/30 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="judge@university.com"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-purple-50 focus:border-[#6C3BFF]/30 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Domain / Expertise <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.domain}
                                        onChange={e => setForm(prev => ({ ...prev, domain: e.target.value }))}
                                        list="domain-suggestions"
                                        placeholder="e.g. AI/ML, Fintech, Healthcare"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-purple-50 focus:border-[#6C3BFF]/30 transition-all"
                                    />
                                    <datalist id="domain-suggestions">
                                        {DOMAIN_SUGGESTIONS.map(d => <option key={d} value={d} />)}
                                    </datalist>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setShowAdd(false); setError(null); }}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#6C3BFF] to-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                                >
                                    {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                    Add Judge
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Judge List */}
            {loading ? (
                <div className="py-16 flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#6C3BFF] animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading judges...</p>
                </div>
            ) : judges.length === 0 ? (
                <div className="py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center gap-4">
                    <UserCheck size={36} className="text-slate-300" />
                    <p className="text-slate-900 font-black text-lg">No judges yet</p>
                    <p className="text-slate-400 font-medium text-sm">Click "Add Judge" to add your first evaluator.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {judges.map((j, idx) => (
                        <motion.div
                            key={j._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 sm:p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-lg hover:shadow-slate-900/5 transition-all group relative"
                        >
                            {/* Avatar */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#6C3BFF] to-purple-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/20">
                                    {j.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-base">{j.name}</p>
                                    {j.email && <p className="text-[10px] font-bold text-slate-400 mt-0.5">{j.email}</p>}
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Briefcase size={10} className="text-[#6C3BFF]" />
                                        <span className="text-[10px] font-black text-[#6C3BFF] uppercase tracking-widest">{j.domain}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Judge ID badge */}
                            <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Judge ID</p>
                                <p className="text-[10px] font-mono text-slate-600 truncate">{j._id}</p>
                            </div>

                            {/* Delete */}
                            <button
                                onClick={() => handleDelete(j._id)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                title="Remove judge"
                            >
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JudgeManager;

