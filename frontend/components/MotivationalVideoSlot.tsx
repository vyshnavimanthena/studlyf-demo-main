import React from 'react';
import { PlayCircle, Sparkles } from 'lucide-react';

interface MotivationalVideoSlotProps {
  title?: string;
  subtitle?: string;
  videoUrl?: string; // Add your local video path here
}

const MotivationalVideoSlot: React.FC<MotivationalVideoSlotProps> = ({
  title = "Today's Learning Motivation",
  subtitle = "Start your day with a mindset shift before learning.",
  videoUrl = "" // Empty by default so user can inject local video
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#6C2BFF]/5 to-[#EC4899]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Text Content */}
      <div className="flex-1 relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#6C2BFF]/10 text-[#6C2BFF] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3 h-3" /> Daily Boost
        </div>
        <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-2">{title}</h3>
        <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
      </div>

      {/* Video Container (Compact & Premium) */}
      <div className="w-full md:w-[320px] aspect-video bg-gray-900 rounded-2xl overflow-hidden relative shadow-lg group-hover:shadow-[0_15px_40px_rgba(108,43,255,0.15)] transition-all duration-500 border border-gray-100">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            controls 
            preload="none"
            controlsList="nodownload"
            className="w-full h-full object-cover"
            poster="/stud.png" 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8F9FC] border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[#6C2BFF] group-hover:text-white transition-all text-[#6C2BFF] duration-300">
              <PlayCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-400">Video Slot (Local)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotivationalVideoSlot;

