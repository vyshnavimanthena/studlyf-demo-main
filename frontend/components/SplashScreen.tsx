import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  duration?: number;
  onFinish?: () => void;
  logoSrc?: string;
  secondaryLogoSrc?: string;
  founderName?: string;
  founderImageSrc?: string;
};

const WORDS = [
  'Hey buddies,',
  'Welcome',
  'to',
  'the world',
  'of exploring',
  'and achieving...',
];

const SplashScreen: React.FC<Props> = ({
  duration = 7500,
  onFinish,
  logoSrc = '/images-optimized/studlyf.webp',
  secondaryLogoSrc = '/images-optimized/studlyf_secondary.webp',
  founderName = 'Eshwar',
  founderImageSrc = '/images-optimized/Eshwar.webp',
}) => {
  const [visibleWords, setVisibleWords] = useState<string[]>([]);
  const [exiting, setExiting] = useState(false);
  const wordTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let index = 0;
    const perWord = Math.max(320, Math.floor((duration - 1400) / WORDS.length));

    wordTimerRef.current = window.setInterval(() => {
      index += 1;
      setVisibleWords(WORDS.slice(0, index));
      if (index >= WORDS.length && wordTimerRef.current) {
        window.clearInterval(wordTimerRef.current as number);
        wordTimerRef.current = null;
      }
    }, perWord) as unknown as number;

    exitTimerRef.current = window.setTimeout(() => {
      setExiting(true);
      window.setTimeout(() => onFinish?.(), 650);
    }, Math.max(1200, duration - 650)) as unknown as number;

    return () => {
      if (wordTimerRef.current) window.clearInterval(wordTimerRef.current as number);
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current as number);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[99999] overflow-hidden transition-all duration-700 ${exiting ? 'opacity-0 scale-[1.02]' : 'opacity-100'}`}
      aria-hidden={exiting}
    >
      <style>{`
        @keyframes floatCard { 0% { transform: translateY(0px) rotate(-1deg); } 50% { transform: translateY(-10px) rotate(1deg); } 100% { transform: translateY(0px) rotate(-1deg); } }
        @keyframes glowPulse { 0%,100% { opacity: .65; transform: scale(1); } 50% { opacity: 1; transform: scale(1.04); } }
        @keyframes shineMove { 0% { transform: translateX(-120%) rotate(18deg); } 100% { transform: translateX(120%) rotate(18deg); } }
        @keyframes cursorBlink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
      `}</style>

      {/* Bright colorful background to match the site */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,92,164,0.30),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(255,194,87,0.28),transparent_24%),radial-gradient(circle_at_70%_80%,rgba(69,222,255,0.22),transparent_30%),linear-gradient(135deg,#16111f_0%,#24142f_35%,#130f20_100%)]" />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

      <div className="relative h-full w-full px-6 sm:px-10 lg:px-16 py-10 flex items-center justify-center">
        <div className="grid w-full max-w-7xl grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-center gap-8 lg:gap-12">
          {/* Left: laptop */}
          <div className="relative flex items-center justify-center lg:justify-start">
            <div className="relative w-[84vw] max-w-[720px] lg:max-w-[680px]" style={{ animation: 'floatCard 6s ease-in-out infinite' }}>
              <div className="absolute -inset-10 rounded-[44px] bg-gradient-to-br from-fuchsia-500/30 via-violet-500/20 to-cyan-400/25 blur-3xl" style={{ animation: 'glowPulse 4s ease-in-out infinite' }} />

              <div className="relative mx-auto w-[96%] max-w-[680px]">
                <div className="relative rounded-[32px] bg-[#090a10] p-[10px] shadow-[0_35px_90px_rgba(0,0,0,0.48)] border border-white/10">
                  <div className="relative overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_30%_20%,rgba(248,113,113,0.55),transparent_28%),radial-gradient(circle_at_75%_25%,rgba(99,102,241,0.40),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(34,211,238,0.28),transparent_28%),linear-gradient(135deg,#170f1d_0%,#2a1230_48%,#0d0f18_100%)] h-[420px] sm:h-[470px] lg:h-[520px]">
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute -left-[30%] top-0 h-full w-[35%] bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-12 blur-md" style={{ animation: 'shineMove 4.5s linear infinite' }} />
                    </div>

                    <div className="absolute inset-0 p-5 sm:p-7 lg:p-9">
                      <div className="h-full rounded-[20px] border border-white/10 bg-black/18 backdrop-blur-[1px] shadow-inner overflow-hidden">
                        <div className="flex items-center justify-between px-5 pt-4 text-[10px] sm:text-xs tracking-[0.35em] text-white/70">
                          <span>STUDLYF</span>
                          <span className="rounded-full bg-lime-300/90 px-3 py-1 text-[10px] font-semibold text-black shadow-[0_0_20px_rgba(163,230,53,0.35)]">Get in Touch</span>
                        </div>

                        <div className="flex h-[calc(100%-52px)] items-center justify-center px-6 text-center">
                          <div className="max-w-[650px]">
                            <div className="mx-auto mb-5 flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center rounded-full border border-white/12 bg-white/8 p-3 shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
                              <img
                                src={logoSrc}
                                alt="Studlyf"
                                className="h-full w-full rounded-full object-contain bg-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
                              />
                            </div>

                            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] tracking-[0.35em] text-white/75 uppercase">
                              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.8)]" />
                              Explore the world
                            </div>

                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.95] text-white drop-shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
                              {visibleWords.map((word, idx) => (
                                <span key={`${word}-${idx}`} className="mr-3 inline-block bg-gradient-to-r from-fuchsia-200 via-white to-amber-200 bg-clip-text text-transparent">
                                  {word}
                                </span>
                              ))}
                              <span className="inline-block align-middle h-[0.85em] w-[0.16em] rounded-full bg-white/85 ml-1" style={{ animation: 'cursorBlink 1s step-end infinite' }} />
                            </h2>

                            <p className="mx-auto mt-6 max-w-[540px] text-sm sm:text-base leading-7 text-white/70">
                              Learn with bright ideas, build with confidence, and achieve more with a community that keeps moving.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mx-auto -mt-1 h-6 w-[78%] rounded-b-[26px] bg-gradient-to-b from-[#4d4d57] to-[#17171d] shadow-[0_20px_30px_rgba(0,0,0,0.4)]" />
                  <div className="mx-auto h-3 w-[44%] rounded-b-[20px] bg-[#1a1a22]" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: big title + founder spotlight */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center lg:items-end lg:justify-center text-center lg:text-right">
            <div className="mt-5 flex justify-center lg:justify-end">
              <div className="rounded-[30px] bg-white/12 backdrop-blur-md border border-white/10 px-6 py-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)]">
                <img
                  src={secondaryLogoSrc}
                  alt="Studlyf secondary visual"
                  className="w-[290px] sm:w-[360px] lg:w-[430px] h-auto object-contain drop-shadow-[0_14px_35px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>

            <div className="mt-6 max-w-[720px] rounded-[32px] border border-white/12 bg-white/8 px-7 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center gap-5 justify-center lg:justify-end">
                <div className="relative h-36 w-36 rounded-full overflow-hidden ring-4 ring-fuchsia-300/30 shadow-[0_0_50px_rgba(244,114,182,0.34)]">
                  <img src={founderImageSrc} alt={founderName} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </div>
                <div className="text-left lg:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">{founderName}</div>
                  <div className="mt-1 text-sm sm:text-base text-white/75 max-w-[520px] leading-relaxed">
                    Student Innovation &amp; Community Ecosystems | AI, Emerging Tech &amp; Wellness Infrastructure | Strategy, Partnerships &amp; Execution | Mentor • Speaker (IIT Bombay, IIT Madras &amp; more) | Building STUDLYF &amp; Nirvaha Wellness
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center lg:text-right text-[11px] tracking-[0.35em] text-white/55 uppercase">
                Meet the founder
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  if (wordTimerRef.current) window.clearInterval(wordTimerRef.current as number);
                  if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current as number);
                  setExiting(true);
                  window.setTimeout(() => onFinish?.(), 300);
                }}
                className="rounded-full border border-white/15 bg-white/6 px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-sm"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

