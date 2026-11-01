import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { useAuth } from '../../AuthContext';

const JoinTeam: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const initialCode = params.get('code') || '';

    const [code, setCode] = useState(initialCode);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<any>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joinedTeamId, setJoinedTeamId] = useState<string | null>(null);

    useEffect(() => {
        // Fetch preview info for the invite code (public endpoint)
        const fetchPreview = async (c: string) => {
            if (!c) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/teams/preview?code=${encodeURIComponent(c)}`);
                if (res.ok) {
                    const d = await res.json();
                    setPreview(d);
                    setPreviewError(null);
                } else {
                    const d = await res.json().catch(() => ({}));
                    setPreviewError(d.detail || d.error || 'Invite not found');
                    setPreview(null);
                }
            } catch (e) {
                setPreviewError('Network error while fetching invite preview');
                setPreview(null);
            }
        };

        if (initialCode) fetchPreview(initialCode);

        if (initialCode && user) {
            // auto-accept on mount when logged in
            doJoin(initialCode);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCode, user]);

    const doJoin = async (inviteCode: string) => {
        if (!inviteCode) return alert('Invite code required');
        if (!user) {
            // redirect to login and preserve return URL
            navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }
        setLoading(true);
        setJoinError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/teams/join-by-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ code: inviteCode })
            });
            const d = await res.json().catch(() => ({}));
            if (res.ok) {
                const evId = d.event_id || d.eventId || d.event || '';
                setJoinedTeamId(d.team_id || null);
                setPreview(p => ({ ...p, joined: true }));
                // friendly inline success message instead of alert
                setTimeout(() => {
                    if (evId) navigate(`/opportunities/${evId}?tab=team&joined=true`);
                    else navigate('/dashboard/learner');
                }, 600);
            } else {
                const msg = d.detail || d.error || d.message || `Failed to join team (${res.status})`;
                setJoinError(msg);
            }
        } catch (e) {
            console.error('Join error', e);
            setJoinError('Network error while joining the team.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-3">Join Team</h2>
                <p className="text-sm text-slate-600 mb-4">Enter the team invite code you received to join the team.</p>
                <div className="space-y-3">
                    {previewError && <div className="text-sm text-red-600">{previewError}</div>}

                    {preview ? (
                        <div className="p-3 bg-slate-50 rounded-md border">
                            <div className="text-sm text-slate-700 font-semibold">{preview.team?.team_name || 'Team'}</div>
                            <div className="text-xs text-slate-500">Event: {preview.event?.title || 'N/A'}</div>
                            <div className="text-xs text-slate-500">Members: {preview.team?.members_count}/{preview.team?.max_team_size}</div>
                            {preview.invite && preview.invite.expires_at && <div className="text-xs text-slate-400">Expires: {preview.invite.expires_at}</div>}
                        </div>
                    ) : (
                        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Invite code" className="w-full px-4 py-3 border rounded-xl" />
                    )}

                    {joinError && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded text-rose-700 text-sm">
                            {joinError}
                            <div className="mt-2 flex gap-2 justify-end">
                                <button onClick={() => doJoin(code)} className="px-3 py-1 rounded bg-rose-600 text-white">Retry</button>
                                <button onClick={() => navigate('/opportunities')} className="px-3 py-1 rounded border bg-white">Back</button>
                            </div>
                        </div>
                    )}

                    {joinedTeamId && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-emerald-700 text-sm">
                            Joined successfully. 
                            <div className="mt-2 flex gap-2 justify-end">
                                <button onClick={() => {
                                    const evId = preview?.event?.event_id || '';
                                    if (evId) navigate(`/opportunities/${evId}?tab=team&joined=true`);
                                    else navigate('/dashboard/learner');
                                }} className="px-3 py-1 rounded bg-emerald-600 text-white">View My Team</button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl border">Cancel</button>
                        <button onClick={() => {
                            if (!user) {
                                navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                                return;
                            }
                            setJoinError(null);
                            doJoin(code);
                        }} disabled={loading || !!preview?.team && preview.team.members_count >= preview.team.max_team_size || !!joinedTeamId} className="px-4 py-2 rounded-xl bg-[#6C3BFF] text-white font-bold">
                            {loading ? 'Joining…' : 'Join Team'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinTeam;

