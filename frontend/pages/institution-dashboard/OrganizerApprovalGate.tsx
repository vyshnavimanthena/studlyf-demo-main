import React, { useCallback, useEffect, useState } from 'react';
import { Clock, LogOut, RefreshCw, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { useAuth } from '../../AuthContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

/**
 * P3-O1: while REQUIRE_ORGANIZER_APPROVAL is on, a pending or rejected organizer sees this screen
 * instead of the dashboard. With the flag off (or an older backend without the endpoint) it renders
 * its children unchanged. Children render straight away unless the last known state (sessionStorage)
 * was blocked, in which case a skeleton shows until the status comes back. Refetched on window focus.
 */
interface ApprovalStatus {
    required: boolean;
    blocked: boolean;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string | null;
    requested_at?: string | null;
    decided_at?: string | null;
    institution_name?: string | null;
    email?: string | null;
}

const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const CACHE_PREFIX = 'studlyf.organizerApproval.blocked.';

const readCachedBlocked = (key: string): boolean => {
    try { return sessionStorage.getItem(key) === '1'; } catch { return false; }
};

const writeCachedBlocked = (key: string, blocked: boolean) => {
    try { sessionStorage.setItem(key, blocked ? '1' : '0'); } catch { /* storage unavailable */ }
};

const GateSkeleton: React.FC = () => (
    <div className="studlyf-ds min-h-screen bg-ds-muted/60 flex flex-col" aria-busy="true">
        <div className="h-16 shrink-0 border-b border-ds-border bg-ds-background" />
        <main className="flex-1 flex items-start justify-center px-6 pt-20">
            <div className="w-full max-w-[560px] rounded-ds-card border border-ds-border bg-ds-background shadow-ds-sm p-8 animate-pulse">
                <div className="size-11 rounded-full bg-ds-muted mb-5" />
                <div className="h-5 w-2/3 rounded bg-ds-muted mb-3" />
                <div className="h-4 w-full rounded bg-ds-muted mb-2" />
                <div className="h-4 w-4/5 rounded bg-ds-muted" />
            </div>
        </main>
    </div>
);

const OrganizerApprovalGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const cacheKey = CACHE_PREFIX + (user?.user_id || 'anon');
    const [state, setState] = useState<ApprovalStatus | null>(null);
    const [checked, setChecked] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        let next: ApprovalStatus | null = null;
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/organizer/approval-status`, { headers: authHeaders() });
            next = res.ok ? await res.json() : null;
        } catch {
            next = null;
        }
        setState(next);
        writeCachedBlocked(cacheKey, !!next?.blocked);
        setChecked(true);
    }, [cacheKey]);

    useEffect(() => {
        load();
        const onFocus = () => { load(); };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [load]);

    if (!checked) return readCachedBlocked(cacheKey) ? <GateSkeleton /> : <>{children}</>;
    if (!state?.blocked) return <>{children}</>;

    const rejected = state.status === 'rejected';

    const refresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const signOut = () => {
        logout();
        navigate('/login?role=institution', { replace: true });
    };

    return (
        <div className="studlyf-ds min-h-screen bg-ds-muted/60 flex flex-col">
            <header className="h-16 shrink-0 border-b border-ds-border bg-ds-background px-8 flex items-center justify-between">
                <img src="/images-optimized/studlyf_secondary.webp" alt="Studlyf" className="h-7" />
                <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut /> Sign out
                </Button>
            </header>

            <main className="flex-1 flex items-start justify-center px-6 pt-20 pb-16">
                <div className="w-full max-w-[560px] rounded-ds-card border border-ds-border bg-ds-background shadow-ds-sm">
                    <div className="p-8 pb-6">
                        <div className={`size-11 rounded-full flex items-center justify-center mb-5 ${rejected ? 'bg-[#fdecea] text-ds-destructive' : 'bg-ds-lavender-strong text-ds-primary'}`}>
                            {rejected ? <XCircle className="size-5" /> : <Clock className="size-5" />}
                        </div>
                        <h1 className="mb-2 text-[22px] font-semibold tracking-tight text-ds-foreground">
                            {rejected ? 'Your organizer account wasn’t approved' : 'Your organizer account is under review'}
                        </h1>
                        <p className="text-[15px] leading-relaxed text-ds-muted-foreground">
                            {rejected
                                ? 'You can still sign in, but creating and editing events is turned off for this account.'
                                : 'The STUDLYF team reviews every new organizer before they can create events. We’ll notify you by email and in the app as soon as a decision is made.'}
                        </p>

                        {rejected && state.rejection_reason && (
                            <Alert variant="destructive" className="mt-5">
                                <AlertTitle>Reason</AlertTitle>
                                <AlertDescription>{state.rejection_reason}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <dl className="border-t border-ds-border px-8 py-5 grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                        <dt className="text-ds-muted-foreground">Status</dt>
                        <dd>
                            <Badge variant={rejected ? 'destructive' : 'warning'}>{rejected ? 'Not approved' : 'Pending review'}</Badge>
                        </dd>
                        <dt className="text-ds-muted-foreground">Organization</dt>
                        <dd className="font-medium text-ds-foreground">{state.institution_name || '—'}</dd>
                        <dt className="text-ds-muted-foreground">Account email</dt>
                        <dd className="font-medium text-ds-foreground">{state.email || '—'}</dd>
                        <dt className="text-ds-muted-foreground">{rejected ? 'Reviewed on' : 'Submitted on'}</dt>
                        <dd className="font-medium text-ds-foreground">{formatDate(rejected ? state.decided_at : state.requested_at)}</dd>
                    </dl>

                    <div className="border-t border-ds-border px-8 py-5 flex items-center justify-between gap-4">
                        <p className="text-[13px] text-ds-subtle-foreground">
                            {rejected ? 'Think this is a mistake? Reply to our email.' : 'You can sign out and come back at any time.'}
                        </p>
                        <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
                            <RefreshCw className={refreshing ? 'animate-spin' : ''} /> Check status
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrganizerApprovalGate;
