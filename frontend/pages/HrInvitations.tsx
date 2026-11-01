import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, authHeaders } from '../apiConfig';
import { useAuth } from '../AuthContext';
import {
    AlertTriangle, ArrowLeft, Briefcase, CalendarClock, CheckCircle2, ChevronLeft, Clock, ExternalLink, Inbox, Loader2, RefreshCw, Send, XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

type InvitationStatus = 'sent' | 'accepted' | 'declined' | 'withdrawn' | 'expired';

type Invitation = {
    invitation_id: string;
    hr_org?: string;
    hr_name?: string;
    role_title?: string;
    message?: string;
    status?: InvitationStatus | string;
    created_at?: string;
    responded_at?: string | null;
    expires_at?: string | null;
    share_contact?: boolean;
};

type Meeting = { title: string; starts_at: string; duration_min: number; meeting_url: string | null };
type Message = { message_id: string; from: 'hr' | 'builder'; kind: 'text' | 'meeting'; body: string; meeting: Meeting | null; created_at: string };

const MAX_BODY = 2000;
const POLL_MS = 30000;

const STATUS_META: Record<string, { label: string; variant: 'default' | 'success' | 'destructive' | 'muted' | 'warning' }> = {
    sent: { label: 'Awaiting your reply', variant: 'default' },
    accepted: { label: 'Accepted', variant: 'success' },
    declined: { label: 'Declined', variant: 'destructive' },
    withdrawn: { label: 'Withdrawn', variant: 'muted' },
    expired: { label: 'Expired', variant: 'warning' },
};

const formatDate = (timestamp?: string | null, withTime = false) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return withTime
        ? date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

async function readError(res: Response, fallback: string) {
    const data = await res.json().catch(() => ({}));
    return typeof data.detail === 'string' ? data.detail : fallback;
}

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    const meta = STATUS_META[status || 'sent'] || STATUS_META.sent;
    return <Badge variant={meta.variant}>{meta.label}</Badge>;
};

const SafetyNotice: React.FC = () => (
    <Alert variant="warning">
        <AlertTriangle />
        <AlertTitle>Stay safe</AlertTitle>
        <AlertDescription>STUDLYF hasn't verified this organization yet — never share passwords or pay fees.</AlertDescription>
    </Alert>
);

const MeetingCard: React.FC<{ meeting: Meeting; mine: boolean }> = ({ meeting, mine }) => (
    <div className={cn('rounded-ds-control border border-ds-lavender-strong bg-ds-lavender p-4 text-ds-foreground', mine && 'ml-auto')}>
        <div className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock className="size-4 text-ds-primary" /> {meeting.title}
        </div>
        <p className="mt-1.5 text-sm text-ds-muted-foreground">
            {formatDate(meeting.starts_at, true)} · {meeting.duration_min} min
        </p>
        {meeting.meeting_url && (
            <Button asChild size="sm" className="mt-3">
                <a href={meeting.meeting_url} target="_blank" rel="noopener noreferrer">
                    Join meeting <ExternalLink />
                </a>
            </Button>
        )}
    </div>
);

const Thread: React.FC<{ invitation: Invitation }> = ({ invitation }) => {
    const [messages, setMessages] = useState<Message[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const canSend = invitation.status === 'accepted';

    const load = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/hr-invitations/${invitation.invitation_id}/messages`, { headers: { ...authHeaders() } });
            if (!res.ok) throw new Error(await readError(res, 'Could not load messages.'));
            setMessages((await res.json()).messages || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load messages.');
        }
    };

    useEffect(() => {
        setMessages(null);
        load();
        if (!canSend) return;
        const timer = window.setInterval(load, POLL_MS);
        return () => window.clearInterval(timer);
    }, [invitation.invitation_id, canSend]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'nearest' });
    }, [messages?.length]);

    const send = async () => {
        const body = draft.trim();
        if (!body) return;
        setSending(true);
        setSendError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/hr-invitations/${invitation.invitation_id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ body }),
            });
            if (!res.ok) throw new Error(await readError(res, 'Could not send your message.'));
            const message: Message = await res.json();
            setMessages(prev => [...(prev || []), message]);
            setDraft('');
        } catch (err) {
            setSendError(err instanceof Error ? err.message : 'Could not send your message.');
        } finally {
            setSending(false);
        }
    };

    if (!canSend && messages && messages.length === 0) return null;

    return (
        <div className="grid gap-4">
            <Separator />
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-ds-foreground">Messages</h3>
                <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh messages">
                    <RefreshCw /> Refresh
                </Button>
            </div>
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {messages === null && !error ? (
                <div className="grid gap-2">
                    <Skeleton className="h-14 w-3/4" />
                    <Skeleton className="ml-auto h-14 w-2/3" />
                </div>
            ) : messages && messages.length === 0 ? (
                <p className="rounded-ds-control bg-ds-muted px-4 py-6 text-center text-sm text-ds-muted-foreground">
                    No messages yet. The recruiter will reach out here, or you can say hello.
                </p>
            ) : (
                <ol className="grid max-h-[420px] gap-3 overflow-y-auto pr-1">
                    {messages?.map(m => {
                        const mine = m.from === 'builder';
                        return (
                            <li key={m.message_id} className={cn('flex max-w-[85%] flex-col gap-1', mine ? 'ml-auto items-end' : 'items-start')}>
                                {m.kind === 'meeting' && m.meeting ? (
                                    <MeetingCard meeting={m.meeting} mine={mine} />
                                ) : null}
                                {m.body ? (
                                    <div
                                        className={cn(
                                            'whitespace-pre-line break-words rounded-ds-control px-4 py-2.5 text-[15px] leading-relaxed',
                                            mine ? 'bg-ds-primary text-ds-primary-foreground' : 'bg-ds-muted text-ds-foreground',
                                        )}
                                    >
                                        {m.body}
                                    </div>
                                ) : null}
                                <span className="text-xs text-ds-subtle-foreground">
                                    {mine ? 'You' : invitation.hr_name || invitation.hr_org || 'Recruiter'} · {formatDate(m.created_at, true)}
                                </span>
                            </li>
                        );
                    })}
                    <div ref={endRef} />
                </ol>
            )}
            {canSend ? (
                <div className="grid gap-2">
                    <Label htmlFor="reply" className="sr-only">Reply</Label>
                    <Textarea
                        id="reply"
                        placeholder="Write a reply…"
                        maxLength={MAX_BODY}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
                        }}
                    />
                    <div className="flex items-center justify-between gap-3">
                        <span className={cn('text-xs', sendError ? 'text-ds-destructive' : 'text-ds-subtle-foreground')}>
                            {sendError || `${draft.length}/${MAX_BODY}`}
                        </span>
                        <Button onClick={send} disabled={sending || !draft.trim()}>
                            {sending ? <Loader2 className="animate-spin" /> : <Send />} Send
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-ds-muted-foreground">This conversation is closed.</p>
            )}
        </div>
    );
};

const InvitationDetail: React.FC<{ invitation: Invitation; onUpdated: (inv: Invitation) => void; onBack: () => void }> = ({
    invitation, onUpdated, onBack,
}) => {
    const [shareEmail, setShareEmail] = useState(false);
    const [busy, setBusy] = useState<'accept' | 'decline' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const status = invitation.status || 'sent';

    useEffect(() => {
        setShareEmail(false);
        setError(null);
    }, [invitation.invitation_id]);

    const respond = async (response: 'accept' | 'decline') => {
        setBusy(response);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/hr-invitations/${invitation.invitation_id}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ response, share_contact: response === 'accept' && shareEmail }),
            });
            if (!res.ok) throw new Error(await readError(res, 'Could not save your response.'));
            onUpdated(await res.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save your response.');
        } finally {
            setBusy(null);
        }
    };

    return (
        <Card>
            <CardHeader className="gap-3">
                <Button variant="ghost" size="sm" className="w-fit lg:hidden" onClick={onBack}>
                    <ArrowLeft /> All invitations
                </Button>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Briefcase className="size-5 shrink-0 text-ds-primary" />
                            <span className="break-words">{invitation.role_title || 'Invitation to connect'}</span>
                        </CardTitle>
                        <CardDescription>
                            {invitation.hr_org || 'A recruiter on STUDLYF'}
                            {invitation.hr_name && invitation.hr_name !== invitation.hr_org ? ` · ${invitation.hr_name}` : ''}
                        </CardDescription>
                    </div>
                    <StatusBadge status={status} />
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ds-muted-foreground">
                    <span>Received {formatDate(invitation.created_at)}</span>
                    {status === 'sent' && invitation.expires_at && (
                        <span className="flex items-center gap-1"><Clock className="size-3.5" /> Reply by {formatDate(invitation.expires_at)}</span>
                    )}
                    {invitation.responded_at && <span>Replied {formatDate(invitation.responded_at)}</span>}
                    {status === 'accepted' && <span>{invitation.share_contact ? 'Your email is shared with this recruiter' : 'Your email is not shared'}</span>}
                </div>
            </CardHeader>
            <CardContent className="grid gap-5">
                <SafetyNotice />
                {invitation.message ? (
                    <p className="whitespace-pre-line break-words rounded-ds-control bg-ds-muted px-4 py-3 text-[15px] leading-relaxed text-ds-foreground">
                        {invitation.message}
                    </p>
                ) : null}

                {status === 'sent' && (
                    <div className="grid gap-4 rounded-ds-control border border-ds-border p-4">
                        <Label htmlFor="share-email" className="cursor-pointer items-start font-normal leading-snug">
                            <Checkbox id="share-email" checked={shareEmail} onCheckedChange={checked => setShareEmail(checked === true)} />
                            <span>
                                Share my email address with this recruiter
                                <span className="block text-xs text-ds-muted-foreground">Only if you accept. You can keep talking here either way.</span>
                            </span>
                        </Label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button onClick={() => respond('accept')} disabled={busy !== null}>
                                {busy === 'accept' ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Accept
                            </Button>
                            <Button variant="outline" onClick={() => respond('decline')} disabled={busy !== null}>
                                {busy === 'decline' ? <Loader2 className="animate-spin" /> : <XCircle />} Decline
                            </Button>
                        </div>
                    </div>
                )}
                {status === 'expired' && (
                    <p className="text-sm text-ds-muted-foreground">This invitation expired before you replied. It can no longer be accepted.</p>
                )}
                {status === 'withdrawn' && <p className="text-sm text-ds-muted-foreground">The recruiter withdrew this invitation.</p>}
                {status === 'declined' && <p className="text-sm text-ds-muted-foreground">You declined this invitation.</p>}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {(status === 'accepted' || status === 'withdrawn') && <Thread invitation={invitation} />}
            </CardContent>
        </Card>
    );
};

const HrInvitations: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);

    const fetchInvitations = async () => {
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/hr-invitations`, { headers: { ...authHeaders() } });
            if (!res.ok) throw new Error(await readError(res, 'Could not load invitations'));
            const data = await res.json();
            const list: Invitation[] = Array.isArray(data?.invitations) ? data.invitations : [];
            setInvitations(list);
            setSelectedId(prev => prev ?? (list.find(i => i.status === 'sent') || list[0])?.invitation_id ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load invitations');
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
        fetchInvitations();
    }, [authLoading, user?.user_id, navigate]);

    const selected = useMemo(() => invitations.find(i => i.invitation_id === selectedId) || null, [invitations, selectedId]);
    const pendingCount = invitations.filter(i => i.status === 'sent').length;

    const select = (id: string) => {
        setSelectedId(id);
        setShowDetailOnMobile(true);
    };

    return (
        <div className="studlyf-ds min-h-screen bg-[#F8FAFC] pt-32 pb-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Button variant="ghost" size="sm" className="mb-6 -ml-2" onClick={() => navigate('/opportunities/my-applications')}>
                    <ChevronLeft /> Back to my dashboard
                </Button>

                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-ds-foreground sm:text-3xl">Recruiter invitations</h1>
                        <p className="max-w-2xl text-[15px] text-ds-muted-foreground">
                            Invitations from recruiters on STUDLYF who found your profile. Turn on "Visible to recruiters on STUDLYF" in your
                            profile preferences to receive them.
                        </p>
                    </div>
                    {pendingCount > 0 && <Badge variant="solid">{pendingCount} awaiting reply</Badge>}
                </div>

                {loading || authLoading ? (
                    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                        <div className="grid gap-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
                        <Skeleton className="h-96" />
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertDescription className="flex flex-wrap items-center gap-3">
                            {error}
                            <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchInvitations(); }}>Try again</Button>
                        </AlertDescription>
                    </Alert>
                ) : invitations.length === 0 ? (
                    <Card className="items-center px-6 py-16 text-center">
                        <Inbox className="size-10 text-ds-subtle-foreground" />
                        <p className="mt-4 font-semibold text-ds-foreground">No invitations yet</p>
                        <p className="mt-1 max-w-md text-sm text-ds-muted-foreground">When a recruiter invites you, it will show up here and in your notifications.</p>
                    </Card>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
                        <ul className={cn('grid gap-3', showDetailOnMobile && 'hidden lg:grid')} aria-label="Invitations">
                            {invitations.map(inv => (
                                <li key={inv.invitation_id}>
                                    <button
                                        type="button"
                                        onClick={() => select(inv.invitation_id)}
                                        aria-current={inv.invitation_id === selectedId}
                                        className={cn(
                                            'ds-focus-ring w-full rounded-ds-card border bg-ds-card p-4 text-left shadow-ds-sm transition-colors hover:border-ds-primary/40',
                                            inv.invitation_id === selectedId ? 'border-ds-primary ring-1 ring-ds-primary/30' : 'border-ds-border',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="min-w-0 truncate font-semibold text-ds-foreground">{inv.role_title || 'Invitation to connect'}</span>
                                            <StatusBadge status={inv.status} />
                                        </div>
                                        <p className="mt-1 truncate text-sm text-ds-muted-foreground">{inv.hr_org || 'A recruiter on STUDLYF'}</p>
                                        <p className="mt-2 text-xs text-ds-subtle-foreground">{formatDate(inv.created_at)}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className={cn(!showDetailOnMobile && 'hidden lg:block')}>
                            {selected && (
                                <InvitationDetail
                                    invitation={selected}
                                    onBack={() => setShowDetailOnMobile(false)}
                                    onUpdated={updated => setInvitations(prev => prev.map(i => (i.invitation_id === updated.invitation_id ? { ...i, ...updated } : i)))}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HrInvitations;
