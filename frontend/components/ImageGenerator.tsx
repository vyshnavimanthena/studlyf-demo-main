
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

interface ImageGeneratorProps {
  prompt: string;
  className?: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  alt?: string;
  overlayColor?: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ 
  prompt, 
  className = "", 
  aspectRatio = "16:9", 
  alt,
  overlayColor = "rgba(124, 58, 237, 0.05)" 
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  const generate = useCallback(async (isMounted: boolean) => {
    setLoading(true);
    setError(null);
    setIsQuotaExceeded(false);
    
    try {
      // Small random delay to stagger multiple component requests and mitigate rate limits
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1500));
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Professional high-end architectural photography, tech aesthetic, ${prompt}, cinematic lighting, 8k, minimalist, ultra-clean composition, purple and blue ambient highlights.` }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        },
      });

      if (!isMounted) return;

      let foundUrl = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          foundUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (foundUrl) {
        setImageUrl(foundUrl);
      } else {
        setError("Empty response from visual server.");
      }
    } catch (e: any) {
      console.error("Image generation failed", e);
      if (!isMounted) return;
      
      if (e?.message?.includes("429") || e?.status === 429 || JSON.stringify(e).includes("429")) {
        setIsQuotaExceeded(true);
      } else {
        setError(e.message || "Unknown synthesis error");
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [prompt, aspectRatio]);

  useEffect(() => {
    let isMounted = true;
    generate(isMounted);
    return () => { isMounted = false; };
  }, [generate]);

  return (
    <div className={`relative overflow-hidden bg-[#F5F3FF] flex items-center justify-center group ${className}`}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-center p-8"
          >
            <div className="w-10 h-10 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#7C3AED] font-bold">Synthesizing Visual</p>
              <p className="text-[8px] uppercase tracking-widest text-[#6B7280]">Verification protocol active...</p>
            </div>
          </motion.div>
        ) : isQuotaExceeded ? (
          <motion.div
            key="quota"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 text-center p-6 relative z-10"
          >
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#7C3AED_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="space-y-2">
              <p className="text-[#7C3AED] text-[10px] uppercase tracking-[0.2em] font-black">Quota Limit Reached</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest max-w-[200px]">Server processing high demand. Visual reference restricted.</p>
            </div>
            <button 
              onClick={() => generate(true)}
              className="px-4 py-2 bg-white border border-[#7C3AED]/20 text-[#7C3AED] text-[9px] uppercase tracking-[0.2em] font-bold rounded hover:bg-[#7C3AED] hover:text-white transition-all shadow-sm"
            >
              Retry Synthesis
            </button>
          </motion.div>
        ) : error || !imageUrl ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-[10px] uppercase tracking-widest font-bold text-center px-4"
          >
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,#7C3AED_25%,transparent_25%,transparent_50%,#7C3AED_50%,#7C3AED_75%,transparent_75%,transparent)] [background-size:24px_24px]" />
            <span className="relative z-10">[ Protocol Unavailable: {error?.slice(0, 20)}... ]</span>
          </motion.div>
        ) : (
          <motion.div
            key="image-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full relative"
          >
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
              src={imageUrl}
              alt={alt || prompt}
              className="w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-40" 
              style={{ backgroundColor: overlayColor }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGenerator;

