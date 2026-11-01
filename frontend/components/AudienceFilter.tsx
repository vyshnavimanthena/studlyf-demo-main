
import React from 'react';
import { motion } from 'framer-motion';
import WebImage from './WebImage';

const AudienceFilter: React.FC = () => {
  const images = [
    "https://images.unsplash.com/photo-1573164773974-2977827e6931?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600"
  ];

  return (
    <section className="bg-white py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="grid grid-cols-2 gap-4">
            {images.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`aspect-square rounded-3xl overflow-hidden shadow-lg border border-gray-100 ${i % 2 !== 0 ? 'mt-8' : '-mt-4'}`}
              >
                <WebImage src={src} alt={`Institutional Context ${i}`} aspectRatio="aspect-square" />
              </motion.div>
            ))}
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-xl font-bold text-[#111827] mb-12 uppercase tracking-[0.2em] border-l-4 border-[#7C3AED] pl-6 font-sans">
                Institutional Selection
              </h3>

              <div className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="text-[#111827] font-bold mb-6 font-sans">Standard Alignment</h4>
                  <ul className="space-y-4">
                    {["Serious learners seeking credibility", "Builders who want honest evaluation", "People comfortable being challenged"].map((item, i) => (
                      <li key={i} className="flex items-center text-[#374151] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mr-4 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="opacity-40"
                >
                  <h4 className="text-[#6B7280] font-bold mb-6 font-sans">Exclusions</h4>
                  <ul className="space-y-4">
                    {["Certificate collectors", "Shortcut seekers", "Passive watchers"].map((item, i) => (
                      <li key={i} className="flex items-center text-[#6B7280] line-through decoration-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-4 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudienceFilter;

