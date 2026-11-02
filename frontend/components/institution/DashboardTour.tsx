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
                    <div className="bg-white text-[#14102b] p-6 rounded-2xl relative border border-[#e8e3f5] shadow-2xl">
                        {/* INDICATOR ARROW pointing to the target */}
                        <div className={`absolute w-6 h-6 bg-white border-l border-t border-[#e8e3f5] rotate-45 ${step.position === 'left' ? '-left-3 top-10 rotate-[-45deg]' :
                                step.position === 'bottom' ? '-top-3 left-1/2 -translate-x-1/2 rotate-[45deg]' :
                                    step.position === 'right' ? '-right-3 top-10 rotate-[135deg]' :
                                        '-bottom-3 left-1/2 -translate-x-1/2 rotate-[225deg]'
                            }`} />

                        <p className="mb-1 text-xs font-semibold text-[#6d3ff0]">Step {currentStep + 1} of {steps.length}</p>
                        <h3 className="text-lg font-bold mb-2 tracking-tight">{step.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            {step.content}
                        </p>

                        <div className="flex items-center justify-between gap-4">
                            <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-[#14102b] transition-colors">
                                Close
                            </button>
                            <div className="flex items-center gap-3">
                                {currentStep > 0 && (
                                    <button
                                        onClick={handleBack}
                                        className="px-4 py-2 border border-[#e8e3f5] rounded-xl text-sm font-semibold hover:bg-[#f6f3ff] transition-colors"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="px-5 py-2 bg-[#6d3ff0] text-white rounded-xl text-sm font-semibold hover:bg-[#5b30d6] transition-colors"
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

