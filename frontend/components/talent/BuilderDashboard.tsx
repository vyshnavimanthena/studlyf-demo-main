import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Award, BellRing, CalendarClock, CheckCircle2, Circle, Compass, Eye, EyeOff, Inbox, ListChecks, Mail, Sparkles, Target, UserRoundCheck, type LucideIcon,
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { useAuth } from '../../AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import CompletenessRing, { Completeness } from './CompletenessRing';

type NextAction = { key: string; kind: 'invitation' | 'deadline' | 'profile'; title: string; detail: string; href: string };
type Recommended = { opportunity_id: string; title: string; organization: string | null; type: string | null; deadline: string | null; days_left: number | null; matched_skills: string[]; reason: string };
type Application = { application_id: string; opportunity_id: string; title: string; organization: string | null; status: string; current_stage: string | null; applied_at: string | null };
type Deadline = { opportunity_id: string; title: string; next_label: string; next_deadline: string; days_left: number };
type Evaluation = { evaluation_id: string; kind: 'evaluation' | 'submission' | 'award' | 'participation'; opportunity_title: string; organization_name: string | null; project_title: string | null; evaluated_at: string | null; final_status: string; result: string | null };
type Discovery = { recruiter_visible: boolean; hr_invitations_total: number; hr_invitations_pending: number; hr_invitations_accepted: number; last_invitation_at: string | null };
type Dashboard = {
    completeness: Completeness;
    next_actions: NextAction[];
    recommended_opportunities: Recommended[];
    active_applications: Application[];
    applications_total: number;
    upcoming_deadlines: Deadline[];
    recent_evaluations_achievements: Evaluation[];
    discovery: Discovery;
};

const ACTION_ICON: Record<NextAction['kind'], LucideIcon> = { invitation: Mail, deadline: CalendarClock, profile: Target };

const humanize = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const formatDate = (value?: string | null) => {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const applicationBadge = (status: string): { label: string; variant: 'success' | 'default' | 'muted' | 'warning' } => {
    if (['shortlisted', 'accepted', 'selected', 'approved'].includes(status)) return { label: humanize(status), variant: 'success' };
    if (['pending', 'applied', 'submitted', 'under_review'].includes(status)) return { label: 'Under review', variant: 'muted' };
    if (status === 'waitlisted') return { label: 'Waitlisted', variant: 'warning' };
    return { label: humanize(status), variant: 'default' };
};

const evaluationBadge = (e: Evaluation): { label: string; variant: 'success' | 'default' | 'muted' | 'outline' } => {
    if (e.kind === 'award') return { label: humanize(e.final_status), variant: 'success' };
    if (e.kind === 'evaluation') return { label: e.result || 'Ranked', variant: 'default' };
    if (e.kind === 'participation') return { label: 'Participated', variant: 'muted' };
    return { label: 'Submitted', variant: 'outline' };
};

const SectionTitle: React.FC<{ icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }> = ({ icon: Icon, title, description, action }) => (
    <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="size-4 text-ds-primary" /> {title}
            </CardTitle>
            {description && <CardDescription className="text-sm">{description}</CardDescription>}
        </div>
        {action}
    </CardHeader>
);

const EmptyLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="rounded-ds-control bg-ds-muted px-4 py-5 text-center text-sm text-ds-muted-foreground">{children}</p>
);

/** Actionable builder dashboard (PRD 4.6-4.7), rendered above the existing learner dashboard content. */
const BuilderDashboard: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<Dashboard | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/dashboard`, { headers: { ...authHeaders() } });
            if (!res.ok) throw new Error('Could not load your dashboard.');
            setData(await res.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load your dashboard.');
        }
    };

    useEffect(() => {
        if (user?.user_id) load();
    }, [user?.user_id]);

    if (!user?.user_id) return null;

    const firstName = (user.full_name || '').split(' ')[0];
    const profileHref = (module: string) => `/dashboard/profile?view=profile&section=${module}`;

    return (
        <section className="studlyf-ds relative z-10 border-b border-ds-border bg-[#FAFAFC] pt-28 pb-14 sm:pt-32" aria-labelledby="builder-dashboard-title">
            <div className="ds-container grid gap-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 id="builder-dashboard-title" className="text-2xl font-semibold tracking-tight text-ds-foreground sm:text-[28px]">
                            {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
                        </h1>
                        <p className="text-[15px] text-ds-muted-foreground">Here is what needs your attention and how your profile is growing.</p>
                    </div>
                    {data && (
                        <Button asChild variant="outline" size="sm">
                            <Link to="/dashboard/profile?view=profile">Edit profile <ArrowRight /></Link>
                        </Button>
                    )}
                </div>

                {error ? (
                    <Alert variant="destructive">
                        <AlertDescription className="flex flex-wrap items-center gap-3">
                            {error}
                            <Button variant="outline" size="sm" onClick={load}>Try again</Button>
                        </AlertDescription>
                    </Alert>
                ) : !data ? (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Skeleton className="h-64 lg:col-span-2" />
                        <Skeleton className="h-64" />
                        <Skeleton className="h-56 lg:col-span-2" />
                        <Skeleton className="h-56" />
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                        <div className="grid gap-6 lg:col-span-2">
                            {/* 1. What should I do next? */}
                            <Card>
                                <SectionTitle icon={ListChecks} title="What should I do next?" description="The most useful steps right now, based on your profile and activity." />
                                <CardContent className="grid grid-cols-1 gap-2">
                                    {data.next_actions.length === 0 ? (
                                        <EmptyLine>You're all caught up. New suggestions appear as opportunities and invitations arrive.</EmptyLine>
                                    ) : (
                                        data.next_actions.map(action => {
                                            const Icon = ACTION_ICON[action.kind] || Target;
                                            return (
                                                <Link
                                                    key={action.key}
                                                    to={action.href}
                                                    className="ds-focus-ring group flex items-center gap-4 rounded-ds-control border border-ds-border bg-ds-card px-4 py-3.5 transition-colors hover:border-ds-primary/40 hover:bg-ds-lavender"
                                                >
                                                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full',
                                                        action.kind === 'profile' ? 'bg-ds-lavender text-ds-primary' : 'bg-ds-lavender-strong text-ds-primary')}>
                                                        <Icon className="size-4" />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block font-medium text-ds-foreground">{action.title}</span>
                                                        <span className="block truncate text-sm text-ds-muted-foreground">{action.detail}</span>
                                                    </span>
                                                    <ArrowRight className="size-4 shrink-0 text-ds-subtle-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-ds-primary" />
                                                </Link>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </Card>

                            {/* 2. Relevant opportunities */}
                            <Card>
                                <SectionTitle
                                    icon={Compass}
                                    title="Relevant opportunities"
                                    description="Open opportunities that ask for skills on your profile."
                                    action={<Button asChild variant="ghost" size="sm"><Link to="/opportunities">Browse all <ArrowRight /></Link></Button>}
                                />
                                <CardContent>
                                    {data.recommended_opportunities.length === 0 ? (
                                        <EmptyLine>No open opportunities match your listed skills yet. Adding skills improves these matches.</EmptyLine>
                                    ) : (
                                        <div className={cn('grid gap-3', {
                                            2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2',
                                        }[data.recommended_opportunities.length])}>
                                            {data.recommended_opportunities.map(o => (
                                                <Link
                                                    key={o.opportunity_id}
                                                    to={`/opportunities/${o.opportunity_id}`}
                                                    className="ds-focus-ring group flex flex-col gap-2 rounded-ds-control border border-ds-border bg-ds-card p-4 transition-colors hover:border-ds-primary/40"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="min-w-0">
                                                            <span className="line-clamp-2 font-medium text-ds-foreground group-hover:text-ds-primary">{o.title}</span>
                                                            <span className="block truncate text-sm text-ds-muted-foreground">{o.organization || 'STUDLYF'}{o.type ? ` · ${humanize(o.type)}` : ''}</span>
                                                        </span>
                                                        {o.days_left !== null && o.days_left <= 7 && <Badge variant="warning">{o.days_left === 0 ? 'Closes today' : `${o.days_left}d left`}</Badge>}
                                                    </div>
                                                    <span className="flex items-start gap-1.5 text-sm text-ds-muted-foreground">
                                                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ds-primary" />
                                                        <span className="line-clamp-2">{o.reason}</span>
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>
                        <div className="grid gap-6">
                            {/* Profile completeness */}
                            <Card>
                                <SectionTitle icon={UserRoundCheck} title="Profile strength" description="Scored on useful information, not filled fields." />
                                <CardContent className="grid gap-5">
                                    <div className="flex items-center gap-5">
                                        <CompletenessRing score={data.completeness.score} size={96} stroke={9} />
                                        <p className="text-sm text-ds-muted-foreground">
                                            {data.completeness.score >= 80
                                                ? 'Strong profile. Keep your evidence current.'
                                                : `${data.completeness.sections.filter(s => !s.done).length} sections left to complete.`}
                                        </p>
                                    </div>
                                    <ul className="grid gap-1">
                                        {data.completeness.sections.map(section => (
                                            <li key={section.key}>
                                                <Link
                                                    to={profileHref(section.module)}
                                                    title={section.done ? undefined : section.hint}
                                                    className="ds-focus-ring flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-ds-lavender"
                                                >
                                                    {section.done
                                                        ? <CheckCircle2 className="size-4 shrink-0 text-ds-success" />
                                                        : <Circle className="size-4 shrink-0 text-ds-subtle-foreground" />}
                                                    <span className={cn('flex-1', section.done ? 'text-ds-muted-foreground' : 'text-ds-foreground')}>{section.label}</span>
                                                    <span className="text-xs tabular-nums text-ds-subtle-foreground">{section.done ? section.weight : `+${section.weight}`}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* 3. My applications */}
                            <Card>
                                <SectionTitle
                                    icon={Inbox}
                                    title="My applications"
                                    description={data.applications_total ? `${data.active_applications.length} active of ${data.applications_total}` : undefined}
                                    action={data.applications_total ? <Button asChild variant="ghost" size="sm"><Link to="/opportunities/my-applications">All <ArrowRight /></Link></Button> : undefined}
                                />
                                <CardContent className="grid grid-cols-1 gap-3">
                                    {data.active_applications.length === 0 ? (
                                        <EmptyLine>No active applications. Apply to an opportunity to track it here.</EmptyLine>
                                    ) : (
                                        <ul className="grid grid-cols-1 divide-y divide-ds-border">
                                            {data.active_applications.map(a => {
                                                const badge = applicationBadge(a.status);
                                                return (
                                                    <li key={a.application_id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                                                        <span className="min-w-0">
                                                            <span className="block truncate text-sm font-medium text-ds-foreground">{a.title}</span>
                                                            <span className="block truncate text-xs text-ds-subtle-foreground">
                                                                {[a.current_stage ? humanize(a.current_stage) : a.organization, a.applied_at ? `Applied ${formatDate(a.applied_at)}` : null].filter(Boolean).join(' · ')}
                                                            </span>
                                                        </span>
                                                        <Badge variant={badge.variant}>{badge.label}</Badge>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                    {data.upcoming_deadlines.length > 0 && (
                                        <>
                                            <Separator />
                                            <div className="grid grid-cols-1 gap-2">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-ds-subtle-foreground">Upcoming deadlines</span>
                                                {data.upcoming_deadlines.map(d => (
                                                    <Link key={`${d.opportunity_id}-${d.next_label}`} to={`/opportunities/${d.opportunity_id}`} className="ds-focus-ring flex items-center justify-between gap-3 rounded-lg text-sm hover:text-ds-primary">
                                                        <span className="flex min-w-0 items-center gap-2">
                                                            <CalendarClock className="size-4 shrink-0 text-ds-subtle-foreground" />
                                                            <span className="truncate">{d.title} · {d.next_label}</span>
                                                        </span>
                                                        <span className={cn('shrink-0 tabular-nums', d.days_left <= 3 ? 'font-semibold text-ds-warning' : 'text-ds-muted-foreground')}>
                                                            {d.days_left === 0 ? 'Today' : `${d.days_left}d`}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                        </div>
                        {/* 4. How my profile is developing */}
                        <Card className="lg:col-span-3">
                            <SectionTitle icon={Award} title="How your profile is developing" description="Published results from organizers and interest from recruiters." />
                            <CardContent className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
                                <div className="grid min-w-0 grid-cols-1 content-start gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-ds-subtle-foreground">Recent evaluations & achievements</span>
                                    {data.recent_evaluations_achievements.length === 0 ? (
                                        <EmptyLine>No published results yet. They appear here once an organizer finalizes an event you took part in.</EmptyLine>
                                    ) : (
                                        <ul className="grid grid-cols-1 divide-y divide-ds-border">
                                            {data.recent_evaluations_achievements.map(e => {
                                                const badge = evaluationBadge(e);
                                                return (
                                                    <li key={e.evaluation_id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                                                        <span className="min-w-0">
                                                            <span className="block truncate text-sm font-medium text-ds-foreground">{e.opportunity_title || 'Evaluation'}</span>
                                                            <span className="block truncate text-xs text-ds-subtle-foreground">
                                                                {[e.organization_name, e.project_title, formatDate(e.evaluated_at)].filter(Boolean).join(' · ')}
                                                            </span>
                                                        </span>
                                                        <Badge variant={badge.variant}>{badge.label}</Badge>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                                <div className="grid content-start gap-3 rounded-ds-control bg-ds-lavender p-4">
                                    <span className="flex items-center gap-2 text-sm font-medium text-ds-foreground">
                                        {data.discovery.recruiter_visible ? <Eye className="size-4 text-ds-primary" /> : <EyeOff className="size-4 text-ds-subtle-foreground" />}
                                        {data.discovery.recruiter_visible ? 'Visible to recruiters on STUDLYF' : 'Hidden from recruiters'}
                                    </span>
                                    <dl className="grid grid-cols-3 gap-2 text-center">
                                        {[
                                            ['Invitations', data.discovery.hr_invitations_total],
                                            ['Awaiting you', data.discovery.hr_invitations_pending],
                                            ['Accepted', data.discovery.hr_invitations_accepted],
                                        ].map(([label, value]) => (
                                            <div key={label as string} className="rounded-lg bg-ds-card px-2 py-2.5">
                                                <dt className="text-[11px] text-ds-muted-foreground">{label}</dt>
                                                <dd className="text-lg font-semibold tabular-nums text-ds-foreground">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                    <Button asChild variant={data.discovery.hr_invitations_pending ? 'default' : 'outline'} size="sm">
                                        {data.discovery.recruiter_visible || data.discovery.hr_invitations_total
                                            ? <Link to="/opportunities/invitations"><BellRing /> View invitations</Link>
                                            : <Link to={profileHref('preferences')}>Turn on recruiter visibility</Link>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BuilderDashboard;
