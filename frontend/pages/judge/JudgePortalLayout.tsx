import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import JudgeSidebar from '../../components/judge/JudgeSidebar';
import JudgeDashboard from '../institution-dashboard/judge/JudgeDashboard';

const Placeholder: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
    <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
    </div>
);

const JudgePortalLayout: React.FC = () => {
    return (
        <div className="h-screen bg-[#06051a] flex overflow-hidden">
            <JudgeSidebar />
            <div className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar">
                <Routes>
                    <Route index element={<JudgeDashboard />} />
                    <Route path="assignments" element={
                        <Placeholder title="Assignments" desc="Use evaluation links sent via email to review and score assigned projects." />
                    } />
                    <Route path="leaderboards" element={
                        <Placeholder title="Leaderboards" desc="Leaderboards will be available once projects have been evaluated." />
                    } />
                    <Route path="settings" element={
                        <Placeholder title="Profile Settings" desc="Manage your profile and notification preferences." />
                    } />
                    <Route path="*" element={<Navigate to="/judge-portal" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default JudgePortalLayout;
