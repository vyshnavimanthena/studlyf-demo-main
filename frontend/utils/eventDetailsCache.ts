const CACHE_TTL_MS = 5 * 60 * 1000;

type EventCacheEntry = {
    event: any;
    participants: any[];
    stages: any[];
    criteria: any[];
    submissions: any[];
    teams: any[];
    quizzes: any[];
    ts: number;
};

const memoryCache = new Map<string, EventCacheEntry>();

function storageKey(eventId: string) {
    return `studlyf_event_details_${eventId}`;
}

export function readEventDetailsCache(eventId: string): EventCacheEntry | null {
    const mem = memoryCache.get(eventId);
    if (mem && Date.now() - mem.ts < CACHE_TTL_MS) return mem;

    try {
        const raw = sessionStorage.getItem(storageKey(eventId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as EventCacheEntry;
        if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL_MS) {
            sessionStorage.removeItem(storageKey(eventId));
            return null;
        }
        memoryCache.set(eventId, parsed);
        return parsed;
    } catch {
        return null;
    }
}

export function writeEventDetailsCache(eventId: string, entry: Omit<EventCacheEntry, 'ts'>) {
    const payload: EventCacheEntry = { ...entry, ts: Date.now() };
    memoryCache.set(eventId, payload);
    try {
        sessionStorage.setItem(storageKey(eventId), JSON.stringify(payload));
    } catch {
        // sessionStorage may be full — memory cache still helps during the session
    }
}

export function invalidateEventDetailsCache(eventId: string) {
    memoryCache.delete(eventId);
    try {
        sessionStorage.removeItem(storageKey(eventId));
    } catch { /* ignore */ }
}
