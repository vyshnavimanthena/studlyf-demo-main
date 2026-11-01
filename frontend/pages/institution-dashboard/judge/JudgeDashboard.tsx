import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Eye, CheckCircle, XCircle, ExternalLink, Github,
    Play, FileText, MessageSquare, TrendingUp, Clock, Trophy,
    Zap, Users, Target, Award, ArrowUpRight, Gavel, Star, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';
import FilePreviewPanel from '../../../components/FilePreviewPanel';
import { fetchSubmissionFileBlob } from '../../../utils/submissionFilePreview';

const JudgeDashboard: React.FC = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [stats, setStats] = useState({ pending: 0, completed: 0, avgScore: 0, activeEvents: 0 });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [eventThresholds, setEventThresholds] = useState<Record<string, any>>({});
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);
    const [inviteBusy, setInviteBusy] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [scoringCriteria, setScoringCriteria] = useState<any[]>([]);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [comments, setComments] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [previewAsset, setPreviewAsset] = useState<{ url: string; filename: string; mime?: string; loading?: boolean } | null>(null);

    const openJudgeSubmissionFile = async (submissionId: string, fieldId: string, filenameHint?: string, mimeHint?: string) => {
        const cacheKey = `judge:${submissionId}:${fieldId}`;
        setPreviewAsset({ url: '', filename: filenameHint || fieldId, loading: true });
        const entry = await fetchSubmissionFileBlob(
            `${API_BASE_URL}/api/v1/institution/judge/submissions/${submissionId}/file/${encodeURIComponent(fieldId)}`,
            { headers: { ...authHeaders() }, cacheKey, filenameHint: filenameHint || fieldId },
        );
        if (!entry) { setPreviewAsset(null); return; }
        setPreviewAsset({ ...entry, mime: entry.mime || mimeHint });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/judge/my-assignments`, {
                headers: { ...authHeaders() }
            });
            if (res.ok) {
                const data = await res.json();
                setAssignments(data);
                const completed = data.filter((a: any) => a.existing_scores).length;
                const pending = data.length - completed;
                let totalScoreSum = 0, scoredCount = 0;
                data.forEach((a: any) => {
                    if (a.existing_scores?.scores) {
                        const vals = Object.values(a.existing_scores.scores) as number[];
                        if (vals.length > 0) {
                            const tot = typeof a.existing_scores.total_score === 'number' ? a.existing_scores.total_score : vals.reduce((s, v) => s + v, 0);
                            totalScoreSum += tot;
                            scoredCount++;
                        }
                    }
                });
                setStats({
                    pending, completed,
                    avgScore: scoredCount > 0 ? Number((totalScoreSum / scoredCount).toFixed(1)) : 0,
                    activeEvents: new Set(data.map((a: any) => a.event_id)).size
                });
                const tmap: Record<string, any> = {};
                data.forEach((a: any) => { if (a.event_id && a.event_thresholds && !tmap[a.event_id]) tmap[a.event_id] = a.event_thresholds; });
                setEventThresholds(tmap);
            }
        } catch { /* silent */ } finally { setLoading(false); }
    };

    const fetchPendingInvites = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/judge/my-invitations`, { headers: { ...authHeaders() } });
            if (res.ok) setPendingInvites(await res.json());
        } catch { /* non-fatal */ }
    };

    useEffect(() => { fetchData(); fetchPendingInvites(); }, []);

    const respondInvitation = async (accept: boolean, invite: any) => {
        setInviteBusy(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/judge/respond-invitation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ accept, event_id: invite.event_id, token: invite.invitation_token }),
            });
            if (res.ok) { fetchPendingInvites(); fetchData(); }
        } catch { /* silent */ } finally { setInviteBusy(false); }
    };

    const handleOpenScoring = async (assignment: any) => {
        setSelectedAssignment(assignment);
        setComments(assignment.existing_scores?.comments || '');
        setScores(assignment.existing_scores?.scores || {});
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/judge/criteria/${assignment.event_id}`, { headers: { ...authHeaders() } });
            if (res.ok) {
                const data = await res.json();
                setScoringCriteria(data);
                if (!assignment.existing_scores) {
                    const initial: Record<string, number> = {};
                    data.forEach((c: any) => { initial[c.name] = 0; });
                    setScores(initial);
                }
            }
        } catch { /* silent */ }
    };

    const handleSaveScore = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/judge/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    submission_id: selectedAssignment._id,
                    event_id: selectedAssignment.event_id,
                    team_id: selectedAssignment.team_id || selectedAssignment.teamId || '',
                    scores, comments
                }),
            });
            if (res.ok) { setSelectedAssignment(null); fetchData(); }
        } catch { /* silent */ } finally { setIsSaving(false); }
    };

    const filteredAssignments = useMemo(() => {
        return assignments.filter(a => {
            const matchesStatus = filterStatus === 'All' ||
                (filterStatus === 'Completed' && a.existing_scores) ||
                (filterStatus === 'Pending' && !a.existing_scores) ||
                (filterStatus === 'Shortlisted' && (a.classification === 'Shortlisted' || a.classification === 'shortlisted')) ||
                (filterStatus === 'Waitlisted' && (a.classification === 'Waitlisted' || a.classification === 'waitlisted')) ||
                (filterStatus === 'Rejected' && (a.classification === 'Rejected' || a.classification === 'rejected'));
            const matchesSearch = !searchQuery ||
                a.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.team_name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [assignments, filterStatus, searchQuery]);

    const shortlistedCount = assignments.filter(a => a.classification?.toLowerCase() === 'shortlisted').length;
    const waitlistedCount = assignments.filter(a => a.classification?.toLowerCase() === 'waitlisted').length;
    const rejectedCount = assignments.filter(a => a.classification?.toLowerCase() === 'rejected').length;

    const statCards = [
        { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-600', iconColor: 'text-amber-400', glow: 'shadow-amber-500/10' },
        { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-emerald-500 to-green-600', iconColor: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
        { label: 'Shortlisted', value: shortlistedCount, icon: Award, color: 'from-blue-500 to-indigo-600', iconColor: 'text-blue-400', glow: 'shadow-blue-500/10' },
        { label: 'Waitlisted', value: waitlistedCount, icon: Clock, color: 'from-yellow-500 to-amber-600', iconColor: 'text-yellow-400', glow: 'shadow-yellow-500/10' },
        { label: 'Rejected', value: rejectedCount, icon: XCircle, color: 'from-red-500 to-rose-600', iconColor: 'text-red-400', glow: 'shadow-red-500/10' },
        { label: 'Avg Score', value: stats.avgScore, icon: TrendingUp, color: 'from-violet-500 to-purple-600', iconColor: 'text-violet-400', glow: 'shadow-violet-500/10' },
        { label: 'Events', value: stats.activeEvents, icon: Trophy, color: 'from-pink-500 to-fuchsia-600', iconColor: 'text-pink-400', glow: 'shadow-pink-500/10' },
    ];

    const classificationStyle = (c?: string, scored?: boolean) => {
        const cls = c?.toLowerCase();
        if (cls === 'shortlisted') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (cls === 'waitlisted') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (cls === 'rejected') return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (scored) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    if (loading && assignments.length === 0) return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Loading assignments</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-full p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Evaluator Dashboard</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Welcome back, <span className="text-white font-semibold">{user?.full_name || user?.name || 'Judge'}</span>
                        {' '}&middot; {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Pending Invitations */}
            {pendingInvites.length > 0 && (
                <div className="space-y-3">
                    {pendingInvites.map((inv) => (
                        <div key={inv._id} className="p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-base font-bold text-white">{inv.event_name || 'Event invitation'}</p>
                                <p className="text-xs text-amber-300/70 mt-0.5">
                                    Invited {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'recently'}
                                    {inv.expertise ? ` · ${inv.expertise}` : ''}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button disabled={inviteBusy} onClick={() => respondInvitation(true, inv)}
                                    className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-colors">
                                    Accept
                                </button>
                                <button disabled={inviteBusy} onClick={() => respondInvitation(false, inv)}
                                    className="px-5 py-2 bg-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/20 disabled:opacity-50 transition-colors">
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {statCards.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className={`p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group ${s.glow} hover:shadow-lg`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                                <s.icon size={16} className="text-white" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-white tracking-tight">{s.value}</div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-col sm:flex-row w-full">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Zap size={18} className="text-violet-400" />
                            Assigned Projects
                        </h2>
                        <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-x-auto w-full sm:w-auto scrollbar-none">
                            {['All', 'Pending', 'Completed', 'Shortlisted', 'Waitlisted', 'Rejected'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilterStatus(t)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                                        filterStatus === t
                                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                            : 'text-slate-500 hover:text-slate-300 border border-transparent'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                        <input
                            type="text"
                            placeholder="Search by project or team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Project Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {filteredAssignments.length > 0 ? filteredAssignments.map((sub, idx) => (
                        <motion.div
                            key={sub._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group"
                        >
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                            <Users size={12} className="text-violet-400" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{sub.team_name || 'Team'}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors truncate">{sub.project_title || 'Untitled Project'}</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {sub.github_link && (
                                            <a href={sub.github_link} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all border border-white/[0.06]">
                                                <Github size={11} />
                                                <span className="text-[10px] font-semibold uppercase">Code</span>
                                            </a>
                                        )}
                                        {sub.demo_link && (
                                            <a href={sub.demo_link} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all border border-white/[0.06]">
                                                <Play size={11} />
                                                <span className="text-[10px] font-semibold uppercase">Demo</span>
                                            </a>
                                        )}
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${classificationStyle(sub.classification, !!sub.existing_scores)}`}>
                                            {sub.classification || (sub.existing_scores ? 'Evaluated' : 'Pending Review')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                                    {sub.existing_scores ? (
                                        <div className="text-left sm:text-right">
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Score</p>
                                            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                                                {(typeof sub.existing_scores.total_score === 'number'
                                                    ? sub.existing_scores.total_score
                                                    : (Object.values(sub.existing_scores.scores || {}) as number[]).reduce((a, b) => a + b, 0)
                                                ).toFixed(1)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="hidden sm:flex w-10 h-10 bg-white/[0.04] border border-white/[0.06] rounded-xl items-center justify-center text-slate-600">
                                            <TrendingUp size={18} />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleOpenScoring(sub)}
                                        className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                                            sub.existing_scores
                                                ? 'bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:bg-white/[0.1] hover:text-white'
                                                : 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20 border border-violet-500/30'
                                        }`}
                                    >
                                        {sub.existing_scores ? 'Edit' : 'Evaluate'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-24 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
                                <Target size={32} className="text-slate-700" />
                            </div>
                            <p className="text-base font-bold text-slate-500">No projects found</p>
                            <p className="text-sm text-slate-600 mt-1">
                                {searchQuery ? 'Try adjusting your search or filters' : 'No assignments have been assigned to you yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Scoring Modal */}
            <AnimatePresence>
                {selectedAssignment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0c0a2a] border border-white/[0.08] rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-4 sm:my-8"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                {/* Left: Project Info */}
                                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedAssignment.project_title}</h2>
                                            <p className="text-sm text-slate-400 font-medium">{selectedAssignment.team_name}</p>
                                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase border ${classificationStyle(selectedAssignment.classification, !!selectedAssignment.existing_scores)}`}>
                                                {selectedAssignment.classification || (selectedAssignment.existing_scores ? 'Evaluated' : 'Pending Review')}
                                            </span>
                                        </div>
                                        <button onClick={() => setSelectedAssignment(null)}
                                            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Abstract</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            {selectedAssignment.description || "No abstract provided."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resources</p>
                                            {selectedAssignment.github_link && (
                                                <a href={selectedAssignment.github_link} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-violet-400 transition-colors">
                                                    <Github size={14} /> Repository
                                                </a>
                                            )}
                                            {selectedAssignment.demo_link && (
                                                <a href={selectedAssignment.demo_link} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-violet-400 transition-colors">
                                                    <Play size={14} /> Live Demo
                                                </a>
                                            )}
                                        </div>
                                        {/* Submitted Data */}
                                        {(() => {
                                            const subData = selectedAssignment.data || {};
                                            const textFields = Object.entries(subData).filter(([k, v]) =>
                                                typeof v === 'string' && !v.startsWith('data:') && !v.startsWith('http') && !k.startsWith('_')
                                            );
                                            if (textFields.length === 0) return null;
                                            return (
                                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitted Data</p>
                                                    <div className="space-y-1 max-h-36 overflow-y-auto">
                                                        {textFields.map(([key, val]) => (
                                                            <div key={key} className="text-xs">
                                                                <span className="font-bold text-slate-500 uppercase text-[9px]">{key.replace(/_/g, ' ')}: </span>
                                                                <span className="text-slate-300">{String(val)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        {/* Deliverable Files */}
                                        {(() => {
                                            const subData = selectedAssignment.data || {};
                                            const fileEntries = Object.entries(subData).filter(([_, v]) =>
                                                (typeof v === 'object' && v && (v as any)._stored_file) ||
                                                (typeof v === 'string' && (v.startsWith('data:') || v.startsWith('http')))
                                            );
                                            if (fileEntries.length === 0) return null;
                                            return (
                                                <div className="col-span-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deliverable Files</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {fileEntries.map(([key, value]) => {
                                                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                                                            if (typeof value === 'object' && value && (value as any)._stored_file) {
                                                                const f = value as any;
                                                                return (
                                                                    <button key={key} type="button"
                                                                        onClick={() => openJudgeSubmissionFile(String(selectedAssignment._id), key, f.filename, f.mime)}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-semibold hover:bg-violet-500/20 transition-colors border border-violet-500/20">
                                                                        <FileText size={12} /> {f.filename || label}
                                                                    </button>
                                                                );
                                                            }
                                                            if (typeof value === 'string' && value.startsWith('http')) {
                                                                return (
                                                                    <a key={key} href={value} target="_blank" rel="noreferrer"
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-semibold hover:bg-violet-500/20 transition-colors border border-violet-500/20">
                                                                        <ExternalLink size={12} /> {label}
                                                                    </a>
                                                                );
                                                            }
                                                            if (typeof value === 'string' && value.startsWith('data:')) {
                                                                return (
                                                                    <button key={key} onClick={() => window.open(value, '_blank')}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-semibold hover:bg-violet-500/20 transition-colors border border-violet-500/20">
                                                                        <FileText size={12} /> {label}
                                                                    </button>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Score Ring */}
                                    {(() => {
                                        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
                                        const maxPossiblePoints = (scoringCriteria || []).reduce((acc: number, c: any) => acc + (c.max_points || 10), 0) || (scoringCriteria.length * 10) || 100;
                                        const scorePct = maxPossiblePoints > 0 ? Math.min(1, Math.max(0, totalScore / maxPossiblePoints)) : 0;
                                        return (
                                            <div className="pt-6 border-t border-white/[0.06] flex items-center gap-6">
                                                <div className="w-16 h-16 relative shrink-0">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/[0.05]" />
                                                        <circle
                                                            cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" fill="transparent"
                                                            strokeDasharray={175.9}
                                                            strokeDashoffset={175.9 - (175.9 * scorePct)}
                                                            className="text-violet-500 transition-all duration-500"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-violet-400">
                                                        {totalScore.toFixed(1)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Score</p>
                                                    <p className="text-2xl font-extrabold text-white tracking-tight">
                                                        {totalScore.toFixed(1)}
                                                        <span className="text-sm text-slate-500 ml-1">/ {maxPossiblePoints}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Right: Scoring */}
                                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-white/[0.01]">
                                    <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                                        <Gavel size={18} className="text-violet-400" />
                                        Evaluation Criteria
                                    </h2>

                                    <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                                        {scoringCriteria.length === 0 && (
                                            <p className="text-sm text-slate-500 text-center py-8">No criteria defined for this event yet.</p>
                                        )}
                                        {scoringCriteria.map((criterion, idx) => (
                                            <div key={idx} className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-bold text-white uppercase tracking-wider">{criterion.name}</label>
                                                    <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-[11px] font-bold border border-violet-500/20">
                                                        {scores[criterion.name] || 0} / {criterion.max_points || 10}
                                                    </span>
                                                </div>
                                                <input
                                                    type="range" min="0" max={criterion.max_points || 10} step="0.5"
                                                    value={scores[criterion.name] || 0}
                                                    onChange={(e) => setScores({ ...scores, [criterion.name]: parseFloat(e.target.value) })}
                                                    className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-violet-500"
                                                />
                                                <p className="text-[10px] text-slate-600 font-medium">Weight: {criterion.weight || 1}x</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <MessageSquare size={13} /> Feedback Notes
                                        </h3>
                                        <textarea
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            placeholder="Provide feedback for the team..."
                                            className="w-full h-28 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all placeholder:text-slate-600 resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveScore}
                                        disabled={isSaving}
                                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 border border-violet-500/30"
                                    >
                                        {isSaving ? 'Saving...' : 'Submit Evaluation'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* File Preview Modal */}
            <AnimatePresence>
                {previewAsset && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0c0a2a] border border-white/[0.08] rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
                        >
                            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white">{previewAsset.filename}</h3>
                                <button onClick={() => setPreviewAsset(null)}
                                    className="p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex-1 p-4">
                                {previewAsset.loading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <FilePreviewPanel url={previewAsset.url} filename={previewAsset.filename} mime={previewAsset.mime} />
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JudgeDashboard;
