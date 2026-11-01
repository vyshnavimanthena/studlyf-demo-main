import type React from 'react';

/**
 * The admin shell is dark (#09090B) while the ds- tokens are light. Setting the token variables on a
 * wrapper re-themes the shadcn primitives inside it. Dialogs render in a portal, so pass the same style
 * to DialogContent.
 */
export const adminDsTheme = {
    '--ds-background': '#111114',
    '--ds-foreground': '#f4f4f5',
    '--ds-card': '#111114',
    '--ds-card-foreground': '#f4f4f5',
    '--ds-muted': '#18181b',
    '--ds-muted-foreground': '#a1a1aa',
    '--ds-subtle-foreground': '#8e8e98',
    '--ds-border': '#27272a',
    '--ds-input': '#3f3f46',
    '--ds-lavender': '#1d1a2e',
    '--ds-lavender-strong': '#2a2350',
    '--ds-primary': '#7c5cff',
    '--ds-primary-hover': '#6a48f5',
    '--ds-ring': '#7c5cff',
    '--ds-destructive': '#e5484d',
} as React.CSSProperties;

export const statusPill: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/20',
    neutral: 'bg-zinc-500/10 text-zinc-300 ring-1 ring-inset ring-zinc-500/20',
};

export const formatDate = (value?: string | null, withTime = false) => {
    if (!value) return '—';
    const raw = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, withTime
        ? { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
        : { day: 'numeric', month: 'short', year: 'numeric' });
};
