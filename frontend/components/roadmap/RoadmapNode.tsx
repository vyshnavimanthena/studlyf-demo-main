import React from 'react';
import { motion } from 'framer-motion';
import { RoadmapNodeData } from '../../data/roadmapData';
import { Check, ChevronRight } from 'lucide-react';

interface RoadmapNodeProps {
  node: RoadmapNodeData;
  isCompleted: boolean;
  isLocked: boolean;
  onClick: (node: RoadmapNodeData) => void;
  isLast: boolean;
}

const RoadmapNode: React.FC<RoadmapNodeProps> = ({ 
  node, 
  isCompleted, 
  isLocked, 
  onClick,
  isLast
}) => {
  return (
    <div className={`relative flex items-start gap-6 ${isLocked ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
      {/* Vertical Timeline Line */}
      {!isLast && (
        <div className="absolute left-[1.125rem] top-10 bottom-[-2.5rem] w-px bg-gray-200" />
      )}
      {!isLast && isCompleted && (
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 0.5 }}
          className="absolute left-[1.125rem] top-10 bottom-[-2.5rem] w-px bg-gradient-to-b from-green-400 to-[#6C2BFF]" 
        />
      )}

      {/* Node Indicator */}
      <div className="relative z-10 flex-shrink-0 mt-1">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          isCompleted 
            ? 'bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
            : isLocked
              ? 'bg-gray-100 border-gray-200 text-gray-300'
              : 'bg-white border-[#6C2BFF] text-[#6C2BFF] shadow-[0_0_15px_rgba(108,43,255,0.2)]'
        }`}>
          {isCompleted ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
        </div>
      </div>

      {/* Node Card */}
      <motion.div 
        whileHover={!isLocked ? { scale: 1.02, x: 5 } : {}}
        whileTap={!isLocked ? { scale: 0.98 } : {}}
        onClick={() => !isLocked && onClick(node)}
        className={`flex-1 p-5 rounded-2xl border mb-10 transition-all duration-300 cursor-pointer group ${
          isCompleted 
            ? 'bg-white border-green-100 shadow-sm' 
            : isLocked
              ? 'bg-gray-50/50 border-gray-100'
              : 'bg-white border-gray-100 shadow-md hover:border-[#6C2BFF]/30 hover:shadow-xl'
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`font-black text-lg transition-colors ${
              isCompleted ? 'text-gray-800' : isLocked ? 'text-gray-400' : 'text-[#1A1A1A] group-hover:text-[#6C2BFF]'
            }`}>
              {node.title}
            </h3>
            <p className={`text-sm mt-1 line-clamp-1 ${
              isCompleted ? 'text-gray-500' : isLocked ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {node.simpleExplanation}
            </p>
          </div>
          
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isCompleted 
              ? 'bg-green-50 text-green-500' 
              : isLocked
                ? 'bg-transparent text-transparent'
                : 'bg-gray-50 text-gray-400 group-hover:bg-[#6C2BFF]/10 group-hover:text-[#6C2BFF]'
          }`}>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoadmapNode;

