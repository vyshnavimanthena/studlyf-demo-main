import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, ExternalLink, Save, Gavel, Users, Calendar, FileText, X, Download, CheckCircle2, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';
import FilePreviewPanel from '../components/FilePreviewPanel';
import {
    buildPreviewFilename,
    cacheSubmissionFile,
    fetchSubmissionFileBlob,
    getCachedSubmissionFile,
    getFileTypeBadge,
} from '../utils/submissionFilePreview';

function recommendationLabel(rec: string): string {
    if (rec === 'shortlist') return 'Shortlisted';
    if (rec === 'waitlist') return 'Waitlisted';
    if (rec === 'reject') return 'Rejected';
    return 'Pending Review';
}

function recommendationClass(rec: string): string {
    if (rec === 'shortlist') return 'bg-emerald-100 text-emerald-700';
    if (rec === 'waitlist') return 'bg-amber-100 text-amber-700';
    if (rec === 'reject') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-600';
}

const EvaluationPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [comments, setComments] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewAsset, setPreviewAsset] = useState<{ url: string; filename: string; loading?: boolean; mime?: string } | null>(null);
    const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});

    const maxPoints = useMemo(
        () => (submission?.criteria || []).reduce((a: number, c: any) => a + (c.max_points || 0), 0) || submission?.thresholds?.max_possible || 100,
        [submission],
    );
    const totalScore = useMemo(
        () => Object.values(criteriaScores).reduce((a, b) => a + b, 0),
        [criteriaScores],
    );
    const scorePercent = useMemo(
        () => (maxPoints > 0 ? (totalScore / maxPoints) * 100 : 0),
        [totalScore, maxPoints],
    );
    const autoRecommendation = useMemo(() => {
        const t = submission?.thresholds || {};
        const shortlist = t.shortlist_min ?? 80;
        const waitlist = t.waitlist_min ?? 65;
        const reject = t.reject_below ?? 50;
        if (scorePercent >= shortlist) return 'shortlist';
        if (scorePercent >= waitlist) return 'waitlist';
        if (scorePercent < reject) return 'reject';
        return 'hold';
    }, [scorePercent, submission?.thresholds]);

    const openEvaluationFile = async (fieldId: string, filenameHint?: string, mimeHint?: string) => {
        if (!token) return;
        const cacheKey = `eval:${token}:${fieldId}`;
        const cached = getCachedSubmissionFile(cacheKey);
        if (cached) {
            setPreviewAsset({ url: cached.url, filename: cached.filename, mime: cached.mime });
            return;
        }
        setPreviewAsset({ url: '', filename: filenameHint || fieldId, loading: true });
        const entry = await fetchSubmissionFileBlob(
            `${API_BASE_URL}/api/evaluation/${token}/file/${encodeURIComponent(fieldId)}`,
            { cacheKey, filenameHint: filenameHint || fieldId },
        );
        if (!entry) {
            setPreviewAsset(null);
            alert('Could not open file.');
            return;
        }
        setPreviewAsset({ ...entry, mime: entry.mime || mimeHint });
    };

    useEffect(() => {
        if (!token) {
            setError('The evaluation link is missing or invalid.');
            setLoading(false);
            return;
        }
        fetchSubmission();
    }, [token]);

    const fetchSubmission = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/evaluation/${token}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setSubmission(data);
                const init: Record<string, number> = {};
                (data.criteria || []).forEach((c: any) => {
                    init[c.name] = data.existing_evaluation?.criteria_scores?.[c.name] ?? 0;
                });
                setCriteriaScores(init);
                setComments(data.existing_evaluation?.comments || '');
            } else {
                setError('Invalid or expired evaluation link');
            }
        } catch {
            setError('Failed to load submission');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEvaluation = async () => {
        if (!submission?.criteria?.length) {
            setError('No scoring rubric configured for this event.');
            return;
        }
        if (totalScore <= 0) {
            setError('Please score at least one rubric criterion.');
            return;
        }

        setSaving(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/evaluation/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: totalScore,
                    criteria_scores: criteriaScores,
                    comments,
                }),
            });

            if (res.ok) {
                const result = await res.json();
                setSuccess(`Evaluation submitted — ${result.status || recommendationLabel(autoRecommendation)} (${result.score_percent ?? scorePercent.toFixed(1)}%)`);
                await fetchSubmission();
            } else {
                const err = await res.json().catch(() => ({}));
                setError(err.detail || 'Failed to submit evaluation');
            }
        } catch {
            setError('Network error while submitting');
        } finally {
            setSaving(false);
        }
    };

    const submittedDateLabel = (() => {
        const raw = submission?.submitted_at;
        if (!raw) return '—';
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
    })();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading evaluation...</p>
                </div>
            </div>
        );
    }

    if (error && !submission) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <Gavel size={32} className="mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Evaluation Link Error</h3>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!submission) return null;

    const isDone = !!submission.existing_evaluation;

    return (
        <div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-3 sm:px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Gavel size={32} className="sm:hidden" /><Gavel size={40} className="hidden sm:block" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-4">Project Evaluation</h1>
                    <p className="text-slate-600">Review and score this submission using the admin rubric</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{submission.title}</h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-2"><Users size={16} />{submission.team_name}</span>
                                {submission.judge_name && (
                                    <span className="flex items-center gap-2 text-purple-600 font-bold"><Gavel size={16} />Judge: {submission.judge_name}</span>
                                )}
                                <span className="flex items-center gap-2"><Calendar size={16} />{submittedDateLabel}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {isDone && (
                                <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Evaluated</span>
                            )}
                            {!isDone && totalScore > 0 && (
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${recommendationClass(autoRecommendation)}`}>
                                    {recommendationLabel(autoRecommendation)}
                                </span>
                            )}
                        </div>
                    </div>

                    {submission.data && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900">Submission Files &amp; Links</h3>
                            {Object.entries(submission.data).map(([key, val]: [string, any]) => {
                                if (val && typeof val === 'object' && val._stored_file) {
                                    const badge = getFileTypeBadge(val.filename || key, val.mime || '');
                                    return (
                                        <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-slate-50 rounded-xl">
                                            <FileText size={20} className="text-slate-500 shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{val.filename || key}</p>
                                                <p className="text-sm text-slate-500">{badge} · Uploaded deliverable</p>
                                            </div>
                                            <button type="button" onClick={() => openEvaluationFile(key, val.filename, val.mime)}
                                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                                <Eye size={16} /> Preview {badge}
                                            </button>
                                        </div>
                                    );
                                }
                                if (typeof val === 'string' && val.startsWith('http')) {
                                    return (
                                        <div key={key} className="p-4 bg-blue-50 rounded-xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                                            <a href={val} target="_blank" rel="noreferrer" className="text-purple-600 text-sm font-bold">{val}</a>
                                        </div>
                                    );
                                }
                                if (typeof val === 'string' && val.trim() && !val.startsWith('data:')) {
                                    return (
                                        <div key={key} className="p-4 bg-blue-50 rounded-xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                                            <p className="text-slate-700 whitespace-pre-wrap">{val}</p>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Evaluation</h3>
                    {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
                    {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">{success}</div>}

                    <div className="space-y-6">
                        {submission.criteria?.length > 0 ? submission.criteria.map((criterion: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-700">{criterion.name}</label>
                                    <span className="text-xs font-bold text-slate-400">Max {criterion.max_points}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input type="range" min={0} max={criterion.max_points}
                                        value={criteriaScores[criterion.name] || 0}
                                        onChange={(e) => setCriteriaScores({ ...criteriaScores, [criterion.name]: parseInt(e.target.value) })}
                                        disabled={isDone} className="flex-1 accent-purple-600" />
                                    <input type="number" min={0} max={criterion.max_points}
                                        value={criteriaScores[criterion.name] || 0}
                                        onChange={(e) => setCriteriaScores({
                                            ...criteriaScores,
                                            [criterion.name]: Math.min(criterion.max_points, Math.max(0, parseInt(e.target.value) || 0)),
                                        })}
                                        disabled={isDone} className="w-16 px-3 py-2 text-center border border-slate-300 rounded-lg text-sm font-bold" />
                                </div>
                            </div>
                        )) : (
                            <p className="text-amber-700 text-sm">No rubric configured by admin.</p>
                        )}

                        <div className="p-4 bg-purple-50 rounded-xl flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Overall Score</p>
                                <p className="text-2xl font-black text-purple-700">{totalScore} / {maxPoints} pts</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Percentage</p>
                                <p className="text-2xl font-black text-slate-800">{scorePercent.toFixed(1)}%</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Outcome</p>
                                <p className={`text-sm font-black px-3 py-1 rounded-full inline-block ${recommendationClass(isDone ? (submission.existing_evaluation?.recommendation || autoRecommendation) : autoRecommendation)}`}>
                                    {recommendationLabel(isDone ? (submission.existing_evaluation?.recommendation || autoRecommendation) : autoRecommendation)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Comments</label>
                            <textarea value={comments} onChange={(e) => setComments(e.target.value)} disabled={isDone} rows={4}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-none disabled:bg-slate-50"
                                placeholder="Add evaluation comments..." />
                        </div>

                        {!isDone ? (
                            <button onClick={handleSubmitEvaluation} disabled={saving}
                                className="w-full py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : <><Save size={20} />Submit Evaluation</>}
                            </button>
                        ) : (
                            <div className="w-full py-4 bg-slate-100 text-slate-500 rounded-lg font-bold flex items-center justify-center gap-2 border-2 border-dashed border-slate-200">
                                <CheckCircle2 size={20} className="text-emerald-500" />Already Evaluated
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {previewAsset && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-6xl h-[95vh] sm:h-[90vh] rounded-2xl sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
                            <div className="p-4 sm:p-8 border-b flex items-center justify-between">
                                <h3 className="text-base sm:text-xl font-black truncate mr-2">{previewAsset.filename}</h3>
                                <button onClick={() => setPreviewAsset(null)} className="p-2 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl shrink-0"><X size={20} /></button>
                            </div>
                            <div className="flex-1 p-2 sm:p-8 bg-slate-100">
                                {previewAsset.loading ? (
                                    <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>
                                ) : (
                                    <FilePreviewPanel url={previewAsset.url} filename={previewAsset.filename} mime={previewAsset.mime} />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EvaluationPage;
