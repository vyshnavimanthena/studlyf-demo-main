import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import CompletenessRing, { Completeness } from './CompletenessRing';

/** Compact completeness indicator for the MyProfile header; refetches whenever refreshKey changes. */
const ProfileCompletenessBadge: React.FC<{ refreshKey?: string; onOpenSection?: (module: string) => void }> = ({ refreshKey, onOpenSection }) => {
    const [data, setData] = useState<Completeness | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/me/profile-completeness`, { headers: { ...authHeaders() } });
                if (res.ok && !cancelled) setData(await res.json());
            } catch { /* indicator is optional */ }
        })();
        return () => { cancelled = true; };
    }, [refreshKey]);

    if (!data) return null;
    const next = [...data.sections].filter(s => !s.done).sort((a, b) => b.weight - a.weight)[0];

    return (
        <div className="studlyf-ds flex w-full items-center gap-3 sm:ml-auto sm:w-auto rounded-ds-card border border-ds-border bg-ds-card py-2 pl-2 pr-4 shadow-ds-sm">
            <CompletenessRing score={data.score} size={44} stroke={5} />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ds-foreground">Profile strength</p>
                {next ? (
                    <button
                        type="button"
                        onClick={() => onOpenSection?.(next.module)}
                        className="ds-focus-ring flex max-w-[16rem] items-center gap-1 truncate rounded text-left text-xs text-ds-primary hover:underline"
                        title={next.hint}
                    >
                        <span className="truncate">Next: {next.label} (+{next.weight})</span> <ArrowRight className="size-3 shrink-0" />
                    </button>
                ) : (
                    <p className="text-xs text-ds-success">Every section complete</p>
                )}
            </div>
        </div>
    );
};

export default ProfileCompletenessBadge;
