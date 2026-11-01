import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { useAuth } from '../../AuthContext';
import { ChevronLeft, Bell, ExternalLink, Loader2, CheckCircle2, UsersRound, Bookmark } from 'lucide-react';
import OpportunityCard from '../../components/opportunities/OpportunityCard';

type ApplicationRow = {
    _id: string;
    opportunity_id?: string;
    status?: string;
    applied_at?: string;
    opportunity_title?: string;
    institution_name?: string;
    event_id?: string;
};

type NotifRow = { _id: string; title?: string; message?: string; is_read?: boolean; created_at?: string; type?: string; meta?: { opportunity_id?: string; action_url?: string } };

// In-app link carried by a notification (e.g. "Results published"); only relative paths are followed
const notifActionUrl = (n: NotifRow) => {
    const url = n.meta?.action_url;
    return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') ? url : null;
};

const MyApplications: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState<ApplicationRow[]>([]);
    const [savedOpps, setSavedOpps] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<NotifRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'applications' | 'saved'>('applications');

    const fetchAll = async () => {
        try {
            const [appRes, notifRes, savedRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/opportunities/me/applications`, { headers: { ...authHeaders() } }),
                fetch(`${API_BASE_URL}/api/opportunities/me/notifications?limit=30`, { headers: { ...authHeaders() } }),
                fetch(`${API_BASE_URL}/api/opportunities/user/saved`, { headers: { ...authHeaders() } })
            ]);
            
            if (appRes.ok) {
                const data = await appRes.json();
                setApplications(Array.isArray(data) ? data : []);
            }
            if (notifRes.ok) {
                const n = await notifRes.json();
                setNotifications(Array.isArray(n) ? n : []);
            }
            if (savedRes.ok) {
                const data = await savedRes.json();
                setSavedOpps(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user?.user_id) {
            navigate('/login', { replace: true });
            return;
        }
        fetchAll();
        
        const handleSaveUpdate = () => fetchAll();
        window.addEventListener('saved-opportunities-update', handleSaveUpdate);
        return () => window.removeEventListener('saved-opportunities-update', handleSaveUpdate);
    }, [authLoading, user?.user_id, navigate]);

    const statusLabel = (s: string | undefined) => {
        const x = (s || 'pending').toLowerCase();
        if (x === 'accepted' || x === 'shortlisted') return { text: 'Shortlisted', cls: 'bg-emerald-50 text-emerald-800 border-emerald-100' };
        if (x === 'rejected') return { text: 'Not selected', cls: 'bg-red-50 text-red-800 border-red-100' };
        return { text: 'Pending review', cls: 'bg-slate-100 text-slate-700 border-slate-200' };
    };

    const formatTimestamp = (timestamp?: string) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const applicationKind = (application: ApplicationRow) => (
        application.event_id ? 'Team opportunity' : 'Opportunity application'
    );

    const markRead = async (id: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/opportunities/me/notifications/${id}/read`, {
                method: 'POST',
                headers: { ...authHeaders() },
            });
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)));
        } catch {
            /* ignore */
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 font-sans">
                <div className="max-w-4xl mx-auto px-3 sm:px-6 space-y-10">
                    <div className="space-y-4">
                        <div className="w-48 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                        <div className="w-96 h-4 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-4 sm:p-8 space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 sm:gap-6 items-center">
                                <div className="flex-1 space-y-3">
                                    <div className="w-1/2 h-6 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="w-1/3 h-4 bg-slate-100 rounded animate-pulse"></div>
                                </div>
                                <div className="w-24 h-8 bg-slate-100 rounded-xl animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 font-sans">
            <div className="max-w-4xl mx-auto px-3 sm:px-6">
                <button
                    type="button"
                    onClick={() => navigate('/opportunities')}
                    className="flex items-center gap-2 text-slate-500 hover:text-purple-700 font-bold text-sm mb-8"
                >
                    <ChevronLeft size={20} /> Back to opportunities
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">My <span className="text-[#7C3AED]">dashboard</span></h1>
                        <p className="text-sm text-slate-500 mt-2">
                            Manage your active applications and saved opportunities.
                        </p>
                    </div>
                </div>

                {notifications.filter((n) => !n.is_read).length > 0 ? (
                    <section className="mb-10 bg-white rounded-3xl border border-slate-100 shadow-sm p-3 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-widest">
                            <Bell size={18} className="text-purple-600" /> Recent updates
                        </div>
                        <ul className="space-y-3">
                            {notifications
                                .filter((n) => !n.is_read)
                                .slice(0, 5)
                                .map((n) => (
                                    <li
                                        key={n._id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-purple-50/50 border border-purple-100"
                                    >
                                        <div>
                                            {n.title ? <p className="text-sm font-black text-slate-900">{n.title}</p> : null}
                                            <p className="text-sm font-bold text-slate-700">{n.message}</p>
                                            {n.type && ['hr_invitation', 'hr_message', 'hr_invitation_withdrawn'].includes(n.type) ? (
                                                <Link to="/opportunities/invitations" className="text-xs font-black uppercase text-purple-700 hover:underline">
                                                    View invitation
                                                </Link>
                                            ) : notifActionUrl(n) ? (
                                                <Link to={notifActionUrl(n)!} className="text-xs font-black uppercase text-purple-700 hover:underline">
                                                    {n.meta?.action_url?.endsWith('/results') ? 'View results' : 'View details'}
                                                </Link>
                                            ) : null}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => markRead(n._id)}
                                            className="text-xs font-black uppercase text-purple-700 hover:underline whitespace-nowrap"
                                        >
                                            Dismiss
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    </section>
                ) : null}

                {/* Tabs */}
                <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
                    <button 
                        onClick={() => setActiveTab('applications')}
                        className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                            activeTab === 'applications' 
                            ? 'border-b-2 border-purple-600 text-purple-600' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Applications ({applications.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('saved')}
                        className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                            activeTab === 'saved' 
                            ? 'border-b-2 border-purple-600 text-purple-600' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Saved ({savedOpps.length})
                    </button>
                </div>

                {activeTab === 'applications' && (
                    <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        {applications.length === 0 ? (
                            <div className="p-8 sm:p-16 text-center text-slate-400 font-bold">
                                You have not applied to any opportunities yet.{' '}
                                <Link to="/opportunities" className="text-purple-600 hover:underline">
                                    Browse listings
                                </Link>
                                .
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {applications.map((a) => {
                                    const st = statusLabel(a.status);
                                    const oid = a.opportunity_id;
                                    const canTeams = Boolean(a.event_id);
                                    return (
                                        <li key={a._id} className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 hover:bg-slate-50/80 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-slate-900 text-lg truncate">
                                                    {a.opportunity_title || 'Opportunity'}
                                                </p>
                                                <p className="text-sm text-slate-500 font-medium mt-1">
                                                    {a.institution_name ? `${a.institution_name}` : 'Host institution'}
                                                </p>
                                                <p className="text-[11px] uppercase tracking-[0.24em] font-black text-slate-400 mt-2">
                                                    {applicationKind(a)} · {formatTimestamp(a.applied_at)}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${st.cls}`}
                                            >
                                                {st.text === 'Shortlisted' ? <CheckCircle2 size={14} /> : null}
                                                {st.text}
                                            </span>
                                            {canTeams ? (
                                                <Link
                                                    to={`/events/${a.event_id}`}
                                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 text-xs font-black uppercase tracking-widest hover:bg-purple-100 transition-colors shrink-0"
                                                    title="Open team & submissions hub"
                                                >
                                                    Team hub <UsersRound size={14} />
                                                </Link>
                                            ) : null}
                                            {oid ? (
                                                <Link
                                                    to={`/opportunities/${oid}`}
                                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#7C3AED] text-white text-xs font-black uppercase tracking-widest hover:bg-[#5B21B6] transition-colors shrink-0"
                                                >
                                                    View listing <ExternalLink size={14} />
                                                </Link>
                                            ) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                )}

                {activeTab === 'saved' && (
                    <section className="bg-transparent">
                        {savedOpps.length === 0 ? (
                            <div className="p-8 sm:p-16 text-center text-slate-400 font-bold bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                You haven't saved any opportunities yet.{' '}
                                <Link to="/opportunities" className="text-purple-600 hover:underline">
                                    Browse listings
                                </Link>
                                .
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                {savedOpps.map((opp) => (
                                    <div key={opp._id} className="w-full max-w-[320px] mx-auto">
                                        <OpportunityCard 
                                            opportunity={opp} 
                                            isApplied={applications.some(a => a.opportunity_id === opp._id)}
                                            isSavedInitial={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
