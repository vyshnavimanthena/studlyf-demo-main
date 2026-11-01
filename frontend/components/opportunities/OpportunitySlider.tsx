import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import OpportunityCard from './OpportunityCard';

interface OpportunitySliderProps {
    opportunities: any[];
    appliedIds: string[];
}

const OpportunitySlider: React.FC<OpportunitySliderProps> = ({ opportunities, appliedIds }) => {
    const [isPaused, setIsPaused] = useState(false);

    if (opportunities.length === 0) return null;

    // Duplicate opportunities for seamless loop
    const loopedOpportunities = [...opportunities, ...opportunities, ...opportunities];

    return (
        <div className="space-y-6 relative overflow-hidden">
            <style>
                {`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .pause-on-hover:hover .animate-marquee {
                    animation-play-state: paused;
                }
                `}
            </style>

            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        Opportunities for You
                        <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-600 text-[10px] rounded-full uppercase tracking-widest font-black animate-pulse">
                            <Sparkles size={12} /> Live
                        </span>
                    </h2>
                    <p className="text-sm font-bold text-slate-400">Handpicked roles based on your skills and interests</p>
                </div>
            </div>

            <div className="relative group pause-on-hover">
                <div className="flex gap-6 animate-marquee w-max py-4">
                    {loopedOpportunities.map((opp, idx) => (
                        <div key={`${opp._id}-${idx}`} className="flex-shrink-0">
                            <OpportunityCard 
                                opportunity={opp} 
                                isApplied={appliedIds.includes(opp._id)}
                            />
                        </div>
                    ))}
                </div>
                
                {/* Gradient Fades for depth */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/80 to-transparent z-10 pointer-events-none" />
            </div>
        </div>
    );
};

export default OpportunitySlider;

