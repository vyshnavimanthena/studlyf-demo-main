
import React from 'react';
import { motion } from 'framer-motion';

const VerificationProcess: React.FC = () => {
  return (
    <section id="verification" className="relative w-full h-[450px] sm:h-[650px] overflow-hidden bg-[#0F172A]">
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
        className="absolute inset-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen"
          alt="Technical Verification Visualization"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-transparent to-[#0F172A]"></div>
        <div className="absolute inset-0 bg-grid-tech opacity-5"></div>
      </motion.div>
    </section>
  );
};

export default VerificationProcess;

