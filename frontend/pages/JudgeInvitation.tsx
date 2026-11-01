import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL, authHeaders } from '../apiConfig';
import { useAuth } from '../AuthContext';

const JudgeInvitation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, role, login } = useAuth();
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
    const [invitationData, setInvitationData] = useState<any>(null);
    const [loadingInvitation, setLoadingInvitation] = useState(true);

    const token = useMemo(() => {
        const fromSearch = new URLSearchParams(location.search).get('token') || '';
        if (fromSearch) return fromSearch.split('&')[0].trim();
        const hash = window.location.hash || '';
        const q = hash.includes('?') ? hash.split('?')[1] : '';
        return (new URLSearchParams(q).get('token') || '').split('&')[0].trim();
    }, [location.search, location.hash]);
    const action = useMemo(() => new URLSearchParams(location.search).get('action') || '', [location.search]);

    // Fetch invitation details when token is available
    useEffect(() => {
        if (token) {
            fetchInvitationDetails();
        } else {
            setLoadingInvitation(false);
        }
    }, [token]);

    // Auto-respond if action is provided in URL
    useEffect(() => {
        if (token && invitationData && action) {
            const shouldAccept = action === 'accept';
            if (shouldAccept || action === 'decline') {
                // Auto-respond after a short delay to show the invitation details first
                setTimeout(() => {
                    respond(shouldAccept);
                }, 2000);
            }
        }
    }, [token, invitationData, action]);

    const fetchInvitationDetails = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/judge-portal/invitation-details?token=${encodeURIComponent(token)}`);
            if (res.ok) {
                const data = await res.json();
                setInvitationData(data);
            } else {
                const body = await res.json().catch(() => ({}));
                const msg = body?.detail || `HTTP ${res.status}`;
                console.error('Failed to fetch invitation details:', msg);
                if (res.status === 404) {
                    setNotice({ kind: 'err', text: 'Invitation not found. The link may have expired or been cancelled.' });
                } else {
                    setNotice({ kind: 'err', text: msg });
                }
            }
        } catch (error) {
            console.error('Failed to fetch invitation details:', error);
            setNotice({ kind: 'err', text: 'Network error. Please check your connection and try again.' });
        } finally {
            setLoadingInvitation(false);
        }
    };

    const respond = async (accept: boolean) => {
        if (!token) {
            setNotice({ kind: 'err', text: 'Invitation token is missing.' });
            return;
        }
        
        // For judge invitations, we don't require authentication first
        // The judge can accept/decline without having an account
        setBusy(true);
        setNotice(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/judge-portal/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, accept }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body?.detail || 'Failed to update invitation');
            setNotice({ kind: 'ok', text: accept ? 'Invitation accepted!' : 'Invitation declined.' });
            if (accept) {
                const loginToken = body?.login_token || '';
                if (loginToken) {
                    localStorage.setItem('auth_token', loginToken);
                    localStorage.setItem('pendingJudgeRole', 'true');
                    localStorage.setItem('wasJudgeInvited', 'true');
                    const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
                        headers: { 'Authorization': `Bearer ${loginToken}` }
                    });
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        login(loginToken, meData);
                    }
                    setTimeout(() => navigate('/judge-portal', { replace: true }), 1000);
                    return;
                }
                localStorage.setItem('pendingJudgeRole', 'true');
                localStorage.setItem('wasJudgeInvited', 'true');
                const judgeEmail = invitationData?.judge_email || '';
                setTimeout(() => {
                    if (user && role === 'judge') {
                        navigate('/judge-portal', { replace: true });
                        return;
                    }
                    const loginQs = new URLSearchParams({
                        next: '/judge-portal',
                        ...(judgeEmail ? { email: judgeEmail } : {}),
                    });
                    navigate(`/login?${loginQs.toString()}`, { replace: true });
                }, 1500);
            }
        } catch (e: any) {
            setNotice({ kind: 'err', text: e?.message || 'Network error' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Studlyf Judge Portal</p>
                <h1 className="text-2xl font-black text-slate-900 mt-2">Judging Invitation</h1>
                
                {loadingInvitation ? (
                    <div className="mt-6 text-center">
                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">Loading invitation details...</p>
                    </div>
                ) : action && invitationData ? (
                    <div className="mt-6 text-center">
                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">
                            {action === 'accept' ? 'Accepting invitation...' : 'Declining invitation...'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Please wait while we process your response</p>
                    </div>
                ) : !token ? (
                    <div className="mt-6 p-4 bg-red-50 rounded-xl">
                        <p className="text-sm font-semibold text-red-600">Invalid invitation link.</p>
                        <p className="text-xs text-red-500 mt-1">Please check the link in your email and try again.</p>
                    </div>
                ) : invitationData ? (
                    <div className="mt-6 space-y-6">
                        {user && invitationData.judge_email && user.email?.toLowerCase() !== String(invitationData.judge_email).toLowerCase() && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
                                You are signed in as <strong>{user.email}</strong>, but this invitation was sent to <strong>{invitationData.judge_email}</strong>.
                                Log out and open this link in a browser where that judge email can sign in, or accept below to record the response for the invited judge.
                            </div>
                        )}
                        {invitationData.status === 'ACCEPTED' && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 font-semibold">
                                This invitation was already accepted. Sign in with {invitationData.judge_email} to open the judge portal.
                            </div>
                        )}
                        {/* Invitation Details */}
                        <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                            <h2 className="text-lg font-black text-purple-900 mb-4">
                                {invitationData.event_name || 'Event Invitation'}
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {invitationData.judge_name?.charAt(0) || 'J'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">
                                            Hello {invitationData.judge_name || 'Judge'},
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            You've been invited to judge this event
                                        </p>
                                        {invitationData.judge_email && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                Email: {invitationData.judge_email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {invitationData.expertise && (
                                    <div className="mt-4">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Expertise</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(invitationData.expertise) 
                                                ? invitationData.expertise.map((exp: string, index: number) => (
                                                    <span key={index} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-purple-700">
                                                        {exp}
                                                    </span>
                                                ))
                                                : (
                                                    <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-purple-700">
                                                        {invitationData.expertise}
                                                    </span>
                                                )
                                            }
                                        </div>
                                    </div>
                                )}
                                
                                {invitationData.invitation_sent_at && (
                                    <div className="mt-4 text-xs text-slate-500">
                                        Invited on {new Date(invitationData.invitation_sent_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 font-medium">
                                Would you like to accept this judging invitation?
                            </p>
                            
                            <div className="flex gap-3">
                                <button
                                    disabled={busy}
                                    onClick={() => respond(true)}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-emerald-600 text-white text-sm font-black uppercase tracking-widest disabled:opacity-60 hover:bg-emerald-700 transition-colors"
                                >
                                    {busy ? 'Processing...' : 'Accept Invitation'}
                                </button>
                                <button
                                    disabled={busy}
                                    onClick={() => respond(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-700 text-sm font-black uppercase tracking-widest disabled:opacity-60 hover:bg-slate-50 transition-colors"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <h3 className="text-sm font-black text-slate-900 mb-2">What happens next?</h3>
                            <ul className="text-xs text-slate-600 space-y-1">
                                <li>• Accepting will confirm your participation as a judge</li>
                                <li>• You'll need to create an account or login to access the judge portal</li>
                                <li>• Once logged in, you can review assigned submissions</li>
                                <li>• You'll receive notifications when new submissions are assigned</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                        <p className="text-sm font-semibold text-yellow-600">Unable to load invitation details.</p>
                        <p className="text-xs text-yellow-500 mt-1">The invitation may have expired or been cancelled.</p>
                    </div>
                )}

                {/* Notice Messages */}
                {notice ? (
                    <div className={`mt-6 p-4 rounded-xl ${
                        notice.kind === 'ok' 
                            ? 'bg-emerald-50 border border-emerald-200' 
                            : 'bg-red-50 border border-red-200'
                    }`}>
                        <p className={`text-sm font-semibold ${
                            notice.kind === 'ok' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                            {notice.text}
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default JudgeInvitation;

