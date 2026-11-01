import React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Compass, Hammer, Puzzle, Sparkles, Target, X } from 'lucide-react';
import InteractiveCreature from './InteractiveCreature';

// Card backs step through the logo sweep from left to right
const learningMethods = [
    { old: 'Syntax memorization', new: 'Practical problem solving', icon: Puzzle, color: '#6d3ff0' },
    { old: 'Passive watching', new: 'Active hands-on learning', icon: Hammer, color: '#8a3bd6' },
    { old: 'Theory over practice', new: 'Career-focused paths', icon: Compass, color: '#b336b4' },
    { old: 'One-size-fits-all', new: 'Personalized skill mapping', icon: Target, color: '#d63a8c' },
    { old: 'No real feedback', new: 'AI-guided feedback', icon: Sparkles, color: '#e0562f' },
];

const HOP_MS = 800; // one hop, card to card
const LAND_MS = 420; // the card flips as the mascot lands on it
const COL = 100 / learningMethods.length;

const faceClass = 'absolute inset-0 flex items-center gap-3 rounded-[20px] p-5 [backface-visibility:hidden] md:flex-col md:items-start md:justify-between md:p-6';

/** Flips to the new way once the mascot lands; hover peeks back at the old way. */
const FlipCard: React.FC<{ item: (typeof learningMethods)[number]; flipped: boolean; onHover: () => void }> = ({ item, flipped, onHover }) => {
    const [peek, setPeek] = React.useState(false);
    return (
        <div className="h-24 [perspective:1000px] md:h-[230px]" onMouseEnter={() => { setPeek(true); onHover(); }} onMouseLeave={() => setPeek(false)}>
            <motion.div
                initial={false}
                animate={{ rotateY: flipped && !peek ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.3, 0.9, 0.3, 1] }}
                className="relative size-full [transform-style:preserve-3d]"
            >
                <div className={`${faceClass} bg-ds-muted text-ds-muted-foreground ring-1 ring-ds-border`}>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-ds-subtle-foreground">
                        <X className="size-5" />
                    </span>
                    <p className="text-lg leading-snug font-semibold">{item.old}</p>
                </div>
                <div className={`${faceClass} text-white shadow-ds-md [transform:rotateY(180deg)]`} style={{ backgroundColor: item.color }}>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <item.icon className="size-5" />
                    </span>
                    <p className="text-xl leading-snug font-bold">{item.new}</p>
                </div>
            </motion.div>
        </div>
    );
};

/** The mascot hops along the row once, flipping each card it lands on; after that it hops to whichever card is hovered. */
const FlipRow: React.FC = () => {
    const reduced = useReducedMotion() ?? false;
    const ref = React.useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const last = learningMethods.length - 1;
    const [at, setAt] = React.useState(reduced ? last : -1); // card the mascot is heading for
    const [flippedTo, setFlippedTo] = React.useState(reduced ? last : -1);

    React.useEffect(() => {
        if (!inView || reduced) return;
        const timers = learningMethods.flatMap((_, i) => [
            window.setTimeout(() => setAt(i), 300 + i * HOP_MS),
            window.setTimeout(() => setFlippedTo(i), 300 + i * HOP_MS + LAND_MS),
        ]);
        return () => timers.forEach(window.clearTimeout);
    }, [inView, reduced]);

    return (
        <div ref={ref} className="relative mx-auto max-w-[1120px] md:pt-14">
            <ul className="sr-only">
                {learningMethods.map((item) => (
                    <li key={item.old}>
                        Old way: {item.old}. The STUDLYF way: {item.new}.
                    </li>
                ))}
            </ul>

            {/* Percent translate on a full-width layer equals percent of the row */}
            <motion.div
                aria-hidden="true"
                initial={false}
                animate={{ x: `${at < 0 ? COL * 0.5 - 6 : COL * (at + 0.5)}%` }}
                transition={{ duration: reduced ? 0 : HOP_MS / 1000 - 0.1, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-14 md:block"
            >
                <motion.div
                    key={at}
                    initial={false}
                    animate={at < 0 || reduced ? { y: 0 } : { y: [0, -30, 0] }}
                    transition={{ duration: HOP_MS / 1000 - 0.1, ease: 'easeInOut' }}
                    className="absolute bottom-0 left-0 flex size-10 -translate-x-1/2 items-center justify-center"
                >
                    <div className="scale-[0.38]">
                        <InteractiveCreature className="![transform:none]" />
                    </div>
                </motion.div>
            </motion.div>

            <div aria-hidden="true" className="grid grid-cols-1 gap-3 md:grid-cols-5 md:gap-4">
                {learningMethods.map((item, i) => (
                    <FlipCard key={item.old} item={item} flipped={i <= flippedTo} onHover={() => { if (flippedTo === last) setAt(i); }} />
                ))}
            </div>
            <p className="mt-5 hidden text-center text-sm text-ds-subtle-foreground md:block">Hover a card to see the old way</p>
        </div>
    );
};

const OldVsNewSection: React.FC = () => (
    <section aria-labelledby="old-vs-new-heading" className="studlyf-ds bg-ds-background pb-[72px] md:pb-[96px] lg:pb-[120px]">
        <div className="ds-container">
            <header className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
                <p className="ds-eyebrow mb-4">Old way vs new way</p>
                <h2 id="old-vs-new-heading" className="ds-h2 text-ds-foreground">
                    The era of human <span className="ds-gradient-text">authority</span>
                </h2>
                <p className="ds-subline mt-4">From outdated methods to intelligent, outcome-driven learning.</p>
            </header>

            <FlipRow />
        </div>
    </section>
);

export default OldVsNewSection;
