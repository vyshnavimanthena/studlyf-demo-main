import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { API_BASE_URL, authHeaders } from '../apiConfig';

const PartnerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'talent' | 'analytics' | 'settings'>('dashboard');
  const [talentPool, setTalentPool] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, aRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/student/partner/talent-pool`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/api/student/partner/analytics`, { headers: authHeaders() }),
        ]);
        if (tRes.ok) setTalentPool(await tRes.json());
        if (aRes.ok) setAnalyticsData(await aRes.json());
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '💼' },
    { id: 'talent', label: 'Talent Pool', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  const renderView = () => {
    switch (activeView) {
      case 'talent':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-[#111827]">Talent Pool</h2>
            {loading ? <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" /> : (
              <div className="grid gap-4 sm:gap-6">
                {talentPool.map((talent, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm hover:border-[#7C3AED]/30 transition-all group gap-4">
                    <div className="flex items-center gap-4 sm:gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-[#7C3AED]">
                        <img src={talent.avatar} className="w-full h-full rounded-2xl object-cover" alt="" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-[#7C3AED] transition-colors">{talent.name}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{talent.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      <div className="text-center">
                        <span className="block font-black text-xl tracking-tighter">{talent.match_score}%</span>
                        <span className="text-[7px] text-gray-400 uppercase tracking-widest font-bold">Match</span>
                      </div>
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${talent.status === 'Available' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{talent.status}</span>
                      </div>
                      <button className="px-6 py-3 bg-[#F5F3FF] text-[#7C3AED] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#7C3AED] hover:text-white transition-all">View Dossier</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-[#111827]">Analytics</h2>
            {loading ? <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                {[
                  { label: 'Candidates Screened', value: analyticsData?.candidates_screened || 0 },
                  { label: 'Verified Matches', value: analyticsData?.verified_matches || 0 },
                  { label: 'Interviews Saved', value: analyticsData?.interviews_saved || 0 }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 text-center shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
                    <p className="text-3xl sm:text-5xl font-black text-[#7C3AED]">{stat.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8 max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-[#111827]">Settings</h2>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
              <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Company Name</label><input defaultValue={user?.college_name || 'Tech Corp'} className="w-full px-5 py-4 border border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20" /></div>
              <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email</label><input defaultValue={user?.email || ''} className="w-full px-5 py-4 border border-gray-100 rounded-2xl font-bold text-sm" /></div>
              <button className="px-10 py-4 bg-[#7C3AED] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#6D28D9] transition-all">Save Changes</button>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-12">
            <div>
              <h1 className="text-3xl sm:text-6xl font-black uppercase tracking-tighter text-[#111827] mb-4">Partner Hub</h1>
              <p className="text-gray-500 font-medium text-lg">Welcome back, {user?.full_name || user?.email}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
              {[{ label: 'Talent Pool', value: talentPool.length || 0, color: '#7C3AED' },
                { label: 'Available Now', value: talentPool.filter((t: any) => t.status === 'Available').length || 0, color: '#059669' },
                { label: 'Interviews', value: talentPool.filter((t: any) => t.status === 'Interviewing').length || 0, color: '#F59E0B' }
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-sm" style={{ borderTop: `4px solid ${stat.color}` }}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
                  <p className="text-3xl sm:text-5xl font-black text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-50">
        <h2 className="text-sm font-black uppercase tracking-tighter">Partner</h2>
        <div className="flex gap-2">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeView === item.id ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-gray-400 hover:text-gray-900'}`}
            >{item.label}</button>
          ))}
        </div>
      </div>
      <div className="hidden md:flex w-72 min-h-screen bg-white border-r border-gray-100 p-8 flex-col">
        <div className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-tighter">Partner</h2>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">Hiring Portal</p>
        </div>
        <nav className="flex-grow space-y-2">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeView === item.id ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
            ><span>{item.icon}</span>{item.label}</button>
          ))}
        </nav>
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <button onClick={handleLogout} className="w-full text-left text-sm font-bold text-gray-400 hover:text-red-500 transition-colors px-5 py-3">Sign Out</button>
        </div>
      </div>
      <div className="flex-1 p-4 sm:p-12 md:p-12">{renderView()}</div>
    </div>
  );
};

export default PartnerDashboard;

