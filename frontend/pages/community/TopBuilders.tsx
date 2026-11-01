import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import {
  Trophy,
  Loader2,
  ArrowLeft,
  FolderOpen,
  Flame,
  ArrowUp,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

interface Builder {
  user_id: string;
  author_name: string;
  author_avatar?: string;
  total_upvotes: number;
  post_count: number;
}

function getRankStyle(rank: number) {
  if (rank === 1)
    return {
      bg: 'bg-gradient-to-br from-yellow-500/20 via-yellow-600/10 to-amber-500/5',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      badge: 'bg-yellow-500 text-black',
      shadow: 'shadow-yellow-500/20',
      icon: <Crown size={20} className="text-yellow-400" />,
    };
  if (rank === 2)
    return {
      bg: 'bg-gradient-to-br from-gray-300/10 via-gray-400/5 to-slate-500/5',
      border: 'border-gray-400/30',
      text: 'text-gray-300',
      badge: 'bg-gray-400 text-black',
      shadow: 'shadow-gray-400/20',
      icon: <Medal size={20} className="text-gray-300" />,
    };
  if (rank === 3)
    return {
      bg: 'bg-gradient-to-br from-orange-500/15 via-orange-600/5 to-amber-600/5',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      badge: 'bg-orange-500 text-black',
      shadow: 'shadow-orange-500/20',
      icon: <Medal size={20} className="text-orange-400" />,
    };
  return {
    bg: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-gray-400',
    badge: 'bg-white/10 text-gray-300',
    shadow: '',
    icon: null,
  };
}

function getOrdinalSuffix(rank: number): string {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 animate-pulse">
      <div className="w-8 h-5 bg-white/10 rounded" />
      <div className="w-10 h-10 bg-white/10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="w-32 h-4 bg-white/10 rounded" />
        <div className="flex gap-3">
          <div className="w-20 h-3 bg-white/10 rounded" />
          <div className="w-16 h-3 bg-white/10 rounded" />
        </div>
      </div>
      <div className="w-20 h-8 bg-white/10 rounded-lg" />
    </div>
  );
}

function PodiumCard({
  builder,
  rank,
}: {
  builder: Builder;
  rank: number;
}) {
  const style = getRankStyle(rank);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.15, type: 'spring', stiffness: 100 }}
      className={`${style.bg} border ${style.border} rounded-xl overflow-hidden ${
        rank === 1 ? 'order-2 -mt-4' : rank === 2 ? 'order-1' : 'order-3'
      }`}
    >
      <div className="p-4 sm:p-6 text-center">
        {/* Rank Badge */}
        <div className="flex justify-center mb-3">
          <div
            className={`w-12 h-12 rounded-full ${style.badge} flex items-center justify-center text-lg font-bold shadow-lg ${style.shadow}`}
          >
            #{rank}
          </div>
        </div>

        {/* Avatar */}
        {builder.author_avatar ? (
          <img
            src={builder.author_avatar}
            alt=""
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-white/10"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-purple-600/30 flex items-center justify-center text-3xl font-bold text-purple-300 mx-auto mb-3 border-2 border-white/10">
            {builder.author_name?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Name */}
        <Link
          to={`/profile/${builder.user_id}`}
          className="font-semibold text-white hover:text-purple-300 transition-colors text-base truncate block"
        >
          {builder.author_name}
        </Link>

        {/* Stats */}
        <div className="mt-4 space-y-2">
          <div className={`flex items-center justify-center gap-1.5 ${style.text}`}>
            <ArrowUp size={16} />
            <span className="text-xl font-bold">{builder.total_upvotes}</span>
            <span className="text-xs opacity-70">upvotes</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FolderOpen size={12} />
              {builder.post_count}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TopBuilders() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuilders();
  }, []);

  const loadBuilders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/top-builders`, {
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setBuilders(data.builders || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const totalUpvotes = builders.reduce((sum, b) => sum + b.total_upvotes, 0);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pt-24">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-400" size={24} />
              Top Builders
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Most upvoted project creators in the community
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Users className="mx-auto mb-1 text-purple-400" size={20} />
            <p className="text-2xl font-bold text-white">
              {builders.length}
            </p>
            <p className="text-xs text-gray-500">Builders</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <ArrowUp className="mx-auto mb-1 text-green-400" size={20} />
            <p className="text-2xl font-bold text-white">
              {totalUpvotes}
            </p>
            <p className="text-xs text-gray-500">Total Upvotes</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {/* Podium skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 animate-pulse">
                  <div className="w-12 h-12 bg-white/10 rounded-full mx-auto mb-3" />
                  <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-3" />
                  <div className="w-24 h-4 bg-white/10 rounded mx-auto mb-2" />
                  <div className="w-16 h-3 bg-white/10 rounded mx-auto" />
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </div>
        ) : builders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Flame className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="text-gray-400 text-lg mb-2">No builders yet</p>
            <p className="text-gray-500 text-sm">
              Be the first to submit a project and claim the top spot!
            </p>
            <Link
              to="/community/submit"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Submit Project
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
              {builders.slice(0, 3).map((builder, idx) => {
                const rank = idx + 1;
                return (
                  <PodiumCard
                    key={builder.user_id}
                    builder={builder}
                    rank={rank}
                  />
                );
              })}
            </div>

            {/* Rest of List */}
            {builders.length > 3 && (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/5">
                  <h3 className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                    <TrendingUp size={14} />
                    More Builders
                  </h3>
                </div>
                {builders.slice(3).map((builder, idx) => {
                  const rank = idx + 4;
                  return (
                    <motion.div
                      key={builder.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (idx + 3) * 0.04 }}
                      className="border-b border-white/5 last:border-b-0"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-white/5 transition-colors">
                        <span className="text-sm font-bold text-gray-500 w-8 text-center">
                          #{rank}
                        </span>
                        {builder.author_avatar ? (
                          <img
                            src={builder.author_avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">
                            {builder.author_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/profile/${builder.user_id}`}
                              className="font-medium text-white hover:text-purple-300 transition-colors text-sm"
                            >
                              {builder.author_name}
                            </Link>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <ArrowUp size={12} className="text-green-400" />
                              {builder.total_upvotes} upvotes
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <FolderOpen size={12} />
                              {builder.post_count} projects
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* How to earn upvotes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-purple-600/10 to-purple-800/10 border border-purple-500/20 rounded-xl p-4 sm:p-6 mt-8"
            >
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Star size={18} className="text-yellow-400" />
                How to earn upvotes
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">1.</span>
                  Submit quality projects to the community
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">2.</span>
                  Include clear descriptions, demos, and source code
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">3.</span>
                  Share on social media to get more visibility
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">4.</span>
                  Engage with other builders and leave helpful comments
                </li>
              </ul>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
