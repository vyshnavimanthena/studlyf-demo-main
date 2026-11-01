import React from 'react';
import { Calendar, Clock, CheckCircle2, Circle, FileText, Upload, UserPlus, Trophy, Gavel, Eye, Star, AlertCircle } from 'lucide-react';

interface TimelineStage {
  id?: string;
  name: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  status?: 'pending' | 'active' | 'completed' | 'upcoming';
  description?: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
}

interface EventTimelineProps {
  stages: TimelineStage[];
  className?: string;
  title?: string;
}

const stageTypeIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  registration: UserPlus,
  submission: Upload,
  review: Eye,
  judging: Gavel,
  result: Trophy,
  coding: FileText,
  quiz: Star,
  interview: UserPlus,
  shortlist: Star,
};

const stageTypeColors: Record<string, string> = {
  registration: 'bg-blue-500',
  submission: 'bg-emerald-500',
  review: 'bg-amber-500',
  judging: 'bg-purple-500',
  result: 'bg-rose-500',
  coding: 'bg-indigo-500',
  quiz: 'bg-teal-500',
  interview: 'bg-orange-500',
  shortlist: 'bg-pink-500',
};

function getStageIcon(type?: string) {
  const key = (type || '').toLowerCase();
  return stageTypeIcons[key] || Calendar;
}

function getStageColor(type?: string) {
  const key = (type || '').toLowerCase();
  return stageTypeColors[key] || 'bg-slate-400';
}

export default function EventTimeline({ stages, className = '', title = 'Event Timeline' }: EventTimelineProps) {
  if (!stages || stages.length === 0) return null;

  const sorted = [...stages].sort((a, b) => {
    const aDate = a.start_date || a.deadline || '';
    const bDate = b.start_date || b.deadline || '';
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

  return (
    <section className={`bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm ${className}`}>
      <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-8">
        <span className="w-1 h-7 bg-purple-600 rounded-full" />
        {title}
      </h2>
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

        <div className="space-y-0">
          {sorted.map((stage, idx) => {
            const Icon = getStageIcon(stage.type);
            const colorClass = getStageColor(stage.type);
            const isActive = stage.isCurrent || stage.status === 'active';
            const isDone = stage.isCompleted || stage.status === 'completed';
            const deadline = stage.end_date || stage.deadline;
            const stageDate = deadline ? new Date(deadline) : null;

            return (
              <div key={stage.id || idx} className="relative flex gap-6 pb-8 last:pb-0">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                      : isActive
                      ? 'bg-purple-50 border-purple-300 text-purple-600 shadow-md shadow-purple-200'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {isDone ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className={`text-base font-black ${
                      isDone ? 'text-emerald-700' : isActive ? 'text-purple-700' : 'text-slate-700'
                    }`}>
                      {stage.name}
                    </h3>
                    {stage.type && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {stage.type}
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} /> Completed
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={10} /> Active
                      </span>
                    )}
                  </div>

                  {stage.description && (
                    <p className="text-sm text-slate-500 font-medium mt-1 line-clamp-2">{stage.description}</p>
                  )}

                  {stageDate && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-400">
                      <Calendar size={12} />
                      <span>
                        {stageDate.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

