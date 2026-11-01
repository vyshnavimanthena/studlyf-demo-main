import { useCallback, useEffect, useRef } from 'react';
import { API_BASE_URL, authHeaders } from '../apiConfig';
import { useDashboardCache } from '../contexts/DashboardDataContext';

const CACHE_KEY = 'institutionEventsSummary';
const inflight = new Map<string, Promise<any[]>>();

function mapLegacyEvents(data: any[]): any[] {
    return (Array.isArray(data) ? data : []).map((e: any) => ({
        _id: e._id,
        title: e.title || e.name,
        status: e.status,
        category: e.category || e.type,
        start_date: e.start_date || e.startDate || e.eventStartDate || e.registrationStartDate,
        end_date: e.end_date || e.endDate || e.eventEndDate || e.registrationDeadline || e.deadline,
        created_at: e.created_at || e.createdAt,
        participant_count: e.participant_count || 0,
        logo_url: e.logo_url || e.image_url || e.logo,
        image_url: e.image_url || e.logo_url,
    }));
}

async function fetchEventsSummary(institutionId: string): Promise<any[]> {
    const existing = inflight.get(institutionId);
    if (existing) return existing;

    const promise = (async () => {
        const summaryRes = await fetch(
            `${API_BASE_URL}/api/v1/institution/events/${institutionId}/summary?limit=100`,
            { headers: { ...authHeaders() } },
        );

        if (summaryRes.ok) {
            const body = await summaryRes.json();
            return Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : [];
        }

        // Fallback for deployed backends that have not picked up /summary yet
        if (summaryRes.status === 404) {
            const legacyRes = await fetch(
                `${API_BASE_URL}/api/v1/institution/events/${institutionId}`,
                { headers: { ...authHeaders() } },
            );
            if (legacyRes.ok) {
                const legacy = await legacyRes.json();
                return mapLegacyEvents(legacy);
            }
        }

        throw new Error(`Events summary failed: ${summaryRes.status}`);
    })().finally(() => {
        inflight.delete(institutionId);
    });

    inflight.set(institutionId, promise);
    return promise;
}

export function useInstitutionEvents(institutionId?: string) {
    const { cache, setCacheData, isLoading, setLoading } = useDashboardCache();
    const data = (cache[CACHE_KEY] as any[]) || [];
    const loading = isLoading[CACHE_KEY] ?? !cache[CACHE_KEY];
    const fetchedRef = useRef<string | null>(null);
    const failedRef = useRef(false);

    const refresh = useCallback(async () => {
        if (!institutionId) return;
        setLoading(CACHE_KEY, true);
        try {
            const items = await fetchEventsSummary(institutionId);
            setCacheData(CACHE_KEY, items);
            failedRef.current = false;
        } catch (err) {
            failedRef.current = true;
            try {
                console.error('Failed to load institution events:', err instanceof Error ? err.message : String(err));
            } catch (_) {}
        } finally {
            setLoading(CACHE_KEY, false);
        }
    }, [institutionId, setCacheData, setLoading]);

    useEffect(() => {
        if (!institutionId) return;
        if (cache[CACHE_KEY] && fetchedRef.current === institutionId) {
            setLoading(CACHE_KEY, false);
            return;
        }
        if (fetchedRef.current === institutionId && failedRef.current) {
            return;
        }
        fetchedRef.current = institutionId;
        refresh();
    }, [institutionId, refresh, setLoading, cache]);

    // Auto-refresh when an opportunity/event is created/updated
    useEffect(() => {
        window.addEventListener('opportunity-list-refresh', refresh);
        return () => window.removeEventListener('opportunity-list-refresh', refresh);
    }, [refresh]);

    return { events: data, loading, refresh };
}
