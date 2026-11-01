import React from 'react';
import { useNavigate } from 'react-router-dom';

const PremiumStorytellingSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6 bg-gradient-to-r from-[#1F2937] via-[#111827] to-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div>
          <span className="text-sm uppercase tracking-[0.4em] text-purple-300">Premium Story</span>
          <h2 className="mt-6 text-4xl lg:text-5xl font-black tracking-tight">Bring Your Engineering Journey to Life</h2>
          <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
            Transform your experience into a compelling professional story with premium templates, smart prompts, and export-ready formatting designed for modern engineering portfolios.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/job-prep/portfolio')}
              className="px-8 py-4 rounded-3xl bg-[#7C3AED] font-semibold text-white shadow-xl hover:bg-[#6D28D9] transition"
            >
              Start Your Story
            </button>
            <button
              type="button"
              onClick={() => navigate('/job-prep/portfolio?section=templates')}
              className="px-8 py-4 rounded-3xl border border-white/20 text-white bg-white/5 hover:bg-white/10 transition"
            >
              Explore Templates
            </button>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#111827] p-6 border border-white/10">
              <h3 className="text-xl font-black mb-3">Featured Story</h3>
              <p className="text-sm text-slate-300 leading-relaxed">Share a crisp career narrative that blends your technical wins, leadership moments, and product impact in one scrollable showcase.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {['Project Highlights', 'Career Wins', 'Skills Narrative', 'Impact Metrics'].map((item) => (
                <div key={item} className="rounded-3xl bg-[#0F172A] p-5 border border-white/10">
                  <span className="text-sm uppercase tracking-[0.3em] text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumStorytellingSection;

