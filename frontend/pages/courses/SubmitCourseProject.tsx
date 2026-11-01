import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import {
  ArrowLeft,
  Loader2,
  X,
  Github,
  ExternalLink,
  Video,
  Plus,
  Link as LinkIcon,
  Code,
} from 'lucide-react';

interface RubricCriterion {
  name: string;
  max_score: number;
  description: string;
}

interface CourseInfo {
  id: string;
  title: string;
  description?: string;
  image?: string;
}

export default function SubmitCourseProject() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [rubric, setRubric] = useState<RubricCriterion[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deployedLink, setDeployedLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (courseId) loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const [courseRes, rubricRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/courses`),
        fetch(`${API_BASE_URL}/api/courses/${courseId}/rubrics`),
      ]);
      if (courseRes.ok) {
        const courses = await courseRes.json();
        const list = courses.courses || courses || [];
        const found = list.find((c: any) => c._id === courseId || c.id === courseId);
        if (found) setCourse({ id: found._id || found.id, title: found.title, description: found.description, image: found.image });
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

  const handleTechAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tech = techInput.trim();
      if (tech && !techStack.includes(tech) && techStack.length < 10) {
        setTechStack([...techStack, tech]);
        setTechInput('');
      }
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!deployedLink.trim()) errs.deployedLink = 'Deployed link is required';
    else if (!isValidUrl(deployedLink)) errs.deployedLink = 'Invalid URL';
    if (githubLink && !isValidUrl(githubLink)) errs.githubLink = 'Invalid URL';
    if (videoUrl && !isValidUrl(videoUrl)) errs.videoUrl = 'Invalid URL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isValidUrl = (str: string): boolean => {
    try { new URL(str); return true; } catch { return false; }
  };

  const handleSubmit = async () => {
    if (!validate() || submitting || !courseId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/submit-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          deployed_link: deployedLink.trim(),
          github_link: githubLink.trim() || undefined,
          video_url: videoUrl.trim() || undefined,
          tech_stack: techStack,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate(`/courses/${courseId}/my-projects`), 1500);
      } else {
        const err = await res.json().catch(() => null);
        setErrors({ submit: err?.detail || 'Failed to submit' });
      }
    } catch {
      setErrors({ submit: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pt-24">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Submit Course Project</h1>
            {course && <p className="text-sm text-gray-400 mt-1">{course.title}</p>}
          </div>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center mb-6">
            <p className="text-green-400 font-semibold text-lg">Project Submitted!</p>
            <p className="text-gray-400 text-sm mt-1">Redirecting to your submissions...</p>
          </div>
        )}

        <div className="flex gap-8">
          <div className="flex-1 min-w-0 space-y-6">
            <div>
              <label className={labelClass}>Project Title *</label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: '' })); }} placeholder="Give your project a name" className={inputClass} maxLength={100} />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className={labelClass}>Description *</label>
              <textarea value={description} onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(p => ({ ...p, description: '' })); }} placeholder="What does it do? What problem does it solve? What tech did you use?" className={`${inputClass} resize-none`} rows={6} maxLength={2000} />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? <p className="text-red-400 text-xs">{errors.description}</p> : <p className="text-gray-500 text-xs">Be specific about features and tech stack</p>}
                <span className={`text-xs ${description.length > 1800 ? 'text-red-400' : 'text-gray-500'}`}>{description.length}/2000</span>
              </div>
            </div>

            <div>
              <label className={labelClass}><LinkIcon size={14} className="inline mr-1" />Deployed Link *</label>
              <input type="url" value={deployedLink} onChange={(e) => { setDeployedLink(e.target.value); if (errors.deployedLink) setErrors(p => ({ ...p, deployedLink: '' })); }} placeholder="https://your-project.vercel.app" className={inputClass} />
              {errors.deployedLink && <p className="text-red-400 text-xs mt-1">{errors.deployedLink}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}><Github size={14} className="inline mr-1" />GitHub Link</label>
                <input type="url" value={githubLink} onChange={(e) => { setGithubLink(e.target.value); if (errors.githubLink) setErrors(p => ({ ...p, githubLink: '' })); }} placeholder="https://github.com/..." className={inputClass} />
                {errors.githubLink && <p className="text-red-400 text-xs mt-1">{errors.githubLink}</p>}
              </div>
              <div>
                <label className={labelClass}><Video size={14} className="inline mr-1" />Demo Video</label>
                <input type="url" value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value); if (errors.videoUrl) setErrors(p => ({ ...p, videoUrl: '' })); }} placeholder="https://youtube.com/..." className={inputClass} />
                {errors.videoUrl && <p className="text-red-400 text-xs mt-1">{errors.videoUrl}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}><Code size={14} className="inline mr-1" />Tech Stack (press Enter to add)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {techStack.map(tech => (
                  <span key={tech} className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {tech}
                    <button onClick={() => setTechStack(techStack.filter(t => t !== tech))} className="hover:text-red-400"><X size={14} /></button>
                  </span>
                ))}
              </div>
              {techStack.length < 10 && (
                <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={handleTechAdd} placeholder="e.g. React, Node.js, MongoDB" className={inputClass} />
              )}
            </div>

            {errors.submit && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">{errors.submit}</p>}

            <div className="flex items-center gap-3 pt-4">
              <button onClick={handleSubmit} disabled={submitting || success} className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {submitting ? 'Submitting...' : 'Submit Project'}
              </button>
              <Link to={`/courses/${courseId}/my-projects`} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium text-gray-400 transition-colors">
                View My Projects
              </Link>
            </div>
          </div>

          {rubric.length > 0 && (
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-purple-400">📋</span> Evaluation Rubric
                </h3>
                <p className="text-xs text-gray-500 mb-4">Projects will be evaluated on these criteria:</p>
                <div className="space-y-3">
                  {rubric.map((r, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300">{r.name}</span>
                        <span className="text-xs text-purple-400 font-mono">{r.max_score}pts</span>
                      </div>
                      <p className="text-xs text-gray-500">{r.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-right">
                  <span className="text-sm font-semibold text-gray-400">Total: </span>
                  <span className="text-lg font-bold text-purple-400">{rubric.reduce((s, r) => s + r.max_score, 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
