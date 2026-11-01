export type PreviewFileKind = 'pdf' | 'image' | 'video' | 'office' | 'other';

export function mimeToExtension(mime: string): string {
    const m = (mime || '').toLowerCase();
    if (m.includes('pdf')) return 'pdf';
    if (m.includes('presentation') || m.includes('powerpoint')) return 'pptx';
    if (m.includes('msword') || m.includes('wordprocessing')) return 'docx';
    if (m.includes('spreadsheet') || m.includes('excel')) return 'xlsx';
    if (m.includes('png')) return 'png';
    if (m.includes('jpeg') || m.includes('jpg')) return 'jpg';
    if (m.includes('gif')) return 'gif';
    if (m.includes('webp')) return 'webp';
    if (m.includes('mp4')) return 'mp4';
    if (m.includes('webm')) return 'webm';
    const tail = m.split('/')[1] || 'bin';
    if (tail.includes('vnd.')) return 'bin';
    return tail;
}

export function getFileKind(filename: string, mime?: string): PreviewFileKind {
    const name = (filename || '').toLowerCase();
    const m = (mime || '').toLowerCase();
    if (name.endsWith('.pdf') || m.includes('pdf')) return 'pdf';
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(name) || m.startsWith('image/')) return 'image';
    if (/\.(mp4|webm|mov)$/.test(name) || m.startsWith('video/')) return 'video';
    if (/\.(pptx?|docx?|xlsx?)$/.test(name) || m.includes('presentation') || m.includes('powerpoint') || m.includes('msword') || m.includes('spreadsheet')) {
        return 'office';
    }
    return 'other';
}

export function getFileTypeLabel(filename: string, mime?: string): string {
    const kind = getFileKind(filename, mime);
    if (kind === 'pdf') return 'PDF Document';
    if (kind === 'office') {
        const name = (filename || '').toLowerCase();
        const m = (mime || '').toLowerCase();
        if (name.endsWith('.ppt') || name.endsWith('.pptx') || m.includes('presentation') || m.includes('powerpoint')) {
            return 'PowerPoint (PPT)';
        }
        if (name.endsWith('.doc') || name.endsWith('.docx') || m.includes('word')) return 'Word Document';
        if (name.endsWith('.xls') || name.endsWith('.xlsx') || m.includes('sheet') || m.includes('excel')) return 'Excel Spreadsheet';
        return 'Office Document';
    }
    if (kind === 'image') return 'Image';
    if (kind === 'video') return 'Video';
    return 'File';
}

export function getFileTypeBadge(filename: string, mime?: string): string {
    const kind = getFileKind(filename, mime);
    if (kind === 'pdf') return 'PDF';
    if (kind === 'office') {
        const name = (filename || '').toLowerCase();
        const m = (mime || '').toLowerCase();
        if (name.endsWith('.ppt') || name.endsWith('.pptx') || m.includes('presentation') || m.includes('powerpoint')) return 'PPT';
        if (name.endsWith('.doc') || name.endsWith('.docx') || m.includes('word')) return 'DOC';
        if (name.endsWith('.xls') || name.endsWith('.xlsx')) return 'XLS';
        return 'DOC';
    }
    if (kind === 'image') return 'IMG';
    if (kind === 'video') return 'VID';
    return 'FILE';
}

/** Cloud document viewers only work with publicly reachable http(s) URLs. */
export function canUseCloudDocumentViewer(url: string): boolean {
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) return false;
    try {
        const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        if (!['http:', 'https:'].includes(parsed.protocol)) return false;
        const host = parsed.hostname.toLowerCase();
        return host !== 'localhost' && host !== '127.0.0.1' && !host.endsWith('.local');
    } catch {
        return false;
    }
}

export function buildPreviewFilename(label: string, mime: string, storedFilename?: string): string {
    if (storedFilename && storedFilename.includes('.')) return storedFilename;
    const ext = mimeToExtension(mime);
    const safeLabel = (label || 'Attachment').replace(/[^\w\s.-]/g, '').trim() || 'Attachment';
    return `${safeLabel}.${ext}`;
}

const fileBlobCache = new Map<string, { url: string; filename: string; mime: string }>();

export function getCachedSubmissionFile(cacheKey: string) {
    return fileBlobCache.get(cacheKey) || null;
}

export function cacheSubmissionFile(cacheKey: string, entry: { url: string; filename: string; mime: string }) {
    const existing = fileBlobCache.get(cacheKey);
    if (existing?.url?.startsWith('blob:') && existing.url !== entry.url) {
        try { URL.revokeObjectURL(existing.url); } catch { /* ignore */ }
    }
    fileBlobCache.set(cacheKey, entry);
    return entry;
}

/** Resolve assigned judge id from submission payload (handles snake_case + assigned_judges array). */
export function resolveAssignedJudgeId(sub: any): string {
    if (!sub) return '';
    const direct = sub.assignedJudgeId || sub.assigned_judge_id || '';
    if (direct) return String(direct);
    const judges = sub.assigned_judges;
    if (Array.isArray(judges) && judges.length > 0) {
        const first = judges[0];
        if (typeof first === 'object' && first?.judge_id) return String(first.judge_id);
        if (typeof first === 'string') return first;
    }
    return '';
}

export function parseContentDispositionFilename(header: string | null, fallback: string): string {
    if (!header) return fallback;
    const match = header.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
    return match?.[1]?.trim() || fallback;
}

export async function fetchSubmissionFileBlob(
    url: string,
    options?: { headers?: Record<string, string>; cacheKey?: string; filenameHint?: string },
): Promise<{ url: string; filename: string; mime: string } | null> {
    const cacheKey = options?.cacheKey;
    if (cacheKey) {
        const cached = getCachedSubmissionFile(cacheKey);
        if (cached) return cached;
    }
    try {
        const res = await fetch(url, { headers: options?.headers, cache: 'no-store' });
        if (!res.ok) return null;
        const blob = await res.blob();
        const mime = blob.type || 'application/octet-stream';
        const fallbackName = buildPreviewFilename(options?.filenameHint || 'Attachment', mime, options?.filenameHint);
        const filename = parseContentDispositionFilename(res.headers.get('Content-Disposition'), fallbackName);
        const objectUrl = window.URL.createObjectURL(blob);
        const entry = { url: objectUrl, filename, mime };
        if (cacheKey) cacheSubmissionFile(cacheKey, entry);
        return entry;
    } catch {
        return null;
    }
}
