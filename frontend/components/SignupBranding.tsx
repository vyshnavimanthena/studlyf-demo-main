
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Target, Orbit, Zap, ShieldCheck, Trophy, Globe, Flame } from 'lucide-react';
import InteractiveCreature from './InteractiveCreature';

const SignupBranding: React.FC = () => {
    return (
        <div className="w-full flex items-center justify-center relative overflow-hidden h-full py-4">
            {/* Background Constellation Effect */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-px h-px bg-white rounded-full shadow-[0_0_15px_1px_rgba(255,255,255,0.8)] animate-pulse" />
                <div className="absolute top-1/2 left-1/3 w-px h-px bg-white rounded-full shadow-[0_0_15px_1px_rgba(255,255,255,0.6)] animate-pulse delay-700" />
                <div className="absolute bottom-1/4 left-1/2 w-px h-px bg-white rounded-full shadow-[0_0_10px_1px_rgba(255,255,255,0.4)] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-between h-full gap-4">

                {/* 1. TOP: Main Visual: Clean Circular Badge Layout */}
                <div className="w-full relative h-[360px] flex items-center justify-center flex-grow">
                    {/* Center Avatar/Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
                        <motion.div
                            initial={{ rotate: -15, scale: 0.8 }}
                            animate={{
                                rotate: [0, 5, -5, 0],
                                y: [0, -8, 8, 0]
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="group"
                        >
                            <InteractiveCreature variant="purple" className="scale-[0.85] origin-center transition-all group-hover:scale-[0.95]" />
                        </motion.div>
                    </div>

                    {/* Organized Skill Badges - Robust Centered Absolute Positioning */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {[
                            { icon: Trophy, color: 'indigo', label: "Win", ox: 0, oy: -125, delay: 0.5 },
                            { icon: Zap, color: 'purple', label: "Elite", ox: -82, oy: -105, delay: 0.6 },
                            { icon: Sparkles, color: 'purple', label: "Growth", ox: 82, oy: -105, delay: 0.7 },
                            { icon: Globe, color: 'indigo', label: "Global", ox: -122, oy: -8, delay: 0.8 },
                            { icon: Target, color: 'purple', label: "Focus", ox: 122, oy: -8, delay: 0.9 },
                            { icon: ShieldCheck, color: 'indigo', label: "Verified", ox: -52, oy: 85, delay: 1.0 },
                            { icon: Orbit, color: 'purple', label: "Skills", ox: 52, oy: 85, delay: 1.1 },
                            { icon: Compass, color: 'indigo', label: "Future", ox: -52, oy: 150, delay: 1.2 },
                            { icon: Flame, color: 'purple', label: "Hot", ox: 52, oy: 150, delay: 1.3 }
                        ].map((p) => (
                            <div
                                key={p.label}
                                style={{
                                    position: 'absolute',
                                    left: `calc(50% + ${p.ox}px)`,
                                    top: `calc(50% + ${p.oy}px)`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                className="pointer-events-auto"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        y: [0, -4, 4, 0]
                                    }}
                                    whileHover={{ scale: 1.1, filter: "brightness(1.1)" }}
                                    transition={{
                                        opacity: { delay: p.delay, duration: 0.4 },
                                        scale: { delay: p.delay, type: "spring", stiffness: 100, damping: 15 },
                                        y: {
                                            repeat: Infinity,
                                            duration: 4 + Math.random() * 2,
                                            ease: "easeInOut"
                                        }
                                    }}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md shadow-xl hover:shadow-2xl hover:from-white/15 transition-all cursor-pointer"
                                >
                                    <p.icon size={15} className={`text-${p.color}-300`} strokeWidth={1.5} />
                                    <span className="text-[8.5px] font-black text-white uppercase tracking-[0.15em]">{p.label}</span>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. BOTTOM: Content Card - Enhanced */}
                <div className="w-full space-y-6 bg-gradient-to-br from-black/40 to-black/20 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.7 }}
                        className="space-y-3"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-thin tracking-tighter text-white leading-tight">
                            THE <br className="hidden lg:block" />
                            <span className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-400">EVOLUTION.</span>
                        </h2>
                        <p className="text-gray-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] opacity-90 max-w-sm mx-auto leading-relaxed">
                            Begin your journey toward global recognition and elite opportunities.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.85 }}
                        className="flex gap-3 justify-center flex-wrap"
                    >
                        <div className="px-6 py-2.5 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-400/40 rounded-full text-[8px] sm:text-[9px] font-black text-purple-300 uppercase tracking-[0.15em] shadow-lg shadow-purple-500/20 backdrop-blur-sm">
                            New Era
                        </div>
                        <div className="px-6 py-2.5 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-400/40 rounded-full text-[8px] sm:text-[9px] font-black text-purple-300 uppercase tracking-[0.15em] shadow-lg shadow-purple-500/20 backdrop-blur-sm">
                            Launch 1.0
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SignupBranding;

