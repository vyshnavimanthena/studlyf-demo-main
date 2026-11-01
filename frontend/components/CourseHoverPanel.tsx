import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, BookOpen, Check, Clock, BarChart3, Calendar } from 'lucide-react';

interface CourseHoverPanelProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
  userState: 'NOT_PURCHASED' | 'IN_CART' | 'ENROLLED';
  onAddToCart?: () => void;
  onGoToCart?: () => void;
  onGotoCourse?: () => void;
  loading?: boolean;
}

const CourseHoverPanel: React.FC<CourseHoverPanelProps> = ({
  course,
  isOpen,
  onClose,
  userState,
  onAddToCart,
  onGoToCart,
  onGotoCourse,
  loading = false,
}) => {
  const rating = course.rating || 4.5;
  const reviews = course.total_reviews || 0;
  const price = course.price || 0;
  const totalHours = course.total_hours || course.duration || '12 weeks';
  const level = course.level || course.difficulty || 'Intermediate';
  const topics = course.key_topics || course.skills || ['System Design', 'Architecture', 'Performance'];
  const lastUpdated = course.last_updated || 'Recently updated';
  const instructor = course.instructor || course.role_tag || 'Engineering Standards';

  const ratingPercentage = (rating / 5) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-auto bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-start justify-between z-10">
                <div className="flex-1">
                  <div className="text-xs font-black text-[#7C3AED] uppercase tracking-[0.3em] mb-2">
                    {instructor}
                  </div>
                  <h2 className="text-3xl font-black text-[#111827] tracking-tight mb-2">{course.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4 flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Rating & Price Bar */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    {/* Star Rating */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-4 h-4 rounded-full transition-colors ${
                                i < Math.floor(rating)
                                  ? 'bg-yellow-400'
                                  : i < rating
                                  ? 'bg-yellow-300'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-black text-sm text-[#111827]">{rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-500">({reviews} reviews)</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    {price > 0 ? (
                      <>
                        <div className="text-3xl font-black text-[#111827]">${price.toFixed(2)}</div>
                      </>
                    ) : (
                      <div className="text-2xl font-black text-[#7C3AED]">FREE</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-black text-[#7C3AED] uppercase tracking-[0.2em] mb-2">Overview</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Clock className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    <div className="text-xs font-black text-[#111827] uppercase tracking-wider">{totalHours}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <BarChart3 className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    <div className="text-xs font-black text-[#111827] uppercase tracking-wider">{level}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Calendar className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    <div className="text-xs font-black text-[#111827] uppercase tracking-wider">Updated</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{lastUpdated}</div>
                  </div>
                </div>

                {/* Key Topics */}
                <div>
                  <h3 className="text-sm font-black text-[#7C3AED] uppercase tracking-[0.2em] mb-3">What You'll Learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {topics.map((topic: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                        </div>
                        <span className="text-sm text-gray-700">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-[10px] text-gray-500 uppercase tracking-widest border-t border-gray-100 pt-4">
                  Last updated: {lastUpdated}
                </div>
              </div>

              {/* CTA Section */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 space-y-3">
                {userState === 'NOT_PURCHASED' && (
                  <button
                    onClick={onAddToCart}
                    disabled={loading}
                    className="w-full py-4 bg-[#7C3AED] text-white font-black text-sm uppercase tracking-[0.3em] rounded-xl hover:bg-[#6D28D9] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7C3AED]/30 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {loading ? 'Adding...' : 'Add to Cart'}
                  </button>
                )}

                {userState === 'IN_CART' && (
                  <button
                    onClick={onGoToCart}
                    disabled={loading}
                    className="w-full py-4 bg-[#111827] text-white font-black text-sm uppercase tracking-[0.3em] rounded-xl hover:bg-[#1F2937] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                  >
                    Go to Cart
                  </button>
                )}

                {userState === 'ENROLLED' && (
                  <button
                    onClick={onGotoCourse}
                    disabled={loading}
                    className="w-full py-4 bg-green-600 text-white font-black text-sm uppercase tracking-[0.3em] rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Go to Course
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-bold text-sm uppercase tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CourseHoverPanel;

