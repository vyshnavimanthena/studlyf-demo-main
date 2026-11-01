import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles, Calendar, Trophy, ArrowUpRight } from 'lucide-react';

const highlights = [
  { 
    title: 'Career Pathways', 
    desc: 'Goal-based pathways designed to help students learn, build, and grow faster.', 
    icon: Star, 
    color: 'from-[#FF7AB6] to-[#7C3AED]',
    glow: 'bg-[#FF7AB6]',
    action: 'tracks' as const,
    label: 'Pathways',
    btnText: 'Explore paths'
  },
  { 
    title: 'Career Opportunities', 
    desc: 'Discover internships, hackathons, startup roles, workshops, and real exposure.', 
    icon: Calendar, 
    color: 'from-[#06B6D4] to-[#4F46E5]',
    glow: 'bg-[#06B6D4]',
    action: 'learnHub' as const,
    label: 'Opportunities',
    btnText: 'Explore now'
  },
  { 
    title: 'Build & Showcase', 
    desc: 'Build projects, create proof of work, and showcase your growth journey.', 
    icon: Trophy, 
    color: 'from-[#F59E0B] to-[#EF4444]',
    glow: 'bg-[#F59E0B]',
    action: 'testimonials' as const,
    label: 'Growth',
    btnText: 'Explore work'
  },
  { 
    title: 'Mentors & Network', 
    desc: 'Connect with founders, mentors, creators, and ambitious student communities.', 
    icon: Sparkles, 
    color: 'from-[#34D399] to-[#06B6D4]',
    glow: 'bg-[#34D399]',
    action: 'aiTools' as const,
    label: 'Ecosystem',
    btnText: 'Explore network'
  },
];

const ColorfulHighlights: React.FC = () => {
  const navigate = useNavigate();

  const handleCardAction = (action: 'tracks' | 'learnHub' | 'testimonials' | 'aiTools') => {
    if (action === 'tracks') {
      const tracksSection = document.getElementById('tracks');
      if (tracksSection) {
        tracksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate('/learn/courses-overview');
      return;
    }

    if (action === 'learnHub') {
      navigate('/learn/courses-overview');
      return;
    }

    if (action === 'testimonials') {
      const testimonialsSection = document.getElementById('testimonials');
      if (testimonialsSection) {
        testimonialsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate('/');
      window.setTimeout(() => {
        document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);
      return;
    }

    navigate('/ai-tools');
  };

  return (
    <section className="py-20 sm:py-28 bg-white px-4 sm:px-6 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-gray-50 to-transparent rounded-full opacity-50 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 sm:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="max-w-2xl">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7C3AED] mb-3">Explore Studlyf</h3>
            <p className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-400">build your future.</span>
            </p>
          </div>
          <div className="hidden md:block">
            <p className="text-[#64748B] text-sm max-w-xs font-medium leading-relaxed">
              Explore opportunities, mentorship, projects, communities, and tools built for ambitious students.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <motion.button
                key={i}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardAction(h.action)}
                className="group text-left rounded-[28px] overflow-hidden bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 relative"
              >
                {/* Top decorative gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${h.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="p-7 sm:p-8 flex flex-col h-full z-10 relative">
                  <div className="flex items-start justify-between mb-8">
                    <div className="relative">
                      {/* Glow effect behind icon */}
                      <div className={`absolute inset-0 ${h.glow} blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-2xl`} />
                      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${h.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-105 transition-transform duration-500`}>
                        <Icon className="w-6 h-6 stroke-[1.5]" />
                      </div>
                    </div>
                    
                    <div className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-900 group-hover:bg-white group-hover:border-gray-200 transition-all duration-300">
                      {h.label}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="font-bold text-xl text-[#0F172A] mb-3 tracking-tight group-hover:text-[#7C3AED] transition-colors duration-300">{h.title}</h4>
                    <p className="text-[14px] text-[#64748B] leading-relaxed font-medium">{h.desc}</p>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors duration-300">
                      {h.btnText}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#7C3AED]/10 transition-colors duration-300">
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#7C3AED] transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ColorfulHighlights;

