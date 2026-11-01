
import React, { useState, useEffect } from 'react';
import { 
    Users, Mail, ShieldCheck, Trash2, UserPlus, 
    Search, Filter, ChevronRight, Gavel, MailCheck,
    Clock, AlertCircle, RefreshCw, Link, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import JudgeInviteModal from './components/JudgeInviteModal';
import { getJudgeStatusById, getJudgeStatusColor, getJudgeStatusIcon, getJudgeStatusLabel } from '../../utils/judgeStatuses';

const JudgeManagement: React.FC = () => {
    const [judges, setJudges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    const fetchJudges = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/judges`, {
                headers: { ...authHeaders() }
            });
            if (res.ok) {
                const data = await res.json();
                setJudges(data || []);
            }
        } catch (error) {
            try { console.error('Failed to fetch judges:', error instanceof Error ? error.message : String(error)); } catch (_) {}
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJudges();
    }, []);

    const handleInviteJudge = async (judgeData: any) => {
        setIsInviting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/judges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    ...judgeData,
                    is_test: false
                })
            });

            if (res.ok) {
                const result = await res.json();
                if (result.email_sent === false) {
                    alert('Judge saved, but the invitation email could not be sent. Check SMTP settings or share the judge dashboard link manually.');
                } else {
                    alert('Judge invitation sent successfully!');
                }
                setIsInviteModalOpen(false);
                fetchJudges();
            } else {
                const error = await res.json();
                alert(error.detail || 'Failed to invite judge');
            }
        } catch (error) {
            try { console.error('Error inviting judge:', error instanceof Error ? error.message : String(error)); } catch (_) {}
            alert('Network error while inviting judge');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveJudge = async (judgeId: string) => {
        if (!window.confirm('Are you sure you want to remove this judge? This will revoke their access to all assigned evaluations.')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/judges/${judgeId}`, {
                method: 'DELETE',
                headers: { ...authHeaders() }
            });
            if (res.ok) {
                fetchJudges();
            }
        } catch (error) {
            try { console.error('Failed to remove judge:', error instanceof Error ? error.message : String(error)); } catch (_) {}
        }
    };

    const filteredJudges = judges.filter(j => 
        (j.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (j.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Gavel className="text-[#6C3BFF]" size={28} />
                        Judge Management
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Invite and manage professional evaluators for your institutional events.
                    </p>
                </div>
                <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#6C3BFF] to-[#8b5cf6] text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                    <UserPlus size={16} /> Invite New Judge
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6C3BFF] transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-[#6C3BFF] transition-all font-medium text-sm"
                    />
                </div>
                <button 
                    onClick={fetchJudges}
                    className="px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl flex items-center gap-2 hover:bg-slate-200 transition-all"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Judges Grid */}
            {loading && judges.length === 0 ? (
                <div className="py-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-[#6C3BFF] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredJudges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                    {filteredJudges.map((judge) => (
                        <motion.div 
                            key={judge._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative bg-white p-7 rounded-[2.5rem] border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(108,59,255,0.08)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#6C3BFF] to-[#a78bfa] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-2xl flex items-center justify-center text-[#6C3BFF] shadow-sm border border-purple-100/50 group-hover:scale-110 transition-transform duration-300">
                                    <Mail size={26} strokeWidth={2.5} />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleRemoveJudge(judge._id)}
                                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Remove Judge"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5 mb-2">
                                <h3 className="text-xl font-black text-slate-900 truncate tracking-tight">{judge.name || 'Invited Judge'}</h3>
                                <p className="text-sm text-slate-500 font-medium truncate flex items-center gap-2">
                                    <Mail size={14} className="text-slate-400" /> {judge.email}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 space-y-5">
                                {judge.expertise && (
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Area of Expertise</p>
                                        <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-bold text-slate-600 shadow-sm">
                                            {judge.expertise}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: getJudgeStatusColor(judge.status || 'pending') }} />
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                            {getJudgeStatusLabel(judge.status || 'pending')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-black text-[#6C3BFF] leading-none">
                                            {judge.assignment_count ?? 0}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">assigned</span>
                                    </div>
                                </div>

                                {judge.invitation_token && (
                                    <button
                                        onClick={() => {
                                            const link = `${window.location.origin}/#/judge-invitation?token=${judge.invitation_token}`;
                                            navigator.clipboard.writeText(link);
                                            alert('Invite link copied to clipboard!');
                                        }}
                                        className="w-full mt-2 px-4 py-3 bg-indigo-50/80 hover:bg-indigo-100 text-[#6C3BFF] text-sm font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm group-hover:bg-[#6C3BFF] group-hover:text-white"
                                    >
                                        <Link size={16} className="group-hover:rotate-12 transition-transform" /> Copy Invite Link
                                    </button>
                                )}
                                
                                <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest pt-2">
                                    Added {judge.created_at ? new Date(judge.created_at).toLocaleDateString() : '—'}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] border border-slate-100 p-8 sm:p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <Gavel size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">No Judges Found</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                        You haven't invited any professional judges yet. Start by inviting an expert to help evaluate your event submissions.
                    </p>
                    <button 
                        onClick={() => setIsInviteModalOpen(true)}
                        className="px-8 py-4 bg-[#6C3BFF] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl shadow-purple-500/20"
                    >
                        Send First Invitation
                    </button>
                </div>
            )}

            <JudgeInviteModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInviteJudge}
                loading={isInviting}
            />
        </div>
    );
};

export default JudgeManagement;

