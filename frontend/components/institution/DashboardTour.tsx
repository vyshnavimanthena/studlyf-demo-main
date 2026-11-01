import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    tooltipPos: { top?: string; bottom?: string; left?: string; right?: string; transform?: string };
}

interface DashboardTourProps {
    isOpen: boolean;
    onClose: () => void;
}

const DashboardTour: React.FC<DashboardTourProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps: TourStep[] = [
        {
            targetId: 'host-engagement-btn',
            title: 'Host Engagements',
            content: 'Create and manage assessments, challenges, or job listings to engage candidates.',
            position: 'left',
            tooltipPos: { top: '75px', left: '280px' }
        },
        {
            targetId: 'stats-section',
            title: 'Track key metrics',
            content: 'Monitor statistics of how well your recruiter account is performing.',
            position: 'top',
            tooltipPos: { bottom: '450px', left: '50%', transform: 'translateX(-50%)' }
        },
        {
            targetId: 'team-manage-icon',
            title: 'Manage your team',
            content: 'Control who can access and manage your organizer account.',
            position: 'right',
            tooltipPos: { top: '100px', right: '80px' }
        },
        {
            targetId: 'alerts-panel',
            title: 'Stay on Top of Everything',
            content: 'This panel helps you manage it all—Alerts notify you of pending actions, Upcoming shows your scheduled rounds.',
            position: 'right',
            tooltipPos: { top: '450px', right: '450px' }
        }
    ];

    if (!isOpen) return null;

    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] pointer-events-none font-sans">
            {/* NO OVERLAY / NO SPOTLIGHT as requested */}

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute z-[2010] pointer-events-auto"
                    style={{
                        ...step.tooltipPos,
                        maxWidth: '340px',
                        filter: 'drop-shadow(0 25px 50px -12px rgba(0, 0, 0, 0.5))'
                    }}
                >
                    <div className="bg-[#0A1A2F] text-white p-8 rounded-[2.5rem] relative border border-slate-700/50 shadow-2xl">
                        {/* INDICATOR ARROW pointing to the target */}
                        <div className={`absolute w-6 h-6 bg-[#0A1A2F] border-l border-t border-slate-700/50 rotate-45 ${step.position === 'left' ? '-left-3 top-10 rotate-[-45deg]' :
                                step.position === 'bottom' ? '-top-3 left-1/2 -translate-x-1/2 rotate-[45deg]' :
                                    step.position === 'right' ? '-right-3 top-10 rotate-[135deg]' :
                                        '-bottom-3 left-1/2 -translate-x-1/2 rotate-[225deg]'
                            }`} />

                        <h3 className="text-xl font-black mb-3 tracking-tight">{step.title}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed mb-10 font-bold opacity-80">
                            {step.content}
                        </p>

                        <div className="flex items-center justify-between gap-8">
                            <button onClick={onClose} className="text-xs font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest">
                                Close
                            </button>
                            <div className="flex items-center gap-3">
                                {currentStep > 0 && (
                                    <button
                                        onClick={handleBack}
                                        className="px-8 py-3 bg-white text-[#0A1A2F] rounded-2xl text-xs font-black hover:bg-slate-100 transition-all uppercase tracking-widest"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="px-10 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest"
                                >
                                    {currentStep === steps.length - 1 ? 'Got it' : 'Next'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default DashboardTour;

