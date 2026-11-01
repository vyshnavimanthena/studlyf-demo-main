import React from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import CountUp from './CountUp';
import { cn } from '@/lib/utils';

type Tile =
    | { kind: 'photo'; src: string; alt: string; size: string }
    | { kind: 'stat'; number: number; suffix: string; label: string; color: string; size: string };

const photo = (name: string, alt: string, size: string): Tile => ({ kind: 'photo', src: `/images-optimized/impact/${name}.webp`, alt, size });
const stat = (number: number, suffix: string, label: string, color: string, size: string): Tile => ({ kind: 'stat', number, suffix, label, color, size });

// Three staggered columns of real event photos and numbers. Heights on desktop keep stat text clear of the crop at both ends of the drift.
const columns: { tiles: Tile[]; drift: [number, number] }[] = [
    {
        drift: [0, -40],
        tiles: [
            stat(5000, '+', 'Strong community', '#6d3ff0', 'lg:h-[200px]'),
            photo('hackathon', 'AI Hackathon poster with a STUDLYF organizer', 'lg:h-[236px]'),
            stat(25, '+', 'Colleges partnered', '#b336b4', 'lg:h-[200px]'),
        ],
    },
    {
        drift: [-60, -20],
        tiles: [
            photo('certificates', 'Hackathon participants posing together', 'lg:h-[250px]'),
            stat(1, ' Lakh+', 'Media reach', '#14102b', 'lg:h-[196px]'),
            photo('mentorship', 'A speaker addressing a full campus auditorium', 'lg:h-[250px]'),
        ],
    },
    {
        drift: [-40, 0],
        tiles: [
            stat(15000, '+', 'Students reached', '#d63a8c', 'lg:h-[190px]'),
            photo('online_sessions', 'Founders and investors at a panel discussion', 'lg:h-[246px]'),
            stat(15, '+', 'Startup hiring partners', '#e0562f', 'lg:h-[200px]'),
        ],
    },
];

const TileView: React.FC<{ tile: Tile }> = ({ tile }) =>
    tile.kind === 'photo' ? (
        <div className={cn('group h-44 shrink-0 overflow-hidden rounded-[20px] bg-ds-muted', tile.size)}>
            <img src={tile.src} alt={tile.alt} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
    ) : (
        <div className={cn('flex h-44 shrink-0 flex-col justify-center rounded-[20px] p-5 text-white', tile.size)} style={{ backgroundColor: tile.color }}>
            <p className="text-3xl font-bold tracking-tight tabular-nums xl:text-4xl">
                <CountUp value={tile.number} />
                {tile.suffix}
            </p>
            <p className="mt-1 text-sm leading-snug text-white/90">{tile.label}</p>
        </div>
    );

/** Columns drift gently in opposite directions as the page scrolls. */
const Column: React.FC<{ tiles: Tile[]; drift: [number, number]; progress: ReturnType<typeof useScroll>['scrollYProgress']; still: boolean }> = ({ tiles, drift, progress, still }) => {
    const y = useTransform(progress, [0, 1], drift);
    return (
        <motion.div style={{ y: still ? drift[0] : y }} className="contents lg:flex lg:flex-col lg:gap-3">
            {tiles.map((tile, i) => (
                <TileView key={i} tile={tile} />
            ))}
        </motion.div>
    );
};

const Impact = () => {
    const ref = React.useRef<HTMLDivElement>(null);
    const still = useReducedMotion() ?? false;
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

    return (
        <section id="impact" aria-labelledby="impact-heading" className="studlyf-ds ds-section bg-ds-background">
            <div className="ds-container">
                <div ref={ref} className="grid overflow-hidden rounded-ds-panel bg-white shadow-ds-md ring-1 ring-ds-border lg:h-[620px] lg:grid-cols-[2fr_3fr] lg:grid-rows-[620px]">
                    <div className="flex flex-col justify-between gap-8 p-8 lg:p-12">
                        <p className="ds-eyebrow">By the numbers</p>
                        <div>
                            <h2 id="impact-heading" className="text-5xl leading-[1.02] font-bold tracking-tight text-ds-foreground lg:text-7xl">
                                Our <br className="hidden lg:block" />
                                <span className="ds-gradient-text">impact</span>
                            </h2>
                            <p className="ds-subline mt-5 max-w-md">
                                Creating a global ecosystem where engineering skills meet real-world opportunities.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 pt-0 lg:grid-cols-3 lg:p-0 lg:pr-3">
                        {columns.map((col, i) => (
                            <Column key={i} tiles={col.tiles} drift={col.drift} progress={scrollYProgress} still={still} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Impact;
