import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { API_BASE_URL, FRONTEND_URL, authHeaders } from '../../apiConfig';
import { ChevronLeft, Users, Copy, Check, Link2, LogOut, Crown, UserPlus, Hash, Send, X, ThumbsUp, ThumbsDown } from 'lucide-react';

type TeamMember = {
    user_id?: string;
    name?: string;
    email?: string;
    role?: string;
    is_leader?: boolean;
};

type Team = {
    _id: string;
    team_name?: string;
    team_leader_id?: string;
    leader_name?: string;
    members?: TeamMember[];
    invite_code?: string;
};

type JoinRequest = {
    _id: string;
    requester_user_id: string;
    requester_name: string;
    requester_email: string;
    requester_college?: string;
    message?: string;
    status: string;
    created_at: string;
};

type TeamManagerProps = {
    eventId: string;
    opportunity?: any;
};

const TeamManager: React.FC<TeamManagerProps> = ({ eventId, opportunity }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState('');
    const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);
    const [teamName, setTeamName] = useState('');
    const [registered, setRegistered] = useState(true);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const autoJoinAttempted = useRef(false);

    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [joinRequestMessage, setJoinRequestMessage] = useState('');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [sentRequest, setSentRequest] = useState<string | null>(null);
    const [codeRequestSent, setCodeRequestSent] = useState<string | null>(null);
    const [pendingSentRequests, setPendingSentRequests] = useState<any[]>([]);

    const isLeader = !!(team && String(team.team_leader_id || '') === String(user?.user_id || ''));
    const memberCount = team?.members?.length || 0;

    const minSizeRaw = opportunity?.minTeamSize ?? opportunity?.min_team_size;
    const maxSizeRaw = opportunity?.maxTeamSize ?? opportunity?.max_team_size;
    const teamSizeConfigured = minSizeRaw != null && maxSizeRaw != null;
    const minSize = teamSizeConfigured ? Number(minSizeRaw) : null;
    const maxSize = teamSizeConfigured ? Number(maxSizeRaw) : null;
    const isSoloTeam = (team as any)?.is_solo === true;

    const shareableLink = generatedInvite
        ? `${FRONTEND_URL}/#/opportunities/${eventId}?tab=team&invite=${generatedInvite}`
        : null;

    const fetchProgress = async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/stages/events/${eventId}/progress`, {
                headers: { ...authHeaders() },
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail || err.error || 'Failed to load team status.');
            }
            const data = await response.json();
            if (data.status === 'not_registered') {
                setRegistered(false);
                setTeam(null);
                return;
            }
            setRegistered(true);
            setTeam(data.team || null);
            if (data.team?.invite_code) {
                setGeneratedInvite(data.team.invite_code);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load team status.');
        } finally {
            setLoading(false);
        }
    };

    const fetchJoinRequests = async () => {
        if (!team?._id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/teams/requests/teams/${team._id}/requests`, {
                headers: { ...authHeaders() },
            });
            if (res.ok) {
                const data = await res.json();
                setJoinRequests(data.requests || []);
            }
        } catch { }
    };

    const fetchUserSentRequests = async () => {
        if (!eventId || !user?.user_id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/teams/requests/my-requests?event_id=${encodeURIComponent(eventId)}`, {
                headers: { ...authHeaders() },
            });
            if (res.ok) {
                const data = await res.json();
                setPendingSentRequests((data.requests || []).filter((r: any) => (r.status || '').toUpperCase() === 'PENDING'));
            }
        } catch { }
    };

    
    useEffect(() => {
        if (!eventId) { setLoading(false); return; }
        fetchProgress();
        fetchUserSentRequests();
    }, [eventId, user?.user_id]);

    useEffect(() => {
        if (team?._id) {
            fetchJoinRequests();
        }
    }, [team?._id]);

    // Auto-poll for new join requests every 15s (leader only)
    useEffect(() => {
        if (!team?._id || !isLeader || isSoloTeam) return;
        const teamId = team._id;
        const interval = setInterval(() => {
            fetch(`${API_BASE_URL}/api/v1/teams/requests/teams/${teamId}/requests`, {
                headers: { ...authHeaders() },
            }).then(r => r.ok ? r.json() : null).then(data => {
                if (data?.requests) setJoinRequests(data.requests);
            }).catch(() => {});
        }, 15000);
        return () => clearInterval(interval);
    }, [team?._id, isSoloTeam]);

    useEffect(() => {
        const codeFromUrl = searchParams.get('invite');
        if (codeFromUrl && !autoJoinAttempted.current) {
            autoJoinAttempted.current = true;
            setInviteCode(codeFromUrl.toUpperCase());
        }
        const joined = searchParams.get('joined');
        if (joined === 'true') {
            setTimeout(() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('joined');
                navigate(`${url.pathname}${url.search}`, { replace: true });
            }, 100);
        }
    }, [searchParams]);

    useEffect(() => {
        if (inviteCode && !team && !codeRequestSent && registered && !loading && autoJoinAttempted.current) {
            handleJoinTeam(new Event('submit') as any);
        }
    }, [inviteCode, team, codeRequestSent, registered, loading]);

    const handleFinalizeTeam = async () => {
        if (!eventId || !team) return;
        if (!window.confirm('Are you sure you want to finalize and lock your team? Once finalized, no more members can join, and your team structure is locked for the rest of the event.')) return;
        
        setError(null);
        setSuccessMsg(null);
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/stages/teams/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ event_id: eventId }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || data.error || 'Failed to finalize team.');
            }
            setSuccessMsg('Team finalized and locked successfully!');
            await fetchProgress();
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
            setError(err.message || 'Failed to finalize team.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = teamName.trim();
        if (!eventId || name.length < 3) {
            setError('Team name must be at least 3 characters.');
            return;
        }
        setError(null);
        setSuccessMsg(null);
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/stages/teams/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ event_id: eventId, team_name: name, min_size: minSize, max_size: maxSize }),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail || err.error || 'Failed to create team.');
            }
            const result = await response.json();
            if (!result?.team?._id && !result?.team_id) {
                throw new Error('Team creation failed — no team returned from server.');
            }
            await fetchProgress();
            setTeamName('');
            setSuccessMsg(`Team "${name}" created successfully!`);
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
            setError(err.message || 'Failed to create team.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim() || !eventId) return;
        setError(null);
        setSuccessMsg(null);
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/teams/requests/send-by-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    event_id: eventId,
                    invite_code: inviteCode.trim(),
                    message: '',
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.detail || data.error || 'Failed to send join request.');
            }
            setInviteCode('');
            setCodeRequestSent(data.request_id || 'sent');
            setSuccessMsg('Join request sent to team leader for approval!');
            fetchUserSentRequests();
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
            setError(err.message || 'Failed to send join request.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!team?._id || !eventId) return;
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        
        setError(null);
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/teams/${team._id}/members/${memberId}`, {
                method: 'DELETE',
                headers: { ...authHeaders() },
            });
            if (res.ok) {
                await fetchProgress(); // Refresh team state
                setSuccessMsg("Member removed successfully.");
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to remove member');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeaveTeam = async () => {
        if (!eventId || !team) return;
        const msg = isLeader
            ? 'Are you sure you want to delete this team? All members will be removed from the team.'
            : 'Are you sure you want to leave this team?';
        if (!window.confirm(msg)) return;
        setError(null);
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/stages/teams/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ event_id: eventId }),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail || err.error || 'Failed to leave team.');
            }
            setTeam(null);
            setGeneratedInvite(null);
        } catch (err: any) {
            setError(err.message || 'Failed to leave team.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendJoinRequest = async () => {
        if (!team?._id || !eventId) return;
        setError(null);
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/teams/requests/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    event_id: eventId,
                    team_id: team._id,
                    message: joinRequestMessage,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setSentRequest(data.request_id || 'sent');
                setShowRequestForm(false);
            } else {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to send request');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send join request.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendEmailInvite = async () => {
        if (!team?._id || !inviteEmail.trim()) return;
        setError(null);
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/teams/send-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ team_id: team._id, invite_email: inviteEmail.trim(), event_id: eventId })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || err.error || 'Failed to send invite email.');
            }
            const data = await res.json();
            setShowEmailModal(false);
            setInviteEmail('');
            setSuccessMsg(data.message || 'Invite sent');
            setTimeout(() => setSuccessMsg(null), 4000);
            await fetchProgress();
        } catch (err: any) {
            setError(err.message || 'Failed to send invite email.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/teams/requests/${requestId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({}),
            });
            if (res.ok) {
                await fetchJoinRequests();
                await fetchProgress();
            } else {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to approve request');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/teams/requests/${requestId}/reject`, {
                method: 'POST',
                headers: { ...authHeaders() },
                body: JSON.stringify({ reason: 'Declined by team leader' }),
            });
            if (res.ok) {
                await fetchJoinRequests();
            } else {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to reject');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const copyToClipboard = async (text: string, type: 'code' | 'link') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
            else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
        } catch { }
    };


    const handleBack = () => {
        const idx = window.history.state?.idx ?? 0;
        if (idx > 0) navigate(-1);
        else navigate(`/opportunities/${eventId}`);
    };

    const isTeamMember = team?.members?.some(m => String(m.user_id) === String(user?.user_id));

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-purple-600 mb-6 transition-colors"
            >
                <ChevronLeft size={18} /> Back to Event
            </button>

            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900">Team Hub</h1>
                <p className="text-slate-500 font-medium mt-1">
                    {opportunity?.title || 'Event'} · {teamSizeConfigured ? `${minSize}–${maxSize} members per team` : 'team size not configured'}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold mb-5">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-semibold mb-5">
                    {successMsg}
                </div>
            )}

            {opportunity?.participationType === 'individual' ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-amber-600" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mb-2">Individual Participation</h2>
                    <p className="text-slate-500 font-medium text-sm">This event is for individual participation only. Teams are not allowed.</p>
                </div>
            ) : !registered ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-purple-600" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mb-2">Register First</h2>
                    <p className="text-slate-500 font-medium text-sm">You need to register for this event before creating or joining a team.</p>
                    <button onClick={handleBack} className="mt-5 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-black hover:bg-purple-700 transition-colors">
                        Go Back & Register
                    </button>
                </div>
            ) : team && isTeamMember ? (
                /* ── TEAM VIEW (member) ── */
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-200 text-xs font-black uppercase tracking-widest mb-1">Your Team</p>
                                    <h2 className="text-white text-xl font-black">{team.team_name}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(team as any).status === 'finalized' && (
                                        <span className="inline-flex items-center gap-1 bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 rounded-xl px-2.5 py-1 text-xs font-black uppercase tracking-wider animate-pulse">
                                            🔒 Finalized
                                        </span>
                                    )}
                                    <div className="bg-white/20 rounded-xl px-3 py-1.5 text-white text-sm font-black">
                                        {isSoloTeam ? `${memberCount}/1` : teamSizeConfigured ? `${memberCount}/${maxSize}` : `${memberCount}`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Members</p>
                            <div className="space-y-2">
                                {(team.members || []).map((member, i) => {
                                    const isThisLeader = member.role === 'LEADER' || member.is_leader ||
                                        String(member.user_id) === String(team.team_leader_id);
                                    return (
                                        <div key={member.user_id || i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isThisLeader ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {isThisLeader ? <Crown size={14} /> : (member.name?.[0] || '?').toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {member.name || member.email || 'Member'}
                                                    {String(member.user_id) === String(user?.user_id) ? ' (You)' : ''}
                                                </p>
                                                {member.email && <p className="text-xs text-slate-400 truncate">{member.email}</p>}
                                            </div>
                                            {isThisLeader && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Leader</span>
                                            )}
                                            {isLeader && !isThisLeader && (team as any).status !== 'finalized' && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.user_id as string)}
                                                    disabled={actionLoading}
                                                    className="ml-2 text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-colors disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                {!isSoloTeam && teamSizeConfigured && (team as any).status !== 'finalized' ? Array.from({ length: Math.max(0, (maxSize as number) - memberCount) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <UserPlus size={14} className="text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">Open slot</p>
                                    </div>
                                )) : null}
                            </div>
                        </div>
                    </div>

                    {/* Invite section — all members (only if not finalized, hidden for solo) */}
                    {!isSoloTeam && (team as any).status !== 'finalized' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Invite Members</p>

                            {generatedInvite ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <Hash size={16} className="text-purple-600 shrink-0" />
                                        <span className="flex-1 font-mono font-black text-slate-900 tracking-widest text-sm">{generatedInvite}</span>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(generatedInvite, 'code')}
                                            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
                                            title="Copy code"
                                        >
                                            {copiedCode ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                        </button>
                                    </div>

                                    {shareableLink && (
                                        <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
                                            <Link2 size={16} className="text-purple-600 shrink-0" />
                                            <span className="flex-1 text-xs text-purple-700 font-medium truncate">{shareableLink}</span>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(shareableLink, 'link')}
                                                className="p-1.5 rounded-lg hover:bg-purple-200 transition-colors text-purple-600"
                                                title="Copy link"
                                            >
                                                {copiedLink ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setShowEmailModal(true)} className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold">Email Invite</button>
                                        {shareableLink && (
                                            <>
                                                <a href={`https://wa.me/?text=${encodeURIComponent(`Join my team "${team?.team_name}" on Studlyf! Use code: ${generatedInvite} — ${shareableLink}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold text-center hover:bg-green-100 transition-colors">Share on WhatsApp</a>
                                            </>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-400 font-medium text-center">Share this code with your teammates to join the team</p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 text-center">Loading invite code...</p>
                            )}
                        </div>
                    )}

                    {isLeader && isSoloTeam && ((team as any).status === 'active' || (team as any).status === 'forming') && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-6 text-center shadow-sm">
                            <p className="text-sm font-black text-amber-900 flex items-center justify-center gap-1.5">Solo Team Created</p>
                            <p className="text-xs text-amber-700 mt-1 font-semibold">Your solo team is ready. Submit it for admin approval to unlock event stages.</p>
                            <button
                                type="button"
                                onClick={async () => {
                                    setActionLoading(true);
                                    setError(null);
                                    try {
                                        const res = await fetch(`${API_BASE_URL}/api/v1/stages/teams/submit-solo`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', ...authHeaders() },
                                            body: JSON.stringify({ event_id: eventId }),
                                        });
                                        const data = await res.json();
                                        if (!res.ok) {
                                            throw new Error(data.detail || data.error || 'Failed to submit');
                                        }
                                        setTeam((prev: any) => prev ? { ...prev, status: 'pending_admin_approval' } : prev);
                                        setSuccessMsg('Team submitted for admin review!');
                                        setTimeout(() => setSuccessMsg(null), 4000);
                                    } catch (err: any) {
                                        setError(err.message || 'Something went wrong');
                                    } finally {
                                        setActionLoading(false);
                                    }
                                }}
                                disabled={actionLoading}
                                className="mt-4 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                            >
                                {actionLoading ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        </div>
                    )}

                    {isLeader && ((team as any).status === 'finalized' || (team as any).status === 'pending_admin_approval') && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                            {isSoloTeam ? (
                                <>
                                    <p className="text-sm font-black text-slate-100 flex items-center justify-center gap-1.5">Submitted for Review</p>
                                    <p className="text-xs text-slate-400 mt-1 font-semibold">Your solo team has been submitted and is waiting for admin approval. You will be able to submit to stages once approved.</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const oppPath = eventId ? `/opportunities/${encodeURIComponent(String(eventId))}` : '';
                                            if (oppPath) navigate(`${oppPath}?tab=submissions`);
                                        }}
                                        className="mt-4 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                                    >
                                        Go to Submissions
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-black text-slate-100 flex items-center justify-center gap-1.5">🔒 Team Pending Admin Approval</p>
                                    <p className="text-xs text-slate-400 mt-1 font-semibold">Your team structure has been submitted and locked. You are waiting for the admin to approve it.</p>
                                </>
                            )}
                        </div>
                    )}

                    {isLeader && (team as any).status === 'approved' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                            <p className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1.5">✅ Team Approved & Locked</p>
                            <p className="text-xs text-slate-400 mt-1 font-semibold">Your team has been approved by the admin. You are now ready to make submissions!</p>
                            {isSoloTeam && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const oppPath = eventId ? `/opportunities/${encodeURIComponent(String(eventId))}` : '';
                                        if (oppPath) navigate(`${oppPath}?tab=submissions`);
                                    }}
                                    className="mt-4 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                                >
                                    Go to Submissions
                                </button>
                            )}
                        </div>
                    )}

                    {showEmailModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-md bg-white rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black">Email Invite</h3>
                                    <button onClick={() => setShowEmailModal(false)} className="text-sm font-bold">Close</button>
                                </div>
                                <p className="text-sm text-slate-500 mb-3">Send an invite link to a teammate's email address.</p>
                                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="teammate@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 mb-3" />
                                {error && <div className="text-rose-500 text-sm mb-2">{error}</div>}
                                <div className="flex gap-3">
                                    <button onClick={() => setShowEmailModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 font-bold">Cancel</button>
                                    <button onClick={handleSendEmailInvite} disabled={actionLoading} className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-black">{actionLoading ? 'Sending...' : 'Send Invite'}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Join Requests — leader can approve/reject (only if forming/active) */}
                    {isLeader && !isSoloTeam && ((team as any).status === 'forming' || (team as any).status === 'active') && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Join Requests</p>
                                {joinRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length > 0 && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full">
                                        {joinRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length} pending
                                    </span>
                                )}
                            </div>
                            {joinRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length > 0 ? (
                                <div className="space-y-3">
                                    {joinRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').map(req => (
                                        <div key={req._id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900">{req.requester_name || req.requester_email}</p>
                                                <p className="text-xs text-slate-500 truncate">{req.requester_email}{req.requester_college ? ` · ${req.requester_college}` : ''}</p>
                                                {req.message && <p className="text-xs text-slate-400 mt-1 italic">"{req.message}"</p>}
                                            </div>
                                            <div className="flex gap-2 ml-3">
                                                <button
                                                    onClick={() => handleApproveRequest(req._id)}
                                                    disabled={actionLoading || !teamSizeConfigured || memberCount >= (maxSize as number)}
                                                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50 text-xs font-bold"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(req._id)}
                                                    disabled={actionLoading}
                                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 text-xs font-bold"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-2">No pending join requests. Share your invite code to get team members.</p>
                            )}
                        </div>
                    )}

                    {/* Finalize/Submit Button — leader only (hidden for solo) */}
                    {!isSoloTeam && ((team as any).status === 'forming' || (team as any).status === 'active') && (
                        memberCount >= (minSize || 1) ? (
                            <button
                                type="button"
                                onClick={handleFinalizeTeam}
                                disabled={actionLoading}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                🔒 Finalize & Submit Team
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full py-4 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-sm font-black uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
                                title={`Requires at least ${minSize} members to submit`}
                            >
                                🔒 Finalize & Submit Team (Needs {minSize} members)
                            </button>
                        )
                    )}

                    {/* Leave team — only if forming/active (hidden for solo) */}
                    {!isSoloTeam && ((team as any).status === 'forming' || (team as any).status === 'active') && (
                        <button
                            type="button"
                            onClick={handleLeaveTeam}
                            disabled={actionLoading}
                            className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-black hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                        >
                            <LogOut size={16} /> {isLeader ? 'Delete Team' : 'Leave Team'}
                        </button>
                    )}
                </div>
            ) : team && !isTeamMember ? (
                /* ── VIEWING SOMEONE ELSE'S TEAM (request to join) ── */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-purple-600" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mb-1">{team.team_name}</h2>
                    <p className="text-sm text-slate-500 font-medium mb-2">
                        Led by {team.leader_name || 'Team Leader'} · {teamSizeConfigured ? `${memberCount}/${maxSize} members` : `${memberCount} members`}
                    </p>

                    {sentRequest ? (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                            <p className="text-sm font-bold text-green-700">Request sent!</p>
                            <p className="text-xs text-green-600 mt-1">Waiting for the team leader to approve.</p>
                        </div>
                    ) : showRequestForm ? (
                        <div className="mt-6 space-y-3 text-left">
                            <textarea
                                value={joinRequestMessage}
                                onChange={(e) => setJoinRequestMessage(e.target.value)}
                                placeholder="Add a message to the team leader (optional)"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-300 transition-all resize-none"
                                rows={3}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSendJoinRequest}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-black hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Send size={14} /> Send Request
                                </button>
                                <button
                                    onClick={() => setShowRequestForm(false)}
                                    className="py-3 px-4 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ) : teamSizeConfigured && memberCount < (maxSize as number) ? (
                        <button
                            onClick={() => setShowRequestForm(true)}
                            disabled={actionLoading || !teamSizeConfigured}
                            className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-black hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                        >
                            <Send size={14} /> Request to Join
                        </button>
                    ) : (
                        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <p className="text-sm font-medium text-slate-500">
                                {teamSizeConfigured ? 'This team is full.' : 'Team size is not configured for this opportunity.'}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                /* ── NO TEAM VIEW ── */
                <div>
                    {pendingSentRequests.length > 0 && (
                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                            <Send size={18} className="text-amber-600 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-amber-800">
                                    {pendingSentRequests.length} pending join request{pendingSentRequests.length > 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-amber-600">Waiting for team leader{pendingSentRequests.length > 1 ? 's' : ''} to approve.</p>
                            </div>
                        </div>
                    )}
                    {/* Participate Solo Option */}
                    {(String(opportunity?.participationType || opportunity?.participation_type || '').toLowerCase() === 'both') && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-6 mb-6 text-center shadow-sm">
                            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center justify-center gap-2">
                                👤 Participate Solo
                            </h3>
                            <p className="text-xs text-slate-500 font-bold mb-4">
                                You can participate in this event solo. Skip team formation and proceed directly to submission.
                            </p>
                            <button
                                type="button"
                                onClick={async () => {
                                    setActionLoading(true);
                                    setError(null);
                                    try {
                                        const res = await fetch(`${API_BASE_URL}/api/v1/stages/teams/create-solo`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', ...authHeaders() },
                                            body: JSON.stringify({ event_id: eventId }),
                                        });
                                        const data = await res.json();
                                        if (!res.ok || data.status === 'error') {
                                            throw new Error(data.error || data.detail || 'Failed to create solo entry');
                                        }
                                        setTeam(data.team);
                                    } catch (err: any) {
                                        setError(err.message || 'Something went wrong');
                                    } finally {
                                        setActionLoading(false);
                                    }
                                }}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                            >
                                {actionLoading ? 'Creating...' : 'Continue as Solo'}
                            </button>
                        </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                                <Users size={20} className="text-purple-600" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-1">Create a Team</h3>
                            <p className="text-xs text-slate-500 font-medium mb-4">Start a new team and invite others.</p>
                            <form onSubmit={handleCreateTeam} className="space-y-3">
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="Team name"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-purple-50 focus:border-purple-300 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={actionLoading || teamName.trim().length < 3}
                                    className="w-full py-3 bg-purple-600 text-white rounded-xl text-sm font-black hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? 'Creating...' : 'Create Team'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <Hash size={20} className="text-green-600" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-1">Join a Team</h3>
                            <p className="text-xs text-slate-500 font-medium mb-4">Enter an invite code from your team leader.</p>
                            {codeRequestSent ? (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                                    <Send size={20} className="text-amber-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-amber-800">Request Sent!</p>
                                    <p className="text-xs text-amber-600 mt-1">Waiting for the team leader to approve your request.</p>
                                    <button
                                        onClick={() => setCodeRequestSent(null)}
                                        className="mt-3 text-xs font-bold text-amber-700 underline hover:no-underline"
                                    >
                                        Send another request
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleJoinTeam} className="space-y-3">
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="Invite code"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 tracking-widest focus:ring-4 focus:ring-green-50 focus:border-green-300 outline-none transition-all"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={actionLoading || !inviteCode.trim()}
                                        className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Sending Request...' : 'Send Join Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManager;

