import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Search, BookOpen, Laptop, Rocket, Trophy } from 'lucide-react';
import InteractiveCreature from './InteractiveCreature';
import { cn } from '@/lib/utils';

const steps = [
    { id: '01', title: 'Discover', icon: Search, text: 'Explore career paths.', details: 'Deep analysis of trends.' },
    { id: '02', title: 'Learn', icon: BookOpen, text: 'Structured modules.', details: 'Curated by veterans.' },
    { id: '03', title: 'Practice', icon: Laptop, text: 'Hands-on projects.', details: 'Build your portfolio.' },
    { id: '04', title: 'Launch', icon: Rocket, text: 'Job readiness.', details: 'Connect with partners.' },
    { id: '05', title: 'Excel', icon: Trophy, text: 'Lead and inspire.', details: 'Become an industry icon.' },
];

// Desktop path, drawn in a 1200×560 box. It climbs left to right; the heading sits in the empty top-left and each step's text under its dot.
const VB_W = 1200;
const VB_H = 560;
const POINTS = [
    { x: 90, y: 430 },
    { x: 320, y: 345 },
    { x: 550, y: 260 },
    { x: 780, y: 175 },
    { x: 1010, y: 90 },
];
const START = { x: 0, y: 400 };
const END = { x: VB_W, y: 50 };

// Smooth road: cubic segments with horizontal tangents at every milestone
const ROAD = [START, ...POINTS, END].reduce((d, p, i, all) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = all[i - 1];
    const dx = (p.x - prev.x) / 2;
    return `${d} C ${prev.x + dx} ${prev.y} ${p.x - dx} ${p.y} ${p.x} ${p.y}`;
}, '');

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

/** Desktop: the mascot walks the road as the section scrolls past; each milestone lights up once it is reached. */
const WalkingRoad: React.FC = () => {
    const reduce = !!useReducedMotion();
    const wrapRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const [stops, setStops] = useState<number[]>([]); // path progress (0..1) at each milestone
    const [reached, setReached] = useState(reduce ? POINTS.length : 0);

    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start 85%', 'end 50%'] });
    // Soft spring so the walker glides rather than tracking every wheel tick
    const smooth = useSpring(scrollYProgress, { stiffness: 55, damping: 22, mass: 0.6, restDelta: 0.0005 });
    const progress = reduce ? scrollYProgress : smooth;

    const x = useMotionValue(START.x);
    const y = useMotionValue(START.y);
        // Percent translate on a full-size layer equals percent of the road box
    const walkerX = useTransform(x, (v) => pct(v, VB_W));
    const walkerY = useTransform(y, (v) => pct(v, VB_H));
    const drawn = useTransform(progress, (p) => (reduce ? 1 : p));

    // Where along the road each milestone sits, so lighting up matches the walker exactly
    useEffect(() => {
        const path = pathRef.current;
        if (!path) return;
        const len = path.getTotalLength();
        const SAMPLES = 600;
        setStops(
            POINTS.map((pt) => {
                let best = 0;
                let bestD = Infinity;
                for (let i = 0; i <= SAMPLES; i++) {
                    const p = path.getPointAtLength((i / SAMPLES) * len);
                    const d = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2;
                    if (d < bestD) { bestD = d; best = i / SAMPLES; }
                }
                return best;
            }),
        );
    }, []);

    const place = (p: number) => {
        const path = pathRef.current;
        if (!path) return;
        const len = path.getTotalLength();
        const t = Math.min(Math.max(reduce ? 1 : p, 0), 1);
        const a = path.getPointAtLength(t * len);
        x.set(a.x);
        y.set(a.y);
        // Re-render only when a milestone is crossed, not on every frame
        if (stops.length) {
            const n = stops.filter((s) => t >= s - 0.005).length;
            setReached((prev) => (prev === n ? prev : n));
        }
    };
    useMotionValueEvent(progress, 'change', place);
    useEffect(() => place(progress.get()), [stops]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div ref={wrapRef} className="relative mx-auto w-full" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
                <defs>
                    <linearGradient id="road-sweep" gradientUnits="userSpaceOnUse" x1="0" x2={VB_W} y1="0" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="60%" stopColor="#e0459b" />
                        <stop offset="100%" stopColor="#ff7a45" />
                    </linearGradient>
                    <filter id="road-shadow" x="-5%" y="-30%" width="110%" height="160%">
                        <feGaussianBlur stdDeviation="9" />
                    </filter>
                </defs>
                {/* A soft shadow lifts the path off the page */}
                <path d={ROAD} fill="none" stroke="rgb(20 16 43 / 0.10)" strokeWidth={10} transform="translate(0 18)" filter="url(#road-shadow)" />
                <path ref={pathRef} d={ROAD} fill="none" stroke="rgb(109 63 240 / 0.22)" strokeWidth={3} strokeLinecap="round" />
                <motion.path d={ROAD} fill="none" stroke="url(#road-sweep)" strokeWidth={3.5} strokeLinecap="round" style={{ pathLength: drawn }} />
            </svg>

            {POINTS.map((pt, i) => {
                const step = steps[i];
                const done = i < reached;
                return (
                    <div key={step.id} className="absolute" style={{ left: pct(pt.x, VB_W), top: pct(pt.y, VB_H) }}>
                        <span
                            className={cn(
                                'absolute top-0 left-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white transition-colors duration-500',
                                done ? 'bg-ds-primary' : 'bg-[#cfcadd]',
                            )}
                        />
                        <div className={cn('absolute top-8 left-0 w-[205px] transition-opacity duration-500', done ? 'opacity-100' : 'opacity-50')}>
                            <span aria-hidden="true" className="absolute -top-1 right-0 text-[64px] leading-none font-bold text-ds-lavender-strong select-none">{i + 1}</span>
                            <div className="relative max-w-[150px]">
                                <h3 className="text-lg font-bold text-ds-foreground">{step.title}</h3>
                                <p className="mt-1 text-sm leading-snug text-ds-muted-foreground">
                                    {step.text} {step.details}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* The mascot floats just above the path. Moved with transforms only, upright, for a steady glide. */}
            <motion.div className="pointer-events-none absolute inset-0 z-10" style={{ x: walkerX, y: walkerY }} aria-hidden="true">
                <div className="absolute top-0 left-0 flex size-8 -translate-x-1/2 -translate-y-[calc(100%+12px)] items-center justify-center">
                    <div className="scale-[0.32]">
                        <InteractiveCreature className="![transform:none]" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/** Phones and tablets: the same journey as a vertical trail. */
const VerticalTrail: React.FC = () => (
    <ol className="relative mx-auto max-w-md pl-14">
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-[22px] w-1 rounded-full bg-gradient-to-b from-violet-400 via-pink-500 to-orange-400 opacity-80" />
        {steps.map((step) => (
            <li key={step.id} className="relative pb-8 last:pb-0">
                <span className="absolute top-0 -left-14 flex size-12 items-center justify-center rounded-full border-2 border-ds-primary bg-ds-primary text-white">
                    <step.icon className="size-5" aria-hidden="true" />
                </span>
                <p className="text-xs font-semibold tracking-[0.12em] text-ds-primary tabular-nums">STEP {step.id}</p>
                <h3 className="mt-1 text-xl font-bold text-ds-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-ds-muted-foreground">
                    {step.text} {step.details}
                </p>
            </li>
        ))}
    </ol>
);

const RoadmapSection: React.FC = () => {
    return (
        <section aria-labelledby="roadmap-heading" className="studlyf-ds bg-ds-background pb-[72px] md:pb-[96px] lg:pb-[120px]">
            <div className="ds-container">
                <div className="relative overflow-hidden rounded-ds-panel bg-white px-5 py-12 text-ds-foreground ring-1 ring-ds-border shadow-ds-md sm:px-10 md:py-14 lg:px-14">
                    <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 hidden size-[420px] rounded-full bg-ds-lavender lg:block" />

                    <header className="relative z-10 mx-auto mb-6 max-w-2xl text-center lg:absolute lg:top-14 lg:left-14 lg:mb-0 lg:max-w-[400px] lg:text-left">
                        <p className="ds-eyebrow mb-4">Your roadmap</p>
                        <h2 id="roadmap-heading" className="ds-h2 text-ds-foreground">Master your path</h2>
                        <p className="ds-subline mt-4">Your journey to career excellence, one step at a time.</p>
                    </header>

                    <div className="relative hidden lg:block">
                        <WalkingRoad />
                    </div>
                    <div className="relative mt-8 lg:hidden">
                        <VerticalTrail />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RoadmapSection;
