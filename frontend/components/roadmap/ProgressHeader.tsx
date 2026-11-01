import React from 'react';
import { motion } from 'framer-motion';
import { RoadmapNodeData } from '../../data/roadmapData';

interface ProgressHeaderProps {
  completedNodes: string[];
  totalNodes: number;
  nextNode: RoadmapNodeData | null;
  activeNode: RoadmapNodeData | null;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ 
  completedNodes, 
  totalNodes, 
  nextNode,
  activeNode
}) => {
  const progressPercentage = totalNodes === 0 ? 0 : Math.round((completedNodes.length / totalNodes) * 100);

  return (
    <div className="sticky top-20 z-30 my-6 pointer-events-auto">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-md rounded-2xl px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
        
        {/* Left: Overall Progress */}
        <div className="flex flex-col w-full md:w-1/3">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Overview</span>
            <span className="text-sm font-bold text-[#1A1A1A]">{progressPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#6C2BFF] to-[#EC4899]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Center/Right: Current & Next Objectives */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto text-sm">
          {activeNode ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6C2BFF] animate-pulse" />
              <span className="text-gray-500 font-medium">Focusing on:</span>
              <span className="font-bold text-[#1A1A1A]">{activeNode.title}</span>
            </div>
          ) : nextNode ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-gray-500 font-medium">Up next:</span>
              <span className="font-bold text-[#1A1A1A]">{nextNode.title}</span>
            </div>
          ) : (
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500" />
               <span className="font-bold text-[#1A1A1A]">Roadmap Completed</span>
             </div>
          )}
        </div>
      </div>
      
      {/* Footer Note inline with header to save space, visible on large screens */}
      <div className="absolute right-4 bottom-[-24px] hidden md:block">
        <span className="text-[10px] text-gray-400 font-medium">Progress saved locally. No account required.</span>
      </div>
    </div>
  );
};

export default ProgressHeader;

