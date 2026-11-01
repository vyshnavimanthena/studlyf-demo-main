import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapNodeData } from '../../data/roadmapData';
import { ExternalLink, X, CheckCircle2, Sparkles, BookOpen, Brain, Lightbulb, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';

interface FocusPanelProps {
  node: RoadmapNodeData | null;
  isOpen: boolean;
  onClose: () => void;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  allNodes?: RoadmapNodeData[];
  onSelectNode?: (node: RoadmapNodeData) => void;
}

const FocusPanel: React.FC<FocusPanelProps> = ({ 
  node, 
  isOpen, 
  onClose, 
  isCompleted, 
  onToggleComplete,
  allNodes = [],
  onSelectNode
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Scroll to top whenever the selected node changes
  useEffect(() => {
    if (node && contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [node?.id]);

  // Derive current node index, previous node, and next node
  const currentIndex = node && allNodes.length > 0 ? allNodes.findIndex(n => n.id === node.id) : -1;
  const prevNode = currentIndex > 0 ? allNodes[currentIndex - 1] : null;
  const nextNode = currentIndex >= 0 && currentIndex < allNodes.length - 1 ? allNodes[currentIndex + 1] : null;

  const handleGoToNext = () => {
    if (!node) return;
    if (!isCompleted) {
      onToggleComplete(node.id);
    }
    if (nextNode && onSelectNode) {
      onSelectNode(nextNode);
    }
  };

  const handleGoToPrev = () => {
    if (prevNode && onSelectNode) {
      onSelectNode(prevNode);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && node && (
        <>
          {/* Backdrop with high z-index to stay above floating navbar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-[#0A0514]/60 backdrop-blur-md transition-opacity"
          />

          {/* Slide-out Panel / Full Page View on Mobile */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-[201] w-full max-w-full sm:max-w-xl md:max-w-2xl bg-white shadow-[0_0_60px_rgba(108,43,255,0.2)] flex flex-col overflow-hidden border-l border-gray-100 font-sans"
          >
            {/* Sticky Panel Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6C2BFF]/10 text-[#6C2BFF] text-[11px] font-black uppercase tracking-[0.2em] rounded-full">
                  <Sparkles className="w-3 h-3" /> Execution Workspace
                </span>
                {currentIndex !== -1 && allNodes.length > 0 && (
                  <span className="hidden sm:inline-block text-[11px] font-bold text-gray-400">
                    Topic {currentIndex + 1} of {allNodes.length}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous & Next Quick Nav in Header */}
                {allNodes.length > 0 && (
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200">
                    <button
                      onClick={handleGoToPrev}
                      disabled={!prevNode}
                      className={`p-1.5 rounded-full transition-all border-none ${
                        prevNode 
                          ? 'hover:bg-white text-gray-700 hover:text-[#6C2BFF] cursor-pointer shadow-sm' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      title={prevNode ? `Previous: ${prevNode.title}` : "First Topic"}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => nextNode && onSelectNode && onSelectNode(nextNode)}
                      disabled={!nextNode}
                      className={`p-1.5 rounded-full transition-all border-none ${
                        nextNode 
                          ? 'hover:bg-white text-gray-700 hover:text-[#6C2BFF] cursor-pointer shadow-sm' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      title={nextNode ? `Next: ${nextNode.title}` : "Last Topic"}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button 
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs transition-all hover:scale-105 cursor-pointer border-none ml-1"
                  title="Close Workspace"
                >
                  <span>Close</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Workspace Body */}
            <div ref={contentRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#FAFBFD]">
              
              {/* Title Header */}
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span>CHAPTER TOPIC</span>
                    <span>•</span>
                    <span className="text-[#6C2BFF]">Interactive Module</span>
                  </div>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#111827] tracking-tight leading-tight mb-3">
                  {node.title}
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-[#6C2BFF] to-[#EC4899] rounded-full" />
              </div>

              {/* Simple Explanation Card */}
              <div className="bg-gradient-to-br from-[#6C2BFF]/5 via-purple-50/50 to-white p-6 rounded-2xl border border-[#6C2BFF]/15 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#6C2BFF]/5 rounded-bl-full pointer-events-none" />
                <span className="text-[10px] font-black text-[#6C2BFF] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#6C2BFF]" /> 
                  Simple Explanation
                </span>
                <p className="text-gray-800 font-medium leading-relaxed text-base">
                  {node.simpleExplanation || (node as any).description}
                </p>
              </div>

              {/* Why This Matters */}
              {(node.whyItMatters || (node as any).description) && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Why This Matters
                  </span>
                  <p className="text-gray-700 font-medium leading-relaxed text-sm">
                    {node.whyItMatters || (node as any).description}
                  </p>
                </div>
              )}

              {/* What You Actually Need To Learn */}
              {((node.keyConcepts?.length > 0) || ((node as any).executionSteps?.length > 0)) && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#6C2BFF]" />
                    What You Actually Need To Learn
                  </span>
                  <div className="space-y-3">
                    {(node.keyConcepts || (node as any).executionSteps || []).map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#6C2BFF]/30 transition-colors">
                        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#6C2BFF]/10 text-[#6C2BFF] flex items-center justify-center text-xs font-black mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-800 leading-snug pt-0.5">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Resources */}
              {((node.resources?.length > 0) || (node as any).docLink) && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Curated Learning Resources
                  </span>
                  <div className="space-y-3">
                    {node.resources ? node.resources.map((res, idx) => {
                      const tagColors = {
                        "Best Starting Point": "bg-emerald-50 text-emerald-700 border-emerald-200",
                        "Official Docs": "bg-blue-50 text-blue-700 border-blue-200",
                        "Beginner Friendly": "bg-purple-50 text-purple-700 border-purple-200",
                        "Practice Resource": "bg-amber-50 text-amber-700 border-amber-200",
                        "Advanced Reading": "bg-rose-50 text-rose-700 border-rose-200"
                      };
                      const colorClass = tagColors[res.type as keyof typeof tagColors] || "bg-gray-100 text-gray-700 border-gray-200";

                      return (
                        <a 
                          key={idx}
                          href={res.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 border border-gray-200 p-4 rounded-xl hover:bg-white hover:border-[#6C2BFF] hover:shadow-[0_4px_20px_rgba(108,43,255,0.1)] transition-all group cursor-pointer"
                        >
                          <span className="text-sm font-bold text-[#111827] group-hover:text-[#6C2BFF] transition-colors line-clamp-1">
                            {res.title}
                          </span>
                          <div className="flex items-center gap-3 justify-between sm:justify-end">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${colorClass} whitespace-nowrap`}>
                              {res.type}
                            </span>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#6C2BFF] transition-colors flex-shrink-0" />
                          </div>
                        </a>
                      );
                    }) : (
                      <a 
                        href={(node as any).docLink?.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl hover:bg-white hover:border-[#6C2BFF] hover:shadow-md transition-all group cursor-pointer"
                      >
                        <span className="text-sm font-bold text-[#111827] group-hover:text-[#6C2BFF] transition-colors">
                          {(node as any).docLink?.title}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#6C2BFF] transition-colors" />
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Sticky Footer CTA - Actions Bar */}
            <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md p-6 border-t border-gray-100 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Mark as Complete Toggle */}
                <button
                  onClick={() => onToggleComplete(node.id)}
                  className={`w-full sm:w-1/2 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isCompleted 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
                    </>
                  ) : (
                    'Mark As Complete'
                  )}
                </button>

                {/* Next Topic CTA Button */}
                {nextNode ? (
                  <button
                    onClick={handleGoToNext}
                    className="w-full sm:w-1/2 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider bg-[#6C2BFF] text-white hover:bg-[#5B21D6] shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer border-none"
                  >
                    <span>{isCompleted ? "Next Topic" : "Complete & Next"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!isCompleted) onToggleComplete(node.id);
                      onClose();
                    }}
                    className="w-full sm:w-1/2 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all cursor-pointer border-none"
                  >
                    <span>Finish Roadmap</span>
                    <PartyPopper className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FocusPanel;



