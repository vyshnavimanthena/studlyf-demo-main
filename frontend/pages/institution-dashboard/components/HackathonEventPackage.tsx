import React, { useState, useEffect } from 'react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import {
    Code2, Plus, Search, Users, Layers, X, Edit3, Trash2, AlertCircle, CheckCircle, Lightbulb, Save, Image, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Problem {
    id: string;
    title: string;
    description: string;
    domain: string;
    tech_stack: string;
    ps_code: string | null;
    brief: string;
    max_teams: number;
    status: string;
    created_at: string;
    team_count: number;
    slots_left: number;
    is_full: boolean;
}

interface Selection {
    id: string;
    problem_id: string;
    team_name: string;
    team_lead_name: string;
    team_lead_email: string;
    team_size: number;
    selected_at: string;
    problem_title: string;
    domain: string;
    ps_code: string | null;
}

interface HackathonEventPackageProps {
    institutionId?: string;
    eventId?: string | null;
}

const emptyForm = {
    title: '', domain: '', description: '', tech_stack: '', ps_code: '', brief: '', max_teams: 5
};

export default function HackathonEventPackage({ institutionId, eventId }: HackathonEventPackageProps) {
    const [activeTab, setActiveTab] = useState<'problems' | 'selections' | 'sponsors'>('problems');
    const [problems, setProblems] = useState<Problem[]>([]);
    const [selections, setSelections] = useState<Selection[]>([]);
    const [form, setForm] = useState({ ...emptyForm });
    const [editModal, setEditModal] = useState<Problem | null>(null);
    const [selFilter, setSelFilter] = useState<string | 'all'>('all');
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [sponsors, setSponsors] = useState<{ name: string; logo: string }[]>([]);
    const [savingSponsors, setSavingSponsors] = useState(false);
    const [sponsorsLoaded, setSponsorsLoaded] = useState(false);

    useEffect(() => {
        loadProblems();
        loadSelections();
        loadSponsors();
    }, []);

    const loadSponsors = async () => {
        if (!eventId) return;
        try {
            const r = await fetch(`${API_BASE_URL}/api/v1/institution/events/${eventId}`, { headers: authHeaders() });
            if (r.ok) {
                const ev = await r.json();
                if (Array.isArray(ev.sponsors)) setSponsors(ev.sponsors);
            }
        } catch {}
        setSponsorsLoaded(true);
    };

    const api = (path: string, options?: RequestInit) =>
        fetch(`${API_BASE_URL}/api/v1/institution/hackathon${path}`, {
            headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options?.headers },
            ...options,
        });

    const handleResponse = async (res: Response) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Request failed');
        return data;
    };

    const loadProblems = async () => {
        try {
            const p = await api('/problems').then(handleResponse);
            setProblems(p);
        } catch (err: any) { setError(err.message) }
    };

    const loadSelections = async () => {
        try {
            const s = await api('/selections').then(handleResponse);
            setSelections(s);
        } catch { }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api('/problems', { method: 'POST', body: JSON.stringify(form) }).then(handleResponse);
            setForm({ ...emptyForm });
            await Promise.all([loadProblems(), loadSelections()]);
        } catch (err: any) { setError(err.message) }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal) return;
        try {
            await api(`/problems/${editModal.id}`, { method: 'PUT', body: JSON.stringify(editModal) }).then(handleResponse);
            setEditModal(null);
            await loadProblems();
        } catch (err: any) { setError(err.message) }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this problem statement?')) return;
        try {
            await api(`/problems/${id}`, { method: 'DELETE' }).then(handleResponse);
            await Promise.all([loadProblems(), loadSelections()]);
        } catch (err: any) { setError(err.message) }
    };

    const filteredProblems = problems.filter(p => {
        if (!search) return true;
        const h = (p.title + ' ' + p.description + ' ' + p.brief + ' ' + p.domain + ' ' + p.tech_stack + ' ' + (p.ps_code || '')).toLowerCase();
        return h.includes(search.toLowerCase());
    });

    const filteredSelections = selFilter === 'all'
        ? selections
        : selections.filter(s => s.problem_id === selFilter);

    return (
        <div className="space-y-6">
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    <AlertCircle size={18} />
                    {error}
                    <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X size={16} /></button>
                </div>
            )}

            <div className="flex items-center gap-4 p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl">
                <div className="p-3 rounded-2xl bg-white/15">
                    <Lightbulb size={28} />
                </div>
                <div>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Event Package</p>
                    <h3 className="text-2xl font-black">Problem Statements & Selection</h3>
                    <p className="text-indigo-100 text-sm mt-1">Manage hackathon challenges and track team selections</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('problems')}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'problems'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                >
                    <Layers size={16} />
                    Problems
                </button>
                <button
                    onClick={() => setActiveTab('selections')}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'selections'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                >
                    <Users size={16} />
                    Selections
                </button>
                <button
                    onClick={() => setActiveTab('sponsors')}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'sponsors'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                >
                    <Image size={16} />
                    Sponsors
                </button>
            </div>

            {activeTab === 'problems' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus size={16} className="text-indigo-600" />
                            Add Problem Statement
                        </h4>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input type="text" required placeholder="Title *" value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <input type="text" placeholder="PS Code (e.g. PS-01)" value={form.ps_code}
                                    onChange={e => setForm({ ...form, ps_code: e.target.value })}
                                    className="p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <input type="text" required placeholder="Domain * (e.g. AI, FinTech)" value={form.domain}
                                    onChange={e => setForm({ ...form, domain: e.target.value })}
                                    className="p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input type="text" placeholder="Brief (one-line description)" value={form.brief}
                                    onChange={e => setForm({ ...form, brief: e.target.value })}
                                    className="p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <input type="text" placeholder="Tech Stack" value={form.tech_stack}
                                    onChange={e => setForm({ ...form, tech_stack: e.target.value })}
                                    className="p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="flex items-end gap-4">
                                <label className="text-sm font-bold text-slate-700 w-36">
                                    Max Teams
                                    <input type="number" value={form.max_teams}
                                        onChange={e => setForm({ ...form, max_teams: e.target.value ? parseInt(e.target.value, 10) : undefined })} min={1}
                                        className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </label>
                                <button type="submit"
                                    className="px-6 py-3 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm cursor-pointer text-sm">
                                    <Plus size={16} className="inline mr-1" />
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-base font-bold text-slate-900">Problem Statements</h4>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder="Search..." value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="pl-8 pr-3 py-2 border border-slate-200 rounded-full text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-48" />
                                </div>
                                <span className="text-slate-400 text-xs font-medium">{filteredProblems.length}</span>
                            </div>
                        </div>
                        {filteredProblems.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 font-medium text-sm">
                                <Layers size={36} className="mx-auto mb-2 text-slate-200" />
                                No problem statements yet
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px]">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                                            <th className="p-3 text-left">Code</th>
                                            <th className="p-3 text-left">Title</th>
                                            <th className="p-3 text-left">Domain</th>
                                            <th className="p-3 text-left">Teams</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-right" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProblems.map(p => (
                                            <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="p-3 font-bold text-slate-800 text-sm">{p.ps_code || '-'}</td>
                                                <td className="p-3 font-medium text-slate-800 text-sm">{p.title}</td>
                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                                        {p.domain}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800 text-sm">{p.team_count}/{p.max_teams}</span>
                                                        <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                                                                style={{ width: `${Math.min(100, (p.team_count / p.max_teams) * 100)}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        p.is_full ? 'bg-red-50 text-red-600' :
                                                        p.team_count > 0 ? 'bg-amber-50 text-amber-600' :
                                                        'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                        {p.is_full ? 'Full' : p.team_count > 0 ? 'Filling' : 'Open'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <button onClick={() => setEditModal({ ...p })}
                                                            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                                                            title="Edit">
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button onClick={() => handleDelete(p.id)}
                                                            className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                                                            title="Delete">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'selections' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-bold text-slate-900">Team Selections</h4>
                        <span className="text-slate-400 text-xs font-medium">{filteredSelections.length} selections</span>
                    </div>
                    <div className="mb-4">
                        <select value={selFilter} onChange={e => setSelFilter(e.target.value)}
                            className="p-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none max-w-xs">
                            <option value="all">All Problems</option>
                            {problems.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.ps_code ? p.ps_code + ' - ' : ''}{p.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    {filteredSelections.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-medium text-sm">
                            <Users size={36} className="mx-auto mb-2 text-slate-200" />
                            No team selections yet
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                                        <th className="p-3 text-left">Team</th>
                                        <th className="p-3 text-left">Problem</th>
                                        <th className="p-3 text-left">Domain</th>
                                        <th className="p-3 text-left">Lead</th>
                                        <th className="p-3 text-left">Size</th>
                                        <th className="p-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSelections.map(s => (
                                        <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-3 font-bold text-slate-800 text-sm">{s.team_name}</td>
                                            <td className="p-3 text-slate-700 text-sm">{s.problem_title}</td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                                    {s.domain}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-700 text-sm">{s.team_lead_name || '-'}</td>
                                            <td className="p-3 text-slate-700 text-sm">{s.team_size}</td>
                                            <td className="p-3 text-slate-500 text-xs">
                                                {new Date(s.selected_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'sponsors' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-base font-bold text-slate-900">Sponsor Logos</h4>
                            <p className="text-xs text-slate-400 mt-1">These appear on the Participant Card and poster for this event.</p>
                        </div>
                        <button
                            onClick={() => setSponsors([...sponsors, { name: '', logo: '' }])}
                            className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                            <Plus size={14} /> Add Sponsor
                        </button>
                    </div>
                    <div className="space-y-3">
                        {sponsors.length === 0 && (
                            <div className="text-center py-12 text-slate-400 font-medium text-sm">
                                <Image size={36} className="mx-auto mb-2 text-slate-200" />
                                No sponsors added yet
                            </div>
                        )}
                        {sponsors.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                {s.logo && (
                                    <img src={s.logo} alt={s.name} className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 shrink-0" />
                                )}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        value={s.name}
                                        onChange={(e) => {
                                            const next = [...sponsors];
                                            next[i] = { ...next[i], name: e.target.value };
                                            setSponsors(next);
                                        }}
                                        placeholder="Company name"
                                        className="p-2 rounded-lg border border-slate-200 bg-white text-sm outline-none"
                                    />
                                    <input
                                        value={s.logo}
                                        onChange={(e) => {
                                            const next = [...sponsors];
                                            next[i] = { ...next[i], logo: e.target.value };
                                            setSponsors(next);
                                        }}
                                        placeholder="Logo URL"
                                        className="p-2 rounded-lg border border-slate-200 bg-white text-sm outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => setSponsors(sponsors.filter((_, j) => j !== i))}
                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    {sponsors.length > 0 && sponsorsLoaded && (
                        <button
                            onClick={async () => {
                                setSavingSponsors(true);
                                try {
                                    await fetch(`${API_BASE_URL}/api/v1/institution/events/${eventId}`, {
                                        method: 'PUT',
                                        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ sponsors }),
                                    });
                                } catch (e) {
                                    console.error('Failed to save sponsors', e);
                                } finally {
                                    setSavingSponsors(false);
                                }
                            }}
                            disabled={savingSponsors}
                            className="mt-4 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-60 cursor-pointer"
                        >
                            {savingSponsors ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save Sponsors
                        </button>
                    )}
                </div>
            )}

            <AnimatePresence>
                {editModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
                        onClick={() => setEditModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-bold text-slate-900">Edit Problem</h4>
                                <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdate} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" required placeholder="Title *" value={editModal.title}
                                        onChange={e => setEditModal({ ...editModal, title: e.target.value })}
                                        className="p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input type="text" placeholder="PS Code" value={editModal.ps_code || ''}
                                        onChange={e => setEditModal({ ...editModal, ps_code: e.target.value })}
                                        className="p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <input type="text" required placeholder="Domain *" value={editModal.domain}
                                    onChange={e => setEditModal({ ...editModal, domain: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <input type="text" placeholder="Brief" value={editModal.brief}
                                    onChange={e => setEditModal({ ...editModal, brief: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <input type="text" placeholder="Tech Stack" value={editModal.tech_stack}
                                    onChange={e => setEditModal({ ...editModal, tech_stack: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="text-sm font-bold text-slate-700">
                                        Max Teams
                                        <input type="number" value={editModal.max_teams}
                                            onChange={e => setEditModal({ ...editModal, max_teams: e.target.value ? parseInt(e.target.value, 10) : undefined })} min={1}
                                            className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </label>
                                    <label className="text-sm font-bold text-slate-700">
                                        Status
                                        <select value={editModal.status}
                                            onChange={e => setEditModal({ ...editModal, status: e.target.value })}
                                            className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option value="active">Active</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit"
                                        className="px-6 py-3 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm cursor-pointer text-sm">
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={() => setEditModal(null)}
                                        className="px-6 py-3 rounded-full font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

