import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Undo2 } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';

/**
 * P3-O2: the event owner reviews the ranked results and publishes them (behind ORGANIZER_PUBLISH_RESULTS).
 * Publishing freezes the ranking, marks the event ENDED with finalized_at and notifies participants.
 * Only an admin can unpublish.
 */
interface RankingRow {
    rank: number;
    name: string;
    lead_name?: string | null;
    participation_type?: string;
    project_title?: string | null;
    college?: string | null;
    total_score?: number | null;
}

interface ResultsResponse {
    event: { id: string; title: string; status?: string; published: boolean; published_at?: string | null; published_via?: string | null };
    rankings: RankingRow[];
    total: number;
    scored: number;
    can_publish: boolean;
    can_unpublish: boolean;
}

const formatDateTime = (value?: string | null) => {
    if (!value) return '';
    const d = new Date(value.endsWith('Z') || value.includes('+') ? value : `${value}Z`);
    return Number.isNaN(d.getTime())
        ? ''
        : d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const readError = async (res: Response) => {
    try {
        const body = await res.json();
        return typeof body?.detail === 'string' ? body.detail : 'Something went wrong. Please try again.';
    } catch {
        return 'Something went wrong. Please try again.';
    }
};

const PublishResultsPanel: React.FC<{ eventId: string; onStatusChange?: () => void }> = ({ eventId, onStatusChange }) => {
    const [data, setData] = useState<ResultsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [unpublishOpen, setUnpublishOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [justPublished, setJustPublished] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/organizer/events/${eventId}/results`, { headers: authHeaders() });
            if (!res.ok) {
                setError(await readError(res));
                setData(null);
            } else {
                setData(await res.json());
            }
        } catch {
            setError('Could not load results. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => { load(); }, [load]);

    const publish = async () => {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/organizer/events/${eventId}/results/publish`, {
                method: 'POST',
                headers: authHeaders(),
            });
            if (!res.ok) {
                setError(await readError(res));
            } else {
                setJustPublished(true);
                await load();
                onStatusChange?.();
            }
        } finally {
            setBusy(false);
            setConfirmOpen(false);
        }
    };

    const unpublish = async () => {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/admin/events/${eventId}/results/unpublish`, {
                method: 'POST',
                headers: authHeaders(),
            });
            if (!res.ok) setError(await readError(res));
            else {
                setJustPublished(false);
                await load();
                onStatusChange?.();
            }
        } finally {
            setBusy(false);
            setUnpublishOpen(false);
        }
    };

    const published = !!data?.event.published;
    const unscored = data ? data.total - data.scored : 0;

    return (
        <div className="studlyf-ds space-y-5">
            <div className="flex items-start justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold tracking-tight text-ds-foreground">Results</h2>
                        {data && (
                            <Badge variant={published ? 'success' : 'muted'}>{published ? 'Published' : 'Not published'}</Badge>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-ds-muted-foreground max-w-2xl">
                        {published
                            ? `Published ${formatDateTime(data?.event.published_at)}. This ranking is final and visible to participants.`
                            : 'Review the final ranking, then publish it. Publishing ends the event, freezes this ranking and notifies every participant.'}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {!published && (
                        <Button variant="outline" size="sm" onClick={load} disabled={loading || busy}>
                            <RefreshCw className={loading ? 'animate-spin' : ''} /> Recalculate
                        </Button>
                    )}
                    {data?.can_unpublish && (
                        <Button variant="outline" size="sm" onClick={() => setUnpublishOpen(true)} disabled={busy}>
                            <Undo2 /> Unpublish
                        </Button>
                    )}
                    {!published && (
                        <Button size="sm" onClick={() => setConfirmOpen(true)} disabled={!data?.can_publish || busy || loading}>
                            Publish results
                        </Button>
                    )}
                </div>
            </div>

            {justPublished && published && (
                <Alert variant="success">
                    <CheckCircle2 className="size-4" />
                    <AlertTitle>Results published</AlertTitle>
                    <AlertDescription>Participants are being notified.</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Couldn’t complete that</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!published && data && unscored > 0 && data.total > 0 && (
                <Alert variant="warning">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>{unscored} of {data.total} entries have no judge scores yet</AlertTitle>
                    <AlertDescription>They will be published with a score of 0. Wait for judging to finish if that isn’t intended.</AlertDescription>
                </Alert>
            )}

            <div className="rounded-ds-card border border-ds-border bg-ds-background overflow-hidden">
                <div className="flex items-center justify-between border-b border-ds-border px-5 py-3">
                    <span className="text-sm font-medium text-ds-foreground">Final ranking</span>
                    {data && (
                        <span className="text-[13px] text-ds-muted-foreground">
                            {data.total} {data.total === 1 ? 'entry' : 'entries'}
                        </span>
                    )}
                </div>
                {loading && !data ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ds-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Loading ranking…
                    </div>
                ) : !data || data.rankings.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-sm font-medium text-ds-foreground">No ranked submissions yet</p>
                        <p className="mt-1 text-[13px] text-ds-muted-foreground">Results can be published once submissions have been judged.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[12px] font-medium text-ds-muted-foreground bg-ds-muted/50">
                                <th className="w-16 px-5 py-2.5 font-medium">Rank</th>
                                <th className="px-3 py-2.5 font-medium">Team / participant</th>
                                <th className="px-3 py-2.5 font-medium">Project</th>
                                <th className="px-3 py-2.5 font-medium">College</th>
                                <th className="w-24 px-5 py-2.5 text-right font-medium">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.rankings.map((r) => (
                                <tr key={`${r.rank}-${r.name}`} className="border-t border-ds-border">
                                    <td className="px-5 py-3 tabular-nums font-semibold text-ds-foreground">{r.rank}</td>
                                    <td className="px-3 py-3">
                                        <div className="font-medium text-ds-foreground">{r.name}</div>
                                        {r.participation_type === 'TEAM' && r.lead_name && r.lead_name !== r.name && (
                                            <div className="text-[12px] text-ds-muted-foreground">Lead: {r.lead_name}</div>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-ds-muted-foreground">{r.project_title || '—'}</td>
                                    <td className="px-3 py-3 text-ds-muted-foreground">{r.college || '—'}</td>
                                    <td className="px-5 py-3 text-right tabular-nums text-ds-foreground">
                                        {typeof r.total_score === 'number' ? r.total_score.toFixed(2) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Dialog open={confirmOpen} onOpenChange={(o) => !busy && setConfirmOpen(o)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Publish results for {data?.event.title}?</DialogTitle>
                        <DialogDescription>
                            The ranking of {data?.total} {data?.total === 1 ? 'entry' : 'entries'} will be frozen, the event will be marked as ended,
                            and all participants will be notified. You can’t undo this yourself; only a STUDLYF admin can unpublish results.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={busy}>Cancel</Button>
                        <Button size="sm" onClick={publish} disabled={busy}>
                            {busy && <Loader2 className="animate-spin" />} Publish results
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={unpublishOpen} onOpenChange={(o) => !busy && setUnpublishOpen(o)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unpublish results?</DialogTitle>
                        <DialogDescription>
                            The published ranking is archived and stops counting as the event’s final results, for example on builder profiles
                            and in the Talent API. Participants are not notified, and certificates already issued stay valid.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setUnpublishOpen(false)} disabled={busy}>Cancel</Button>
                        <Button variant="destructive" size="sm" onClick={unpublish} disabled={busy}>
                            {busy && <Loader2 className="animate-spin" />} Unpublish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PublishResultsPanel;
