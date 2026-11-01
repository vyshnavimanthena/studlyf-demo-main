import React, { useState } from 'react';
import { X, User, Mail, ShieldCheck, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JudgeInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (judge: { name: string; email: string; expertise: string }) => void;
    loading?: boolean;
}

const JudgeInviteModal: React.FC<JudgeInviteModalProps> = ({ isOpen, onClose, onInvite, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        expertise: ''
    });

    const resetForm = () => setFormData({ name: '', email: '', expertise: '' });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const email = formData.email.trim().toLowerCase();
        if (formData.name && email && formData.expertise) {
            onInvite({ ...formData, email });
            resetForm();
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Invite External Judge</h2>
                            <p className="text-sm text-slate-500 font-medium">Add a professional evaluator to your panel</p>
                        </div>
                        <button type="button" onClick={handleClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g. Dr. Sarah Chen"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6C3BFF]/10 focus:border-[#6C3BFF] transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="judge@university.com"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6C3BFF]/10 focus:border-[#6C3BFF] transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Specialization / Domain</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.expertise}
                                        onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                                        placeholder="e.g. Artificial Intelligence, CSE"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#6C3BFF]/10 focus:border-[#6C3BFF] transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button"
                                onClick={handleClose}
                                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-4 bg-[#6C3BFF] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Sending Invitation...' : (
                                    <>
                                        <Send size={16} /> Send Invitation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default JudgeInviteModal;

