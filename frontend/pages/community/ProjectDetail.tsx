import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Eye,
  Share2,
  Bookmark,
  ExternalLink,
  Github,
  Loader2,
  ArrowLeft,
  Trash2,
  Reply,
} from 'lucide-react';

interface Comment {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
  replies?: Comment[];
  parent_comment_id?: string;
}

interface CommunityPost {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  github_link?: string;
  website_link?: string;
  video_url?: string;
  cover_image?: string;
  project_type: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  view_count: number;
  share_count: number;
  created_at: string;
  user_vote?: 'up' | 'down' | null;
  is_saved?: boolean;
  comments?: Comment[];
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
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function CommentItem({
  comment,
  postId,
  currentUser,
  onDelete,
  onRefresh,
  depth = 0,
}: {
  comment: Comment;
  postId: string;
  currentUser: any;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  depth?: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          post_id: postId,
          content: replyText,
          parent_comment_id: comment.id,
        }),
      });
      if (res.ok) {
        setReplyText('');
        setShowReply(false);
        onRefresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l border-white/10' : ''}`}>
      <div className="flex gap-3 py-3">
        {comment.author_avatar ? (
          <img
            src={comment.author_avatar}
            alt=""
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-300 flex-shrink-0">
            {comment.author_name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-300">{comment.author_name}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500">{timeAgo(comment.created_at)}</span>
            {currentUser?.user_id === comment.author_id && (
              <button
                onClick={() => onDelete(comment.id)}
                className="ml-auto text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.content}</p>
          <button
            onClick={() => setShowReply(!showReply)}
            className="flex items-center gap-1 mt-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors"
          >
            <Reply size={12} />
            Reply
          </button>
        </div>
      </div>

      {showReply && (
        <div className="ml-11 mb-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleReply}
              disabled={!replyText.trim() || submitting}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : null}
              Reply
            </button>
            <button
              onClick={() => {
                setShowReply(false);
                setReplyText('');
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          currentUser={currentUser}
          onDelete={onDelete}
          onRefresh={onRefresh}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

function buildCommentTree(comments: Comment[]): Comment[] {
  return comments.map(c => ({
    ...c,
    replies: c.replies || []
  }));
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/);
  return match ? match[1] : null;
}

export default function ProjectDetail() {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [toast, setToast] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const lastFetchedPostId = React.useRef<string | null>(null);

  useEffect(() => {
    if (postId && lastFetchedPostId.current !== postId) {
      lastFetchedPostId.current = postId;
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setPost(data.post || data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (direction: 'up' | 'down') => {
    if (!post || !user) {
      navigate('/login');
      return;
    }
    const prevVote = post.user_vote;
    let upvotes = post.upvotes;
    let downvotes = post.downvotes;

    if (prevVote === direction) {
      if (direction === 'up') upvotes--;
      else downvotes--;
      setPost({ ...post, upvotes, downvotes, user_vote: null });
    } else {
      if (prevVote === 'up') upvotes--;
      else if (prevVote === 'down') downvotes--;
      if (direction === 'up') upvotes++;
      else downvotes++;
      setPost({ ...post, upvotes, downvotes, user_vote: direction });
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ direction }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev) => prev ? {
          ...prev,
          user_vote: data.user_vote,
          upvotes: data.upvotes,
          downvotes: data.downvotes,
        } : prev);
      }
    } catch {
      loadPost();
    }
  };

  const handleSave = async () => {
    if (!post || !user) {
      navigate('/login');
      return;
    }
    setPost({ ...post, is_saved: !post.is_saved });
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/save`, {
        method: 'POST',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev) => prev ? { ...prev, is_saved: data.is_saved } : prev);
      }
    } catch {
      loadPost();
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/community/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast('Link copied!');
      setTimeout(() => setToast(''), 2000);
      const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/share`, {
        method: 'POST',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        if (post) setPost({ ...post, share_count: data.share_count });
      }
    } catch {
      // clipboard may be blocked
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || submittingComment || !postId) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ post_id: postId, content: commentText }),
      });
      if (res.ok) {
        setCommentText('');
        loadPost();
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/community/comments/${commentId}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
      });
      loadPost();
    } catch {
      // silently fail
    }
  };

  const handleDeletePost = async () => {
    if (!postId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        setToast('Post deleted');
        setTimeout(() => navigate('/community'), 500);
      }
    } catch {
      setToast('Failed to delete');
      setTimeout(() => setToast(''), 2000);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const startEditing = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditCategory(post.category);
    setEditTags([...post.tags]);
    setEditGithub(post.github_link || '');
    setEditWebsite(post.website_link || '');
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!postId || !editTitle.trim() || !editDescription.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          category: editCategory,
          tags: editTags,
          github_link: editGithub || undefined,
          website_link: editWebsite || undefined,
          video_url: post?.video_url || undefined,
          cover_image: post?.cover_image || undefined,
          project_type: post?.project_type || 'project',
        }),
      });
      if (res.ok) {
        setEditing(false);
        setToast('Post updated!');
        setTimeout(() => setToast(''), 2000);
        loadPost();
      }
    } catch {
      setToast('Failed to update');
      setTimeout(() => setToast(''), 2000);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleEditTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = editTagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (tag && !editTags.includes(tag) && editTags.length < 5 && !tag.startsWith('http')) {
        setEditTags([...editTags, tag]);
        setEditTagInput('');
      }
    }
  };

  const isOwner = user && post && user.user_id === post.author_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Post not found</p>
        <Link
          to="/community"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
        >
          Back to Feed
        </Link>
      </div>
    );
  }

  const commentTree = buildCommentTree(post.comments || []);
  const youtubeId = post.video_url ? extractYouTubeId(post.video_url) : null;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pt-24">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-3 sm:px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/community')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors shrink-0 mt-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white break-words">{post.title}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {post.author_avatar ? (
                <img src={post.author_avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center text-[10px] font-bold text-purple-300">
                  {post.author_name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-400">{post.author_name}</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">{timeAgo(post.created_at)}</span>
            </div>
          </div>
          {isOwner && !editing && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {editing && isOwner ? (
          <div className="bg-white/5 border border-purple-500/30 rounded-xl p-5 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                  <option value="ai-ml">AI/ML</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="devtools">DevTools</option>
                  <option value="gaming">Gaming</option>
                  <option value="iot">IoT</option>
                  <option value="fintech">FinTech</option>
                  <option value="healthtech">HealthTech</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      #{tag}
                      <button onClick={() => setEditTags(editTags.filter(t => t !== tag))} className="hover:text-red-400 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
                {editTags.length < 5 && (
                  <input
                    type="text"
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyDown={handleEditTagAdd}
                    placeholder="Add tag + Enter"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">GitHub</label>
                  <input type="url" value={editGithub} onChange={(e) => setEditGithub(e.target.value)} placeholder="https://github.com/..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                  <input type="url" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editTitle.trim() || !editDescription.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 size={14} className="animate-spin" /> : null}
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Cover Image */}
            {post.cover_image && (
              <div className="rounded-xl overflow-hidden mb-6 bg-white/5">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-auto max-h-[420px] object-cover"
                />
              </div>
            )}

            {/* Content Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6 mb-5">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                  {post.project_type === 'startup' ? '🚀 Startup' : post.project_type === 'open-source' ? '🌍 Open Source' : '📦 Project'}
                </span>
                <span className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                  {post.category.replace('-', '/').toUpperCase()}
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-gray-400 border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="mb-5">
                <h2 className="text-base font-semibold text-white mb-2">About this project</h2>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {post.description}
                </div>
              </div>

              {/* Links */}
              {(post.github_link || post.website_link) && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {post.github_link && (
                    <a
                      href={post.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors"
                    >
                      <Github size={14} />
                      GitHub
                    </a>
                  )}
                  {post.website_link && (
                    <a
                      href={post.website_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors"
                    >
                      <ExternalLink size={14} />
                      Website
                    </a>
                  )}
                </div>
              )}

              {/* Video Embed */}
              {youtubeId && (
                <div className="aspect-video rounded-lg overflow-hidden mb-5 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Project video"
                  />
                </div>
              )}

              {/* Stats + Vote + Actions Row */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/10 gap-3">
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Vote buttons inline */}
                  <button
                    onClick={() => handleVote('up')}
                    className={`p-1.5 rounded-md transition-colors ${
                      post.user_vote === 'up'
                        ? 'text-green-400 bg-green-400/10'
                        : 'text-gray-500 hover:text-green-400 hover:bg-green-400/10'
                    }`}
                  >
                    <ArrowUp size={18} />
                  </button>
                  <span
                    className={`text-sm font-bold min-w-[24px] text-center ${
                      post.user_vote === 'up' ? 'text-green-400' : post.user_vote === 'down' ? 'text-red-400' : 'text-gray-400'
                    }`}
                  >
                    {post.upvotes - post.downvotes}
                  </span>
                  <button
                    onClick={() => handleVote('down')}
                    className={`p-1.5 rounded-md transition-colors ${
                      post.user_vote === 'down'
                        ? 'text-red-400 bg-red-400/10'
                        : 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'
                    }`}
                  >
                    <ArrowDown size={18} />
                  </button>

                  <span className="text-gray-600 mx-1">·</span>

                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye size={13} />
                    {post.view_count}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MessageCircle size={13} />
                    {post.comment_count}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Share2 size={13} />
                    {post.share_count}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      post.is_saved
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Bookmark size={13} fill={post.is_saved ? 'currentColor' : 'none'} />
                    {post.is_saved ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-400 transition-colors"
                  >
                    <Share2 size={13} />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                <MessageCircle size={16} />
                Comments ({post.comment_count})
              </h3>

              {/* Comment Input */}
              {user ? (
                <div className="mb-5">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim() || submittingComment}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {submittingComment ? <Loader2 size={14} className="animate-spin" /> : null}
                      Comment
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-5">
                  <Link to="/login" className="text-purple-400 hover:underline">Log in</Link> to leave a comment.
                </p>
              )}

              {/* Comments List */}
              <div className="divide-y divide-white/5">
                {commentTree.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  commentTree.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      postId={postId!}
                      currentUser={user}
                      onDelete={handleDeleteComment}
                      onRefresh={loadPost}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete Post</h3>
                <p className="text-gray-400 text-sm">This cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to delete "<span className="text-white font-medium break-words">{post.title}</span>"? All comments and votes will be removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
