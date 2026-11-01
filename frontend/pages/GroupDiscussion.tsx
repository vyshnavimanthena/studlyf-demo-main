import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';

const GroupDiscussion: React.FC = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/student/gd-topics`);
        if (res.ok) setTopics(await res.json());
      } catch {}
      setLoading(false);
    };
    fetchTopics();
  }, []);

  const fallbackTopics = [
    "Centralization vs Decentralization in Modern Cloud",
    "Human Accountability in Automated Decision Systems",
    "Monolith vs Microservices: The Cultural Trade-off",
    "The Ethics of Generative Code in Institutions"
  ];

  return (
    <div className="pt-32 pb-24 px-3 sm:px-6 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 sm:mb-24 text-center lg:text-left">
          <span className="text-[#7C3AED] font-bold uppercase tracking-[0.5em] text-[10px]">Communication Mastery</span>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-[#111827] mt-6 mb-8 uppercase tracking-tighter leading-[0.85]">GD Practice <br/><span className="text-[#7C3AED]">Protocols.</span></h1>
          <p className="text-lg sm:text-xl text-[#475569] max-w-3xl leading-relaxed font-medium">Learn to articulate complex technical philosophy clearly and confidently in high-stakes team environments.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12">
            <div className="bg-[#F9FAFB] p-6 sm:p-12 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#111827] mb-10 uppercase tracking-[0.3em] border-b border-gray-200 pb-4">Active Session Topics</h3>
              <ul className="space-y-8">
                {(topics.length > 0 ? topics : fallbackTopics).map((topic, i) => (
                  <li key={i} className="flex items-start gap-8 group cursor-pointer">
                    <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#7C3AED] font-bold text-xs shadow-sm group-hover:bg-[#7C3AED] group-hover:text-white transition-all shrink-0">{i + 1}</span>
                    <span className="font-bold text-[#374151] group-hover:text-[#7C3AED] transition-colors leading-tight text-lg mt-2">{typeof topic === 'string' ? topic : topic.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-6 sm:gap-8">
              <div className="p-6 sm:p-12 border border-gray-100 rounded-[3rem] shadow-sm flex flex-col justify-center bg-white group hover:border-[#7C3AED]/20 transition-all">
                <h4 className="font-bold text-[#7C3AED] mb-6 text-xs uppercase tracking-[0.3em]">Leadership Skills</h4>
                <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed">Learn how to steer technical discussions without dominating, focusing on consensus, logic, and professional respect.</p>
              </div>
              <div className="p-6 sm:p-12 border border-gray-100 rounded-[3rem] shadow-sm flex flex-col justify-center bg-white group hover:border-[#7C3AED]/20 transition-all">
                <h4 className="font-bold text-[#7C3AED] mb-6 text-xs uppercase tracking-[0.3em]">Logical Thinking</h4>
                <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed">Deconstruct complex arguments in real-time and provide structured, evidence-based opinions that teams trust.</p>
              </div>
            </div>
          </div>
        )}

        <section className="bg-[#F9FAFB] p-6 sm:p-12 rounded-[3rem] border border-gray-100 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-3xl font-bold text-[#111827] mb-6 uppercase tracking-tight">Join Structured Sessions</h2>
            <p className="text-[#6B7280] mb-12 leading-relaxed">Participate in live group discussion sessions evaluated by technical moderators against professional communication criteria.</p>
            <button className="w-full sm:w-auto px-16 py-6 bg-[#7C3AED] text-white font-bold text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-2xl hover:scale-105 transition-transform">Join GD Practice Session</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GroupDiscussion;

