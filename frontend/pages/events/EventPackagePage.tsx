import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import HackathonEventPackage from '../institution-dashboard/components/HackathonEventPackage';
import ParticipantPortal from './ParticipantPortal';

const EventPackagePage: React.FC = () => {
    const { eventId } = useParams();
    const { role, user } = useAuth();

    if (!eventId) {
        return null;
    }

    if (role === 'institution' || role === 'judge') {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-8">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#6C3BFF]">Event Package</p>
                        <h1 className="text-3xl font-black tracking-tight">Institution package controls</h1>
                        <p className="text-slate-500 font-medium mt-1">Create problem statements, review selections, and keep the package scoped to this event.</p>
                    </div>
                    <HackathonEventPackage institutionId={user?.institution_id} eventId={eventId} />
                </div>
            </div>
        );
    }

    return <ParticipantPortal />;
};

export default EventPackagePage;

