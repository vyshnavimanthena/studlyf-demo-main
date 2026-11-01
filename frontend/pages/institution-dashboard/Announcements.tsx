import React, { useEffect, useState } from 'react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';
import { useAuth } from '../../AuthContext';
import { format } from 'date-fns';

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [eventId, setEventId] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use selected eventId from URL if present
    const params = new URLSearchParams(window.location.search);
    const eid = params.get('eventId');
    if (eid) setEventId(eid);
  }, []);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/registration/events/${eventId}/announcements`, { headers: { ...authHeaders() } })
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <div className="bg-white p-3 sm:p-6 rounded-2xl border border-slate-100">
      <h2 className="text-lg font-black mb-4">Announcements</h2>
      {!eventId ? (
        <div className="text-sm text-slate-500">Select an event to view its announcements (use ?eventId=... in URL).</div>
      ) : loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-sm text-slate-400">No announcements found for this event.</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="py-3">{a.subject}</td>
                    <td className="py-3">{a.status}</td>
                    <td className="py-3">{a.estimated_recipients}</td>
                    <td className="py-3">{a.created_at ? format(new Date(a.created_at), 'yyyy-MM-dd HH:mm') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Announcements;

