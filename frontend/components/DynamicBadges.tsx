import React from 'react';
import { Globe, Users, Trophy, Calendar, Code, Brain, Award, Briefcase, Shield, Clock, Star } from 'lucide-react';

interface Badge {
  label: string;
  type?: string;
  color?: string;
  icon?: string;
}

interface DynamicBadgesProps {
  badges: Badge[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  globe: Globe, users: Users, trophy: Trophy, calendar: Calendar,
  code: Code, brain: Brain, award: Award, briefcase: Briefcase,
  shield: Shield, clock: Clock, star: Star,
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-50 text-slate-600 border-slate-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
};

const sizeMap = { sm: 'text-[10px] px-2 py-0.5 gap-1', md: 'text-xs px-2.5 py-1 gap-1.5', lg: 'text-sm px-3 py-1.5 gap-2' };
const iconSizeMap = { sm: 10, md: 12, lg: 14 };

export default function DynamicBadges({ badges, size = 'md', className = '' }: DynamicBadgesProps) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {badges.map((badge, i) => {
        const Icon = badge.icon ? iconMap[badge.icon.toLowerCase()] : null;
        const colorClass = colorMap[badge.color || 'slate'] || colorMap.slate;
        const sz = sizeMap[size] || sizeMap.md;
        return (
          <span key={i} className={`inline-flex items-center rounded-full border font-bold ${colorClass} ${sz}`}>
            {Icon && <Icon size={iconSizeMap[size] || 12} />}
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}

