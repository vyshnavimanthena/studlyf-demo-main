import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import {
  ArrowLeft,
  Loader2,
  X,
  Github,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ai-ml', label: 'AI/ML' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'devtools', label: 'DevTools' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'iot', label: 'IoT' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'healthtech', label: 'HealthTech' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const PROJECT_TYPES = [
  { value: 'project', label: 'Project' },
  { value: 'startup_idea', label: 'Startup Idea' },
  { value: 'open_source', label: 'Open Source' },
];

export default function SubmitProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('project');
  const [category, setCategory] = useState('web');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagError, setTagError] = useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (!tag) return;
      if (tag.startsWith('http') || tag.includes('.') || tag.length > 30) {
        setTagError('Tags should be short keywords (e.g., react, python, ai)');
        setTimeout(() => setTagError(''), 3000);
        return;
      }
      if (tags.includes(tag)) {
        setTagError('Tag already added');
        setTimeout(() => setTagError(''), 2000);
        return;
      }
      if (tags.length >= 5) {
        setTagError('Maximum 5 tags allowed');
        setTimeout(() => setTagError(''), 2000);
        return;
      }
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, coverImage: 'Image must be under 5MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
      setCoverFileName(file.name);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.coverImage;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const syntheticEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(syntheticEvent);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (githubLink && !isValidUrl(githubLink)) newErrors.githubLink = 'Invalid URL';
    if (websiteLink && !isValidUrl(websiteLink)) newErrors.websiteLink = 'Invalid URL';
    if (videoUrl && !isValidUrl(videoUrl)) newErrors.videoUrl = 'Invalid URL';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        project_type: projectType,
        category,
        tags,
        github_link: githubLink || undefined,
        website_link: websiteLink || undefined,
        video_url: videoUrl || undefined,
        cover_image: coverImage || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/api/community/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        navigate(`/community/${data.post?.id}`);
      } else {
        const err = await res.json().catch(() => null);
        setErrors({ submit: err?.message || 'Failed to submit project' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pt-24">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/community')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Submit Project</h1>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          {/* Form */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title */}
            <div>
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((p) => ({ ...p, title: '' }));
                }}
                placeholder="Give your project a catchy title"
                className={inputClass}
                maxLength={100}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((p) => ({ ...p, description: '' }));
                }}
                placeholder={"What does it do? What problem does it solve?\nWhat tech stack did you use?\nWhat are the key features?\nAny future plans?"}
                className={`${inputClass} resize-none`}
                rows={8}
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-red-400 text-xs">{errors.description}</p>
                ) : (
                  <p className="text-gray-500 text-xs">Be specific about the problem, solution, and tech stack</p>
                )}
                <span className={`text-xs ${description.length > 1800 ? 'text-red-400' : 'text-gray-500'}`}>
                  {description.length}/2000
                </span>
              </div>
            </div>

            {/* Project Type */}
            <div>
              <label className={labelClass}>Project Type</label>
              <div className="flex gap-3">
                {PROJECT_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => setProjectType(pt.value)}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border transition-all ${
                      projectType === pt.value
                        ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#0a0a1a]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className={labelClass}>Tags (max 5, press Enter to add)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a tag and press Enter (e.g., react, python, ai)"
                  className={inputClass}
                />
              )}
              {tagError && (
                <p className="text-red-400 text-xs mt-1">{tagError}</p>
              )}
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <Github size={14} className="inline mr-1" />
                  GitHub Link
                </label>
                <input
                  type="url"
                  value={githubLink}
                  onChange={(e) => {
                    setGithubLink(e.target.value);
                    if (errors.githubLink) setErrors((p) => ({ ...p, githubLink: '' }));
                  }}
                  placeholder="https://github.com/..."
                  className={inputClass}
                />
                {errors.githubLink && (
                  <p className="text-red-400 text-xs mt-1">{errors.githubLink}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>
                  <ExternalLink size={14} className="inline mr-1" />
                  Website Link
                </label>
                <input
                  type="url"
                  value={websiteLink}
                  onChange={(e) => {
                    setWebsiteLink(e.target.value);
                    if (errors.websiteLink) setErrors((p) => ({ ...p, websiteLink: '' }));
                  }}
                  placeholder="https://..."
                  className={inputClass}
                />
                {errors.websiteLink && (
                  <p className="text-red-400 text-xs mt-1">{errors.websiteLink}</p>
                )}
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className={labelClass}>
                <Video size={14} className="inline mr-1" />
                Video URL (YouTube / Vimeo)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  if (errors.videoUrl) setErrors((p) => ({ ...p, videoUrl: '' }));
                }}
                placeholder="https://youtube.com/watch?v=..."
                className={inputClass}
              />
              {errors.videoUrl && <p className="text-red-400 text-xs mt-1">{errors.videoUrl}</p>}
            </div>

            {/* Cover Image */}
            <div>
              <label className={labelClass}>Cover Image (max 5MB)</label>
              {coverImage ? (
                <div className="relative rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => {
                      setCoverImage(null);
                      setCoverFileName('');
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/60 text-xs text-gray-300 truncate">
                    {coverFileName}
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors"
                >
                  <ImageIcon className="mx-auto mb-3 text-gray-600" size={32} />
                  <p className="text-sm text-gray-400">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {errors.coverImage && (
                <p className="text-red-400 text-xs mt-1">{errors.coverImage}</p>
              )}
            </div>

            {/* Error */}
            {errors.submit && (
              <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">
                {errors.submit}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {submitting ? 'Submitting...' : 'Submit Project'}
              </button>
              <Link
                to="/community"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium text-gray-400 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Preview Panel (desktop) */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={16} className="text-gray-500" />
                <h3 className="text-sm font-medium text-gray-400">Preview</h3>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt=""
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="w-full h-36 bg-white/5 flex items-center justify-center">
                    <ImageIcon size={24} className="text-gray-700" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {user?.photoURL || user?.profilePhoto ? (
                      <img
                        src={user.photoURL || user.profilePhoto || ''}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center text-[10px] font-bold text-purple-300">
                        {user?.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-xs text-gray-500">{user?.full_name || 'You'}</span>
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                    {title || 'Project Title'}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {description || 'Project description will appear here...'}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/10 text-purple-300"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-600">Tags</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-600">
                    <span>0 comments</span>
                    <span>0 views</span>
                    <span>0 shares</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
