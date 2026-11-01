import React, { useEffect, useState } from 'react';
import { BadgeCheck, BriefcaseBusiness, FolderGit2, Link2, Loader2, ShieldCheck } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

type Evidence = { type: 'project' | 'experience' | 'evaluation'; ref_id: string; title: string };
type SkillDetail = { name: string; level: 'self_reported' | 'evidence_backed' | 'evaluated'; evidence: Evidence[] };
type Linkable = { type: 'project' | 'experience'; ref_id: string; title: string };
type TalentProfile = {
    open_to_opportunities: boolean;
    availability: string | null;
    preferred_role: string | null;
    availability_options: string[];
    linkable: Linkable[];
    skills_detailed: SkillDetail[];
};

const AVAILABILITY_LABELS: Record<string, string> = {
    immediately: 'Immediately',
    within_1_month: 'Within 1 month',
    within_3_months: 'Within 3 months',
    not_available: 'Not available right now',
};
const NO_AVAILABILITY = '__none__';

export const LEVEL_META: Record<SkillDetail['level'], { label: string; variant: 'success' | 'default' | 'muted'; help: string }> = {
    evaluated: { label: 'Evaluated', variant: 'success', help: 'Confirmed by a published evaluation from an organizer.' },
    evidence_backed: { label: 'Evidence-backed', variant: 'default', help: 'You linked this skill to your own project or experience.' },
    self_reported: { label: 'Self-reported', variant: 'muted', help: 'Listed on your profile without linked evidence.' },
};

async function readError(res: Response, fallback: string) {
    const data = await res.json().catch(() => ({}));
    return typeof data.detail === 'string' ? data.detail : fallback;
}

/** Preferences card: recruiter visibility, availability details and skill evidence. Saves on its own endpoints. */
const RecruiterSettings: React.FC = () => {
    const [visible, setVisible] = useState<boolean | null>(null);
    const [visibleSaving, setVisibleSaving] = useState(false);
    const [visibleError, setVisibleError] = useState<string | null>(null);

    const [profile, setProfile] = useState<TalentProfile | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [details, setDetails] = useState({ open: true, availability: NO_AVAILABILITY, role: '' });
    const [detailsSaving, setDetailsSaving] = useState(false);
    const [detailsStatus, setDetailsStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [editingSkill, setEditingSkill] = useState<SkillDetail | null>(null);
    const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
    const [linkSaving, setLinkSaving] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);

    const applyProfile = (data: TalentProfile) => {
        setProfile(data);
        setDetails({
            open: data.open_to_opportunities,
            availability: data.availability || NO_AVAILABILITY,
            role: data.preferred_role || '',
        });
    };

    const load = async () => {
        setLoadError(null);
        try {
            const [visRes, profRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/v1/me/talent-visibility`, { headers: { ...authHeaders() } }),
                fetch(`${API_BASE_URL}/api/v1/me/talent-profile`, { headers: { ...authHeaders() } }),
            ]);
            if (visRes.ok) setVisible(Boolean((await visRes.json()).hrDiscoverable));
            if (!profRes.ok) throw new Error(await readError(profRes, 'Could not load your recruiter settings.'));
            applyProfile(await profRes.json());
        } catch (err) {
            setLoadError(err instanceof Error ? err.message : 'Could not load your recruiter settings.');
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggleVisible = async (next: boolean) => {
        if (visibleSaving) return;
        const previous = visible;
        setVisible(next);
        setVisibleSaving(true);
        setVisibleError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/me/talent-visibility`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ hrDiscoverable: next }),
            });
            if (!res.ok) throw new Error(await readError(res, 'Could not update recruiter visibility. Please try again.'));
        } catch (err) {
            setVisible(previous);
            setVisibleError(err instanceof Error ? err.message : 'Could not update recruiter visibility. Please try again.');
        } finally {
            setVisibleSaving(false);
        }
    };

    const putTalentProfile = async (body: Record<string, unknown>) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/me/talent-profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await readError(res, 'Could not save. Please try again.'));
        applyProfile(await res.json());
    };

    const saveDetails = async () => {
        setDetailsSaving(true);
        setDetailsStatus(null);
        try {
            await putTalentProfile({
                open_to_opportunities: details.open,
                availability: details.availability === NO_AVAILABILITY ? null : details.availability,
                preferred_role: details.role.trim() || null,
            });
            setDetailsStatus({ type: 'success', message: 'Recruiter details saved.' });
        } catch (err) {
            setDetailsStatus({ type: 'error', message: err instanceof Error ? err.message : 'Could not save. Please try again.' });
        } finally {
            setDetailsSaving(false);
        }
    };

    const refKey = (item: { type: string; ref_id: string }) => `${item.type}:${item.ref_id}`;

    const openLinkDialog = (skill: SkillDetail) => {
        setEditingSkill(skill);
        setSelectedRefs(skill.evidence.filter(e => e.type !== 'evaluation').map(refKey));
        setLinkError(null);
    };

    const saveLinks = async () => {
        if (!profile || !editingSkill) return;
        setLinkSaving(true);
        setLinkError(null);
        const toLinks = (keys: string[]) =>
            keys.map(k => profile.linkable.find(item => refKey(item) === k)).filter(Boolean).map(item => ({ type: item!.type, ref_id: item!.ref_id }));
        // The endpoint replaces the whole list, so send every skill's current links with this one swapped in
        const skillEvidence = profile.skills_detailed
            .map(s => ({
                skill: s.name,
                links: s.name === editingSkill.name ? toLinks(selectedRefs) : toLinks(s.evidence.filter(e => e.type !== 'evaluation').map(refKey)),
            }))
            .filter(s => s.links.length > 0);
        try {
            await putTalentProfile({ skill_evidence: skillEvidence });
            setEditingSkill(null);
        } catch (err) {
            setLinkError(err instanceof Error ? err.message : 'Could not save. Please try again.');
        } finally {
            setLinkSaving(false);
        }
    };

    return (
        <div className="studlyf-ds md:col-span-2 grid gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-6">
                        <div className="space-y-1.5">
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="size-5 text-ds-primary" /> Visible to recruiters on STUDLYF
                            </CardTitle>
                            <CardDescription>
                                While this is on, recruiters on the STUDLYF HR platform can see your profile, projects and verified achievements,
                                and invite you to connect. They cannot see your email or phone. Choosing "Not Looking" above also hides you.
                            </CardDescription>
                        </div>
                        <Switch
                            aria-label="Visible to recruiters on STUDLYF"
                            checked={Boolean(visible)}
                            disabled={visibleSaving || visible === null}
                            onCheckedChange={toggleVisible}
                        />
                    </div>
                    {visibleError && (
                        <Alert variant="destructive" className="mt-3">
                            <AlertDescription>{visibleError}</AlertDescription>
                        </Alert>
                    )}
                </CardHeader>
                <Separator />
                <CardContent className="pt-6 grid gap-5 sm:grid-cols-2">
                    {!profile && !loadError ? (
                        <>
                            <Skeleton className="h-11" />
                            <Skeleton className="h-11" />
                        </>
                    ) : loadError ? (
                        <Alert variant="destructive" className="sm:col-span-2">
                            <AlertDescription className="flex flex-wrap items-center gap-3">
                                {loadError}
                                <Button variant="outline" size="sm" onClick={load}>Try again</Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <div className="sm:col-span-2 flex items-center justify-between gap-4 rounded-ds-control bg-ds-lavender px-4 py-3">
                                <Label htmlFor="open-to-opportunities" className="flex-col items-start gap-1">
                                    <span>Open to opportunities</span>
                                    <span className="text-xs font-normal text-ds-muted-foreground">Recruiters see whether you are currently open to roles.</span>
                                </Label>
                                <Switch
                                    id="open-to-opportunities"
                                    checked={details.open}
                                    onCheckedChange={open => setDetails(d => ({ ...d, open }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="availability">Availability</Label>
                                <Select value={details.availability} onValueChange={availability => setDetails(d => ({ ...d, availability }))}>
                                    <SelectTrigger id="availability">
                                        <SelectValue placeholder="Not specified" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NO_AVAILABILITY}>Not specified</SelectItem>
                                        {(profile?.availability_options || []).map(option => (
                                            <SelectItem key={option} value={option}>{AVAILABILITY_LABELS[option] || option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="preferred-role">Preferred role</Label>
                                <Input
                                    id="preferred-role"
                                    maxLength={120}
                                    placeholder="e.g. Backend engineer"
                                    value={details.role}
                                    onChange={e => setDetails(d => ({ ...d, role: e.target.value }))}
                                />
                            </div>
                            <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-3">
                                {detailsStatus && (
                                    <span className={`text-sm font-medium ${detailsStatus.type === 'success' ? 'text-ds-success' : 'text-ds-destructive'}`}>
                                        {detailsStatus.message}
                                    </span>
                                )}
                                <Button onClick={saveDetails} disabled={detailsSaving}>
                                    {detailsSaving && <Loader2 className="animate-spin" />} Save recruiter details
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BadgeCheck className="size-5 text-ds-primary" /> Skills & evidence
                    </CardTitle>
                    <CardDescription>
                        Link each skill to the projects or experience that prove it. Recruiters see how each skill is backed:
                        only links you make yourself count as evidence, and "Evaluated" comes only from published organizer evaluations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                    {!profile && !loadError ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)
                    ) : profile && profile.skills_detailed.length === 0 ? (
                        <p className="rounded-ds-control bg-ds-muted px-4 py-6 text-center text-sm text-ds-muted-foreground">
                            No saved skills yet. Add skills in the Skills module and save them, then link evidence here.
                        </p>
                    ) : (
                        profile?.skills_detailed.map(skill => {
                            const meta = LEVEL_META[skill.level];
                            return (
                                <div key={skill.name} className="flex flex-col gap-3 rounded-ds-control border border-ds-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-ds-foreground">{skill.name}</span>
                                            <Badge variant={meta.variant} title={meta.help}>{meta.label}</Badge>
                                        </div>
                                        {skill.evidence.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {skill.evidence.map(e => (
                                                    <Badge key={refKey(e)} variant="outline" className="max-w-full font-medium">
                                                        {e.type === 'experience' ? <BriefcaseBusiness /> : e.type === 'project' ? <FolderGit2 /> : <BadgeCheck />}
                                                        <span className="truncate">{e.title || 'Untitled'}</span>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => openLinkDialog(skill)} disabled={!profile?.linkable.length}>
                                        <Link2 /> Link evidence
                                    </Button>
                                </div>
                            );
                        })
                    )}
                    {profile && profile.skills_detailed.length > 0 && !profile.linkable.length && (
                        <p className="text-sm text-ds-muted-foreground">Add a project or work experience to your profile to link evidence.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={editingSkill !== null} onOpenChange={open => !open && setEditingSkill(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Evidence for {editingSkill?.name}</DialogTitle>
                        <DialogDescription>Pick the projects and experience where you used this skill.</DialogDescription>
                    </DialogHeader>
                    <div className="grid max-h-80 gap-2 overflow-y-auto">
                        {profile?.linkable.map(item => {
                            const key = refKey(item);
                            return (
                                <Label key={key} htmlFor={`link-${key}`} className="cursor-pointer rounded-ds-control border border-ds-border px-3 py-3 font-normal hover:bg-ds-lavender">
                                    <Checkbox
                                        id={`link-${key}`}
                                        checked={selectedRefs.includes(key)}
                                        onCheckedChange={checked =>
                                            setSelectedRefs(prev => (checked ? [...prev, key] : prev.filter(k => k !== key)))
                                        }
                                    />
                                    {item.type === 'experience' ? <BriefcaseBusiness className="size-4 text-ds-muted-foreground" /> : <FolderGit2 className="size-4 text-ds-muted-foreground" />}
                                    <span className="min-w-0 truncate">{item.title || 'Untitled'}</span>
                                </Label>
                            );
                        })}
                    </div>
                    {linkError && (
                        <Alert variant="destructive">
                            <AlertDescription>{linkError}</AlertDescription>
                        </Alert>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingSkill(null)}>Cancel</Button>
                        <Button onClick={saveLinks} disabled={linkSaving}>
                            {linkSaving && <Loader2 className="animate-spin" />} Save links
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RecruiterSettings;
