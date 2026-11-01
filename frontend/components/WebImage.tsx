
import React from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';

interface WebImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

const WebImage: React.FC<WebImageProps> = ({ src, alt, className = "", aspectRatio = "aspect-video" }) => {
  const fullSrc = src?.startsWith('/') ? `${API_BASE_URL}${src}` : src;
  
  return (
    <div className={`relative overflow-hidden group ${aspectRatio} ${className}`}>
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full"
      >
        <img
          src={fullSrc}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/10 to-transparent opacity-60 pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default WebImage;

