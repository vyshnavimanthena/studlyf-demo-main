import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import InteractiveCreature from './InteractiveCreature';

interface AuthLayoutProps {
    children: React.ReactNode;
    branding?: React.ReactNode;
    fullWidth?: boolean;
    title?: React.ReactNode;
    subtitle?: string;
    tags?: string[];
    creatureVariant?: 'purple' | 'indigo' | 'emerald' | 'amber';
    /** When true, branding column shrinks and form column grows — ideal for institution signup */
    wideForm?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    branding,
    fullWidth = false,
    title = (
        <>
            Own Your <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                Capability.
            </span>
        </>
    ),
    subtitle = 'Access your dashboard and career tools.',
    tags = ['Verified Skills', 'Career Growth', 'Elite Talent'],
    creatureVariant = 'purple',
    wideForm = false,
}) => {
    const glowColor =
        creatureVariant === 'emerald'
            ? 'bg-emerald-600/10'
            : creatureVariant === 'amber'
            ? 'bg-amber-600/10'
            : creatureVariant === 'indigo'
            ? 'bg-indigo-600/10'
            : 'bg-purple-600/10';

    const tagColor =
        creatureVariant === 'emerald'
            ? 'text-emerald-300/80'
            : creatureVariant === 'indigo'
            ? 'text-indigo-300/80'
            : 'text-purple-300/80';

    const creatureGlow =
        creatureVariant === 'emerald'
            ? 'bg-emerald-500/20'
            : creatureVariant === 'indigo'
            ? 'bg-indigo-500/20'
            : 'bg-purple-500/20';

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#09090b_100%)] overflow-x-hidden py-10 px-4 sm:px-6">
            {/* Top Logo */}
            <Link
                to="/"
                className="absolute top-6 left-6 z-50 group transition-transform active:scale-95"
            >
                <div className="flex items-center bg-white border border-white/20 px-3 py-1.5 rounded-2xl shadow-lg backdrop-blur-md">
                    <img
                        src="/images-optimized/studlyf_secondary.webp"
                        alt="STUDLYF Logo"
                        className="h-8 sm:h-10 w-auto object-contain drop-shadow-sm group-hover:opacity-80 transition-opacity"
                    />
                </div>
            </Link>

            {/* Background glow */}
            <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[140px] pointer-events-none ${glowColor}`}
            />

            {fullWidth ? (
                <div className="relative z-10 w-full max-w-[1400px] flex items-center justify-center min-h-[70vh]">
                    {children}
                </div>
            ) : (
                <div className="relative z-10 w-full max-w-[1500px] flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 pt-16 lg:pt-0">

                    {/* ── Branding column ── */}
                    {branding ? (
                        branding
                    ) : (
                        <div
                            className={`hidden lg:flex flex-col text-center space-y-8 shrink-0 ${
                                wideForm ? 'lg:w-[28%] lg:pl-6' : 'lg:w-[35%] lg:pl-10'
                            }`}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="flex justify-center"
                            >
                                <div className="relative">
                                    <InteractiveCreature
                                        variant={creatureVariant}
                                        className={`origin-center ${wideForm ? 'scale-100 lg:scale-[1.15]' : 'scale-110 lg:scale-[1.35]'}`}
                                    />
                                    <div
                                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl -z-10 ${creatureGlow}`}
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="space-y-4"
                            >
                                <h2
                                    className={`font-black text-white leading-[1.1] tracking-tight ${
                                        wideForm
                                            ? 'text-3xl sm:text-4xl lg:text-5xl'
                                            : 'text-4xl sm:text-5xl lg:text-6xl'
                                    }`}
                                >
                                    {title}
                                </h2>
                                <p className="text-gray-400 text-base lg:text-lg max-w-xs mx-auto font-medium leading-relaxed">
                                    {subtitle}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap gap-2 justify-center"
                            >
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className={`px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] backdrop-blur-sm ${tagColor}`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    {/* ── Auth card column ── */}
                    <div
                        className={`w-full flex justify-center min-w-0 ${
                            wideForm ? 'lg:w-[72%]' : 'lg:w-[65%]'
                        }`}
                    >
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthLayout;

