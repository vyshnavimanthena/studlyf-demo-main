import type React from 'react';

/**
 * The admin shell uses the light ds- palette. The token variables are set on a wrapper so the shadcn
 * primitives inside it pick them up. Dialogs render in a portal, so pass the same style to DialogContent.
 */
export const adminDsTheme = {
    '--ds-background': '#ffffff',
    '--ds-foreground': '#14102b',
    '--ds-card': '#ffffff',
    '--ds-card-foreground': '#14102b',
    '--ds-muted': '#f4f2fa',
    '--ds-muted-foreground': '#57536b',
    '--ds-subtle-foreground': '#6b6780',
    '--ds-border': '#e8e3f5',
    '--ds-input': '#d9d3ea',
    '--ds-lavender': '#f6f3ff',
    '--ds-lavender-strong': '#ece6ff',
    '--ds-primary': '#6d3ff0',
    '--ds-primary-hover': '#5a2fd6',
    '--ds-ring': '#6d3ff0',
    '--ds-destructive': '#d92d20',
} as React.CSSProperties;

export const statusPill: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20',
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
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
