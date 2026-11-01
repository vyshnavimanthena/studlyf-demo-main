import React from 'react';
import { Users, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface JudgeStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const JudgeStatsCard: React.FC<JudgeStatsCardProps> = ({ title, value, icon, color = 'bg-blue-50', trend = 'neutral' }) => {
  return (
    <div className={`${color} p-6 rounded-2xl border border-slate-100 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          trend === 'up' ? 'bg-emerald-100 text-emerald-600' :
          trend === 'down' ? 'bg-red-100 text-red-600' :
          'bg-slate-100 text-slate-600'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default JudgeStatsCard;

