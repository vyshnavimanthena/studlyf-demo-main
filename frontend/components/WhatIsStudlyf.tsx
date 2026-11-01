import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// `to` is set only where a page for that feature already exists; Placement ecosystem has none yet.
const items: { id: string; shortTitle: string; title: string; description: string; image: string; to?: string }[] = [
    {
        id: '01',
        shortTitle: 'Learning paths',
        title: 'Company-specific learning paths',
        description: 'Master placement preparation through structured learning modules tailored for top companies like Google, Amazon, and Microsoft.',
        image: 'company-paths',
        to: '/learn/company-modules',
    },
    {
        id: '02',
        shortTitle: 'Mock interview',
        title: 'AI mock interview simulator',
        description: 'Experience realistic mock interviews designed for top companies with adaptive questioning, behavioral scenarios, and placement-focused preparation.',
        image: 'neural-simulator',
        to: '/job-prep/mock-interview',
    },
    {
        id: '03',
        shortTitle: 'Career dreamer',
        title: 'AI career dreamer',
        description: 'Discover career paths based on your interests, skills, projects, and strengths with intelligent career recommendations and personalized guidance.',
        image: 'career-dreamer',
        to: '/learn/career-fit',
    },
    {
        id: '04',
        shortTitle: 'Placement ecosystem',
        title: 'Complete placement ecosystem',
        description: 'Everything you need for placements in one platform - learning, mock interviews, career guidance, and structured preparation.',
        image: 'placement-ecosystem',
    },
];

const AUTO_ADVANCE_MS = 7000;
const RESUME_AFTER_LEAVE_MS = 4000;
const N = items.length;
const EASE = [0.65, 0, 0.35, 1] as const; // ease-in-out

type Item = (typeof items)[number];

const imageSrc = (item: Item) => `/images-optimized/${item.image}.webp`;
const fallbackToPng = (item: Item) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.src.endsWith('.png')) img.src = `/images/${item.image}.png`;
};

const useIsCompact = () => {
    const [compact, setCompact] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia?.('(max-width: 899px)');
        if (!mq) return;
        setCompact(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);
    return compact;
};

/** Featured content: number, title, description and the feature's existing destination. */
// Lines fade up one after another when the parent runs the "show" variant.
const copyLine = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } } };

const FeatureCopy: React.FC<{ item: Item; headingId?: string }> = ({ item, headingId }) => (
    <>
        <motion.span variants={copyLine} className="text-sm font-semibold tabular-nums text-ds-primary">
            {item.id} <span className="text-ds-subtle-foreground">/ 0{N}</span>
        </motion.span>
        <motion.h3
            variants={copyLine}
            id={headingId}
            className="mt-3 text-[36px] leading-[1.12] font-bold tracking-tight text-balance text-ds-foreground [hyphens:none]"
        >
            {item.title.replace(/-/g, '‑')}
        </motion.h3>
        <motion.p variants={copyLine} className="mt-4 text-base leading-relaxed text-ds-muted-foreground">
            {item.description}
        </motion.p>
        <motion.div variants={copyLine} className="mt-8">
            {item.to ? (
                <Button asChild className="group w-fit">
                    <Link to={item.to}>
                        Explore
                        <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                </Button>
            ) : (
                <span className="inline-flex h-9 items-center rounded-full bg-ds-lavender px-3 text-sm font-medium text-ds-muted-foreground">Coming soon</span>
            )}
        </motion.div>
    </>
);

const WhatIsStudlyf: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    // After the pointer leaves, autoplay resumes sooner than the normal interval
    const [resumeSoon, setResumeSoon] = useState(false);
    const reduceMotion = !!useReducedMotion();
    const compact = useIsCompact();
    const autoplay = !isPaused && !reduceMotion;
    const interval = resumeSoon ? RESUME_AFTER_LEAVE_MS : AUTO_ADVANCE_MS;

    // Autoplay as an enhancement: slow, paused on hover/focus, off for reduced motion.
    useEffect(() => {
        if (!autoplay) return;
        const timer = setTimeout(() => {
            setResumeSoon(false);
            setActiveIndex((prev) => (prev + 1) % N);
        }, interval);
        return () => clearTimeout(timer);
    }, [activeIndex, autoplay, interval]);

    const active = items[activeIndex];
    const fade = reduceMotion ? { duration: 0 } : { duration: 0.45, ease: EASE };

    return (
        <section aria-labelledby="what-is-studlyf-heading" className="studlyf-ds ds-section ds-band pb-10 md:pb-14 lg:pb-16">
            <div className="ds-container">
                <header className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
                    <p className="ds-eyebrow mb-4">Say hello to the latest in learning</p>
                    <h2 id="what-is-studlyf-heading" className="ds-h2 flex items-center justify-center gap-1 text-ds-foreground">
                        <span>Wait, what is</span>
                        <img
                            src="/stud.png"
                            alt="STUDLYF"
                            width={500}
                            height={500}
                            loading="lazy"
                            className="inline-block size-[1.25em] shrink-0 object-contain"
                        />
                    </h2>
                </header>

                <Tabs
                    value={active.id}
                    onValueChange={(v) => {
                        setResumeSoon(false);
                        setActiveIndex(items.findIndex((i) => i.id === v));
                    }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => {
                        setIsPaused(false);
                        setResumeSoon(true);
                    }}
                    onFocusCapture={() => setIsPaused(true)}
                    onBlurCapture={() => setIsPaused(false)}
                    className="mx-auto flex w-full max-w-[1080px] flex-col"
                >
                    {/* The tabs are the only control. The active tab fills up while autoplay runs. */}
                    <TabsList className="mx-auto mb-8 h-auto max-w-full flex-wrap justify-center gap-1 rounded-full bg-ds-lavender-strong p-1.5">
                        {items.map((item, i) => (
                            <TabsTrigger
                                key={item.id}
                                value={item.id}
                                className="relative h-10 overflow-hidden rounded-full px-4 text-sm text-ds-muted-foreground data-[state=active]:bg-white data-[state=active]:text-ds-foreground data-[state=active]:shadow-ds-md"
                            >
                                <span className="tabular-nums text-ds-primary">{item.id}</span>
                                {item.shortTitle}
                                {i === activeIndex && (
                                    <motion.span
                                        key={`${activeIndex}-${interval}-${autoplay}`}
                                        aria-hidden="true"
                                        className="absolute inset-x-4 bottom-1 h-0.5 origin-left rounded-full bg-ds-primary"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: autoplay ? 1 : 0 }}
                                        transition={{ duration: autoplay ? interval / 1000 : 0.2, ease: 'linear' }}
                                    />
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {items.map((item) => (
                        <TabsContent key={item.id} value={item.id} forceMount className="sr-only">
                            {item.title}. {item.description}
                        </TabsContent>
                    ))}
                    <p className="sr-only" aria-live="polite">
                        Feature {activeIndex + 1} of {N}: {active.title}
                    </p>

                    {compact ? (
                        <div className="overflow-hidden rounded-ds-card bg-white shadow-ds-lg ring-1 ring-ds-border">
                            <img
                                src={imageSrc(active)}
                                onError={fallbackToPng(active)}
                                alt={active.title}
                                width={1024}
                                height={1024}
                                className="aspect-[4/3] w-full object-cover"
                            />
                            <motion.div key={active.id} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="flex flex-col p-6 [&_h3]:text-[28px]">
                                <FeatureCopy item={active} />
                            </motion.div>
                        </div>
                    ) : (
                        /* Desktop: one card, copy on the left, the feature's screen on a dark panel on the right */
                        <div
                            role="region"
                            aria-labelledby={`feature-title-${active.id}`}
                            className="grid h-[460px] grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] overflow-hidden rounded-[20px] bg-white shadow-ds-lg ring-1 ring-ds-border"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={active.id}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.15 } }}
                                    variants={{ show: { transition: reduceMotion ? {} : { staggerChildren: 0.06 } } }}
                                    className="flex flex-col justify-center px-12 py-10"
                                >
                                    <FeatureCopy item={active} headingId={`feature-title-${active.id}`} />
                                </motion.div>
                            </AnimatePresence>
                            <div className="relative overflow-hidden bg-ds-ink">
                                <AnimatePresence initial={false}>
                                    <motion.img
                                        key={active.id}
                                        src={imageSrc(active)}
                                        onError={fallbackToPng(active)}
                                        alt=""
                                        width={1024}
                                        height={1024}
                                        draggable={false}
                                        initial={{ opacity: 0, scale: 1.06 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={fade}
                                        className="absolute inset-0 size-full object-cover object-center"
                                    />
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </Tabs>
            </div>
        </section>
    );
};

export default WhatIsStudlyf;
