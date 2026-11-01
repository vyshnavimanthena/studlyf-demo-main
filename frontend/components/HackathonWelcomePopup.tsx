import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
    open: boolean;
    onClose: () => void;
    onProblemStatements: () => void;
};

const HackathonWelcomePopup: React.FC<Props> = ({ open, onClose, onProblemStatements }) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                        className="relative w-full max-w-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow frame */}
                        <div className="absolute -inset-2 rounded-[2.75rem] blur-2xl opacity-70 bg-gradient-to-r from-[#22c55e]/35 via-[#6C3BFF]/35 to-[#22c55e]/35" />
                        <div className="relative bg-white rounded-[2.75rem] overflow-hidden shadow-2xl border border-white/60">
                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 z-10 w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                aria-label="Close"
                                title="Close"
                            >
                                <X size={18} />
                            </button>

                            {/* Image */}
                            <div className="bg-slate-50">
                                <img
                                    src="/popup.png"
                                    alt="AI Hackathon"
                                    loading="lazy"
                                    className="w-full h-auto block select-none"
                                    draggable={false}
                                />
                            </div>

                            {/* Footer CTA */}
                            <div className="p-5 sm:p-7 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-center sm:text-left">
                                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                        Hyderabad Biggest - AI Hackathon
                                    </div>
                                    <div className="text-sm font-black text-slate-900">
                                        Start with the problem statements, then submit your idea.
                                    </div>
                                </div>
                                <button
                                    onClick={onProblemStatements}
                                    className="w-full sm:w-auto px-7 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white bg-gradient-to-r from-[#22c55e] via-[#6C3BFF] to-[#22c55e] shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                                >
                                    Click here for Problem Statements
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HackathonWelcomePopup;


