
import React from 'react';
import { motion } from 'framer-motion';

const SocialProof: React.FC = () => {
  return (
    <section className="bg-[#F9FAFB] py-24 px-6 border-y border-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-lg font-bold text-[#111827] mb-4"
        >
          Designed for engineers preparing for real responsibility.
        </motion.p>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#6B7280] max-w-xl mx-auto"
        >
          Used by mentors, reviewers, and teams evaluating early-career engineers.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale contrast-125"
        >
          {["TECHCORP", "SYSNET", "DATAFLOW", "LOGIC"].map((logo) => (
            <div key={logo} className="text-xl font-bold">{logo}</div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;

