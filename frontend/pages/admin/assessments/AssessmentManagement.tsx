
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Zap,
    ShieldAlert,
    BarChart3,
    Edit,
    ExternalLink,
    Timer,
    BrainCircuit,
    Settings2,
    ToggleLeft,
    ToggleRight,
    ArrowUpRight,
    CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

const AssessmentManagement: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiScoring, setAiScoring] = useState(true);
    const [view, setView] = useState<'assessments' | 'submissions' | 'preview' | 'history' | 'templates'>('assessments');
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [certTemplates, setCertTemplates] = useState<any[]>([]);
    const [comments, setComments] = useState<Record<string, string>>({});
    const [newTemplate, setNewTemplate] = useState({ name: '', description: '', html_content: '' });
    const [savingTemplate, setSavingTemplate] = useState(false);

    const fetchSubmissions = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/submissions`, {
                headers: { 'X-Admin-Email': user.email }
            });
            if (res.ok) setSubmissions(await res.json());
        } catch (err) { }
    };

    const fetchHistory = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/evaluations-history`, {
                headers: { 'X-Admin-Email': user.email }
            });
            if (res.ok) setHistory(await res.json());
        } catch (err) { }
    };

    const fetchCertTemplates = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/cert-templates`, {
                headers: { 'X-Admin-Email': user.email }
            });
            if (res.ok) setCertTemplates(await res.json());
        } catch (err) { }
    };

    const saveNewTemplate = async () => {
        if (!user?.email || !newTemplate.name || !newTemplate.html_content) return;
        setSavingTemplate(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/cert-templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Email': user.email },
                body: JSON.stringify(newTemplate)
            });
            if (res.ok) {
                setNewTemplate({ name: '', description: '', html_content: '' });
                fetchCertTemplates();
                alert('Template saved!');
            }
        } catch (err) { } finally { setSavingTemplate(false); }
    };

    const deleteTemplate = async (templateId: string) => {
        if (!user?.email || !window.confirm('Delete this template?')) return;
        try {
            await fetch(`${API_BASE_URL}/api/admin/cert-templates/${templateId}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Email': user.email }
            });
            fetchCertTemplates();
        } catch (err) { }
    };

    const handleManualCertUpload = async (file: File, userId: string, moduleId: string, courseId: string) => {
        if (!user?.email) return;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await fetch(`${API_BASE_URL}/api/admin/upload-certificate`, {
                method: 'POST',
                headers: { 'X-Admin-Email': user.email },
                body: formData
            });

            if (uploadRes.ok) {
                const { url } = await uploadRes.json();
                // Now approve with this URL
                await reviewSubmission(userId, moduleId || 'final', 'approved', 'manual', url);
            } else {
                alert('Upload failed');
            }
        } catch (err) { console.error(err); }
    };

    const reviewSubmission = async (userId: string, moduleId: string, status: string, templateId: string = 'standard', certUrl?: string) => {
        if (!user?.email) return;
        const itemKey = `${userId}-${moduleId}`;
        const adminComment = comments[itemKey] || '';
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/submissions/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Email': user.email
                },
                body: JSON.stringify({
                    user_id: userId,
                    module_id: moduleId,
                    status,
                    template_id: templateId,
                    comment: adminComment,
                    certificate_url: certUrl
                })
            });
            if (res.ok) {
                alert(`Assessment ${status} successfully!`);
                fetchSubmissions();
            }
        } catch (err) { }
    };

    const [selectedTemplatePerId, setSelectedTemplatePerId] = useState<Record<string, string>>({});

    const [adminStats, setAdminStats] = useState<any>(null);

    const fetchAdminStats = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                headers: { 'X-Admin-Email': user.email }
            });
            if (res.ok) setAdminStats(await res.json());
        } catch (err) { }
    };

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!user?.email) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/quizzes`, {
                    headers: { 'X-Admin-Email': user.email }
                });
                if (!response.ok) return;
                const data = await response.json();
                if (!Array.isArray(data)) return;
                const formatted = data.map((q: any) => ({
                    id: q._id,
                    name: q.title || 'Dynamic Assessment',
                    difficulty: q.difficulty || 'Medium',
                    passRate: q.pass_rate || 72,
                    avgTime: q.avg_time || '45m',
                    questionsCount: q.questions?.length || 0,
                    status: q.status || 'Active',
                    cheatingFlags: q.cheating_incidents || 0,
                    rawData: q
                }));
                setAssessments(formatted);
            } catch (error) {
                try { console.error("Error fetching quizzes:", error instanceof Error ? error.message : String(error)); } catch (_) {}
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
        fetchCertTemplates();
        fetchAdminStats();
    }, [user]);

    const kpiMetrics = [
        { label: 'Avg Pass Rate', value: adminStats ? `${adminStats.success_rate || 72}%` : '...', icon: Zap, color: 'text-yellow-500' },
        { label: 'Avg Progress', value: adminStats ? `${adminStats.courseCompletion || 84}%` : '...', icon: Timer, color: 'text-blue-500' },
        { label: 'Cheating Incidence', value: '1.2%', icon: ShieldAlert, color: 'text-red-500' },
        { label: 'AI Evaluation Success', value: '98%', icon: BrainCircuit, color: 'text-purple-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Assessment Control</h1>
                    <p className="text-white/50 mt-1">Configure logic, AI evaluation, and grant certifications.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button onClick={() => { setView('history'); fetchHistory(); }} className={`flex items-center gap-2 px-4 py-2 ${view === 'history' ? 'bg-[#7C3AED] shadow-lg shadow-purple-500/20 text-white' : 'bg-white/5 hover:bg-white/10 text-white/80'} border border-white/10 rounded-xl text-sm font-medium transition-colors`}>
                        <Settings2 size={18} />
                        Evaluation History
                    </button>
                    <button onClick={() => { setView('templates'); fetchCertTemplates(); }} className={`flex items-center gap-2 px-4 py-2 ${view === 'templates' ? 'bg-amber-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white/80'} border border-white/10 rounded-xl text-sm font-medium transition-colors`}>
                        🏅 Cert Templates
                    </button>
                    {view === 'assessments' ? (
                        <button onClick={() => { setView('submissions'); fetchSubmissions(); }} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors text-white">
                            <CheckCircle size={18} />
                            Evaluate Candidates
                        </button>
                    ) : (
                        <button onClick={() => setView('assessments')} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors text-white">
                            Back to Assessments
                        </button>
                    )}
                    <button
                        onClick={() => {
                            alert("Assessments are built directly within your courses! Redirecting to Curriculum Builder...");
                            navigate("/admin/courses");
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-500/20">
                        <Plus size={18} />
                        New Assessment
                    </button>
                </div>
            </div>

            {/* Conditional Views */}
            {view === 'assessments' && (
                <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {kpiMetrics.map(stat => (
                            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                                <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <div className="text-sm text-white/40">{stat.label}</div>
                                    <div className="text-xl font-bold text-white">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Assessments List */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-3 sm:px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <h2 className="text-lg font-bold text-white">Active Assessments</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40">Master AI Eval</span>
                                    <button onClick={() => setAiScoring(!aiScoring)} className="text-[#7C3AED] transition-all">
                                        {aiScoring ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-white/20" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans">
                                <thead>
                                    <tr className="bg-white/[0.02] text-xs font-semibold text-white/30 uppercase tracking-widest border-b border-white/10">
                                        <th className="px-6 py-4">Assessment Name</th>
                                        <th className="px-6 py-4 text-center">Difficulty</th>
                                        <th className="px-6 py-4 text-center">Questions</th>
                                        <th className="px-6 py-4 text-center">Pass Rate</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {assessments.map(test => (
                                        <tr key={test.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{test.name}</div>
                                                    {test.cheatingFlags > 0 && (
                                                        <div className="flex items-center gap-1 text-[10px] text-red-400 mt-1 font-bold">
                                                            <ShieldAlert size={10} /> {test.cheatingFlags} Flags Detected
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${test.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                                                    test.difficulty === 'Medium' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {test.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-white/60 font-mono">{test.questionsCount}</td>
                                            <td className="px-6 py-4 text-center font-bold text-white">{test.passRate}%</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${test.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-white/20'}`} />
                                                    <span className="text-xs text-white/70">{test.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => alert(`Edit Logic config for ${test.name}`)} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all shadow-sm" title="Edit Logic">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => alert(`Analytics Heatmap for ${test.name} - Under Construction`)} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all shadow-sm" title="View Heatmap">
                                                        <BarChart3 size={16} />
                                                    </button>
                                                    <button onClick={() => { setSelectedAssessment(test); setView('preview'); }} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all shadow-sm" title="Preview Mode">
                                                        <ExternalLink size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {view === 'submissions' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-3 sm:p-6 font-sans">
                    <h3 className="text-xl font-bold text-white mb-6">Pending Student Evaluations</h3>
                    <div className="space-y-4">
                        {submissions.length === 0 && <p className="text-white/40">No pending assessments or track completions to review.</p>}
                        {submissions.map((sub, idx) => {
                            const isFinalTrack = sub.final_assessment_passed === true;
                            const itemKey = `${sub.user_id}-${sub.module_id || 'final'}`;
                            return (
                                <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-l-4 border-l-[#7C3AED]">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-sm font-bold text-white">{sub.user_id}</div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${isFinalTrack ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30'}`}>
                                                {isFinalTrack ? '🏆 Final Track Completed' : '📂 Capstone Submissions'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-white/50 mb-4">
                                            Course: <span className="text-white/80">{sub.course_id}</span>
                                            {!isFinalTrack && <> • Module: <span className="text-white/80">{sub.module_id}</span></>}
                                            {isFinalTrack && <> • Final Score: <span className="text-green-400 font-bold">{sub.final_assessment_score}%</span></>}
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            {sub.deployed_link && <a href={sub.deployed_link} target="_blank" className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1"><ExternalLink size={12} /> Live App</a>}
                                            {sub.github_link && <a href={sub.github_link} target="_blank" className="text-xs text-blue-400 hover:underline flex items-center gap-1"><ExternalLink size={12} /> Repository</a>}
                                            {sub.file_url && <a href={`${API_BASE_URL}${sub.file_url}`} target="_blank" className="text-xs text-green-400 hover:underline flex items-center gap-1"><ArrowUpRight size={12} /> Submission File</a>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[280px]">
                                        <textarea
                                            placeholder="Leave professional feedback..."
                                            rows={2}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#7C3AED] resize-none"
                                            value={comments[itemKey] || ''}
                                            onChange={(e) => setComments({ ...comments, [itemKey]: e.target.value })}
                                        />

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="flex-grow bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#7C3AED]"
                                                    value={selectedTemplatePerId[itemKey] || 'standard'}
                                                    onChange={(e) => setSelectedTemplatePerId({ ...selectedTemplatePerId, [itemKey]: e.target.value })}
                                                >
                                                    <optgroup label="System Templates">
                                                        {certTemplates.map((tmpl: any) => (
                                                            <option key={tmpl.template_id} value={tmpl.template_id}>{tmpl.name}</option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                                <button onClick={() => reviewSubmission(sub.user_id, sub.module_id || 'final', 'approved', selectedTemplatePerId[itemKey] || 'standard')} className="px-4 py-2 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase rounded-xl border border-green-500/30 hover:bg-green-500/30 whitespace-nowrap">Auto Issue</button>
                                            </div>

                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id={`manual-cert-${idx}`}
                                                    className="hidden"
                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleManualCertUpload(file, sub.user_id, sub.module_id || 'final', sub.course_id);
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`manual-cert-${idx}`}
                                                    className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-[#7C3AED]/20 text-[#7C3AED] text-[10px] font-bold uppercase rounded-xl border border-[#7C3AED]/30 hover:bg-[#7C3AED]/30 cursor-pointer transition-all"
                                                >
                                                    <ExternalLink size={12} /> Upload Manual Certificate
                                                </label>
                                            </div>

                                            <button onClick={() => reviewSubmission(sub.user_id, sub.module_id || 'final', 'rejected')} className="w-full px-4 py-1.5 text-[10px] font-bold text-red-500/60 hover:text-red-500 uppercase">Need Revision</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {view === 'history' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
                            <div className="text-sm font-bold text-white/50 mb-1">Total Evaluated</div>
                            <div className="text-xl sm:text-3xl font-bold text-white mb-2">{history.length}</div>
                            <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden"><div className="h-full bg-blue-500 w-full" /></div>
                        </div>
                        <div className="bg-white/5 border border-white/10 border-b-4 border-b-green-500 rounded-2xl p-4 sm:p-6">
                            <div className="text-sm font-bold text-white/50 mb-1">Approved & Certified</div>
                            <div className="text-xl sm:text-3xl font-bold text-green-400 mb-2">{history.filter(h => h.review_status === 'approved').length}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 border-b-4 border-b-red-500 rounded-2xl p-4 sm:p-6">
                            <div className="text-sm font-bold text-white/50 mb-1">Rejected / Demanded Revisions</div>
                            <div className="text-xl sm:text-3xl font-bold text-red-400 mb-2">{history.filter(h => h.review_status === 'rejected').length}</div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-3 sm:p-6">
                        <h3 className="text-xl font-bold text-white mb-6">Evaluation Logs</h3>
                        <div className="space-y-4">
                            {history.length === 0 && <p className="text-white/40">No historical evaluations found.</p>}
                            {history.map((log, idx) => (
                                <div key={idx} className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-sm font-bold text-white">Student: {log.user_id}</div>
                                        <div className="text-xs text-white/50">Module / Quiz: {log.module_id}</div>
                                        <div className="text-[10px] text-white/40 italic mt-1">Evaluated on: {new Date(log.review_date).toLocaleDateString()} {new Date(log.review_date).toLocaleTimeString()}</div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex-grow max-w-xl">
                                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Admin Comment Log</div>
                                        <p className="text-sm text-white/80">{log.admin_comment || <span className="text-white/30 italic">No comment provided</span>}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${log.review_status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {log.review_status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* AI Reasoning Preview Section - premium touch */}
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <BrainCircuit size={120} className="text-[#7C3AED]" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        Machine Evaluations
                        <span className="px-2 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded text-xs font-mono uppercase tracking-widest border border-[#7C3AED]/30">v4.2-Neural</span>
                    </h3>
                    <p className="text-white/50 leading-relaxed mb-6">
                        The current scoring engine uses multi-modal analysis to verify student logic. It looks for coding patterns, time-per-node complexity, and behavioral consistency to assign "Trust Scores".
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Cheating Prediction Accuracy</div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 2 }} className="h-full bg-green-500" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Logic Heatmap Resolution</div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} transition={{ duration: 2 }} className="h-full bg-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {view === 'preview' && selectedAssessment && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-6"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-8 border-b border-white/10 pb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedAssessment.name}</h2>
                            <div className="flex gap-4 text-sm text-white/50">
                                <span>Module ID: {selectedAssessment.rawData.module_id}</span>
                                <span>Difficulty: <span className="text-blue-400 font-bold">{selectedAssessment.difficulty}</span></span>
                                <span>Base Pass Mark: {selectedAssessment.rawData.pass_mark || 70}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white mb-4">Questions Preview & Logic Configuration</h3>

                        {selectedAssessment.rawData.questions?.map((q: any, i: number) => (
                            <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-5">
                                <div className="text-sm font-bold text-[#7C3AED] mb-2 uppercase tracking-wide">Question {i + 1}</div>
                                <div className="text-lg text-white mb-4">{q.question}</div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    {q.options?.map((opt: string, optIdx: number) => {
                                        const isCorrect = q.correct_answers?.includes(optIdx);
                                        return (
                                            <div key={optIdx} className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-white/5 border-white/5 text-white/70'} flex items-center gap-3`}>
                                                <div className={`w-4 h-4 rounded-full border flex flex-shrink-0 items-center justify-center ${isCorrect ? 'border-green-500' : 'border-white/20'}`}>
                                                    {isCorrect && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                                </div>
                                                <span className="text-sm">{opt}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="text-xs text-white/30 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="font-bold text-white/50">Explanation Log: </span>
                                    {q.explanation || 'No explanation provided for incorrect selections.'}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
            {view === 'templates' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-6">
                        <h3 className="text-xl font-bold text-white mb-2">🏅 Certificate Templates Library</h3>
                        <p className="text-white/40 text-sm mb-6">Stored templates appear in the evaluation dropdown. Use <code className="text-[#7C3AED]">{'{student_name}'}</code>, <code className="text-[#7C3AED]">{'{course_title}'}</code>, <code className="text-[#7C3AED]">{'{issue_date}'}</code>, <code className="text-[#7C3AED]">{'{certificate_id}'}</code> as placeholders.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                            {certTemplates.map((tmpl: any) => (
                                <div key={tmpl.template_id} className="bg-black/30 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-white">{tmpl.name}</span>
                                        {tmpl.is_builtin
                                            ? <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Built-in</span>
                                            : <button onClick={() => deleteTemplate(tmpl.template_id)} className="text-red-400 hover:text-red-300 text-[10px] font-bold uppercase">Delete</button>
                                        }
                                    </div>
                                    <p className="text-xs text-white/40">{tmpl.description || 'No description'}</p>
                                    <span className="font-mono text-[9px] text-white/20">ID: {tmpl.template_id}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-white/10 pt-6">
                            <h4 className="text-sm font-bold text-white mb-4">Add New Template</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text" placeholder="Template Name"
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#7C3AED] placeholder-white/20"
                                />
                                <input
                                    type="text" placeholder="Description (optional)"
                                    value={newTemplate.description}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#7C3AED] placeholder-white/20"
                                />
                            </div>
                            <textarea
                                placeholder="Paste your full HTML template here... Use {student_name}, {course_title}, {issue_date}, {certificate_id} placeholders."
                                rows={8}
                                value={newTemplate.html_content}
                                onChange={(e) => setNewTemplate({ ...newTemplate, html_content: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:ring-1 focus:ring-[#7C3AED] placeholder-white/20 mb-4 resize-none"
                            />
                            <button
                                onClick={saveNewTemplate}
                                disabled={savingTemplate || !newTemplate.name || !newTemplate.html_content}
                                className="px-8 py-3 bg-[#7C3AED] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#6D28D9] transition-all disabled:opacity-40"
                            >
                                {savingTemplate ? 'Saving...' : '+ Save Template'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AssessmentManagement;

