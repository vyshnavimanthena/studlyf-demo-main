import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WebImage from '../components/WebImage';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const examples = [
    { title: "Food Delivery System", company: "Zomato-inspired", desc: "Architect a real-time dispatch engine for high-throughput logistics optimization.", stack: ["Go", "Redis", "Kafka"], image: "https://images.unsplash.com/photo-1526367790999-0150786486a9?auto=format&fit=crop&q=80&w=800" },
    { title: "Ride Booking Application", company: "Uber-inspired", desc: "Design a geo-distributed matching system with low-latency p99 guarantees.", stack: ["Node.js", "Postgis", "WebSockets"], image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800" },
    { title: "E-Commerce Analytics", company: "Amazon-inspired", desc: "Develop a streaming analytics hub for real-time inventory and sales governance.", stack: ["React", "Rust", "ClickHouse"], image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" }
  ];

  return (
    <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-8xl font-bold text-[#111827] mb-8 uppercase tracking-tighter leading-[0.85]">Build <br/><span className="text-[#7C3AED]">Interesting Projects.</span></h1>
            <p className="text-xl text-[#475569] font-medium leading-relaxed">Work on systems inspired by engineering giants. Move beyond tutorials into the realm of real-world complexity.</p>
          </div>
          <button 
            onClick={() => navigate('/learn/courses')}
            className="px-10 py-5 bg-[#7C3AED] text-white font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-xl shadow-[#7C3AED]/20 hover:scale-105 transition-transform"
          >
            Explore Tracks
          </button>
        </header>

        <div className="grid gap-12">
          {examples.map((ex, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-[#F9FAFB] rounded-[3rem] border border-gray-100 overflow-hidden flex flex-col lg:flex-row shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div className="lg:w-2/5 h-80 lg:h-auto overflow-hidden relative">
                <WebImage src={ex.image} alt={ex.title} aspectRatio="aspect-square" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[#7C3AED]/5 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="p-12 lg:p-20 flex-grow">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[#7C3AED] font-bold text-[10px] uppercase tracking-[0.5em]">{ex.company}</span>
                  <div className="flex gap-3">
                    {ex.stack.map(s => <span key={s} className="text-[8px] font-bold bg-white px-3 py-1.5 rounded-full border border-gray-200 tracking-wider">{s}</span>)}
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-[#111827] mb-6 group-hover:text-[#7C3AED] transition-colors tracking-tight">{ex.title}</h3>
                <p className="text-[#6B7280] text-lg leading-relaxed mb-12 max-w-xl">{ex.desc}</p>
                
                <div className="flex flex-wrap gap-12 mb-12 border-y border-gray-100 py-8">
                   {[
                     { label: "Demonstrate Skills", desc: "Practical Proof" },
                     { label: "Strengthen Resume", desc: "Recruiter Magnet" },
                     { label: "Interview Prep", desc: "Real Confidence" }
                   ].map((item, idx) => (
                     <div key={idx}>
                       <span className="block text-[#111827] font-bold text-xs uppercase tracking-widest">{item.label}</span>
                       <span className="block text-[#6B7280] text-[10px] uppercase tracking-widest mt-1 opacity-60">{item.desc}</span>
                     </div>
                   ))}
                </div>

                <button className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#111827] flex items-center gap-6 group/btn hover:translate-x-2 transition-transform">
                  View Project Blueprint
                  <span className="w-12 h-[2px] bg-[#7C3AED] group-hover/btn:w-20 transition-all"></span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;

