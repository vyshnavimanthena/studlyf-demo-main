import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Loader2, Lock, Users } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import SubmissionForm from './SubmissionForm';

export type StageAccessState = {
    stage_id: string;
    stage_name: string;
    description?: string;
    type?: string;
    order?: number;
    is_unlocked: boolean;
    can_submit: boolean;
    has_submission: boolean;
    lock_reason?: string | null;
    lock_detail?: string | null;
    status_badge: string;
    fields?: any[];
    submission?: {
        status?: string;
        total_score?: number;
        judges_feedback?: any[];
    };
};

type StagesAccessResponse = {
    active_stage: StageAccessState | null;
    active_stage_id: string | null;
    completed_stages?: StageAccessState[];
    team_name?: string | null;
    team_id?: string | null;
    participant_status?: string;
    current_stage?: string | null;
    total_configured_stages?: number;
};

type Props = {
    eventId: string;
    participationType?: string;
    stagesFromOpportunity?: any[];
    selectedStageId?: string | null;
};

const StageSubmissionsPanel: React.FC<Props> = ({ eventId, participationType, stagesFromOpportunity, selectedStageId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [access, setAccess] = useState<StagesAccessResponse | null>(null);

    const loadAccess = async () => {
        if (!eventId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/stages/events/${eventId}/stages-access`, {
                headers: { ...authHeaders() },
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to load stage access');
            }
            setAccess(await res.json());
        } catch (e: any) {
            setError(e.message || 'Failed to load stages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccess();
    }, [eventId]);

    const mergeStageConfig = (accessStage: StageAccessState) => {
        const fromOpp = (stagesFromOpportunity || []).find(
            (s: any) => s.id === accessStage.stage_id || s.name === accessStage.stage_name
        );
        return {
            ...(fromOpp || {}),
            id: accessStage.stage_id,
            name: accessStage.stage_name,
            description: accessStage.description || fromOpp?.description,
            type: accessStage.type || fromOpp?.type,
            fields: accessStage.fields?.length ? accessStage.fields : fromOpp?.fields || fromOpp?.config?.fields,
            config: fromOpp?.config || { fields: accessStage.fields },
            start_date: fromOpp?.start_date || fromOpp?.startDate,
            end_date: fromOpp?.end_date || fromOpp?.endDate || fromOpp?.deadline,
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 text-slate-500">
                <Loader2 className="animate-spin mr-2" size={20} />
                Loading your current stage…
            </div>
        );
    }

    if (error) {
        return <div className="bg-white rounded-2xl border border-red-100 p-8 text-center text-red-600">{error}</div>;
    }

    const findStageById = (stageId: string): StageAccessState | null => {
        if (!access) return null;
        if (access.active_stage?.stage_id === stageId || access.active_stage?.stage_name === stageId) {
            return access.active_stage;
        }
        const allStages = [...(access.completed_stages || [])];
        const found = allStages.find(s => s.stage_id === stageId || s.stage_name === stageId);
        if (found) return found;

        const fromOpp = (stagesFromOpportunity || []).find(
            (s: any) => s.id === stageId || s.name === stageId
        );
        if (fromOpp) {
            return {
                stage_id: fromOpp.id || stageId,
                stage_name: fromOpp.name || stageId,
                description: fromOpp.description,
                type: fromOpp.type,
                is_unlocked: false,
                can_submit: false,
                has_submission: false,
                status_badge: 'upcoming',
                lock_detail: `This stage has not started yet. It will start on ${fromOpp.start_date || fromOpp.startDate ? new Date(fromOpp.start_date || fromOpp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : 'TBA'}.`,
            };
        }
        return null;
    };

    const active = selectedStageId ? findStageById(selectedStageId) : access?.active_stage;

    if (!active) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <Lock className="mx-auto mb-3 text-amber-500" size={32} />
                <p className="font-bold text-slate-800">No stage is open for you right now</p>
                <p className="text-sm text-slate-500 mt-2">
                    Complete registration or team formation and wait for admin approval to unlock the next stage.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {access?.team_name ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl text-sm font-bold text-purple-800">
                    <Users size={16} />
                    Team: {access.team_name}
                </div>
            ) : null}

            {/* Only the current active stage — locked future stages are hidden */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-purple-600 mb-1">{selectedStageId ? 'Selected stage' : 'Current stage'}</p>
                    <h3 className="text-lg font-black text-slate-900">{active.stage_name}</h3>
                    {active.description ? <p className="text-sm text-slate-500 mt-1">{active.description}</p> : null}

                    {active.submission?.status && active.submission.status.toLowerCase() !== 'pending' && (
                        <div className="mt-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                <h4 className="font-black text-purple-900 text-lg flex items-center gap-2">
                                    <CheckCircle2 size={20} className="text-purple-600" />
                                    Evaluation Results
                                </h4>
                                <span className="px-4 py-1.5 bg-white border border-purple-200 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                    Status: {active.submission.status}
                                </span>
                            </div>
                            
                            {active.submission.total_score !== undefined && active.submission.total_score !== null && (
                                <div className="mb-5 flex items-baseline gap-2 bg-white px-4 py-3 rounded-xl border border-purple-100 shadow-sm w-fit">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overall Score</span>
                                    <span className="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                        {active.submission.total_score}
                                    </span>
                                </div>
                            )}

                            {active.submission.judges_feedback && active.submission.judges_feedback.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Judges Feedback</h5>
                                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                                        {active.submission.judges_feedback.map((fb: any, idx: number) => (
                                            <div key={idx} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm text-sm">
                                                <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-50">
                                                    <span className="font-bold text-slate-800">{fb.judge_name || 'Judge'}</span>
                                                    {fb.score !== undefined && fb.score !== null && (
                                                        <span className="font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md text-xs">Score: {fb.score}</span>
                                                    )}
                                                </div>
                                                {fb.comments ? (
                                                    <p className="text-slate-600 mt-1 italic text-sm leading-relaxed">"{fb.comments}"</p>
                                                ) : (
                                                    <p className="text-slate-400 mt-1 italic text-xs">No comments provided.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-5">
                    {!active.is_unlocked ? (
                        <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-100">
                            <Lock className="mx-auto mb-3 text-amber-500" size={32} />
                            <p className="text-sm text-slate-500">{active.lock_detail || 'This stage is locked.'}</p>
                        </div>
                    ) : active.status_badge === 'upcoming' ? (
                        <div className="bg-sky-50 rounded-xl p-8 text-center border border-sky-100">
                            <Clock className="mx-auto mb-3 text-sky-500" size={32} />
                            <p className="text-sm font-bold text-sky-800">{active.lock_detail || 'This stage has not started yet.'}</p>
                        </div>
                    ) : active.can_submit || active.has_submission ? (
                        <SubmissionForm
                            eventId={eventId}
                            stage={mergeStageConfig(active)}
                            participationType={participationType}
                            onSubmitted={loadAccess}
                            skipAccessCheck
                            teamIdHint={access?.team_id || null}
                            teamNameHint={access?.team_name || null}
                        />
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-6">{active.lock_detail || 'This stage is not open for submissions.'}</p>
                    )}
                </div>
            </div>

            {(access?.completed_stages?.length || 0) > 0 ? (
                <div className="text-xs text-slate-400 text-center">
                    {access!.completed_stages!.length} earlier stage(s) completed. Next stages unlock after admin review.
                </div>
            ) : null}
        </div>
    );
};

export default StageSubmissionsPanel;
