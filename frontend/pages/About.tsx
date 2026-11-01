import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Users, Rocket, BookOpen } from 'lucide-react';

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-24 px-3 sm:px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center lg:text-left relative overflow-visible">
          <div className="absolute -top-16 right-8 hidden md:block">
            <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#6D28D9] to-[#06B6D4] opacity-10 blur-3xl" />
          </div>

          <span className="text-[#7C3AED] font-bold uppercase tracking-[0.6em] text-[10px]">Institutional Profile</span>
          <div className="flex flex-col items-center lg:items-start gap-6 mt-6">
            <h1 className="text-4xl sm:text-7xl md:text-9xl font-extrabold text-[#111827] leading-none tracking-tight">About</h1>
            <h2 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B]">Studlyf</h2>
          </div>

          <div className="h-[2px] w-32 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] my-8 mx-auto lg:mx-0"></div>
          <p className="text-base sm:text-xl text-[#475569] leading-relaxed font-medium max-w-4xl mx-auto lg:mx-0">We help learners build real skills and help companies hire based on verified ability, not resumes — through role-ready training, hands-on projects, and institutional verification.</p>
        </header>

        <section className="grid md:grid-cols-2 gap-6 sm:gap-12 mb-24">
          <div className="space-y-10">
            <div>
              <h2 className="text-xs font-bold text-[#7C3AED] uppercase tracking-[0.4em] mb-6">Our Mission</h2>
              <motion.p className="text-xl sm:text-2xl font-extrabold text-[#111827] leading-relaxed mb-4" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                We bridge the gap between abstract learning and high-stakes engineering skills through clinical verification.
              </motion.p>
              <p className="text-[#6B7280] text-base leading-relaxed">
                In a world of generative noise, we provide auditable evidence. Our programs focus on owning systems, not just answering interview questions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{
                icon: Lightbulb, title: 'Clinical Rigor', desc: 'Assessments designed to measure real engineering judgment.' , color: 'from-[#FF7AB6] to-[#7C3AED]'
              },{
                icon: Rocket, title: 'Job-Ready Projects', desc: 'Build and ship evidence-grade projects used by hiring partners.', color: 'from-[#06B6D4] to-[#7C3AED]'
              },{
                icon: Users, title: 'Mentorship', desc: 'Senior engineers who review your work and help you improve.', color: 'from-[#F59E0B] to-[#EF4444]'
              },{
                icon: BookOpen, title: 'Research-backed', desc: 'Curriculum and assessments grounded in industry patterns.', color: 'from-[#34D399] to-[#06B6D4]'
              }].map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div key={i} className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm flex gap-4 items-start" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827]">{card.title}</h4>
                      <p className="text-sm text-[#6B7280]">{card.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-white to-[#FBFCFF] border border-gray-100 p-4 sm:p-8 shadow-2xl">
            <h3 className="font-bold text-[#111827] uppercase tracking-[0.3em] text-xs mb-6">Our Core Approach</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white">01</div>
                <div>
                  <h4 className="font-bold">Clinical Verification</h4>
                  <p className="text-sm text-[#6B7280]">Multi-stage evaluations that simulate production challenges.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#06B6D4] flex items-center justify-center text-white">02</div>
                <div>
                  <h4 className="font-bold">Project Evidence</h4>
                  <p className="text-sm text-[#6B7280]">Portfolios and projects reviewed by industry partners.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#F59E0B] flex items-center justify-center text-white">03</div>
                <div>
                  <h4 className="font-bold">Institutional Trust</h4>
                  <p className="text-sm text-[#6B7280]">Adopted by organisations for hiring and upskilling.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="p-8 sm:p-16 md:p-24 bg-[#F9FAFB] rounded-2xl sm:rounded-[4rem] text-center border border-gray-100 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#7C3AED]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#111827] mb-12 uppercase tracking-tighter">Ready to join the standard?</h2>
            <p className="text-[#6B7280] text-base sm:text-xl mb-16 max-w-xl mx-auto font-medium leading-relaxed">Connect your capability to real opportunities. Build skills. Create a career.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 sm:px-16 py-6 sm:py-8 bg-[#7C3AED] text-white font-bold text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-3xl shadow-[#7C3AED]/20 hover:scale-[1.02] transition-transform"
            >
              Join Our Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

