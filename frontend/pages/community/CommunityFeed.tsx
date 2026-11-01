import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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
  Search,
  Loader2,
  Plus,
  TrendingUp,
  Clock,
  Trophy,
  Tag,
  Flame,
  X,
} from 'lucide-react';

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
}

interface TopBuilder {
  user_id: string;
  author_name: string;
  author_avatar?: string;
  total_upvotes: number;
  post_count: number;
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
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

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'newest', label: 'New', icon: Clock },
  { value: 'top', label: 'Top', icon: Trophy },
];

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

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 w-10">
          <div className="w-6 h-6 bg-white/10 rounded" />
          <div className="w-8 h-4 bg-white/10 rounded" />
          <div className="w-6 h-6 bg-white/10 rounded" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-full" />
            <div className="w-24 h-3 bg-white/10 rounded" />
            <div className="w-12 h-3 bg-white/10 rounded" />
          </div>
          <div className="w-3/4 h-5 bg-white/10 rounded" />
          <div className="w-full h-3 bg-white/10 rounded" />
          <div className="w-2/3 h-3 bg-white/10 rounded" />
          <div className="flex gap-2">
            <div className="w-12 h-5 bg-white/10 rounded-full" />
            <div className="w-16 h-5 bg-white/10 rounded-full" />
            <div className="w-10 h-5 bg-white/10 rounded-full" />
          </div>
          <div className="flex gap-4">
            <div className="w-16 h-3 bg-white/10 rounded" />
            <div className="w-12 h-3 bg-white/10 rounded" />
            <div className="w-12 h-3 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('trending');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [topBuilders, setTopBuilders] = useState<TopBuilder[]>([]);
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const POSTS_PER_PAGE = 15;

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const prevSortRef = useRef(sortBy);
  const prevCatRef = useRef(selectedCategory);
  const prevSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    const sortChanged = prevSortRef.current !== sortBy;
    const catChanged = prevCatRef.current !== selectedCategory;
    const searchChanged = prevSearchRef.current !== debouncedSearch;
    prevSortRef.current = sortBy;
    prevCatRef.current = selectedCategory;
    prevSearchRef.current = debouncedSearch;

    if (sortChanged || catChanged || searchChanged) {
      setPage(1);
      setPosts([]);
      setHasMore(true);
    }
  }, [sortBy, selectedCategory, debouncedSearch]);

  useEffect(() => {
    loadPosts(true);
  }, [sortBy, selectedCategory, debouncedSearch, page]);

  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadPosts = async (reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        page: String(reset ? 1 : page),
        limit: String(POSTS_PER_PAGE),
      });
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`${API_BASE_URL}/api/community/posts?${params}`, {
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        const newPosts = data.posts || data || [];
        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }
        setHasMore(newPosts.length >= POSTS_PER_PAGE);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadSidebarData = async () => {
    try {
      const [buildersRes, catsRes, tagsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/community/top-builders`),
        fetch(`${API_BASE_URL}/api/community/categories`),
        fetch(`${API_BASE_URL}/api/community/tags`)
      ]);
      if (buildersRes.ok) {
        const b = await buildersRes.json();
        setTopBuilders(b.builders || []);
      }
      if (catsRes.ok) {
        const c = await catsRes.json();
        setCategoryCounts(
          (c.categories || []).reduce((acc: Record<string, number>, cat: any) => {
            acc[cat.category] = cat.count;
            return acc;
          }, {})
        );
      }
      if (tagsRes.ok) {
        const t = await tagsRes.json();
        setPopularTags(t.tags || []);
      }
    } catch {
      // silently fail
    }
  };

  const handleVote = async (postId: string, direction: 'up' | 'down') => {
    if (!user) {
      navigate('/login');
      return;
    }
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const prevVote = p.user_vote;
        let upvotes = p.upvotes;
        let downvotes = p.downvotes;

        if (prevVote === direction) {
          if (direction === 'up') upvotes--;
          else downvotes--;
          return { ...p, upvotes, downvotes, user_vote: null };
        }

        if (prevVote === 'up') upvotes--;
        else if (prevVote === 'down') downvotes--;

        if (direction === 'up') upvotes++;
        else downvotes++;

        return { ...p, upvotes, downvotes, user_vote: direction };
      })
    );

    try {
      await fetch(`${API_BASE_URL}/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ direction }),
      });
    } catch {
      loadPosts(true);
    }
  };

  const handleSave = async (postId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_saved: !p.is_saved } : p))
    );
    try {
      await fetch(`${API_BASE_URL}/api/community/posts/${postId}/save`, {
        method: 'POST',
        headers: { ...authHeaders() },
      });
    } catch {
      loadPosts(true);
    }
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/community/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      await fetch(`${API_BASE_URL}/api/community/posts/${postId}/share`, {
        method: 'POST',
        headers: { ...authHeaders() },
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, share_count: p.share_count + 1 } : p
        )
      );
    } catch {
      // clipboard may be blocked
    }
  };

  const loadMore = () => {
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pt-24">
      {/* Top Nav */}
      <div className="sticky top-24 z-40 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Community</h1>
          <Link
            to="/community/submit"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Submit Project
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Sort Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sortBy === opt.value
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                  : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
              }`}
            >
              {cat.label}
              {cat.value !== 'all' && categoryCounts[cat.value] ? (
                <span className="ml-1 text-xs opacity-60">{categoryCounts[cat.value]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-3 sm:gap-6">
          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <Flame className="mx-auto mb-4 text-gray-600" size={48} />
                <p className="text-gray-400 text-lg mb-2">No projects yet</p>
                <p className="text-gray-500 text-sm">Be the first to share!</p>
                <Link
                  to="/community/submit"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                >
                  <Plus size={18} />
                  Submit Project
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {posts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.03 }}
                      className="bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-all group"
                    >
                      <div className="flex p-4 gap-4">
                        {/* Vote Column */}
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <button
                            onClick={() => handleVote(post.id, 'up')}
                            className={`p-1 rounded transition-colors ${
                              post.user_vote === 'up'
                                ? 'text-green-400 bg-green-400/10'
                                : 'text-gray-500 hover:text-green-400 hover:bg-green-400/10'
                            }`}
                          >
                            <ArrowUp size={20} />
                          </button>
                          <span
                            className={`text-sm font-semibold ${
                              post.user_vote === 'up'
                                ? 'text-green-400'
                                : post.user_vote === 'down'
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }`}
                          >
                            {post.upvotes - post.downvotes}
                          </span>
                          <button
                            onClick={() => handleVote(post.id, 'down')}
                            className={`p-1 rounded transition-colors ${
                              post.user_vote === 'down'
                                ? 'text-red-400 bg-red-400/10'
                                : 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'
                            }`}
                          >
                            <ArrowDown size={20} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {post.author_avatar ? (
                              <img
                                src={post.author_avatar}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-300">
                                {post.author_name?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-gray-400">{post.author_name}</span>
                            <span className="text-xs text-gray-600">·</span>
                            <span className="text-xs text-gray-500">{timeAgo(post.created_at)}</span>
                          </div>

                          <Link
                            to={`/community/${post.id}`}
                            className="block group/title"
                          >
                            <h3 className="text-base font-semibold text-white group-hover/title:text-purple-300 transition-colors mb-1 break-words line-clamp-2">
                              {post.title}
                            </h3>
                          </Link>

                          <p className="text-sm text-gray-400 line-clamp-2 mb-2 break-words">
                            {post.description}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {post.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 4 && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-gray-500">
                                +{post.tags.length - 4}
                              </span>
                            )}
                          </div>

                          {/* Bottom Row */}
                          <div className="flex items-center gap-4 text-gray-500">
                            <Link
                              to={`/community/${post.id}`}
                              className="flex items-center gap-1 text-xs hover:text-gray-300 transition-colors"
                            >
                              <MessageCircle size={14} />
                              {post.comment_count}
                            </Link>
                            <span className="flex items-center gap-1 text-xs">
                              <Eye size={14} />
                              {post.view_count}
                            </span>
                            <button
                              onClick={() => handleShare(post.id)}
                              className="flex items-center gap-1 text-xs hover:text-gray-300 transition-colors"
                            >
                              <Share2 size={14} />
                              {post.share_count}
                            </button>
                            <button
                              onClick={() => handleSave(post.id)}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                post.is_saved ? 'text-yellow-400' : 'hover:text-gray-300'
                              }`}
                            >
                              <Bookmark size={14} fill={post.is_saved ? 'currentColor' : 'none'} />
                              Save
                            </button>
                            {post.github_link && (
                              <a
                                href={post.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs hover:text-gray-300 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Github size={14} />
                              </a>
                            )}
                            {post.website_link && (
                              <a
                                href={post.website_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs hover:text-gray-300 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Thumbnail */}
                        {post.cover_image && (
                          <Link
                            to={`/community/${post.id}`}
                            className="hidden sm:block flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-white/5"
                          >
                            <img
                              src={post.cover_image}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center py-6">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
            {/* Top Builders */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" />
                Top Builders
              </h3>
              {topBuilders.length === 0 ? (
                <p className="text-sm text-gray-500">No builders yet</p>
              ) : (
                <div className="space-y-3">
                  {topBuilders.slice(0, 5).map((builder, idx) => (
                    <Link
                      key={builder.user_id}
                      to={`/profile/${builder.user_id}`}
                      className="flex items-center gap-3 group"
                    >
                      <span
                        className={`text-sm font-bold w-5 ${
                          idx === 0
                            ? 'text-yellow-400'
                            : idx === 1
                            ? 'text-gray-300'
                            : idx === 2
                            ? 'text-orange-400'
                            : 'text-gray-500'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      {builder.author_avatar ? (
                        <img
                          src={builder.author_avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-300">
                          {builder.author_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">
                          {builder.author_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {builder.total_upvotes} upvotes · {builder.post_count} projects
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Tags */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Tag size={18} className="text-purple-400" />
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 20).map((t) => (
                  <button
                    key={t.tag}
                    onClick={() => {
                      setSearchQuery(t.tag);
                    }}
                    className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                  >
                    {t.tag}
                    <span className="ml-1 opacity-50">{t.count}</span>
                  </button>
                ))}
                {popularTags.length === 0 && (
                  <p className="text-sm text-gray-500">No tags yet</p>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-xs opacity-50">{categoryCounts[cat.value] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
