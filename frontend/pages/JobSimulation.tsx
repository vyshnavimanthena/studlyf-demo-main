import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';

const JobSimulation: React.FC = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/student/simulations`);
        if (res.ok) setMissions(await res.json());
      } catch {}
      setLoading(false);
    };
    fetchMissions();
  }, []);

  const fallbackMissions = [
    { _id: "1", title: "Resilience Audit", company: "Nirvaha", difficulty: "Elite", description: "A production database is deadlocking under peak traffic. Identify the bottleneck and propose a zero-downtime migration." },
    { _id: "2", title: "Scale Deployment", company: "DataFlow", difficulty: "High", description: "Deploy a global real-time event hub. Ensure p99 latency stays under 100ms across 4 geographic regions." },
    { _id: "3", title: "Security Breach", company: "Logic", difficulty: "Critical", description: "A compromised dependency has leaked API keys. Initiate lockdown, audit permissions, and restore authority." }
  ];

  const displayMissions = missions.length > 0 ? missions : fallbackMissions;

  return (
    <div className="pt-32 pb-24 px-3 sm:px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 sm:mb-20 flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <span className="text-[#7C3AED] font-bold uppercase tracking-[0.5em] text-[10px] mb-4 block">Scenario Sandbox</span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-[#111827] mb-4 sm:mb-8 uppercase tracking-tighter leading-[0.9]">Job <br/><span className="text-[#7C3AED]">Simulation.</span></h1>
          </div>
          <p className="text-base sm:text-xl text-[#475569] max-w-2xl leading-relaxed font-medium">Test your authority in high-stakes engineering environments. No risk to production, total risk to your clinical score.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayMissions.map((mission, i) => (
              <motion.div key={mission._id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-10 flex flex-col group hover:border-[#7C3AED]/30 hover:shadow-2xl transition-all min-h-[400px] sm:h-[550px]"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="font-mono text-2xl font-black text-gray-200 group-hover:text-[#7C3AED] transition-colors">{mission._id || `S-0${i + 1}`}</span>
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${mission.difficulty === 'Critical' || mission.difficulty === 'Elite' ? 'bg-red-50 text-red-500' : 'bg-[#F5F3FF] text-[#7C3AED]'}`}>
                    {mission.difficulty} Complexity
                  </span>
                </div>
                <div className="flex-grow">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{mission.company} Mission</span>
                  <h3 className="text-3xl font-bold text-[#111827] mb-6 uppercase tracking-tight leading-tight">{mission.title}</h3>
                  <p className="text-[#6B7280] leading-relaxed text-sm font-medium">{mission.description}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">{[1,2,3].map(dot => <div key={dot} className="w-2 h-2 rounded-full bg-gray-100 group-hover:bg-[#7C3AED]/20" />)}</div>
                  <button className="w-full py-5 bg-gray-50 text-[#7C3AED] rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[#7C3AED] hover:text-white transition-all group-hover:shadow-xl">
                    Initialize Mission
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <footer className="mt-32 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 text-center">
            {[
              { value: "12 Simulations", label: "Active Library" },
              { value: "94%", label: "Avg Completion" },
              { value: "4.9", label: "Clinical Rating" }
            ].map((stat, i) => (
              <div key={i}><p className="text-2xl sm:text-4xl font-black text-[#111827]">{stat.value}</p><p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">{stat.label}</p></div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default JobSimulation;

