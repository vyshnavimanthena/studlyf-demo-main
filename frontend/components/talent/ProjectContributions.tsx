import React, { useEffect, useState } from 'react';
import { Check, FolderGit2, Loader2, Pencil, Plus, Undo2, UserRoundCheck, Users, X } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

export type Contribution = {
    role: string | null;
    summary: string | null;
    team_size: number | null;
    skills: string[];
    confirmed_by: number;
};
type OwnContribution = Contribution & {
    contribution_id: string;
    confirmers: { user_id: string; name: string }[];
};
type ProjectItem = {
    project_ref: string;
    title: string;
    source: 'profile' | 'sdl';
    is_owner: boolean;
    teammates: number;
    contribution: OwnContribution | null;
};
type ToConfirm = Contribution & {
    contribution_id: string;
    project_title: string;
    author: { user_id: string; name: string };
    confirmed_by_me: boolean;
};

const MAX_SUMMARY = 1000;
const MAX_SKILLS = 15;

// Match MyProfile's module cards (large radius, light border, uppercase black-weight headings)
const MODULE_CARD = 'rounded-[2.5rem] border-gray-100 bg-white shadow-sm';
const MODULE_HEADER = 'gap-2 p-5 sm:p-8 sm:pb-5';
const MODULE_TITLE = 'flex items-center gap-3 text-base font-black uppercase tracking-tight text-gray-900';
const MODULE_ICON = 'flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/10 text-[#7C3AED]';
const MODULE_CONTENT = 'grid min-w-0 grid-cols-1 gap-3 px-5 pb-5 sm:px-8 sm:pb-8';

async function readError(res: Response, fallback: string) {
    const data = await res.json().catch(() => ({}));
    return typeof data.detail === 'string' ? data.detail : fallback;
}

export const confirmedLabel = (n: number) => `Confirmed by ${n} teammate${n === 1 ? '' : 's'}`;

/** "Role · team of N" line; empty string when neither is set. */
export const roleLine = (c: Pick<Contribution, 'role' | 'team_size'>) =>
    [c.role, c.team_size ? `team of ${c.team_size}` : null].filter(Boolean).join(' · ');

/** Read-only contribution body, shared by MyProfile and the public profile. */
export const ContributionSummary: React.FC<{ contribution: Contribution }> = ({ contribution }) => (
    <div className="grid min-w-0 gap-2 break-words">
        {roleLine(contribution) && <p className="text-sm font-medium text-ds-foreground">{roleLine(contribution)}</p>}
        {contribution.summary && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-ds-muted-foreground">{contribution.summary}</p>
        )}
        {(contribution.skills.length > 0 || contribution.confirmed_by > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
                {contribution.confirmed_by > 0 && (
                    <Badge variant="success"><UserRoundCheck /> {confirmedLabel(contribution.confirmed_by)}</Badge>
                )}
                {contribution.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="font-medium">{skill}</Badge>
                ))}
            </div>
        )}
    </div>
);

type Draft = { role: string; summary: string; teamSize: string; skills: string[]; skillInput: string };
const emptyDraft: Draft = { role: '', summary: '', teamSize: '', skills: [], skillInput: '' };

/**
 * "My contribution" per project (MyProfile > Projects) and the teammates' contributions this builder can confirm.
 * Renders nothing when the feature is off on the server (404).
 */
const ProjectContributions: React.FC<{ refreshKey?: string; onChanged?: () => void }> = ({ refreshKey, onChanged }) => {
    const [enabled, setEnabled] = useState(true);
    const [projects, setProjects] = useState<ProjectItem[] | null>(null);
    const [toConfirm, setToConfirm] = useState<ToConfirm[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [editing, setEditing] = useState<ProjectItem | null>(null);
    const [draft, setDraft] = useState<Draft>(emptyDraft);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [confirming, setConfirming] = useState<string | null>(null);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    const load = async () => {
        setLoadError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/contributions`, { headers: { ...authHeaders() } });
            if (res.status === 404) {
                setEnabled(false);
                return;
            }
            if (!res.ok) throw new Error(await readError(res, 'Could not load your contributions.'));
            const data = await res.json();
            setProjects(data.projects || []);
            setToConfirm(data.to_confirm || []);
        } catch (err) {
            setLoadError(err instanceof Error ? err.message : 'Could not load your contributions.');
        }
    };

    useEffect(() => {
        load();
    }, [refreshKey]);

    if (!enabled) return null;

    const openEditor = (project: ProjectItem) => {
        const c = project.contribution;
        setDraft(c
            ? { role: c.role || '', summary: c.summary || '', teamSize: c.team_size ? String(c.team_size) : '', skills: c.skills, skillInput: '' }
            : emptyDraft);
        setSaveError(null);
        setEditing(project);
    };

    const addSkill = (raw: string) => {
        const names = raw.split(',').map(s => s.trim()).filter(Boolean);
        if (!names.length) return;
        setDraft(d => {
            const skills = [...d.skills];
            for (const name of names) {
                if (skills.length < MAX_SKILLS && !skills.some(s => s.toLowerCase() === name.toLowerCase())) skills.push(name.slice(0, 50));
            }
            return { ...d, skills, skillInput: '' };
        });
    };

    const save = async () => {
        if (!editing) return;
        const teamSize = draft.teamSize.trim() ? Number(draft.teamSize) : null;
        if (teamSize !== null && (!Number.isInteger(teamSize) || teamSize < 1 || teamSize > 100)) {
            setSaveError('Team size must be a whole number from 1 to 100.');
            return;
        }
        const skills = draft.skillInput.trim()
            ? [...draft.skills, ...draft.skillInput.split(',').map(s => s.trim()).filter(Boolean)].slice(0, MAX_SKILLS)
            : draft.skills;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/contributions/${encodeURIComponent(editing.project_ref)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ role: draft.role.trim() || null, summary: draft.summary.trim() || null, team_size: teamSize, skills }),
            });
            if (!res.ok) throw new Error(await readError(res, 'Could not save. Please try again.'));
            setEditing(null);
            await load();
            onChanged?.();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Could not save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!editing) return;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/contributions/${encodeURIComponent(editing.project_ref)}`, {
                method: 'DELETE',
                headers: { ...authHeaders() },
            });
            if (!res.ok && res.status !== 404) throw new Error(await readError(res, 'Could not remove. Please try again.'));
            setEditing(null);
            await load();
            onChanged?.();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Could not remove. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const toggleConfirm = async (item: ToConfirm) => {
        setConfirming(item.contribution_id);
        setConfirmError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/contributions/${encodeURIComponent(item.contribution_id)}/confirm`, {
                method: item.confirmed_by_me ? 'DELETE' : 'POST',
                headers: { ...authHeaders() },
            });
            if (!res.ok) throw new Error(await readError(res, 'Could not update. Please try again.'));
            const data = await res.json();
            setToConfirm(list => list.map(c => (c.contribution_id === item.contribution_id
                ? { ...c, confirmed_by: data.confirmed_by, confirmed_by_me: data.confirmed_by_me }
                : c)));
        } catch (err) {
            setConfirmError(err instanceof Error ? err.message : 'Could not update. Please try again.');
        } finally {
            setConfirming(null);
        }
    };

    const existingConfirmations = editing?.contribution?.confirmed_by || 0;

    return (
        <div className="studlyf-ds grid min-w-0 grid-cols-1 gap-6">
            <Card className={MODULE_CARD}>
                <CardHeader className={MODULE_HEADER}>
                    <CardTitle className={MODULE_TITLE}>
                        <span className={MODULE_ICON}><Users className="size-4" /></span> My contribution
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Say what you did on each project: your role, the team size and the skills you used. On STUDLYF team projects,
                        teammates can confirm it. Recruiters see your contribution and how many teammates confirmed it.
                    </CardDescription>
                </CardHeader>
                <CardContent className={MODULE_CONTENT}>
                    {loadError ? (
                        <Alert variant="destructive">
                            <AlertDescription className="flex flex-wrap items-center gap-3">
                                {loadError}
                                <Button variant="outline" size="sm" onClick={load}>Try again</Button>
                            </AlertDescription>
                        </Alert>
                    ) : projects === null ? (
                        [1, 2].map(i => <Skeleton key={i} className="h-16" />)
                    ) : projects.length === 0 ? (
                        <p className="rounded-ds-control bg-ds-muted px-4 py-6 text-center text-sm text-ds-muted-foreground">
                            Save a project above (or join a team project) to describe your contribution.
                        </p>
                    ) : (
                        projects.map(project => (
                            <div key={project.project_ref} className="grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-gray-100 px-3 py-3 sm:px-5 sm:py-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="flex min-w-0 items-start gap-2 font-semibold text-ds-foreground">
                                                <FolderGit2 className="mt-1 size-4 shrink-0 text-ds-muted-foreground" />
                                                <span className="min-w-0 break-words">{project.title || 'Untitled project'}</span>
                                            </span>
                                            {project.source === 'sdl' ? (
                                                <Badge variant="muted" className="whitespace-normal">
                                                    Team project{project.teammates > 0 ? ` · ${project.teammates} teammate${project.teammates === 1 ? '' : 's'}` : ''}
                                                </Badge>
                                            ) : (
                                                <Badge variant="muted">Profile project</Badge>
                                            )}
                                        </div>
                                        {!project.contribution && (
                                            <p className="text-sm text-ds-muted-foreground">No contribution added yet.</p>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm" className="self-start" onClick={() => openEditor(project)}>
                                        {project.contribution ? <><Pencil /> Edit</> : <><Plus /> Add contribution</>}
                                    </Button>
                                </div>
                                {project.contribution && <ContributionSummary contribution={project.contribution} />}
                                {project.contribution && project.contribution.confirmers.length > 0 && (
                                    <p className="text-xs text-ds-muted-foreground">
                                        Confirmed by {project.contribution.confirmers.map(c => c.name).join(', ')}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {toConfirm.length > 0 && (
                <Card className={MODULE_CARD}>
                    <CardHeader className={MODULE_HEADER}>
                        <CardTitle className={MODULE_TITLE}>
                            <span className={MODULE_ICON}><UserRoundCheck className="size-4" /></span> Confirm your teammates
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Teammates on your STUDLYF team projects described their contribution. Confirm the ones that match what they did.
                            You can undo a confirmation at any time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className={MODULE_CONTENT}>
                        {confirmError && (
                            <Alert variant="destructive">
                                <AlertDescription>{confirmError}</AlertDescription>
                            </Alert>
                        )}
                        {toConfirm.map(item => (
                            <div key={item.contribution_id} className="grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-gray-100 px-3 py-3 sm:px-5 sm:py-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <p className="min-w-0 text-sm text-ds-muted-foreground">
                                        <span className="font-semibold text-ds-foreground">{item.author.name}</span> on{' '}
                                        <span className="font-semibold text-ds-foreground">{item.project_title}</span>
                                    </p>
                                    <Button
                                        variant={item.confirmed_by_me ? 'ghost' : 'outline'}
                                        size="sm"
                                        className="self-start"
                                        disabled={confirming === item.contribution_id}
                                        onClick={() => toggleConfirm(item)}
                                    >
                                        {confirming === item.contribution_id ? <Loader2 className="animate-spin" /> : item.confirmed_by_me ? <Undo2 /> : <Check />}
                                        {item.confirmed_by_me ? 'Undo confirmation' : 'Confirm'}
                                    </Button>
                                </div>
                                <ContributionSummary contribution={item} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Dialog open={editing !== null} onOpenChange={open => !open && !saving && setEditing(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>My contribution</DialogTitle>
                        <DialogDescription className="break-words">{editing?.title}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
                            <div className="grid gap-2">
                                <Label htmlFor="contribution-role">Your role</Label>
                                <Input
                                    id="contribution-role"
                                    maxLength={100}
                                    placeholder="e.g. Backend lead"
                                    value={draft.role}
                                    onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contribution-team-size">Team size</Label>
                                <Input
                                    id="contribution-team-size"
                                    type="number"
                                    inputMode="numeric"
                                    min={1}
                                    max={100}
                                    placeholder="e.g. 4"
                                    value={draft.teamSize}
                                    onChange={e => setDraft(d => ({ ...d, teamSize: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="contribution-summary">What you did</Label>
                                <span className="text-xs text-ds-muted-foreground">{draft.summary.length} / {MAX_SUMMARY}</span>
                            </div>
                            <Textarea
                                id="contribution-summary"
                                maxLength={MAX_SUMMARY}
                                rows={5}
                                placeholder="e.g. Designed the booking API, modelled the data in MongoDB and set up deployment."
                                value={draft.summary}
                                onChange={e => setDraft(d => ({ ...d, summary: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contribution-skills">Skills you used</Label>
                            {draft.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {draft.skills.map(skill => (
                                        <Badge key={skill} variant="outline" className="gap-1 pr-1 font-medium">
                                            {skill}
                                            <button
                                                type="button"
                                                aria-label={`Remove ${skill}`}
                                                className="rounded-full p-0.5 text-ds-muted-foreground hover:bg-ds-muted hover:text-ds-foreground"
                                                onClick={() => setDraft(d => ({ ...d, skills: d.skills.filter(s => s !== skill) }))}
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <Input
                                id="contribution-skills"
                                placeholder={draft.skills.length >= MAX_SKILLS ? `Up to ${MAX_SKILLS} skills` : 'Type a skill and press Enter'}
                                disabled={draft.skills.length >= MAX_SKILLS}
                                value={draft.skillInput}
                                onChange={e => setDraft(d => ({ ...d, skillInput: e.target.value }))}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault();
                                        addSkill(draft.skillInput);
                                    } else if (e.key === 'Backspace' && !draft.skillInput && draft.skills.length) {
                                        setDraft(d => ({ ...d, skills: d.skills.slice(0, -1) }));
                                    }
                                }}
                                onBlur={() => addSkill(draft.skillInput)}
                            />
                        </div>
                        {existingConfirmations > 0 && (
                            <Alert>
                                <AlertDescription>
                                    {existingConfirmations} teammate{existingConfirmations === 1 ? '' : 's'} confirmed this. Changing it clears
                                    {existingConfirmations === 1 ? ' that confirmation' : ' those confirmations'} so they can confirm the new version.
                                </AlertDescription>
                            </Alert>
                        )}
                        {saveError && (
                            <Alert variant="destructive">
                                <AlertDescription>{saveError}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter className="sm:justify-between">
                        {editing?.contribution ? (
                            <Button variant="ghost" className="text-ds-destructive hover:bg-[#fdecea]" onClick={remove} disabled={saving}>
                                Remove
                            </Button>
                        ) : <span />}
                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
                            <Button onClick={save} disabled={saving}>
                                {saving && <Loader2 className="animate-spin" />} Save contribution
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectContributions;
