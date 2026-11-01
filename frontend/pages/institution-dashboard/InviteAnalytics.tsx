import React, { useEffect, useState } from 'react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { useAuth } from '../../AuthContext';

const InviteAnalytics: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any | null>(null);

    const fetchData = async () => {
        if (!user || !user.institution_id) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/teams/institution/${user.institution_id}/invite-analytics?days=14`, { headers: { ...authHeaders() } });
            if (res.ok) {
                const d = await res.json();
                setData(d);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (!data) return null;
    return (
        <div className="bg-white rounded-2xl p-4 border">
            <h3 className="text-sm font-black mb-3">Invite Analytics (14d)</h3>
            <div className="flex items-center gap-6">
                <div>
                    <div className="text-xs text-slate-500">Total Invites</div>
                    <div className="text-xl font-black">{data.total_invites}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500">Total Acceptances</div>
                    <div className="text-xl font-black">{data.total_acceptances}</div>
                </div>
                <div>
                    <div className="text-xs text-slate-500">Acceptance Rate</div>
                    <div className="text-xl font-black">{data.acceptance_rate === null ? '—' : `${(data.acceptance_rate * 100).toFixed(1)}%`}</div>
                </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">Daily accepts (last 14 days)</div>
            <div className="mt-2 flex gap-1 items-end h-16">
                {data.daily.map((d: any) => (
                    <div key={d.day} title={`${d.day}: ${d.count}`} style={{ height: `${Math.min(100, d.count * 10)}%` }} className="w-3 bg-purple-600 rounded-t"></div>
                ))}
            </div>
        </div>
    );
};

export default InviteAnalytics;

