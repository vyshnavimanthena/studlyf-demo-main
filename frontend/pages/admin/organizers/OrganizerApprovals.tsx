import React, { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Search, X } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';
import { adminDsTheme, formatDate, statusPill } from './adminDsTheme';

/** P3-O1 admin review of organizer (institution) accounts. */
type Status = 'pending' | 'approved' | 'rejected';

interface Organizer {
    user_id: string;
    full_name: string;
    email: string;
    institution_name: string;
    approval_status: Status;
    requested_at?: string | null;
    decided_at?: string | null;
    decided_by?: string | null;
    rejection_reason?: string | null;
    email_verified: boolean;
    joins_existing_institution?: { institution_name: string; organizers: number } | null;
}

interface ListResponse {
    items: Organizer[];
    total: number;
    counts: Record<Status, number>;
    required: boolean;
}

const STATUS_LABEL: Record<Status, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

const readError = async (res: Response) => {
    try {
        const body = await res.json();
        return typeof body?.detail === 'string' ? body.detail : `Request failed (${res.status})`;
    } catch {
        return `Request failed (${res.status})`;
    }
};

const OrganizerApprovals: React.FC = () => {
    const { role } = useAuth();
    const [status, setStatus] = useState<Status>('pending');
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');
    const [data, setData] = useState<ListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [rejecting, setRejecting] = useState<Organizer | null>(null);
    const [reason, setReason] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebounced(query.trim()), 250);
        return () => clearTimeout(t);
    }, [query]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ status, limit: '100' });
            if (debounced) params.set('q', debounced);
            const res = await fetch(`${API_BASE_URL}/api/v1/admin/organizers?${params}`, { headers: authHeaders() });
            if (!res.ok) {
                setError(await readError(res));
                setData(null);
            } else {
                setData(await res.json());
            }
        } catch {
            setError('Could not reach the server.');
        } finally {
            setLoading(false);
        }
    }, [status, debounced]);

    useEffect(() => { load(); }, [load]);

    const decide = async (org: Organizer, action: 'approve' | 'reject', rejectReason?: string) => {
        setBusyId(org.user_id);
        setError(null);
        setNotice(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/admin/organizers/${org.user_id}/${action}`, {
                method: 'POST',
                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                body: action === 'reject' ? JSON.stringify({ reason: rejectReason }) : undefined,
            });
            if (!res.ok) {
                setError(await readError(res));
                return false;
            }
            setNotice(`${org.institution_name || org.email} ${action === 'approve' ? 'approved' : 'rejected'}. The organizer has been notified.`);
            await load();
            return true;
        } finally {
            setBusyId(null);
        }
    };

    const submitReject = async () => {
        if (!rejecting) return;
        const ok = await decide(rejecting, 'reject', reason.trim());
        if (ok) {
            setRejecting(null);
            setReason('');
        }
    };

    if (role && !['admin', 'super_admin'].includes(role)) {
        return <div className="py-24 text-center text-sm text-slate-600">Only STUDLYF admins can review organizer accounts.</div>;
    }

    const counts = data?.counts;

    return (
        <div className="studlyf-ds space-y-6 text-ds-foreground" style={adminDsTheme}>
            <div className="flex items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Organizer approvals</h1>
                    <p className="mt-1 text-sm text-ds-muted-foreground">
                        Review organizer accounts before they can create and edit events.
                    </p>
                </div>
                {data && (
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${data.required ? statusPill.approved : statusPill.neutral}`}>
                        <span className={`size-1.5 rounded-full ${data.required ? 'bg-emerald-400' : 'bg-zinc-400'}`} />
                        {data.required ? 'Approval required for new organizers' : 'Approval gate off: new organizers are not held'}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between gap-4">
                <Tabs value={status} onValueChange={(v) => setStatus(v as Status)}>
                    <TabsList>
                        {(['pending', 'approved', 'rejected'] as Status[]).map((s) => (
                            <TabsTrigger key={s} value={s}>
                                {STATUS_LABEL[s]}
                                {counts && <span className="ml-1 tabular-nums text-ds-muted-foreground">{counts[s]}</span>}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <div className="relative w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ds-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search organizers"
                        className="h-9 pl-9 text-sm"
                        aria-label="Search organizers"
                    />
                </div>
            </div>

            {notice && (
                <div className="flex items-center justify-between rounded-ds-control border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-600">
                    {notice}
                    <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-200" aria-label="Dismiss"><X className="size-4" /></button>
                </div>
            )}
            {error && (
                <div className="rounded-ds-control border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">{error}</div>
            )}

            <div className="overflow-hidden rounded-ds-card border border-ds-border bg-ds-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-ds-border text-left text-xs font-medium text-ds-muted-foreground">
                            <th className="px-5 py-3 font-medium">Organizer</th>
                            <th className="px-3 py-3 font-medium">Organization</th>
                            <th className="px-3 py-3 font-medium">{status === 'pending' ? 'Submitted' : 'Reviewed'}</th>
                            <th className="px-3 py-3 font-medium">Email</th>
                            {status === 'rejected' && <th className="px-3 py-3 font-medium">Reason</th>}
                            <th className="px-5 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && !data ? (
                            <tr><td colSpan={6} className="px-5 py-16 text-center text-ds-muted-foreground">
                                <Loader2 className="mr-2 inline size-4 animate-spin" />Loading…
                            </td></tr>
                        ) : !data || data.items.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-16 text-center">
                                <div className="font-medium">{debounced ? 'No organizers match your search' : `No ${STATUS_LABEL[status].toLowerCase()} organizers`}</div>
                                <div className="mt-1 text-[13px] text-ds-muted-foreground">
                                    {status === 'pending' && !debounced ? 'New organizer sign-ups will appear here for review.' : 'Try another tab or search.'}
                                </div>
                            </td></tr>
                        ) : data.items.map((o) => (
                            <tr key={o.user_id} className="border-b border-ds-border last:border-0 hover:bg-[#f6f3ff]">
                                <td className="px-5 py-3.5">
                                    <div className="font-medium">{o.full_name || '—'}</div>
                                    <div className="text-[13px] text-ds-muted-foreground">{o.email}</div>
                                </td>
                                <td className="px-3 py-3.5">
                                    <div>{o.institution_name || <span className="text-ds-muted-foreground">—</span>}</div>
                                    {o.joins_existing_institution && (
                                        <span className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-medium leading-snug ${statusPill.pending}`}>
                                            Joins existing institution {o.joins_existing_institution.institution_name} ({o.joins_existing_institution.organizers} {o.joins_existing_institution.organizers === 1 ? 'organizer' : 'organizers'})
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 py-3.5 whitespace-nowrap text-ds-muted-foreground tabular-nums">
                                    {formatDate(status === 'pending' ? o.requested_at : (o.decided_at || o.requested_at))}
                                </td>
                                <td className="px-3 py-3.5">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${o.email_verified ? statusPill.approved : statusPill.neutral}`}>
                                        {o.email_verified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                                {status === 'rejected' && (
                                    <td className="max-w-[280px] px-3 py-3.5 text-ds-muted-foreground">
                                        <span className="line-clamp-2" title={o.rejection_reason || ''}>{o.rejection_reason || '—'}</span>
                                    </td>
                                )}
                                <td className="px-5 py-3.5">
                                    <div className="flex justify-end gap-2">
                                        {o.approval_status !== 'rejected' && (
                                            <Button
                                                variant="outline" size="sm"
                                                className="h-8 bg-transparent"
                                                disabled={busyId === o.user_id}
                                                onClick={() => { setRejecting(o); setReason(''); }}
                                            >
                                                {o.approval_status === 'approved' ? 'Revoke' : 'Reject'}
                                            </Button>
                                        )}
                                        {o.approval_status !== 'approved' && (
                                            <Button size="sm" className="h-8" disabled={busyId === o.user_id} onClick={() => decide(o, 'approve')}>
                                                {busyId === o.user_id ? <Loader2 className="animate-spin" /> : <Check />} Approve
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={!!rejecting} onOpenChange={(o) => { if (!o && !busyId) setRejecting(null); }}>
                <DialogContent style={adminDsTheme} className="text-ds-foreground">
                    <DialogHeader>
                        <DialogTitle>
                            {rejecting?.approval_status === 'approved' ? 'Revoke approval' : 'Reject organizer'}
                        </DialogTitle>
                        <DialogDescription>
                            {rejecting?.institution_name || rejecting?.email} will be able to sign in but not create or edit events.
                            They’ll see this reason in the app and by email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <label htmlFor="reject-reason" className="text-sm font-medium">Reason</label>
                        <Textarea
                            id="reject-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value.slice(0, 500))}
                            placeholder="For example: we couldn’t verify that this email belongs to the organization."
                            rows={4}
                            autoFocus
                        />
                        <div className="text-right text-xs text-ds-muted-foreground tabular-nums">{reason.length}/500</div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setRejecting(null)} disabled={!!busyId}>Cancel</Button>
                        <Button variant="destructive" size="sm" onClick={submitReject} disabled={reason.trim().length < 3 || !!busyId}>
                            {busyId && <Loader2 className="animate-spin" />}
                            {rejecting?.approval_status === 'approved' ? 'Revoke approval' : 'Reject organizer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrganizerApprovals;
