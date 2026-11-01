import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckSquare, Square, UserCheck, ExternalLink, RefreshCw,
    Loader2, AlertCircle, ChevronDown, X, Star, CheckCircle2,
    ClipboardList, Users, Download
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import JudgeManager from './JudgeManager';

interface Submission {
    _id: string;
    team_name: string;
    problem_statement: string;
    solution?: string;
    domain: string;
    ppt_link?: string;
    deployed_link?: string;
    team_members?: string;
    submitted_at: string;
    evaluation_status: string;
    assigned_judge_id?: string;
    assigned_judge_name?: string;
    total_score?: number;
    evaluator_feedback?: string;
}

interface Rubric {
    _id: string;
    title: string;
    description?: string;
    max_points: number;
}

interface SubmissionsPanelProps {
    eventId: string;
    opportunityId?: string;
}

const STATUS_STYLES: Record<string, string> = {
    'Pending Evaluation': 'bg-amber-50 text-amber-600 border-amber-100',
    'Assigned': 'bg-blue-50 text-blue-600 border-blue-100',
    'Evaluated': 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const SubmissionsPanel: React.FC<SubmissionsPanelProps> = ({ eventId, opportunityId }) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [rubrics, setRubrics] = useState<Rubric[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string[]>([]);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [selectedJudge, setSelectedJudge] = useState<any>(null);
    const [assigning, setAssigning] = useState(false);

    const [previewAsset, setPreviewAsset] = useState<{ url: string; filename: string } | null>(null);

    // Evaluation modal
    const [evalSub, setEvalSub] = useState<Submission | null>(null);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState('');
    const [submittingEval, setSubmittingEval] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const id = opportunityId || eventId;
            const [subRes, rubricRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/judging/submissions/${id}`, { headers: { ...authHeaders() } }),
                fetch(`${API_BASE_URL}/api/judging/rubrics/${id}`, { headers: { ...authHeaders() } }),
            ]);
            if (subRes.ok) setSubmissions(await subRes.json());
            if (rubricRes.ok) setRubrics(await rubricRes.json());
        } catch { /* non-fatal */ }
        finally { setLoading(false); }
    }, [eventId, opportunityId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const toggleSelect = (id: string) =>
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const toggleSelectAll = () =>
        setSelected(prev => prev.length === submissions.length ? [] : submissions.map(s => s._id));

    const handleBulkAssign = async () => {
        if (!selectedJudge || selected.length === 0) return;
        setAssigning(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/judging/bulk-assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ submission_ids: selected, judge_id: selectedJudge._id }),
            });
            if (res.ok) {
                setBulkModalOpen(false);
                setSelected([]);
                setSelectedJudge(null);
                await fetchAll();
            }
        } catch { /* non-fatal */ }
        finally { setAssigning(false); }
    };

    const openEval = (sub: Submission) => {
        setEvalSub(sub);
        const init: Record<string, number> = {};
        rubrics.forEach(r => { init[r._id] = 0; });
        setScores(init);
        setFeedback('');
    };

    const handleEvalSubmit = async () => {
        if (!evalSub) return;
        setSubmittingEval(true);
        try {
            const scoreList = rubrics.map(r => ({ rubric_id: r._id, score: scores[r._id] || 0 }));
            const total = scoreList.reduce((sum, s) => sum + s.score, 0);
            const res = await fetch(`${API_BASE_URL}/api/judging/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    submission_id: evalSub._id,
                    scores: scoreList,
                    feedback,
                    evaluator_id: 'institution',
                }),
            });
            if (res.ok) {
                setEvalSub(null);
                await fetchAll();
            }
        } catch { /* non-fatal */ }
        finally { setSubmittingEval(false); }
    };

    const totalScore = rubrics.reduce((sum, r) => sum + (scores[r._id] || 0), 0);
    const maxPossible = rubrics.reduce((sum, r) => sum + (r.max_points || 10), 0);

    if (loading) return (
        <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#6C3BFF] animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading submissions...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center gap-4 flex-wrap">
                <div>
                    <h3 className="text-2xl font-black text-slate-900">Project Submissions</h3>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">{submissions.length} submissions received</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <button onClick={fetchAll} className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
                        <RefreshCw size={16} className="text-slate-400" />
                    </button>
                    {selected.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setBulkModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6C3BFF] to-purple-700 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                        >
                            <UserCheck size={14} /> Assign Judge ({selected.length})
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-5">
                                    <button onClick={toggleSelectAll} className="p-1 text-slate-400 hover:text-[#6C3BFF] transition-colors">
                                        {selected.length === submissions.length && submissions.length > 0
                                            ? <CheckSquare size={18} className="text-[#6C3BFF]" />
                                            : <Square size={18} />}
                                    </button>
                                </th>
                                {['Team Name', 'Problem', 'Domain', 'Submitted At', 'Status', 'Assigned Judge', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <ClipboardList size={48} />
                                            <p className="font-black text-[11px] uppercase tracking-[0.3em]">No submissions yet</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : submissions.map((sub, idx) => (
                                <motion.tr
                                    key={sub._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`hover:bg-slate-50/50 transition-colors ${selected.includes(sub._id) ? 'bg-purple-50/40' : ''}`}
                                >
                                    <td className="px-6 py-5">
                                        <button onClick={() => toggleSelect(sub._id)} className="p-1 text-slate-400 hover:text-[#6C3BFF] transition-colors">
                                            {selected.includes(sub._id)
                                                ? <CheckSquare size={18} className="text-[#6C3BFF]" />
                                                : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="font-black text-slate-900 text-sm">{sub.team_name || '—'}</p>
                                            {sub.team_members && (
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                                                    <Users size={10} /> {sub.team_members}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 max-w-[200px]">
                                        <p className="text-sm text-slate-600 font-medium line-clamp-2">{sub.problem_statement || '—'}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-[#6C3BFF]/5 text-[#6C3BFF] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#6C3BFF]/10">
                                            {sub.domain || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-bold text-slate-500">
                                            {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[sub.evaluation_status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            {sub.evaluation_status}
                                        </span>
                                        {sub.total_score != null && (
                                            <p className="text-[10px] font-black text-emerald-600 mt-1">Score: {sub.total_score}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        {sub.assigned_judge_name ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-[#6C3BFF] rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                                                    {sub.assigned_judge_name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{sub.assigned_judge_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-xs italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {sub.ppt_link ? (
                                                sub.ppt_link.startsWith('data:') ? (
                                                    <button
                                                        onClick={() => {
                                                            const mime = sub.ppt_link.split(';')[0].split(':')[1] || '';
                                                            const ext = mime.includes('pdf') ? '.pdf' : mime.includes('presentation') ? '.pptx' : '.file';
                                                            setPreviewAsset({ url: sub.ppt_link, filename: 'PPT' + ext });
                                                        }}
                                                        className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                                                        title="View PPT"
                                                    >
                                                        <ExternalLink size={14} className="text-slate-500" />
                                                    </button>
                                                ) : (
                                                    <a href={sub.ppt_link.startsWith('http') ? sub.ppt_link : `${API_BASE_URL}${sub.ppt_link}`}
                                                        target="_blank" rel="noreferrer"
                                                        className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-all"
                                                        title="View PPT">
                                                        <ExternalLink size={14} className="text-slate-500" />
                                                    </a>
                                                )
                                            ) : null}
                                            <button
                                                onClick={() => openEval(sub)}
                                                className="px-4 py-2 bg-gradient-to-r from-[#6C3BFF] to-purple-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                                            >
                                                Evaluate
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Assign Modal */}
            <AnimatePresence>
                {bulkModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Assign Judge</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                                        Assigning to {selected.length} submission{selected.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button onClick={() => setBulkModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <X size={18} className="text-slate-500" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a judge</p>
                                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                                    <JudgeManager
                                        onSelect={j => setSelectedJudge(j)}
                                        selectedId={selectedJudge?._id}
                                    />
                                </div>
                                <button
                                    onClick={handleBulkAssign}
                                    disabled={!selectedJudge || assigning}
                                    className="w-full py-4 bg-gradient-to-r from-[#6C3BFF] to-purple-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {assigning ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                                    {assigning ? 'Assigning...' : `Assign to ${selected.length} Submission${selected.length !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Evaluation Modal */}
            <AnimatePresence>
                {evalSub && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/30 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white rounded-t-[2.5rem] z-10">
                                <div>
                                    <p className="text-[10px] font-black text-[#6C3BFF] uppercase tracking-widest mb-1">Evaluating Project</p>
                                    <h3 className="text-xl font-black text-slate-900">{evalSub.team_name || 'Project'}</h3>
                                    <span className="inline-block mt-1 px-3 py-1 bg-[#6C3BFF]/5 text-[#6C3BFF] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#6C3BFF]/10">
                                        {evalSub.domain}
                                    </span>
                                </div>
                                <button onClick={() => setEvalSub(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <X size={18} className="text-slate-500" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Submission Details */}
                                <div className="space-y-4">
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Problem Statement</p>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{evalSub.problem_statement}</p>
                                    </div>
                                    {evalSub.solution && (
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Solution</p>
                                            <p className="text-sm font-medium text-slate-700 leading-relaxed">{evalSub.solution}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-3 flex-wrap">
                                        {evalSub.ppt_link && (
                                            evalSub.ppt_link.startsWith('data:') ? (
                                                <button onClick={() => {
                                                    const mime = evalSub.ppt_link!.split(';')[0].split(':')[1] || '';
                                                    const ext = mime.includes('pdf') ? '.pdf' : mime.includes('presentation') ? '.pptx' : '.file';
                                                    setPreviewAsset({ url: evalSub.ppt_link!, filename: 'PPT' + ext });
                                                }}
                                                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6C3BFF] transition-all cursor-pointer">
                                                    <ExternalLink size={12} /> View PPT
                                                </button>
                                            ) : (
                                                <a href={evalSub.ppt_link.startsWith('http') ? evalSub.ppt_link : `${API_BASE_URL}${evalSub.ppt_link}`}
                                                    target="_blank" rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6C3BFF] transition-all">
                                                    <ExternalLink size={12} /> View PPT
                                                </a>
                                            )
                                        )}
                                        {evalSub.deployed_link && (
                                            <a href={evalSub.deployed_link} target="_blank" rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                                                <ExternalLink size={12} /> Live Demo
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Rubric Scoring */}
                                {rubrics.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Rubric Scoring</p>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-[#6C3BFF]">{totalScore}</span>
                                                <span className="text-slate-400 font-bold text-sm">/{maxPossible}</span>
                                            </div>
                                        </div>

                                        {rubrics.map(r => (
                                            <div key={r._id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm">{r.title}</p>
                                                        {r.description && <p className="text-xs text-slate-400 font-medium mt-0.5">{r.description}</p>}
                                                    </div>
                                                    <span className="text-lg font-black text-[#6C3BFF] min-w-[2rem] text-right">{scores[r._id] || 0}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={r.max_points || 10}
                                                    step={0.5}
                                                    value={scores[r._id] || 0}
                                                    onChange={e => setScores(prev => ({ ...prev, [r._id]: parseFloat(e.target.value) }))}
                                                    className="w-full accent-[#6C3BFF] cursor-pointer"
                                                />
                                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>0</span><span>{r.max_points || 10}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                                        <AlertCircle size={16} className="text-amber-500 shrink-0" />
                                        <p className="text-sm font-bold text-amber-700">No rubrics configured. Please add scoring rubrics in the Scoring Rubrics tab first.</p>
                                    </div>
                                )}

                                {/* Feedback */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Star size={12} className="text-[#6C3BFF]" /> Evaluator Feedback
                                        <span className="text-slate-300 font-medium">(optional)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={feedback}
                                        onChange={e => setFeedback(e.target.value)}
                                        placeholder="Key observations, strengths, and suggestions for improvement..."
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-purple-50 focus:border-[#6C3BFF]/30 transition-all resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleEvalSubmit}
                                    disabled={submittingEval || rubrics.length === 0}
                                    className="w-full py-5 bg-gradient-to-r from-[#6C3BFF] to-purple-700 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:shadow-2xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {submittingEval
                                        ? <><Loader2 size={16} className="animate-spin" /> Saving Evaluation...</>
                                        : <><CheckCircle2 size={16} /> Submit Evaluation — {totalScore} pts</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewAsset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{previewAsset.filename}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Secure Asset Preview</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <a href={previewAsset.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6C3BFF] hover:text-white transition-all">
                                        <ExternalLink size={14} /> Open Original
                                    </a>
                                    <a href={previewAsset.url} download
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl transition-all">
                                        <Download size={14} /> Download
                                    </a>
                                    <button onClick={() => setPreviewAsset(null)}
                                        className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-100 p-8 relative">
                                <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl bg-white relative">
                                    {previewAsset.filename.match(/\.(pdf)$/i) ? (
                                        <iframe src={previewAsset.url} className="w-full h-full border-none" title="PDF Preview" />
                                    ) : previewAsset.filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                                        <img src={previewAsset.url} className="w-full h-full object-contain" alt={previewAsset.filename} />
                                    ) : previewAsset.filename.match(/\.(mp4|webm|mov)$/i) ? (
                                        <video src={previewAsset.url} controls className="w-full h-full" />
                                    ) : previewAsset.url.startsWith('data:') ? (
                                        <iframe src={previewAsset.url} className="w-full h-full border-none" title="Preview" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
                                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl">📁</div>
                                            <p className="text-2xl font-black text-slate-900">{previewAsset.filename}</p>
                                            <p className="text-slate-500 mt-2">Preview not available for this file type.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubmissionsPanel;

