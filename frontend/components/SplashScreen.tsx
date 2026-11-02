import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import InteractiveCreature from './InteractiveCreature';

type Props = {
  duration?: number;
  onFinish?: () => void;
  secondaryLogoSrc?: string;
  founderName?: string;
  founderImageSrc?: string;
};

/** First-visit welcome: the mascot bounces in above the logo, a thin bar shows the short wait, and Skip is always available. */
const SplashScreen: React.FC<Props> = ({
  duration = 2000,
  onFinish,
  secondaryLogoSrc = '/images-optimized/studlyf_secondary.webp',
  founderName = 'Eshwar',
  founderImageSrc = '/images-optimized/Eshwar.webp',
}) => {
  const reduce = !!useReducedMotion();
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);

  const finish = (delay: number) => {
    setExiting(true);
    window.setTimeout(() => onFinish?.(), delay);
  };

  useEffect(() => {
    exitTimerRef.current = window.setTimeout(() => finish(400), Math.max(800, duration - 400));
    return () => {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <div
      className={`studlyf-ds fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-white px-6 transition-opacity duration-300 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      aria-hidden={exiting}
    >
      <div aria-hidden="true" className="absolute -top-40 -right-40 size-[520px] rounded-full bg-ds-lavender" />
      <div aria-hidden="true" className="absolute -bottom-48 -left-40 size-[480px] rounded-full bg-ds-lavender" />

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={reduce ? false : { y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          aria-hidden="true"
          className="mb-6 flex size-24 items-center justify-center"
        >
          <InteractiveCreature className="![transform:none]" />
        </motion.div>

        <motion.img
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          src={secondaryLogoSrc}
          alt="STUDLYF"
          className="h-auto w-[220px] sm:w-[280px]"
        />

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4 text-lg font-medium text-ds-muted-foreground sm:text-xl"
        >
          Hey buddies, welcome to the world of exploring and achieving.
        </motion.p>

        <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-ds-lavender-strong">
          <motion.div
            className="h-full origin-left rounded-full bg-ds-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-ds-border">
            <img src={founderImageSrc} alt="" className="size-full origin-[50%_42%] scale-[2.4] object-cover" />
          </span>
          <p className="text-left text-sm leading-tight">
            <span className="block font-semibold text-ds-foreground">{founderName}</span>
            <span className="text-ds-muted-foreground">Founder</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
            finish(200);
          }}
          className="rounded-full px-4 py-2 text-sm font-semibold text-ds-muted-foreground transition-colors hover:bg-ds-lavender hover:text-ds-foreground focus-visible:outline-2 focus-visible:outline-ds-ring"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
