import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapChapter, RoadmapNodeData } from '../../data/roadmapData';
import RoadmapNode from './RoadmapNode';
import { CheckCircle, Lock } from 'lucide-react';

interface ChapterAccordionProps {
  chapter: RoadmapChapter;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
  completedNodes: string[];
  onNodeClick: (node: RoadmapNodeData) => void;
  chapterIndex?: number;
}

const ChapterAccordion: React.FC<ChapterAccordionProps> = ({
  chapter,
  isActive,
  isPast,
  isFuture,
  completedNodes,
  onNodeClick,
  chapterIndex = 0
}) => {
  const isChapterComplete = chapter.nodes.every(node => completedNodes.includes(node.id));

  // Extract clean number from chapter ID (e.g., chapter-fullstack-01 -> "1") or fallback to index + 1
  const numberMatch = chapter.id.match(/\d+/);
  const phaseNum = numberMatch ? String(parseInt(numberMatch[0], 10)) : String(chapterIndex + 1);

  return (
    <div className={`mb-8 transition-all duration-500 ${isFuture ? 'opacity-50' : 'opacity-100'}`}>
      
      {/* Chapter Header */}
      <div className={`flex items-center gap-4 mb-6 p-4 rounded-2xl border ${
        isActive 
          ? 'bg-gradient-to-r from-[#6C2BFF]/5 to-transparent border-[#6C2BFF]/20 shadow-sm' 
          : isPast
            ? 'bg-emerald-50/50 border-emerald-100'
            : 'bg-gray-50 border-gray-100'
      }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0 shadow-sm ${
          isActive 
            ? 'bg-[#6C2BFF] text-white' 
            : isPast
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-200 text-gray-400'
        }`}>
          {isPast ? <CheckCircle className="w-6 h-6" /> : isFuture ? <Lock className="w-6 h-6" /> : phaseNum}
        </div>
        
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-black uppercase tracking-widest block mb-0.5 ${
            isActive ? 'text-[#6C2BFF]' : isPast ? 'text-emerald-600' : 'text-gray-400'
          }`}>
            {isPast ? 'Completed Phase' : isFuture ? 'Locked Phase' : 'Current Phase'}
          </span>
          <h2 className={`text-xl sm:text-2xl font-black leading-tight ${
            isFuture ? 'text-gray-400' : 'text-[#111827]'
          }`}>
            {chapter.title}
          </h2>
        </div>
      </div>

      {/* Nodes Container */}
      <AnimatePresence initial={false}>
        {(isActive || isPast) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="pl-6 md:pl-10 pt-2 overflow-hidden"
          >
            {chapter.nodes.map((node, idx) => {
              const isNodeCompleted = completedNodes.includes(node.id);
              // A node is locked if it's in a future chapter (handled at chapter level usually)
              // Or if the previous node in THIS chapter isn't completed.
              // For simplicity of progressive disclosure: you can only click a node if all previous nodes in the entire roadmap are completed.
              // But we can just pass down the locked state.
              const isLocked = isFuture; // In this design, we lock future chapters. Within active chapter, all nodes are clickable, or we can restrict it. We'll leave it unrestricted within the active chapter for better UX.

              return (
                <RoadmapNode
                  key={node.id}
                  node={node}
                  isCompleted={isNodeCompleted}
                  isLocked={isLocked}
                  onClick={onNodeClick}
                  isLast={idx === chapter.nodes.length - 1}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChapterAccordion;

