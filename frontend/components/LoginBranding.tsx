
import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, Activity, Database } from 'lucide-react';
import InteractiveCreature from './InteractiveCreature';

const LoginBranding: React.FC = () => {
    return (
        <div className="w-full flex items-center justify-center relative overflow-hidden h-full py-8">
            {/* Background Digital Rain / Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

            <div className="relative w-full max-w-sm flex flex-col items-center justify-between h-full gap-8 z-10">
                {/* 1. TOP: Floating System Stats */}
                <div className="w-full grid grid-cols-2 gap-3">
                    {[
                        { icon: Terminal, label: "Kernel", val: "v2.0.4" },
                        { icon: Cpu, label: "Sync", val: "99.8%" },
                        { icon: Activity, label: "Uptime", val: "24/7" },
                        { icon: Database, label: "Data", val: "Encrypted" }
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md flex items-center gap-3"
                        >
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <stat.icon size={14} className="text-purple-400" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter truncate">{stat.label}</div>
                                <div className="text-[10px] font-black text-white truncate">{stat.val}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 2. MIDDLE: The AI Monitor */}
                <div className="w-full relative flex-grow flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-[32px] p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
                    >
                        {/* Scanning Line */}
                        <motion.div
                            animate={{ top: ['-10%', '110%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-[2px] bg-purple-500/50 blur-sm z-20"
                        />

                        <div className="flex flex-col items-center text-center pt-0 pb-2 relative">
                            <div className="relative -mt-10 mb-2">
                                <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full animate-pulse" />
                                <InteractiveCreature variant="purple" className="scale-[0.5] origin-center" />
                            </div>
                            <div className="space-y-2 relative z-10 mt-12">
                                <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none group-hover:text-purple-400 transition-colors">
                                    Architect <span className="text-purple-400 italic font-medium">Login</span>
                                </h2>
                                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest opacity-60">
                                    Biometric interface ready
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 3. BOTTOM: Boot Log Snippet */}
                <div className="w-full bg-black/40 rounded-2xl p-4 border border-white/10 font-mono text-[9px] space-y-1.5 opacity-70">
                    <div className="flex gap-2 text-emerald-500">
                        <span className="shrink-0">[OK]</span>
                        <span>Service: Auth_Vault_Secure</span>
                    </div>
                    <div className="flex gap-2 text-purple-400">
                        <span className="shrink-0">[WAIT]</span>
                        <span>Initializing profile_nexus...</span>
                    </div>
                    <div className="flex gap-2 text-gray-500">
                        <span className="shrink-0">[INFO]</span>
                        <span>User session established via IPV6_LOCAL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBranding;

