import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  { name: 'Varenyam', src: '/images-optimized/varenyam.webp' },
  { name: 'S', src: '/images-optimized/s.webp' },
  { name: 'RGES', src: '/images-optimized/rges.webp' },
  { name: 'GED', src: '/images-optimized/ged.webp' },
  { name: 'Centle', src: '/images-optimized/centle.webp' },
  { name: 'AI', src: '/images-optimized/ai.webp' },
  { name: 'Prompt', src: '/images-optimized/prompt.webp' },
  { name: 'Code Questers', src: '/images-optimized/codequesters.webp' },
  { name: 'Next', src: '/images-optimized/next.webp' },
  { name: 'Ground Zero', src: '/images-optimized/groundzero.webp' },
  { name: 'TG10X', src: '/images-optimized/tg10x.webp' },
];

const FeaturedColleges: React.FC = () => {
  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] uppercase tracking-tighter"
          >
            OUR INDUSTRY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B]">PARTNERS</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 mt-4 text-lg font-medium max-w-2xl mx-auto"
          >
            Partnering with top-tier industry leaders to accelerate your career growth and success.
          </motion.p>
        </div>

        <div className="relative flex items-center overflow-hidden group min-h-[160px] border-y border-transparent py-4">
          <motion.div
            className="flex flex-nowrap min-w-max"
            animate={{
              x: ['0%', '-33.33%'],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 40,
                ease: 'linear',
              },
            }}
          >
            {duplicatedLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center px-10 sm:px-14 min-w-[200px]"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  loading="lazy"
                  className="h-14 sm:h-16 md:h-20 max-w-[180px] w-auto object-contain rounded-xl bg-white mix-blend-multiply transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                />
              </div>
            ))}
          </motion.div>
          
          {/* Fading gradients for edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedColleges;

