import React, { useState, useEffect } from 'react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface Participant {
    id: string;
    name: string;
    email: string;
    phone: string;
    event: string;
    event_id?: string;
    team: string;
    regDate: string;
    status: string;
    current_stage?: string;
    user_id?: string;
}

const ParticipantsManagement: React.FC<{ institutionId?: string }> = ({ institutionId }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newParticipant, setNewParticipant] = useState({ name: '', email: '', phone: '', event_id: '', team: '' });
    const [events, setEvents] = useState<{ _id: string; title: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEvent, setFilterEvent] = useState('All Events');
    const [filterStatus, setFilterStatus] = useState('All Statuses');

    const headers = authHeaders();

    useEffect(() => {
        if (!institutionId) {
            setParticipants([]);
            setLoading(false);
            return;
        }
        fetchParticipants();
        fetchEvents();
    }, [institutionId]);

    const fetchParticipants = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/participants/${institutionId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setParticipants(data.map((p: any) => ({
                    id: p._id,
                    name: p.full_name || p.name || 'Unknown',
                    email: p.email || '',
                    phone: p.phone || 'N/A',
                    event: p.event_title || p.event_id || 'Unknown',
                    event_id: p.event_id,
                    team: p.team_name || 'Individual',
                    regDate: p.registered_at ? new Date(p.registered_at).toLocaleDateString() : 'N/A',
                    status: p.status || 'pending',
                    current_stage: p.current_stage || null,
                    user_id: p.user_id,
                })));
            } else {
                setError('Failed to fetch participants');
            }
        } catch {
            setError('Network error fetching participants');
        }
        setLoading(false);
    };

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/events/${institutionId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setEvents(data.map((e: any) => ({ _id: e._id, title: e.title || e.name })));
            }
        } catch {}
    };

    const handleApprove = async (p: Participant) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/participants/${p.id}/status`, {
                method: 'PATCH',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'shortlisted' }),
            });
            if (res.ok) {
                setParticipants(prev => prev.map(x => x.id === p.id ? { ...x, status: 'shortlisted' } : x));
            } else {
                setError('Failed to approve participant');
            }
        } catch {
            setError('Network error approving participant');
        }
    };

    const handleReject = async (p: Participant) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/participants/${p.id}/status`, {
                method: 'PATCH',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' }),
            });
            if (res.ok) {
                setParticipants(prev => prev.map(x => x.id === p.id ? { ...x, status: 'rejected' } : x));
            } else {
                setError('Failed to reject participant');
            }
        } catch {
            setError('Network error rejecting participant');
        }
    };

    const handleAddParticipant = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/institution/participants/add`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_id: newParticipant.event_id,
                    email: newParticipant.email,
                    name: newParticipant.name,
                }),
            });
            if (res.ok) {
                const result = await res.json();
                const p = result.participant;
                setParticipants(prev => [{
                    id: p._id,
                    name: p.name || newParticipant.name,
                    email: p.email || newParticipant.email,
                    phone: newParticipant.phone || 'N/A',
                    event: events.find(e => e._id === newParticipant.event_id)?.title || newParticipant.event_id,
                    event_id: newParticipant.event_id,
                    team: 'Individual',
                    regDate: new Date().toLocaleDateString(),
                    status: p.status || 'registered',
                    current_stage: p.current_stage,
                    user_id: p.user_id,
                }, ...prev]);
                setShowAddForm(false);
                setNewParticipant({ name: '', email: '', phone: '', event_id: '', team: '' });
            } else {
                const err = await res.json();
                setError(err.detail || 'Failed to add participant');
            }
        } catch {
            setError('Network error adding participant');
        }
    };

    const statusActions = (p: Participant) => {
        if (p.status === 'shortlisted' || p.status === 'verified') return null;
        if (p.status === 'rejected') return null;
        return (
            <div className="flex gap-2">
                <button
                    onClick={() => handleApprove(p)}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-200 transition-all"
                >
                    Approve
                </button>
                <button
                    onClick={() => handleReject(p)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition-all"
                >
                    Reject
                </button>
            </div>
        );
    };

    const eventOptions = events.length > 0
        ? events
        : [];

    const filteredParticipants = participants.filter(p => {
        const matchEvent = filterEvent === 'All Events' || p.event === filterEvent || p.event_id === filterEvent;
        const matchStatus = filterStatus === 'All Statuses' || p.status === filterStatus;
        const searchLower = searchTerm.toLowerCase();
        const matchSearch = p.name.toLowerCase().includes(searchLower) || p.email.toLowerCase().includes(searchLower);
        return matchEvent && matchStatus && matchSearch;
    });

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'shortlisted':
            case 'verified':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'registered':
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex pt-0">
            <div className="flex-1 flex flex-col min-h-screen">
                <main className="px-3 sm:px-8 py-4 sm:py-8 pt-10 flex-1">
                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Participants Management</h1>
                            <p className="text-gray-500 mt-2">Manage, filter, and review event participants.</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {showAddForm ? 'Cancel' : 'Add Participant'}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-bold flex items-center gap-2">
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
                        </div>
                    )}

                    {showAddForm && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Participant</h2>
                            <form onSubmit={handleAddParticipant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input required type="text" placeholder="Name" value={newParticipant.name} onChange={e => setNewParticipant({...newParticipant, name: e.target.value})} className="px-4 py-2 border rounded-lg" />
                                <input required type="email" placeholder="Email" value={newParticipant.email} onChange={e => setNewParticipant({...newParticipant, email: e.target.value})} className="px-4 py-2 border rounded-lg" />
                                <input type="tel" placeholder="Phone" value={newParticipant.phone} onChange={e => setNewParticipant({...newParticipant, phone: e.target.value})} className="px-4 py-2 border rounded-lg" />
                                <select required value={newParticipant.event_id} onChange={e => setNewParticipant({...newParticipant, event_id: e.target.value, team: ''})} className="px-4 py-2 border rounded-lg bg-white">
                                    <option value="">Select event...</option>
                                    {eventOptions.map(ev => (
                                        <option key={ev._id} value={ev._id}>{ev.title}</option>
                                    ))}
                                </select>
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors md:col-span-2">Add Participant</button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border rounded-lg flex-1 min-w-[200px]"
                            />
                            <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)} className="px-4 py-2 border rounded-lg bg-white">
                                <option value="All Events">All Events</option>
                                {[...new Set(participants.map(p => p.event).filter(Boolean))].map(ev => (
                                    <option key={ev} value={ev}>{ev}</option>
                                ))}
                            </select>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg bg-white">
                                <option value="All Statuses">All Statuses</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                                <option value="registered">Registered</option>
                            </select>
                            <span className="text-sm text-gray-500 font-medium ml-auto">{filteredParticipants.length} participants</span>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-gray-400 font-bold">Loading participants...</div>
                        ) : filteredParticipants.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 font-bold">No participants found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Email</th>
                                            <th className="px-6 py-4">Event</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Team</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 hidden lg:table-cell">Stage</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredParticipants.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50 transition-all">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400">{p.regDate}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{p.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{p.event}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{p.team}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusBadgeClass(p.status)}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{p.current_stage || 'N/A'}</td>
                                                <td className="px-6 py-4">{statusActions(p)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ParticipantsManagement;

