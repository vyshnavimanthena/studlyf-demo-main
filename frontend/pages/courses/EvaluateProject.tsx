import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import {
  ArrowLeft,
  Loader2,
  Save,
  ExternalLink,
  Github,
  Star,
  AlertCircle,
} from 'lucide-react';

interface Submission {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  title: string;
  description: string;
  deployed_link: string;
  github_link?: string;
  video_url?: string;
  tech_stack: string[];
  status: string;
  author_name: string;
  created_at: string;
}

interface RubricCriterion {
  name: string;
  max_score: number;
  description: string;
}

interface Evaluation {
  id: string;
  scores: Record<string, number>;
  total_score: number;
  feedback: string;
  strengths?: string;
  improvements?: string;
  status: string;
}

export default function EvaluateProject() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [rubric, setRubric] = useState<RubricCriterion[]>([]);
  const [existingEval, setExistingEval] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [evalStatus, setEvalStatus] = useState('evaluated');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (submissionId) loadData();
  }, [submissionId]);

  const loadData = async () => {
    try {
      const [subRes, evalRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/projects/${submissionId}`, { headers: { ...authHeaders() } }),
        fetch(`${API_BASE_URL}/api/projects/${submissionId}/evaluate`, { headers: { ...authHeaders() } }).catch(() => null),
      ]);

      if (subRes.ok) {
        const data = await subRes.json();
        setSubmission(data.submission);
        if (data.submission?.course_id) {
          const rubricRes = await fetch(`${API_BASE_URL}/api/courses/${data.submission.course_id}/rubrics`);
          if (rubricRes.ok) {
            const rData = await rubricRes.json();
            const criteria = rData.rubric?.criteria || [];
            setRubric(criteria);
            const initialScores: Record<string, number> = {};
            criteria.forEach((c: RubricCriterion) => { initialScores[c.name] = 0; });
            setScores(initialScores);
          }
        }
      }

      if (evalRes && evalRes.ok) {
        const data = await evalRes.json();
        if (data.evaluation) {
          setExistingEval(data.evaluation);
          setScores(data.evaluation.scores || {});
          setFeedback(data.evaluation.feedback || '');
          setStrengths(data.evaluation.strengths || '');
          setImprovements(data.evaluation.improvements || '');
          setEvalStatus(data.evaluation.status || 'evaluated');
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const maxScore = rubric.reduce((sum, r) => sum + r.max_score, 0);

  const handleScoreChange = (name: string, value: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, value));
    setScores(prev => ({ ...prev, [name]: clamped }));
  };

  const handleSave = async () => {
    if (!submissionId || !feedback.trim() || saving) return;
    setSaving(true);
    try {
      const body = { scores, total_score: totalScore, feedback: feedback.trim(), strengths: strengths.trim() || undefined, improvements: improvements.trim() || undefined, status: evalStatus };
      const method = existingEval ? 'PUT' : 'POST';
      const res = await fetch(`${API_BASE_URL}/api/projects/${submissionId}/evaluate`, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (!existingEval) loadData();
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#0a0a1a] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-full bg-[#0a0a1a] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Submission not found</p>
        <button onClick={() => navigate('/admin/course-projects')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
          Back to Review
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0a0a1a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin/course-projects')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Evaluate Project</h1>
            <p className="text-sm text-gray-400 mt-1">by {submission.author_name} · {submission.course_title}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Submission Details */}
          <div className="lg:w-2/5">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-3">{submission.title}</h2>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">{submission.description}</p>
              {submission.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {submission.tech_stack.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">{t}</span>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <a href={submission.deployed_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors">
                  <ExternalLink size={14} /> Live Demo
                </a>
                {submission.github_link && (
                  <a href={submission.github_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors">
                    <Github size={14} /> GitHub Repository
                  </a>
                )}
                {submission.video_url && (
                  <a href={submission.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors">
                    📹 Demo Video
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Evaluation Form */}
          <div className="lg:w-3/5 space-y-5">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Star size={16} className="text-yellow-400" /> Rubric Scores
              </h3>
              <div className="space-y-4">
                {rubric.map(r => (
                  <div key={r.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-medium text-gray-300">{r.name}</span>
                        <span className="text-xs text-gray-600 ml-2">/ {r.max_score}</span>
                      </div>
                      <span className={`text-lg font-bold ${scores[r.name] >= r.max_score * 0.8 ? 'text-green-400' : scores[r.name] >= r.max_score * 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {scores[r.name] || 0}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={r.max_score}
                      value={scores[r.name] || 0}
                      onChange={(e) => handleScoreChange(r.name, parseInt(e.target.value), r.max_score)}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">{r.description}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                <span className="text-sm text-gray-400">Total Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-purple-400">{totalScore}</span>
                  <span className="text-sm text-gray-500">/ {maxScore}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3">Feedback</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback about the project..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                rows={4}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-green-400 mb-1">Strengths</label>
                  <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="What did they do well?" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-orange-400 mb-1">Areas for Improvement</label>
                  <textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} placeholder="What could be improved?" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none" rows={3} />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">Final Status</label>
              <div className="flex gap-3">
                {[{ v: 'evaluated', l: 'Approved' }, { v: 'needs_revision', l: 'Needs Revision' }].map(opt => (
                  <button key={opt.v} onClick={() => setEvalStatus(opt.v)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    evalStatus === opt.v
                      ? opt.v === 'evaluated'
                        ? 'bg-green-500/20 border-green-500/50 text-green-300'
                        : 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {saved && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2 text-sm text-green-400 text-center">
                Evaluation saved successfully!
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving || !feedback.trim()} className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : existingEval ? 'Update Evaluation' : 'Submit Evaluation'}
              </button>
              <button onClick={() => navigate('/admin/course-projects')} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium text-gray-400 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
