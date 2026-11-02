import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';
import { Button } from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';
import { adminDsTheme, formatDate, statusPill } from './adminDsTheme';

/** P3-O2 admin view: events whose results are published, with Unpublish (admin only). */
interface PublishedEvent {
    id: string;
    title: string;
    institution_name: string;
    published_at?: string | null;
    published_via?: string | null;
    ranked_entries?: number | null;
}

const VIA_LABEL: Record<string, string> = {
    organizer: 'Organizer',
    admin: 'Admin',
    admin_finalize: 'Admin finalize',
};

const PublishedResults: React.FC = () => {
    const { role } = useAuth();
    const [items, setItems] = useState<PublishedEvent[] | null>(null);
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [target, setTarget] = useState<PublishedEvent | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/admin/results/published`, { headers: authHeaders() });
            if (res.status === 404) {
                setDisabled(true);
                setItems([]);
            } else if (!res.ok) {
                setError(`Request failed (${res.status})`);
            } else {
                setItems((await res.json()).items);
            }
        } catch {
            setError('Could not reach the server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const unpublish = async () => {
        if (!target) return;
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/admin/events/${target.id}/results/unpublish`, {
                method: 'POST',
                headers: authHeaders(),
            });
            if (!res.ok) setError(`Unpublish failed (${res.status})`);
            setTarget(null);
            await load();
        } finally {
            setBusy(false);
        }
    };

    if (role && !['admin', 'super_admin'].includes(role)) {
        return <div className="py-24 text-center text-sm text-slate-600">Only STUDLYF admins can manage published results.</div>;
    }

    return (
        <div className="studlyf-ds space-y-6 text-ds-foreground" style={adminDsTheme}>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Published results</h1>
                <p className="mt-1 text-sm text-ds-muted-foreground">
                    Events whose final rankings are published. Organizers publish their own events; only admins can unpublish.
                </p>
            </div>

            {error && <div className="rounded-ds-control border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">{error}</div>}

            <div className="overflow-hidden rounded-ds-card border border-ds-border bg-ds-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-ds-border text-left text-xs font-medium text-ds-muted-foreground">
                            <th className="px-5 py-3 font-medium">Event</th>
                            <th className="px-3 py-3 font-medium">Organization</th>
                            <th className="px-3 py-3 font-medium">Published</th>
                            <th className="px-3 py-3 font-medium">Published by</th>
                            <th className="px-3 py-3 text-right font-medium">Entries</th>
                            <th className="px-5 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && !items ? (
                            <tr><td colSpan={6} className="px-5 py-16 text-center text-ds-muted-foreground">
                                <Loader2 className="mr-2 inline size-4 animate-spin" />Loading…
                            </td></tr>
                        ) : disabled ? (
                            <tr><td colSpan={6} className="px-5 py-16 text-center">
                                <div className="font-medium">Organizer result publishing is turned off</div>
                                <div className="mt-1 text-[13px] text-ds-muted-foreground">Set ORGANIZER_PUBLISH_RESULTS=on on the backend to enable it.</div>
                            </td></tr>
                        ) : !items || items.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-16 text-center">
                                <div className="font-medium">No published results yet</div>
                                <div className="mt-1 text-[13px] text-ds-muted-foreground">Events appear here once their results are published.</div>
                            </td></tr>
                        ) : items.map((e) => (
                            <tr key={e.id} className="border-b border-ds-border last:border-0 hover:bg-[#f6f3ff]">
                                <td className="px-5 py-3.5 font-medium">{e.title}</td>
                                <td className="px-3 py-3.5 text-ds-muted-foreground">{e.institution_name || '—'}</td>
                                <td className="px-3 py-3.5 text-ds-muted-foreground tabular-nums">{formatDate(e.published_at, true)}</td>
                                <td className="px-3 py-3.5">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusPill.neutral}`}>
                                        {VIA_LABEL[e.published_via || ''] || '—'}
                                    </span>
                                </td>
                                <td className="px-3 py-3.5 text-right tabular-nums">{e.ranked_entries ?? '—'}</td>
                                <td className="px-5 py-3.5 text-right">
                                    <Button variant="outline" size="sm" className="h-8 bg-transparent" onClick={() => setTarget(e)}>Unpublish</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={!!target} onOpenChange={(o) => { if (!o && !busy) setTarget(null); }}>
                <DialogContent style={adminDsTheme} className="text-ds-foreground">
                    <DialogHeader>
                        <DialogTitle>Unpublish results for {target?.title}?</DialogTitle>
                        <DialogDescription>
                            The published ranking is archived and stops counting as the event’s final results, for example on builder profiles
                            and in the Talent API. The organizer can publish again afterwards. Certificates already issued stay valid.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setTarget(null)} disabled={busy}>Cancel</Button>
                        <Button variant="destructive" size="sm" onClick={unpublish} disabled={busy}>
                            {busy && <Loader2 className="animate-spin" />} Unpublish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PublishedResults;
