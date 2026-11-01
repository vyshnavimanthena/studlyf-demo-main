import React, { useEffect, useState } from 'react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { useAuth } from '../../AuthContext';

const InviteAudit: React.FC = () => {
    const { user } = useAuth();
    const [acceptances, setAcceptances] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ team_id: '', code: '', date_from: '', date_to: '' });

    const fetchAcceptances = async () => {
        if (!user || !user.institution_id) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.team_id) params.set('team_id', filters.team_id);
            if (filters.code) params.set('code', filters.code);
            if (filters.date_from) params.set('date_from', filters.date_from);
            if (filters.date_to) params.set('date_to', filters.date_to);
            const res = await fetch(`${API_BASE_URL}/api/teams/institution/${user.institution_id}/invite-acceptances?${params.toString()}`, { headers: { ...authHeaders() } });
            if (res.ok) {
                const d = await res.json();
                setAcceptances(d.acceptances || []);
            } else {
                setAcceptances([]);
            }
        } catch (e) { setAcceptances([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAcceptances(); }, []);

    const handleExport = async () => {
        if (!user || !user.institution_id) return;
        const params = new URLSearchParams();
        if (filters.team_id) params.set('team_id', filters.team_id);
        if (filters.code) params.set('code', filters.code);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        try {
            const res = await fetch(`${API_BASE_URL}/api/teams/institution/${user.institution_id}/invite-acceptances/export?${params.toString()}`, { headers: { ...authHeaders() } });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `invite_acceptances_institution_${user.institution_id}.csv`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
        } catch (e) { alert('Export failed'); }
    };

    return (
        <div className="p-3 sm:p-6 bg-white rounded-2xl shadow-sm">
            <h2 className="text-lg font-black mb-4">Invite Audit</h2>
            <div className="flex flex-wrap gap-2 mb-4">
                <input placeholder="Team ID" value={filters.team_id} onChange={e => setFilters(f => ({ ...f, team_id: e.target.value }))} className="px-3 py-2 border rounded" />
                <input placeholder="Invite Code" value={filters.code} onChange={e => setFilters(f => ({ ...f, code: e.target.value }))} className="px-3 py-2 border rounded" />
                <input type="date" value={filters.date_from} onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))} className="px-3 py-2 border rounded" />
                <input type="date" value={filters.date_to} onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))} className="px-3 py-2 border rounded" />
                <button onClick={fetchAcceptances} className="px-4 py-2 bg-purple-600 text-white rounded">Filter</button>
                <button onClick={handleExport} className="px-4 py-2 bg-white border rounded">Export CSV</button>
            </div>
            <div className="max-h-72 overflow-auto">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs text-slate-500"><th className="p-2">When</th><th className="p-2">Team</th><th className="p-2">User</th><th className="p-2">Email</th><th className="p-2">Code</th></tr>
                    </thead>
                    <tbody>
                        {!loading && acceptances.map(a => (
                            <tr key={`${a.team_id}-${a.user_id}-${a.accepted_at}`} className="border-t"><td className="p-2 text-xs">{new Date(a.accepted_at).toLocaleString()}</td><td className="p-2">{a.team_id}</td><td className="p-2">{a.user_id}</td><td className="p-2">{a.user_email || '-'}</td><td className="p-2 font-mono text-xs">{a.invite_code}</td></tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
};

export default InviteAudit;

