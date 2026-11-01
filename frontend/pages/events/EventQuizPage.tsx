import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

type QuizQuestion = {
    type?: string;
    text?: string;
    options?: string[];
    language?: string;
};

const EventQuizPage: React.FC = () => {
    const { eventId, quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [answers, setAnswers] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const submittedRef = useRef(false);
    const startedAtRef = useRef<number>(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const durationSeconds = useMemo(() => (quiz?.duration || 0) * 60, [quiz?.duration]);

    useEffect(() => {
        if (!eventId || !quizId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${API_BASE_URL}/api/opportunities/events/${eventId}/quizzes/${quizId}`, {
                    headers: { ...authHeaders() },
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.detail || 'Unable to open this quiz');
                if (!cancelled) {
                    if (data.already_submitted) {
                        setAlreadySubmitted(true);
                    } else {
                        setQuiz(data);
                        setAnswers((data.questions || []).map(() => ({})));
                        startedAtRef.current = Date.now();
                    }
                }
            } catch (e: any) {
                if (!cancelled) setError(e?.message || 'Unable to load quiz');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [eventId, quizId]);

    // Tab closing/reload guard to prevent accidental progress loss
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!submittedRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Countdown timer (immune to browser throttling/tab suspension)
    useEffect(() => {
        if (!quiz || durationSeconds <= 0) return;
        
        const updateTimer = () => {
            const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
            const remaining = Math.max(0, durationSeconds - elapsed);
            setTimeLeft(remaining);
            return remaining;
        };

        const initialRemaining = updateTimer();
        if (initialRemaining <= 0) return;

        const timer = setInterval(() => {
            const remaining = updateTimer();
            if (remaining <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz, durationSeconds]);

    const submit = useCallback(async () => {
        if (!eventId || !quizId || submittedRef.current) return;
        submittedRef.current = true;
        setSaving(true);
        try {
            const payload: any[] = [];
            Object.keys(answers).forEach((qIdx) => {
                const answer = answers[qIdx];
                if (answer !== undefined && answer !== null && answer !== '') {
                    payload[Number(qIdx)] = answer;
                }
            });

            const res = await fetch(`${API_BASE_URL}/api/v1/institution/events/${eventId}/quizzes/${quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    answers: payload,
                    time_spent: durationSeconds - timeLeft,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || 'Failed to submit quiz');
            }

            alert('Assessment submitted successfully.');
            navigate(`/events/${eventId}`);
        } catch (err: any) {
            submittedRef.current = false;
            try { console.error('Quiz submission error:', err instanceof Error ? err.message : String(err)); } catch (_) {}
            alert(err.message || 'Failed to submit quiz');
        } finally {
            setSaving(false);
        }
    }, [eventId, quizId, answers, durationSeconds, timeLeft, navigate]);

    // Auto-submit when time hits 0
    useEffect(() => {
        if (timeLeft === 0 && !submittedRef.current && quiz && !saving) {
            submit();
        }
    }, [timeLeft, quiz, saving, submit]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const canSubmit = useMemo(() => Array.isArray(quiz?.questions) && quiz.questions.length > 0, [quiz?.questions]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 px-6 py-24 flex items-start justify-center">
            <div className="w-full max-w-3xl rounded-[2rem] bg-white border border-slate-100 shadow-sm p-8 text-center">
                <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading quiz</p>
            </div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen bg-slate-50 px-6 py-24 flex items-start justify-center">
            <div className="w-full max-w-3xl rounded-[2rem] bg-white border border-red-100 shadow-sm p-8 text-center">
                <p className="text-red-600 font-semibold">{error}</p>
            </div>
        </div>
    );
    if (alreadySubmitted) return (
        <div className="min-h-screen flex items-center justify-center py-10">
            <div className="max-w-md mx-auto px-4 text-center">
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="text-4xl mb-4">📋</div>
                    <h1 className="text-xl font-black text-slate-900 mb-2">Assessment Submitted</h1>
                    <p className="text-sm text-slate-500 mb-6">You have already completed this assessment. Results will be shared once reviewed.</p>
                    <button onClick={() => navigate(`/events/${eventId}`)} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm">Back to Event</button>
                </div>
            </div>
        </div>
    );
    if (!quiz) return null;

    const timeAlmostUp = timeLeft !== null && timeLeft <= 120;

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">{quiz.title || 'Assessment'}</h1>
                            <p className="text-xs mt-2 text-slate-500 uppercase tracking-wider font-bold">
                                Duration: {quiz.duration || 0} min
                            </p>
                        </div>
                        {timeLeft !== null && (
                            <div className={`text-right ${timeAlmostUp ? 'animate-pulse' : ''}`}>
                                <div className={`text-2xl font-black tabular-nums ${timeLeft === 0 ? 'text-red-500' : timeAlmostUp ? 'text-red-500' : 'text-slate-700'}`}>
                                    {timeLeft > 0 ? formatTime(timeLeft) : 'Time up!'}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">Remaining</div>
                            </div>
                        )}
                    </div>

                    {timeAlmostUp && timeLeft > 0 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                            ⏰ Time is running out! Quiz will auto-submit when the timer reaches zero.
                        </div>
                    )}

                    <div className="mt-6 space-y-6">
                        {(quiz.questions || []).map((q: QuizQuestion, i: number) => (
                            <div key={i} className={`p-4 rounded-xl border ${timeLeft === 0 ? 'bg-slate-100 border-slate-200 opacity-70' : 'bg-slate-50 border-slate-100'}`}>
                                <p className="font-bold text-slate-900 mb-3">{i + 1}. {q.text || 'Question'}</p>
                                {String(q.type || '').toUpperCase() === 'SINGLE_CHOICE' ? (
                                    <div className="space-y-2">
                                        {(q.options || []).map((op, oi) => (
                                            <label key={oi} className={`flex items-center gap-3 text-sm font-medium ${timeLeft === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
                                                <input
                                                    type="radio"
                                                    name={`q-${i}`}
                                                    checked={answers[i]?.selectedIndex === oi}
                                                    onChange={() => setAnswers((prev) => prev.map((a, idx) => idx === i ? { ...a, selectedIndex: oi } : a))}
                                                    disabled={timeLeft === 0}
                                                    className="disabled:opacity-40"
                                                />
                                                {op}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-500 font-semibold">Coding ({q.language || 'any'})</p>
                                        <textarea
                                            value={answers[i]?.code || ''}
                                            onChange={(e) => setAnswers((prev) => prev.map((a, idx) => idx === i ? { ...a, code: e.target.value, language: q.language || 'text' } : a))}
                                            disabled={timeLeft === 0}
                                            className="w-full min-h-[180px] rounded-xl border border-slate-200 bg-white p-3 text-sm font-mono disabled:opacity-50 disabled:bg-slate-50"
                                            placeholder="Write your solution here..."
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm">Back</button>
                        {timeLeft !== 0 && (
                            <button disabled={!canSubmit || saving || submittedRef.current} onClick={submit} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm disabled:opacity-60">
                                {saving ? 'Submitting...' : 'Submit quiz'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventQuizPage;

