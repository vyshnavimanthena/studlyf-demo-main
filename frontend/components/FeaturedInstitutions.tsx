import React, { useMemo, useState } from 'react';
import { Briefcase, GraduationCap, Users, type LucideIcon } from 'lucide-react';
import { partners } from './OurPartners';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const institutions = [
    { name: 'Woxsen', logo: '/images-optimized/woxen.webp', scale: 1.5 },
    { name: 'VJIM', logo: '/images-optimized/vjim.webp' },
    { name: 'Vishnu', logo: '/images-optimized/vishnu.webp' },
    { name: 'SRM', logo: '/images-optimized/srm.webp', scale: 1.41 },
    { name: 'MRU', logo: '/images-optimized/mru.webp' },
    { name: 'IIT Madras', logo: '/images-optimized/iitm.webp' },
    { name: 'IIT Kanpur', logo: '/images-optimized/iit k.webp' },
    { name: 'IIT Hyderabad', logo: '/images-optimized/iit h.webp' },
    { name: 'IIT Delhi', logo: '/images-optimized/iit-delhi.webp' },
    { name: 'IIT Bombay', logo: '/images-optimized/iit-bombay.webp' },
    { name: 'IIM K', logo: '/images-optimized/iim k.webp' },
    { name: 'GRIET', logo: '/images-optimized/griet.webp', scale: 1.31 },
    { name: 'CMR', logo: '/images-optimized/cmr.webp' },
    { name: 'CBIT', logo: '/images-optimized/cbit.webp' },
    { name: 'BITS', logo: '/images-optimized/bits.webp' },
    { name: 'Anurag University', logo: '/images-optimized/anuraguni.webp' },
];

/** `scale` optically enlarges logo files that carry lots of built-in whitespace (until tighter exports exist). */
type Logo = { name: string; logo: string; scale?: number };

// ---- Network canvas (desktop) -------------------------------------------------------------
// Fixed-aspect canvas; every position is a percentage so the whole network scales with the width.
const CANVAS_W = 1100;
const CANVAS_H = 720;
const NODE = 64; // px at 1100 wide

type Pt = { x: number; y: number }; // percent of canvas

// Institutions cluster on the left, companies on the right; the heading sits top-centre (x 25–75%, y 0–47%)
const INSTITUTION_POS: Pt[] = [
    { x: 6, y: 9 }, { x: 16, y: 5 }, { x: 21, y: 19 }, { x: 10, y: 25 }, { x: 20, y: 32 }, { x: 5, y: 42 },
    { x: 13, y: 49 }, { x: 22.5, y: 44 }, { x: 8, y: 63 }, { x: 19, y: 64 }, { x: 29, y: 61 }, { x: 5, y: 82 },
    { x: 15, y: 87 }, { x: 26, y: 79 }, { x: 36, y: 90 }, { x: 39, y: 72 },
];
const COMPANY_POS: Pt[] = [
    { x: 94, y: 9 }, { x: 84, y: 5 }, { x: 79, y: 19 }, { x: 90, y: 25 }, { x: 80, y: 32 }, { x: 95, y: 43 },
    { x: 87, y: 49 }, { x: 77.5, y: 44 }, { x: 92, y: 66 }, { x: 80, y: 65 }, { x: 71, y: 61 }, { x: 88, y: 86 },
    { x: 76, y: 82 },
];

// Chips sit on the bridge curves. Labels are the section's own categories only.
type Chip = { id: string; label: string; icon: LucideIcon; at: Pt };
const CHIPS: Chip[] = [
    { id: 'chip-institutions', label: 'Institutions', icon: GraduationCap, at: { x: 41, y: 53 } },
    { id: 'chip-companies', label: 'Companies', icon: Briefcase, at: { x: 59, y: 53 } },
    { id: 'chip-learners', label: 'Learners', icon: Users, at: { x: 50, y: 74 } },
];

type Node = Logo & { id: string; group: 'institution' | 'company'; at: Pt };

const nodes: Node[] = [
    ...institutions.map((l, i) => ({ ...l, id: `inst-${i}`, group: 'institution' as const, at: INSTITUTION_POS[i] })),
    ...partners.map((l, i) => ({ ...l, id: `co-${i}`, group: 'company' as const, at: COMPANY_POS[i] })),
];

type Edge = { from: string; to: string };

const dist = (a: Pt, b: Pt) => Math.hypot((a.x - b.x) * CANVAS_W, (a.y - b.y) * CANVAS_H);

/** Each cluster is joined by its minimum spanning tree (short, natural links, no orphans), plus fixed bridges through the chips. */
const buildEdges = (): Edge[] => {
    const seen = new Set<string>();
    const edges: Edge[] = [];
    const add = (from: string, to: string) => {
        const key = [from, to].sort().join('|');
        if (from === to || seen.has(key)) return;
        seen.add(key);
        edges.push({ from, to });
    };
    for (const group of ['institution', 'company'] as const) {
        const members = nodes.filter((n) => n.group === group);
        const inTree = new Set([members[0].id]);
        while (inTree.size < members.length) {
            let best: { from: Node; to: Node; d: number } | null = null;
            for (const a of members) {
                if (!inTree.has(a.id)) continue;
                for (const b of members) {
                    if (inTree.has(b.id)) continue;
                    const d = dist(a.at, b.at);
                    if (!best || d < best.d) best = { from: a, to: b, d };
                }
            }
            if (!best) break;
            inTree.add(best.to.id);
            add(best.from.id, best.to.id);
        }
    }
    // Bridges: each cluster's inner nodes reach its chip, and both chips meet at "Learners"
    add('inst-7', 'chip-institutions');
    add('inst-10', 'chip-institutions');
    add('co-7', 'chip-companies');
    add('co-10', 'chip-companies');
    add('chip-institutions', 'chip-learners');
    add('chip-companies', 'chip-learners');
    add('inst-15', 'chip-learners');
    add('co-12', 'chip-learners');
    return edges;
};

const pointOf = (id: string): Pt => (nodes.find((n) => n.id === id) ?? CHIPS.find((c) => c.id === id)!).at as Pt;

/** Soft cubic curve between two points, bowed perpendicular to the line (alternating side per edge). */
const curvePath = (a: Pt, b: Pt, i: number) => {
    const ax = (a.x / 100) * CANVAS_W, ay = (a.y / 100) * CANVAS_H;
    const bx = (b.x / 100) * CANVAS_W, by = (b.y / 100) * CANVAS_H;
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const bow = Math.min(60, len * 0.22) * (i % 2 ? 1 : -1);
    const nx = (-dy / len) * bow, ny = (dx / len) * bow;
    return `M ${ax.toFixed(1)} ${ay.toFixed(1)} C ${(ax + dx / 3 + nx).toFixed(1)} ${(ay + dy / 3 + ny).toFixed(1)}, ${(ax + (2 * dx) / 3 + nx).toFixed(1)} ${(ay + (2 * dy) / 3 + ny).toFixed(1)}, ${bx.toFixed(1)} ${by.toFixed(1)}`;
};

const networkCss = `
@keyframes net-float { 0%, 100% { transform: translateY(-4px); } 50% { transform: translateY(4px); } }
@keyframes net-drift { to { stroke-dashoffset: -24; } }
.net-node { animation: net-float var(--dur) ease-in-out var(--delay) infinite; }
.net-edge { animation: net-drift 2.4s linear infinite; }
.net-canvas:hover .net-node, .net-canvas:hover .net-edge, .net-canvas:focus-within .net-node, .net-canvas:focus-within .net-edge { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .net-node, .net-edge { animation: none; } }
`;

const LogoNode: React.FC<{ node: Node; index: number; active: boolean; onActive: (id: string | null) => void }> = ({ node, index, active, onActive }) => {
    const [failed, setFailed] = useState(false);
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    role="img"
                    tabIndex={0}
                    aria-label={node.name}
                    onMouseEnter={() => onActive(node.id)}
                    onMouseLeave={() => onActive(null)}
                    onFocus={() => onActive(node.id)}
                    onBlur={() => onActive(null)}
                    className="net-node group absolute rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-ring"
                    style={{
                        left: `calc(${node.at.x}% - ${NODE / 2}px)`,
                        top: `calc(${node.at.y}% - ${NODE / 2}px)`,
                        width: NODE,
                        height: NODE,
                        ['--dur' as string]: `${4 + (index % 5) * 0.5}s`,
                        ['--delay' as string]: `${-(index * 0.37) % 4}s`,
                    }}
                >
                    {/* The circle lifts on hover/focus; the float animation lives on the outer element */}
                    <span
                        className={cn(
                            'flex size-full items-center justify-center overflow-hidden rounded-full bg-white ring-4 ring-white transition-[transform,box-shadow] duration-200 motion-reduce:transition-none',
                            active ? '-translate-y-1 shadow-ds-lg' : 'shadow-ds-md',
                        )}
                    >
                        {failed ? (
                            <span aria-hidden="true" className="text-[11px] leading-tight font-semibold text-ds-muted-foreground">
                                {node.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 3)}
                            </span>
                        ) : (
                            <img
                                src={node.logo}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                onError={() => setFailed(true)}
                                className="size-11 object-contain"
                                style={node.scale ? { transform: `scale(${node.scale})` } : undefined}
                            />
                        )}
                    </span>
                </span>
            </TooltipTrigger>
            <TooltipContent side="top">{node.name}</TooltipContent>
        </Tooltip>
    );
};

const NetworkCanvas: React.FC = () => {
    const edges = useMemo(buildEdges, []);
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <div
            className="net-canvas relative mx-auto w-full max-w-[1100px]"
            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
        >
            <style dangerouslySetInnerHTML={{ __html: networkCss }} />
            <svg
                aria-hidden="true"
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                className="pointer-events-none absolute inset-0 size-full overflow-visible"
            >
                {edges.map((e, i) => {
                    const touches = activeId !== null && (e.from === activeId || e.to === activeId);
                    const isBridge = e.from.startsWith('chip') || e.to.startsWith('chip');
                    return (
                        <path
                            key={`${e.from}-${e.to}`}
                            d={curvePath(pointOf(e.from), pointOf(e.to), i)}
                            fill="none"
                            className="net-edge transition-[stroke,opacity] duration-200"
                            stroke={touches ? 'var(--ds-primary)' : isBridge ? 'var(--ds-coral)' : '#b9a6ff'}
                            strokeWidth={touches ? 3 : 2.5}
                            strokeLinecap="round"
                            strokeDasharray="0 8"
                            opacity={activeId === null ? (isBridge ? 0.7 : 0.85) : touches ? 1 : 0.25}
                        />
                    );
                })}
            </svg>

            {/* Heading lives in the canvas, top-centre, with the clusters around it */}
            <header className="absolute top-0 left-1/2 w-[50%] -translate-x-1/2 text-center">
                <p className="ds-eyebrow mb-4">Our community</p>
                <h2 id="institutions-heading" className="ds-h2 text-ds-foreground">
                    Where our learners <span className="ds-gradient-text">come from</span>
                </h2>
                <p className="mx-auto mt-4 max-w-[520px] text-base leading-relaxed text-ds-muted-foreground">
                    STUDLYF learners come from strong colleges, universities, and institutions. Learners, professionals, and aspirants from leading companies, institutions, and ecosystems grow with STUDLYF.
                </p>
            </header>

            {CHIPS.map((chip) => (
                <span
                    key={chip.id}
                    data-chip
                    className="absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ds-foreground shadow-ds-md ring-1 ring-ds-border"
                    style={{ left: `${chip.at.x}%`, top: `${chip.at.y}%` }}
                >
                    <chip.icon className="size-4 text-ds-primary" aria-hidden="true" />
                    {chip.label}
                </span>
            ))}

            <ul aria-label="Institutions and companies our learners come from" className="contents">
                {nodes.map((node, i) => (
                    <li key={node.id} className="contents">
                        <LogoNode node={node} index={i} active={activeId === node.id} onActive={setActiveId} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ---- Mobile / tablet fallback: two simple wrapped logo grids --------------------------------
const LogoGrid: React.FC<{ label: string; logos: Logo[] }> = ({ label, logos }) => (
    <div>
        <h3 className="mb-4 text-center text-base font-semibold text-ds-muted-foreground">{label}</h3>
        <ul className="flex flex-wrap justify-center gap-3">
            {logos.map((l) => (
                <li key={l.name} className="flex size-16 items-center justify-center rounded-full bg-white shadow-ds-sm ring-1 ring-ds-border">
                    <img src={l.logo} alt={l.name} loading="lazy" decoding="async" className="max-h-7 max-w-10 object-contain grayscale" />
                </li>
            ))}
        </ul>
    </div>
);

/** Institutions and "trusted by" companies as a connected network (desktop) or two logo grids (mobile). */
const FeaturedInstitutions: React.FC = () => {
    return (
        <section aria-labelledby="institutions-heading" className="studlyf-ds ds-section overflow-hidden bg-ds-background lg:pb-6">
            <div className="ds-container">
                <div className="hidden lg:block">
                    <NetworkCanvas />
                </div>

                <div className="lg:hidden">
                    <header className="mx-auto mb-10 max-w-3xl text-center">
                        <p className="ds-eyebrow mb-4">Our community</p>
                        <h2 className="ds-h2 text-ds-foreground">
                            Where our learners <span className="ds-gradient-text">come from</span>
                        </h2>
                        <p className="ds-subline mx-auto mt-4 max-w-2xl">
                            STUDLYF learners come from strong colleges, universities, and institutions. Learners, professionals, and aspirants from leading companies, institutions, and ecosystems grow with STUDLYF.
                        </p>
                    </header>
                    <div className="flex flex-col gap-10">
                        <LogoGrid label="Featured institutions" logos={institutions} />
                        <LogoGrid label="Trusted by people from" logos={partners} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedInstitutions;
