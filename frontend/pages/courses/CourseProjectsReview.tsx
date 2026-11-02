import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import {
  Loader2,
  Search,
  Filter,
  ExternalLink,
  Github,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Star,
  BarChart3,
  Users,
  TrendingUp,
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
  tech_stack: string[];
  status: string;
  author_name: string;
  created_at: string;
  evaluation?: { total_score: number; feedback: string } | null;
}

interface Stats {
  total_submissions: number;
  by_status: Record<string, number>;
  score_stats: { average: number; highest: number; lowest: number };
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    submitted: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-600', icon: <Clock size={12} /> },
    under_review: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-600', icon: <RotateCw size={12} /> },
    evaluated: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-600', icon: <CheckCircle size={12} /> },
    needs_revision: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-600', icon: <AlertCircle size={12} /> },
    resubmitted: { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-600', icon: <RotateCw size={12} /> },
  };
  const s = styles[status] || styles.submitted;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${s.bg} ${s.text}`}>
      {s.icon} {status.replace('_', ' ')}
    </span>
  );
}

export default function CourseProjectsReview() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, subsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/course-projects/stats`, { headers: { ...authHeaders() } }),
        fetch(`${API_BASE_URL}/api/courses/all/projects?limit=100`, { headers: { ...authHeaders() } }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (subsRes.ok) {
        const data = await subsRes.json();
        setSubmissions(data.submissions || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.author_name.toLowerCase().includes(q) || s.course_title.toLowerCase().includes(q);
    }
    return true;
  });

  const isReviewer = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'mentor' || user?.role === 'institution';

  if (loading) {
    return (
      <div className="min-h-full bg-[#fbfaff] text-[#14102b] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#fbfaff] text-[#14102b]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="text-purple-600" size={24} />
            Course Projects Review
          </h1>
          <p className="text-sm text-slate-600 mt-1">Evaluate student course project submissions</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-[#e8e3f5] rounded-xl shadow-[0_1px_3px_rgba(20,16,43,0.05)] p-4 text-center">
              <Users className="mx-auto mb-1 text-purple-600" size={20} />
              <p className="text-2xl font-bold text-[#14102b]">{stats.total_submissions}</p>
              <p className="text-xs text-slate-500">Total Submissions</p>
            </div>
            <div className="bg-white border border-[#e8e3f5] rounded-xl shadow-[0_1px_3px_rgba(20,16,43,0.05)] p-4 text-center">
              <Clock className="mx-auto mb-1 text-blue-600" size={20} />
              <p className="text-2xl font-bold text-[#14102b]">{stats.by_status?.submitted || 0}</p>
              <p className="text-xs text-slate-500">Pending Review</p>
            </div>
            <div className="bg-white border border-[#e8e3f5] rounded-xl shadow-[0_1px_3px_rgba(20,16,43,0.05)] p-4 text-center">
              <CheckCircle className="mx-auto mb-1 text-green-600" size={20} />
              <p className="text-2xl font-bold text-[#14102b]">{stats.by_status?.evaluated || 0}</p>
              <p className="text-xs text-slate-500">Evaluated</p>
            </div>
            <div className="bg-white border border-[#e8e3f5] rounded-xl shadow-[0_1px_3px_rgba(20,16,43,0.05)] p-4 text-center">
              <TrendingUp className="mx-auto mb-1 text-yellow-600" size={20} />
              <p className="text-2xl font-bold text-[#14102b]">{stats.score_stats?.average || 0}</p>
              <p className="text-xs text-slate-500">Avg Score</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title, student, or course..." className="w-full bg-white border border-[#e8e3f5] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#14102b] placeholder-slate-400 focus:outline-none focus:border-purple-500" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'submitted', 'under_review', 'evaluated', 'needs_revision'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-[#f0ecfa]'}`}>
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#e8e3f5] rounded-xl shadow-[0_1px_3px_rgba(20,16,43,0.05)] overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-600 text-lg">No submissions found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0ecfa]">
              {filteredSubmissions.map(sub => (
                <div key={sub.id} className="p-4 hover:bg-[#f6f3ff] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-[#14102b] text-sm">{sub.title}</h3>
                        <StatusBadge status={sub.status} />
                      </div>
                      <p className="text-xs text-slate-500 mb-1">
                        {sub.author_name} · {sub.course_title}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-1">{sub.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-400">{timeAgo(sub.created_at)}</span>
                        {(sub.tech_stack || []).slice(0, 3).map(t => (
                          <span key={t} className="px-1.5 py-0.5 text-[10px] rounded bg-white text-slate-500">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {sub.evaluation && (
                        <span className="text-lg font-bold text-purple-600 mr-2">{sub.evaluation.total_score}</span>
                      )}
                      <a href={sub.deployed_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-white hover:bg-[#f0ecfa] rounded-lg transition-colors text-slate-600 hover:text-[#14102b]">
                        <ExternalLink size={14} />
                      </a>
                      {sub.github_link && (
                        <a href={sub.github_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-white hover:bg-[#f0ecfa] rounded-lg transition-colors text-slate-600 hover:text-[#14102b]">
                          <Github size={14} />
                        </a>
                      )}
                      {isReviewer && (
                        <Link to={`/admin/course-projects/${sub.id}/evaluate`} className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-medium transition-colors">
                          <Star size={12} /> {sub.evaluation ? 'Re-evaluate' : 'Evaluate'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
