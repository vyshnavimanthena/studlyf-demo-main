import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  Star,
  TrendingUp,
  Eye,
  Archive,
  AlertCircle,
  RefreshCw,
  Database,
  MessageSquare,
  ListTodo,
  UserPlus,
} from 'lucide-react';
import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

// ─── Types ───────────────────────────────────────────────────────
interface SDLProject {
  _id: string;
  owner_name: string;
  title: string;
  project_type: string;
  status: string;
  featured: boolean;
  trending: boolean;
  progress: number;
  team_size: number;
  tags: string[];
  views: number;
  member_count: number;
  task_count: number;
  done_task_count: number;
  created_at: string;
}

interface SDLStats {
  total_projects: number;
  open_projects: number;
  in_progress_projects: number;
  completed_projects: number;
  archived_projects: number;
  active_collaborators: number;
  total_tasks: number;
  completed_tasks: number;
  total_comments: number;
  pending_join_requests: number;
}

// ─── Helpers ─────────────────────────────────────────────────────
const typeLabel = (t: string) => {
  switch (t) {
    case 'system_replica': return 'Replica';
    case 'original_build': return 'Original';
    case 'collaboration_request': return 'Collab';
    default: return t;
  }
};
const statusColor = (s: string) => {
  switch (s) {
    case 'open': return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'in_progress': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'completed': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'archived': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    default: return 'text-white/40 bg-white/5 border-white/10';
  }
};

// ─── Main Component ──────────────────────────────────────────────
const SDLManagement: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SDLStats | null>(null);
  const [projects, setProjects] = useState<SDLProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Admin-Email': user?.email || '',
  };

  useEffect(() => {
    fetchAll();
  }, [user, filterStatus]);

  const fetchAll = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const [statsRes, projRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/sdl/stats`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/sdl/projects${filterStatus ? `?status=${filterStatus}` : ''}`, { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (projRes.ok) setProjects(await projRes.json());
    } catch (err) {
      try { console.error('Failed to fetch SDL admin data:', err instanceof Error ? err.message : String(err)); } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Seed the database with 6 starter SDL projects? This will add new projects.')) return;
    setSeeding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sdl/seed`, { method: 'POST', headers });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        fetchAll();
      } else {
        alert('Seed failed.');
      }
    } catch {
      alert('Network error during seed.');
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleFeatured = async (projectId: string, current: boolean) => {
    setActionLoading(projectId);
    try {
      await fetch(`${API_BASE_URL}/api/admin/sdl/projects/${projectId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ featured: !current }),
      });
      fetchAll();
    } catch { } finally { setActionLoading(null); }
  };

  const handleToggleTrending = async (projectId: string, current: boolean) => {
    setActionLoading(projectId);
    try {
      await fetch(`${API_BASE_URL}/api/admin/sdl/projects/${projectId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ trending: !current }),
      });
      fetchAll();
    } catch { } finally { setActionLoading(null); }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setActionLoading(projectId);
    try {
      await fetch(`${API_BASE_URL}/api/admin/sdl/projects/${projectId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAll();
    } catch { } finally { setActionLoading(null); }
  };

  const handleDelete = async (projectId: string, title: string) => {
    if (!window.confirm(`Delete project "${title}" and ALL related data (tasks, comments, members)? This cannot be undone.`)) return;
    setActionLoading(projectId);
    try {
      await fetch(`${API_BASE_URL}/api/admin/sdl/projects/${projectId}`, {
        method: 'DELETE',
        headers,
      });
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      fetchAll();
    } catch { } finally { setActionLoading(null); }
  };

  // ─── KPI Cards ─────────────────────────────────────────────────
  const kpis = stats
    ? [
      { label: 'Total Projects', value: stats.total_projects, icon: Layers, color: 'text-purple-400' },
      { label: 'Open', value: stats.open_projects, icon: Clock, color: 'text-green-400' },
      { label: 'In Progress', value: stats.in_progress_projects, icon: RefreshCw, color: 'text-amber-400' },
      { label: 'Completed', value: stats.completed_projects, icon: CheckCircle2, color: 'text-blue-400' },
      { label: 'Collaborators', value: stats.active_collaborators, icon: Users, color: 'text-pink-400' },
      { label: 'Tasks', value: `${stats.completed_tasks}/${stats.total_tasks}`, icon: ListTodo, color: 'text-teal-400' },
      { label: 'Comments', value: stats.total_comments, icon: MessageSquare, color: 'text-orange-400' },
      { label: 'Pending Joins', value: stats.pending_join_requests, icon: UserPlus, color: 'text-red-400' },
    ]
    : [];

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Layers size={28} className="text-purple-400" />
            Build A <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B]">Project</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">Manage projects, teams, and collaboration across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Database size={14} />
            {seeding ? 'Seeding...' : 'Seed Projects'}
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition-all"
            >
              <kpi.icon size={18} className={`${kpi.color} mb-2`} />
              <div className="text-xl font-bold text-white">{kpi.value}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-0.5">{kpi.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Filter Row ── */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mr-2">Filter:</span>
        {['', 'open', 'in_progress', 'completed', 'archived'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterStatus === s
              ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30'
              : 'text-white/40 hover:text-white/60 border border-transparent hover:border-white/10'
              }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* ── Projects Table ── */}
      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm animate-pulse">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
          <Database size={40} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 text-sm mb-2">No SDL projects in database yet.</p>
          <p className="text-white/20 text-xs mb-6">Click "Seed Projects" to populate the lab with starter projects.</p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-6 py-3 bg-[#7C3AED] rounded-xl text-xs font-bold text-white disabled:opacity-50"
          >
            {seeding ? 'Seeding...' : 'Seed 6 Starter Projects'}
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
          {/* Table Header */}
          <div className="overflow-x-auto">
          <div className="grid grid-cols-12 gap-3 px-3 sm:px-6 py-3 border-b border-white/[0.06] text-[10px] font-bold text-white/30 uppercase tracking-widest min-w-[700px]">
            <div className="col-span-3">Project</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-center">Team</div>
            <div className="col-span-1 text-center">Tasks</div>
            <div className="col-span-1 text-center">Views</div>
            <div className="col-span-1 text-center">Flags</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Rows */}
          <AnimatePresence>
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-12 gap-3 px-3 sm:px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors items-center group min-w-[700px]"
              >
                {/* Title + Owner */}
                <div className="col-span-3">
                  <span className="text-sm font-semibold text-white block truncate group-hover:text-purple-300 transition-colors">
                    {project.title}
                  </span>
                  <span className="text-[10px] text-white/30">{project.owner_name}</span>
                </div>

                {/* Type */}
                <div className="col-span-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded">
                    {typeLabel(project.project_type)}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project._id, e.target.value)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border bg-transparent outline-none cursor-pointer ${statusColor(project.status)}`}
                  >
                    <option value="open" className="bg-[#1A1030]">Open</option>
                    <option value="in_progress" className="bg-[#1A1030]">In Progress</option>
                    <option value="completed" className="bg-[#1A1030]">Completed</option>
                    <option value="archived" className="bg-[#1A1030]">Archived</option>
                  </select>
                </div>

                {/* Team */}
                <div className="col-span-1 text-center">
                  <span className="text-xs text-white/50">{project.member_count}/{project.team_size}</span>
                </div>

                {/* Tasks */}
                <div className="col-span-1 text-center">
                  <span className="text-xs text-white/50">{project.done_task_count}/{project.task_count}</span>
                </div>

                {/* Views */}
                <div className="col-span-1 text-center">
                  <span className="text-xs text-white/30 flex items-center justify-center gap-1">
                    <Eye size={12} /> {project.views}
                  </span>
                </div>

                {/* Feature / Trending flags */}
                <div className="col-span-1 flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => handleToggleFeatured(project._id, project.featured)}
                    title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                    className={`p-1 rounded transition-all ${project.featured ? 'text-yellow-400 bg-yellow-500/10' : 'text-white/15 hover:text-white/30'}`}
                  >
                    <Star size={14} fill={project.featured ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => handleToggleTrending(project._id, project.trending)}
                    title={project.trending ? 'Remove from trending' : 'Mark as trending'}
                    className={`p-1 rounded transition-all ${project.trending ? 'text-rose-400 bg-rose-500/10' : 'text-white/15 hover:text-white/30'}`}
                  >
                    <TrendingUp size={14} />
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  {project.status !== 'archived' && (
                    <button
                      onClick={() => handleStatusChange(project._id, 'archived')}
                      className="p-1.5 rounded-lg text-white/30 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                      title="Archive"
                    >
                      <Archive size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(project._id, project.title)}
                    disabled={actionLoading === project._id}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Info Note ── */}
      <div className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
        <AlertCircle size={16} className="text-purple-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-white/50">
            <strong className="text-white/70">Tip:</strong> Use the <strong className="text-purple-300">Seed Projects</strong> button to populate the database with 6 structured engineering lab projects.
            Students can then browse, join teams, and start collaborating. Toggle <Star size={10} className="inline text-yellow-400" /> Featured and <TrendingUp size={10} className="inline text-rose-400" /> Trending flags to control what shows on the landing page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SDLManagement;

