import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../apiConfig';

// ─── Types ───────────────────────────────────────────────────────
interface SDLProject {
  _id: string;
  owner_id: string;
  owner_name: string;
  owner_avatar?: string;
  title: string;
  project_type: string;
  problem_statement: string;
  architecture_focus: string;
  skills_required: string[];
  team_size: number;
  timeline: string;
  roles_needed: string[];
  tags: string[];
  github_link?: string;
  progress: number;
  status: string;
  featured: boolean;
  trending: boolean;
  views: number;
  upvotes?: number;
  comments_count?: number;
  created_at: string;
  members?: any[];
}

// ─── Filter Tags ─────────────────────────────────────────────────
const FILTER_TAGS = ['All', 'AI', 'Backend', 'System Design', 'Full Stack', 'DevOps', 'Beginner Friendly'];
const TABS = ['Top Launches', 'Trending Today', 'Open to Collaborate', 'Recently Completed'];

// ─── Seed Data (shown when DB is empty) ──────────────────────────
const SEED_PROJECTS: SDLProject[] = [
  {
    _id: 'seed-1',
    owner_id: 'system',
    owner_name: 'Studlyf Lab',
    title: 'Netflix Streaming Engine',
    project_type: 'system_replica',
    problem_statement: 'Deconstruct and rebuild the core video streaming pipeline — adaptive bitrate, CDN routing, and real-time recommendations.',
    architecture_focus: 'Microservices + Event-Driven',
    skills_required: ['Node.js', 'Kafka', 'Redis', 'React', 'FFmpeg'],
    team_size: 4,
    timeline: '6 weeks',
    roles_needed: ['backend', 'frontend', 'devops'],
    tags: ['System Design', 'Full Stack', 'Backend'],
    progress: 0,
    status: 'open',
    featured: true,
    trending: true,
    views: 342,
    upvotes: 843,
    comments_count: 156,
    created_at: new Date().toISOString(),
  },
  {
    _id: 'seed-2',
    owner_id: 'system',
    owner_name: 'Studlyf Lab',
    title: 'Uber Ride Matching System',
    project_type: 'system_replica',
    problem_statement: 'Build a geo-distributed ride matching engine with sub-100ms p99 latency using spatial indexing and real-time location tracking.',
    architecture_focus: 'Geo-Distributed + Real-Time',
    skills_required: ['Go', 'PostGIS', 'WebSockets', 'React Native'],
    team_size: 3,
    timeline: '5 weeks',
    roles_needed: ['backend', 'frontend', 'devops'],
    tags: ['System Design', 'Backend', 'DevOps'],
    progress: 0,
    status: 'open',
    featured: true,
    trending: false,
    views: 218,
    upvotes: 412,
    comments_count: 89,
    created_at: new Date().toISOString(),
  },
  {
    _id: 'seed-3',
    owner_id: 'system',
    owner_name: 'Studlyf Lab',
    title: 'AI Resume Screener',
    project_type: 'original_build',
    problem_statement: 'Create an AI-powered resume screening system that scores candidates against job descriptions using NLP and semantic matching.',
    architecture_focus: 'ML Pipeline + API Gateway',
    skills_required: ['Python', 'FastAPI', 'Transformers', 'React', 'PostgreSQL'],
    team_size: 3,
    timeline: '4 weeks',
    roles_needed: ['ai', 'backend', 'frontend'],
    tags: ['AI', 'Full Stack', 'Beginner Friendly'],
    progress: 0,
    status: 'open',
    featured: true,
    trending: true,
    views: 456,
    upvotes: 1024,
    comments_count: 231,
    created_at: new Date().toISOString(),
  },
  {
    _id: 'seed-4',
    owner_id: 'system',
    owner_name: 'Studlyf Lab',
    title: 'Slack Real-Time Messenger',
    project_type: 'system_replica',
    problem_statement: 'Architect a real-time messaging platform with channels, threads, presence indicators, and file sharing at scale.',
    architecture_focus: 'WebSocket + CQRS',
    skills_required: ['TypeScript', 'Socket.io', 'MongoDB', 'React', 'Docker'],
    team_size: 4,
    timeline: '6 weeks',
    roles_needed: ['backend', 'frontend', 'devops', 'ui_ux'],
    tags: ['Full Stack', 'System Design'],
    progress: 45,
    status: 'in_progress',
    featured: false,
    trending: true,
    views: 189,
    upvotes: 388,
    comments_count: 42,
    created_at: new Date().toISOString(),
  },
  {
    _id: 'seed-5',
    owner_id: 'system',
    owner_name: 'Studlyf Lab',
    title: 'GitHub CI/CD Pipeline Builder',
    project_type: 'original_build',
    problem_statement: 'Build a visual CI/CD pipeline designer with YAML generation, container orchestration, and deployment automation.',
    architecture_focus: 'Container Orchestration + DAG',
    skills_required: ['Go', 'Docker', 'Kubernetes', 'React', 'YAML'],
    team_size: 2,
    timeline: '4 weeks',
    roles_needed: ['devops', 'frontend'],
    tags: ['DevOps', 'Full Stack'],
    progress: 100,
    status: 'completed',
    featured: false,
    trending: false,
    views: 567,
    upvotes: 955,
    comments_count: 188,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    _id: 'seed-6',
    owner_id: 'system',
    owner_name: 'Studlyf Lab',
    title: 'E-Commerce Recommendation Engine',
    project_type: 'collaboration_request',
    problem_statement: 'Looking for collaborators to build a collaborative filtering + content-based recommendation engine for an e-commerce platform.',
    architecture_focus: 'ML + Streaming Pipeline',
    skills_required: ['Python', 'Spark', 'Redis', 'FastAPI'],
    team_size: 3,
    timeline: '5 weeks',
    roles_needed: ['ai', 'backend'],
    tags: ['AI', 'Backend', 'Beginner Friendly'],
    progress: 0,
    status: 'open',
    featured: false,
    trending: false,
    views: 132,
    upvotes: 215,
    comments_count: 18,
    created_at: new Date().toISOString(),
  },
];

// ─── Utility ─────────────────────────────────────────────────────
const typeLabel = (t: string) => {
  switch (t) {
    case 'system_replica': return 'System Replica';
    case 'original_build': return 'Original Build';
    case 'collaboration_request': return 'Collab Request';
    default: return t;
  }
};

const typeColor = (t: string) => {
  switch (t) {
    case 'system_replica': return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
    case 'original_build': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'collaboration_request': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    default: return 'bg-gray-500/20 text-gray-300';
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case 'open': return 'bg-green-500';
    case 'in_progress': return 'bg-amber-500';
    case 'completed': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

// ─── Project Feed Row (Reddit/Product Hunt Style) ──────────────────
const ProjectFeedRow: React.FC<{ project: SDLProject; onClick: () => void }> = ({ project, onClick }) => {
  const [upvoted, setUpvoted] = useState(false);
  const upvoteCount = (project.upvotes || 0) + (upvoted ? 1 : 0);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUpvoted(!upvoted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl border border-gray-100 hover:border-violet-500/30 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] transition-all duration-300 p-4 sm:p-5 flex gap-4 sm:gap-6 items-center"
    >
      {/* Upvote Block (Left) */}
      <div className="flex flex-col items-center justify-center gap-1 shrink-0">
        <button
          onClick={handleUpvote}
          className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg border transition-all duration-300 ${
            upvoted 
              ? 'bg-violet-50 border-violet-200 text-violet-600' 
              : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
          }`}
        >
          <svg className={`w-5 h-5 mb-0.5 transition-transform duration-300 ${upvoted ? '-translate-y-0.5' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h6v8h4v-8h6z" /></svg>
          <span className="text-xs font-black">{upvoteCount}</span>
        </button>
      </div>

      {/* Main Content (Center) */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h3 className="text-lg font-black text-[#111827] group-hover:text-violet-600 transition-colors truncate">
            {project.title}
          </h3>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
            {project.architecture_focus}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-1 mb-2">
          {project.problem_statement}
        </p>
        
        <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-[7px] text-white font-bold">
              {project.owner_name.charAt(0)}
            </div>
            <span>{project.owner_name}</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex gap-1.5 hidden sm:flex">
            {project.skills_required.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[10px] text-gray-500">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement & Actions (Right) */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
          <div className="flex items-center gap-1.5 hover:text-violet-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span>{project.comments_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            <span>{project.views}</span>
          </div>
        </div>
        
        {project.status === 'open' ? (
          <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all">
            Join Team
          </button>
        ) : (
          <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${statusColor(project.status)} bg-opacity-10 text-gray-500 border-gray-200`}>
            {project.status.replace('_', ' ')}
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ─── Stats Strip ─────────────────────────────────────────────────
const StatsStrip: React.FC<{ stats: any }> = ({ stats }) => {
  const items = [
    { label: 'Live Projects', value: stats.total_projects || SEED_PROJECTS.length, icon: '◆' },
    { label: 'Open to Join', value: stats.open_projects || SEED_PROJECTS.filter(p => p.status === 'open').length, icon: '◇' },
    { label: 'Completed Labs', value: stats.completed_projects || 1, icon: '▣' },
    { label: 'Active Engineers', value: stats.active_collaborators || 24, icon: '⟐' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm"
        >
          <span className="text-violet-400 text-lg mb-1 block">{item.icon}</span>
          <div className="text-2xl font-black text-[#111827] mb-1">{item.value}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{item.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
const SystemDeconstructionLab: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');
  const [projects, setProjects] = useState<SDLProject[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sdl/projects`);
      const data = await res.json();
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        setProjects(SEED_PROJECTS);
      }
    } catch {
      setProjects(SEED_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sdl/stats`);
      setStats(await res.json());
    } catch {
      setStats({});
    }
  };

  // Filter logic
  const filteredProjects = projects.filter((p) => {
    // Tab filter
    if (activeTab === 0 && !p.featured) return false;
    if (activeTab === 1 && p.status !== 'open') return false;
    if (activeTab === 2 && !p.trending) return false;
    if (activeTab === 3 && p.status !== 'completed') return false;

    // Tag filter
    if (activeFilter !== 'All' && !p.tags.includes(activeFilter)) return false;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.problem_statement.toLowerCase().includes(q);
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Hero ── */}
        <style>{`
          @keyframes sdf-shimmer {
              0%   { transform: translateX(-180%) skewX(-20deg); }
              100% { transform: translateX(300%) skewX(-20deg); }
          }
          @keyframes sdf-orb1 {
              0%,100% { transform: translate(0px,0px) scale(1);    opacity:0.55; }
              40%     { transform: translate(8px,-6px) scale(1.3);  opacity:0.9; }
              70%     { transform: translate(-4px,4px) scale(0.8);  opacity:0.4; }
          }
          @keyframes sdf-orb2 {
              0%,100% { transform: translate(0px,0px) scale(1);     opacity:0.4; }
              35%     { transform: translate(-10px,-8px) scale(1.4); opacity:0.85; }
              65%     { transform: translate(6px,5px) scale(0.75);   opacity:0.35; }
          }
          @keyframes sdf-orb3 {
              0%,100% { transform: translate(0px,0px) scale(1);    opacity:0.5; }
              50%     { transform: translate(6px,8px) scale(1.25);  opacity:0.9; }
          }
          .glow-btn-inline {
              position: relative;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background: #7C3AED;
              color: #fff;
              font-weight: 800;
              border: none;
              overflow: hidden;
              transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
              box-shadow: 0 4px 20px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.12) inset;
          }
          .glow-btn-inline::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 55%);
              pointer-events: none;
              z-index: 1;
          }
          .glow-btn-inline::after {
              content: '';
              position: absolute;
              top: 0; left: 0;
              width: 40%; height: 100%;
              background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.24) 50%, transparent 80%);
              animation: sdf-shimmer 2.8s ease-in-out infinite;
              pointer-events: none;
              z-index: 2;
          }
          .glow-btn-inline:hover {
              transform: translateY(-2px) scale(1.02);
              box-shadow: 0 0 0 5px rgba(139,92,246,0.18), 0 0 32px 12px rgba(139,92,246,0.45), 0 16px 40px rgba(109,40,217,0.5);
          }
          .glow-btn-inline:active { transform: scale(0.97); }
          .glow-orb {
              position: absolute;
              border-radius: 50%;
              pointer-events: none;
              filter: blur(7px);
              z-index: 1;
          }
          .glow-orb-tab { filter: blur(5px); }
          .glow-orb1 { width:28px; height:28px; background:radial-gradient(circle,rgba(196,168,255,0.95),transparent 70%); top:-4px; left:18px; animation:sdf-orb1 3.2s ease-in-out infinite; }
          .glow-orb2 { width:22px; height:22px; background:radial-gradient(circle,rgba(255,255,255,0.8),transparent 70%);  bottom:-2px; right:48px; animation:sdf-orb2 4s ease-in-out infinite; }
          .glow-orb3 { width:18px; height:18px; background:radial-gradient(circle,rgba(167,139,250,0.9),transparent 70%); top:4px; right:18px;  animation:sdf-orb3 2.6s ease-in-out infinite; }
          .glow-label { position:relative; z-index:5; display:flex; align-items:center; gap:8px; }
        `}</style>
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.4em]">Engineering Lab Protocol</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#111827] mb-6 tracking-tighter leading-[0.9]">
                Build A<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B]">
                  PROJECT
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                Build and scale industry-standard projects with elite engineering teams. Showcase architecture ownership and system thinking.
              </p>
            </div>

            <button
              onClick={() => navigate('/job-prep/projects/create')}
              className="w-full sm:w-auto shrink-0 px-8 py-4 glow-btn-inline rounded-xl text-xs uppercase tracking-[0.25em]"
            >
              <span className="glow-orb glow-orb1" />
              <span className="glow-orb glow-orb2" />
              <span className="glow-orb glow-orb3" />
              <span className="glow-label">+ Start a New Project</span>
            </button>
          </div>
        </motion.header>

        {/* ── Stats ── */}
        <StatsStrip stats={stats} />

        {/* ── Search Bar ── */}
        <div className="mb-8">
          <div className="relative w-full sm:max-w-md">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${activeTab === i
                ? 'glow-btn-inline shadow-lg shadow-violet-600/30'
                : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-100'
                }`}
            >
              {activeTab === i ? (
                <>
                  <span className="glow-orb glow-orb-tab glow-orb1" style={{width:'18px', height:'18px', left: '10px'}} />
                  <span className="glow-orb glow-orb-tab glow-orb2" style={{width:'14px', height:'14px', right: '10px'}} />
                  <span className="glow-orb glow-orb-tab glow-orb3" style={{width:'12px', height:'12px', top: '2px', right: '10px'}} />
                  <span className="glow-label">{tab}</span>
                </>
              ) : (
                tab
              )}
            </button>
          ))}
        </div>

        {/* ── Filter Tags ── */}
        <div className="flex flex-wrap gap-2 mb-12">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${activeFilter === tag
                ? 'bg-gray-100 text-gray-900 border border-gray-200'
                : 'text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* ── Projects Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-white/30 text-xs uppercase tracking-[0.3em] font-bold animate-pulse">
              Initializing Lab Protocol...
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 ? (
              <motion.div
                key={`${activeTab}-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 max-w-4xl mx-auto"
              >
                {filteredProjects.map((project) => (
                  <ProjectFeedRow
                    key={project._id}
                    project={project}
                    onClick={() => navigate(`/job-prep/projects/${project._id}`)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="text-4xl mb-4 opacity-20">◇</div>
                <p className="text-white/20 text-sm uppercase tracking-[0.2em] font-bold mb-6">No projects match this filter</p>
                <button
                  onClick={() => { setActiveFilter('All'); setActiveTab(0); }}
                  className="text-violet-400 text-xs uppercase tracking-[0.2em] font-bold hover:text-violet-300 transition-colors"
                >
                  Reset Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── CTA Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 bg-gradient-to-br from-violet-600/10 to-purple-600/5 rounded-3xl border border-violet-500/10 p-12 text-center"
        >
          <h2 className="text-3xl font-black text-[#111827] mb-4 tracking-tight">
            Ready to Build Something Real?
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Stop watching tutorials. Start deconstructing systems used by millions. Your portfolio will speak louder than any certificate.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/job-prep/projects/create')}
              className="px-8 py-4 glow-btn-inline rounded-xl text-xs uppercase tracking-[0.25em]"
            >
              <span className="glow-orb glow-orb1" />
              <span className="glow-orb glow-orb2" />
              <span className="glow-orb glow-orb3" />
              <span className="glow-label">Launch Your Lab</span>
            </button>
            <button
              onClick={() => { setActiveTab(1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
              className="px-8 py-4 glow-btn-inline rounded-xl text-xs uppercase tracking-[0.25em]"
            >
              <span className="glow-orb glow-orb1" />
              <span className="glow-orb glow-orb2" />
              <span className="glow-orb glow-orb3" />
              <span className="glow-label">Join a Team</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemDeconstructionLab;

