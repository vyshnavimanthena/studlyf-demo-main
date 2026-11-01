import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  Github,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Star,
  MessageCircle,
} from 'lucide-react';

interface Submission {
  id: string;
  title: string;
  description: string;
  deployed_link: string;
  github_link?: string;
  video_url?: string;
  tech_stack: string[];
  status: string;
  created_at: string;
  updated_at: string;
  evaluation?: {
    id: string;
    scores: Record<string, number>;
    total_score: number;
    feedback: string;
    strengths?: string;
    improvements?: string;
    evaluator_name: string;
    evaluated_at: string;
  } | null;
}

interface RubricCriterion {
  name: string;
  max_score: number;
  description: string;
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    submitted: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', icon: <Clock size={12} /> },
    under_review: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', icon: <RotateCw size={12} /> },
    evaluated: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', icon: <CheckCircle size={12} /> },
    needs_revision: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', icon: <AlertCircle size={12} /> },
    resubmitted: { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400', icon: <RotateCw size={12} /> },
  };
  const s = styles[status] || styles.submitted;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${s.bg} ${s.text}`}>
      {s.icon} {status.replace('_', ' ')}
    </span>
  );
}

export default function MyCourseProjects() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [rubric, setRubric] = useState<RubricCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const [subsRes, rubricRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/courses/${courseId}/my-projects`, { headers: { ...authHeaders() } }),
        fetch(`${API_BASE_URL}/api/courses/${courseId}/rubrics`),
      ]);
      if (subsRes.ok) {
        const data = await subsRes.json();
        setSubmissions(data.submissions || []);
      }
      if (rubricRes.ok) {
        const data = await rubricRes.json();
        setRubric(data.rubric?.criteria || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const selected = submissions.find(s => s.id === selectedId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pt-24">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">My Course Projects</h1>
            <p className="text-sm text-gray-400 mt-1">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to={`/courses/${courseId}/submit-project`} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
            Submit New
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-gray-400 text-lg mb-2">No projects submitted yet</p>
            <p className="text-gray-500 text-sm mb-6">Submit your course project to get evaluated by mentors.</p>
            <Link to={`/courses/${courseId}/submit-project`} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
              Submit Your First Project
            </Link>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Submissions List */}
            <div className={`${selectedId ? 'hidden md:block md:w-96' : 'w-full'} space-y-3 flex-shrink-0`}>
              {submissions.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedId(selectedId === sub.id ? null : sub.id)}
                  className={`w-full text-left bg-white/5 border rounded-xl p-4 transition-all hover:border-purple-500/30 ${selectedId === sub.id ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm line-clamp-1">{sub.title}</h3>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{sub.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{timeAgo(sub.created_at)}</span>
                    {sub.evaluation && (
                      <span className="text-sm font-bold text-purple-400">{sub.evaluation.total_score}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Detail View */}
            {selected && (
              <div className="flex-1 min-w-0">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{selected.title}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <StatusBadge status={selected.status} />
                        <span className="text-xs text-gray-500">Submitted {timeAgo(selected.created_at)}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedId(null)} className="md:hidden text-gray-500 hover:text-white">✕</button>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{selected.description}</p>

                  {(selected.tech_stack || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(selected.tech_stack || []).map(t => (
                        <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-6">
                    <a href={selected.deployed_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors">
                      <ExternalLink size={14} /> Live Demo
                    </a>
                    {selected.github_link && (
                      <a href={selected.github_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors">
                        <Github size={14} /> GitHub
                      </a>
                    )}
                    {selected.video_url && (
                      <a href={selected.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors">
                        <Video size={14} /> Video
                      </a>
                    )}
                  </div>

                  {selected.evaluation ? (
                    <div className="bg-white/5 border border-purple-500/20 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <Star size={16} className="text-yellow-400" /> Evaluation Result
                        </h3>
                        <div className="text-2xl font-bold text-purple-400">{selected.evaluation.total_score}</div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {rubric.map(r => (
                          <div key={r.name} className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 w-32 flex-shrink-0">{r.name}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${((selected.evaluation!.scores[r.name] || 0) / r.max_score) * 100}%` }} />
                            </div>
                            <span className="text-sm font-mono text-gray-300 w-12 text-right">{selected.evaluation!.scores[r.name] || 0}/{r.max_score}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/10">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Feedback</p>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.evaluation.feedback}</p>
                        </div>
                        {selected.evaluation.strengths && (
                          <div>
                            <p className="text-xs font-medium text-green-400 mb-1">Strengths</p>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.evaluation.strengths}</p>
                          </div>
                        )}
                        {selected.evaluation.improvements && (
                          <div>
                            <p className="text-xs font-medium text-orange-400 mb-1">Areas for Improvement</p>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.evaluation.improvements}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-600">Evaluated by {selected.evaluation?.evaluator_name || 'Admin'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                      <Clock className="mx-auto mb-2 text-gray-600" size={24} />
                      <p className="text-gray-400 text-sm">Awaiting evaluation</p>
                      <p className="text-gray-600 text-xs mt-1">A mentor or admin will review your project soon.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
