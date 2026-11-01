
import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  {
    value: "1M+",
    label: "Active Learners",
    icon: (
      <div className="relative">
        <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="18" r="8" fill="#7C3AED" fillOpacity="0.2" />
          <path d="M12 40C12 33.3726 17.3726 28 24 28V28C30.6274 28 36 33.3726 36 40" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 18V8L32 12L24 16" fill="#7C3AED" />
          <circle cx="24" cy="18" r="6" stroke="#7C3AED" strokeWidth="3" />
        </svg>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-[#1E293B]"></div>
      </div>
    ),
    delay: 0.1
  },
  {
    value: "95%",
    label: "Success Rate",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="32" height="32" rx="16" fill="#22C55E" fillOpacity="0.1" stroke="#22C55E" strokeWidth="3" />
        <path d="M18 24L22 28L30 20" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    delay: 0.2
  },
  {
    value: "4.8/5",
    label: "Google Rating",
    icon: (
      <div className="relative">
        <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 8L27.5 17.5H37L29.5 23L32.5 32.5L24 27L15.5 32.5L18.5 23L11 17.5H20.5L24 8Z" fill="#FBBF24" fillOpacity="0.2" stroke="#FBBF24" strokeWidth="2" />
          <path d="M34 32C34 35.3137 31.3137 38 28 38H22C18.6863 38 16 35.3137 16 32V26" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          <path d="M22 26V32" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    ),
    delay: 0.3
  },
  {
    value: "100% Live",
    label: "Training",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="36" height="24" rx="3" stroke="#7C3AED" strokeWidth="3" />
        <path d="M12 34H36" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 16V22" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="22" r="2" fill="#EF4444" />
      </svg>
    ),
    delay: 0.4
  }
];

const StatsSection: React.FC = () => {
  return (
    <section className="relative z-30 py-20 bg-[#0F172A]">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C3AED]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                delay: stat.delay, 
                duration: 1, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              whileHover="hover"
              className="group relative"
            >
              {/* Shiny Border Effect Layer */}
              <motion.div 
                variants={{
                  hover: { opacity: 1, scale: 1.02 }
                }}
                initial={{ opacity: 0, scale: 1 }}
                className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent opacity-0 blur-[2px] transition-all duration-500 group-hover:via-white/40 group-hover:opacity-100"
              />

              <div className="relative h-full bg-[#1E293B]/60 backdrop-blur-2xl border border-white/5 rounded-[1.9rem] p-8 flex items-center gap-6 shadow-2xl transition-all duration-500 group-hover:bg-[#1E293B]/40 group-hover:translate-y-[-8px]">
                
                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner overflow-hidden">
                  <div className="relative z-10">{stat.icon}</div>
                  <div className="absolute inset-0 bg-[#7C3AED]/5 group-hover:bg-[#7C3AED]/20 transition-colors" />
                </div>

                {/* Text Content */}
                <div className="flex flex-col">
                  <motion.span 
                    variants={{
                      hover: { scale: 1.05, x: 2 }
                    }}
                    className="text-3xl sm:text-4xl font-black text-white tracking-tighter transition-all duration-300"
                  >
                    {stat.value}
                  </motion.span>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-[#7C3AED] transition-colors duration-300">
                    {stat.label}
                  </span>
                </div>

                {/* Internal Decorative Glow */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#7C3AED]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Visual Divider to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF9FF] to-transparent opacity-10" />
    </section>
  );
};

export default StatsSection;

