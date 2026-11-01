import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Building2, ChevronRight, Zap } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const GoalSelector: React.FC = () => {
    const navigate = useNavigate();

    const goals = [
        {
            id: 'improve-core-skills',
            title: 'Improve Core Skills',
            desc: 'Clinical mastery of software engineering and systems design.',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-purple-500',
            path: '/learn/courses-overview'
        },
        {
            id: 'switch-domain',
            title: 'Switch My Domain',
            desc: 'Complete cross-functional pivot with verified architectural data.',
            icon: <Target className="w-6 h-6" />,
            color: 'bg-emerald-500',
            path: '/learn/courses-overview'
        },
        {
            id: 'crack-mnc-faang',
            title: 'Crack an MNC / FAANG',
            desc: 'Institutional-level preparation for global scale engineering.',
            icon: <Building2 className="w-6 h-6" />,
            color: 'bg-amber-500',
            path: '/job-prep/mock-interview'
        }
    ];

    const handleSelect = async (goal: typeof goals[0]) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                await fetch(`${API_BASE_URL}/api/student/goals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ goal: goal.id }),
                });
            }
        } catch {}
        navigate(goal.path);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-3 sm:px-6 pt-32 pb-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7C3AED]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full relative z-10 text-center">
                <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 text-[#7C3AED] px-4 py-1.5 rounded-full mb-8 border border-[#7C3AED]/10">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Initialized</span>
                </div>
                <h1 className="text-3xl sm:text-5xl sm:text-7xl font-black text-gray-900 mb-6 leading-[0.9] tracking-tighter uppercase italic">
                    What is your <br /><span className="text-[#7C3AED]">Atomic Goal?</span>
                </h1>
                <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
                    The Studlyf engine personalizes your verification flow based on your target outcome. Choose your primary objective to continue.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {goals.map((goal, i) => (
                        <motion.div key={goal.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }} whileHover={{ y: -8, scale: 1.02 }} onClick={() => handleSelect(goal)}
                            className="bg-white border border-gray-100 p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 cursor-pointer group text-left flex flex-col h-full hover:border-[#7C3AED]/20 transition-all"
                        >
                            <div className={`${goal.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-gray-200`}>{goal.icon}</div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-3 group-hover:text-[#7C3AED] transition-colors">{goal.title}</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8 flex-grow">{goal.desc}</p>
                            <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#7C3AED] transition-colors">Initialize Flow</span>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 group-hover:text-[#7C3AED] transition-all" />
                            </div>
                        </motion.div>
                    ))}
                </div>
                <p className="mt-16 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">SECURE INTERFACE • NON-BINDING SELECTION</p>
            </motion.div>
            <div className="fixed inset-0 bg-grid-black/[0.01] pointer-events-none" />
        </div>
    );
};

export default GoalSelector;

