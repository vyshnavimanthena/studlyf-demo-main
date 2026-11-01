import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Share2, Check, Bookmark } from 'lucide-react';

interface Tool {
    name: string;
    description: string;
    logo: string;
    category: string;
    url: string;
}

const AIToolCard: React.FC<{ tool: Tool; isBookmarked: boolean; onToggleBookmark: () => void }> = ({ tool, isBookmarked, onToggleBookmark }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(tool.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link: ', err);
        }
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="group bg-white border border-gray-100 rounded-[1.5rem] p-6 flex flex-col h-full relative overflow-hidden hover:border-[#7C3AED]/20 hover:shadow-[0_20px_40px_rgba(124,58,237,0.08)] transition-all"
        >
            {/* Category Badge & Share */}
            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#F9FAFB] border border-gray-100 p-2 flex items-center justify-center overflow-hidden group-hover:border-[#7C3AED]/20 transition-colors">
                    <img
                        src={tool.logo}
                        alt={tool.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=AI'; }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleBookmark();
                        }}
                        className="p-1.5 bg-[#F9FAFB] hover:bg-gray-100 text-gray-400 hover:text-amber-500 rounded-lg border border-gray-100 hover:border-gray-200 flex items-center justify-center transition-all duration-200"
                        title={isBookmarked ? "Remove Bookmark" : "Bookmark Tool"}
                    >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-1.5 bg-[#F9FAFB] hover:bg-gray-100 text-gray-400 hover:text-[#7C3AED] rounded-lg border border-gray-100 hover:border-gray-200 flex items-center justify-center transition-all duration-200"
                        title="Share Tool"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                    <span className="px-3 py-1 bg-[#F5F3FF] text-[#7C3AED] text-[10px] uppercase font-black tracking-widest rounded-full border border-[#7C3AED]/10">
                        {tool.category}
                    </span>
                </div>
            </div>

            <div className="flex-grow">
                <h3 className="text-xl font-bold text-[#111827] mb-2 group-hover:text-[#7C3AED] transition-colors tracking-tight">
                    {tool.name}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-3 mb-6 font-medium">
                    {tool.description}
                </p>
            </div>

            <style>{`
                @keyframes tc-shimmer {
                    0%   { transform: translateX(-180%) skewX(-20deg); }
                    100% { transform: translateX(300%) skewX(-20deg); }
                }
                @keyframes tc-orb1 {
                    0%,100% { transform: translate(0px,0px) scale(1);    opacity:0.55; }
                    40%     { transform: translate(8px,-6px) scale(1.3);  opacity:0.9; }
                    70%     { transform: translate(-4px,4px) scale(0.8);  opacity:0.4; }
                }
                @keyframes tc-orb2 {
                    0%,100% { transform: translate(0px,0px) scale(1);     opacity:0.4; }
                    35%     { transform: translate(-10px,-8px) scale(1.4); opacity:0.85; }
                    65%     { transform: translate(6px,5px) scale(0.75);   opacity:0.35; }
                }
                @keyframes tc-orb3 {
                    0%,100% { transform: translate(0px,0px) scale(1);    opacity:0.5; }
                    50%     { transform: translate(6px,8px) scale(1.25);  opacity:0.9; }
                }
                .tc-btn {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px 0;
                    background: #7C3AED;
                    color: #fff;
                    font-weight: 800;
                    font-size: 12px;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    overflow: hidden;
                    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
                    box-shadow: 0 4px 20px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.12) inset;
                    text-decoration: none;
                }
                .tc-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 12px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 55%);
                    pointer-events: none;
                    z-index: 1;
                }
                .tc-btn::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 40%; height: 100%;
                    background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.24) 50%, transparent 80%);
                    animation: tc-shimmer 2.8s ease-in-out infinite;
                    pointer-events: none;
                    z-index: 2;
                }
                .tc-btn:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 0 0 5px rgba(139,92,246,0.18), 0 0 32px 12px rgba(139,92,246,0.45), 0 16px 40px rgba(109,40,217,0.5);
                }
                .tc-btn:active { transform: scale(0.97); }
                .tc-orb {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(7px);
                    z-index: 1;
                }
                .tc-orb1 { width:28px; height:28px; background:radial-gradient(circle,rgba(196,168,255,0.95),transparent 70%); top:-4px; left:18px; animation:tc-orb1 3.2s ease-in-out infinite; }
                .tc-orb2 { width:22px; height:22px; background:radial-gradient(circle,rgba(255,255,255,0.8),transparent 70%);  bottom:-2px; right:48px; animation:tc-orb2 4s ease-in-out infinite; }
                .tc-orb3 { width:18px; height:18px; background:radial-gradient(circle,rgba(167,139,250,0.9),transparent 70%); top:4px; right:18px;  animation:tc-orb3 2.6s ease-in-out infinite; }
                .tc-label { position:relative; z-index:5; display:flex; align-items:center; gap:8px; }
            `}</style>
            <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="tc-btn"
            >
                <span className="tc-orb tc-orb1" />
                <span className="tc-orb tc-orb2" />
                <span className="tc-orb tc-orb3" />
                <span className="tc-label">Visit Tool <ExternalLink className="w-4 h-4" /></span>
            </a>
        </motion.div>
    );
};

export default AIToolCard;

