import React from 'react';
import { motion, type Transition, type Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Frosted-glass "photo folder" (macOS style) used by the Learn/Jobs menu on the homepage. */

export type FolderState = 'rest' | 'hover' | 'open';

export type FolderPaper = {
    key: string;
    image?: string;
    icon?: LucideIcon;
    /** Tile tint + icon colour for papers without a photo. */
    tint?: string;
    ink?: string;
};

export type FolderSticker = {
    key: string;
    icon: LucideIcon;
    /** 'badge' = round die-cut sticker, 'tag' = pill sticker with a word. */
    shape: 'badge' | 'tag';
    text?: string;
    className: string;
    rotate: number;
};

// Geometry (px). The graphic is drawn at a fixed 280 wide.
export const FOLDER_W = 280;
// 8px grid: papers peek 64px (centre) / 56px (sides) above the front; the back shows 32px above it.
const FOLDER_H = 192;
const FRONT_H = 128;
const BACK_TOP = 16; // top of the tab
const TAB_H = 16;
const TAB_W = 96;
const PAPER_W = 104;
const PAPER_H = 88;
const FAN_CX = 24; // fan sits right of centre so the tab stays visible

// Fan per paper slot: left, right, centre (centre painted last, on top)
const FAN = [
    { x: -56, rotate: -8, y: 8 },
    { x: 56, rotate: 8, y: 8 },
    { x: 0, rotate: 0, y: 0 },
];
const SPREAD: Record<FolderState, { x: number; rotate: number; y: number }> = {
    rest: { x: 1, rotate: 1, y: 0 },
    hover: { x: 1.1, rotate: 1.25, y: -12 },
    open: { x: 1.25, rotate: 1.5, y: -24 },
};

const spring: Transition = { type: 'spring', stiffness: 300, damping: 26, mass: 0.9 };
const instant: Transition = { duration: 0 };

/** Back panel with the tab notch on the top-left, drawn as one path so the tab joins the body smoothly. */
const BackPanel: React.FC = () => {
    const gradId = `ds-folder-back-${React.useId().replace(/:/g, '')}`;
    const w = FOLDER_W;
    const h = FOLDER_H - BACK_TOP;
    const r = 24;
    const tabW = TAB_W;
    const t = TAB_H;
    const d = [
        `M0 ${r}`,
        `Q0 0 ${r} 0`,
        `H${tabW - 16}`,
        `C${tabW - 4} 0 ${tabW - 4} ${t} ${tabW + 16} ${t}`,
        `H${w - r}`,
        `Q${w} ${t} ${w} ${t + r}`,
        `V${h - r}`,
        `Q${w} ${h} ${w - r} ${h}`,
        `H${r}`,
        `Q0 ${h} 0 ${h - r}`,
        'Z',
    ].join(' ');
    return (
        <svg
            className="absolute left-0"
            style={{ top: BACK_TOP }}
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#E4DFF2" />
                    <stop offset="1" stopColor="#D5CEE8" />
                </linearGradient>
            </defs>
            <path d={d} fill={`url(#${gradId})`} />
            <path d={d} fill="none" stroke="rgb(20 16 43 / 0.08)" />
            {/* Soft highlight along the tab and the top edge */}
            <path
                d={`M${r} 1.5 H${tabW - 16} C${tabW - 4} 1.5 ${tabW - 4} ${t + 1.5} ${tabW + 16} ${t + 1.5} H${w - r}`}
                fill="none"
                stroke="rgb(255 255 255 / 0.9)"
                strokeWidth="1.5"
            />
        </svg>
    );
};

const Paper: React.FC<{ paper: FolderPaper; slot: number; reduce: boolean }> = ({ paper, slot, reduce }) => {
    const base = FAN[slot];
    const Icon = paper.icon;
    const variants: Variants = Object.fromEntries(
        (Object.keys(SPREAD) as FolderState[]).map((s) => [
            s,
            reduce
                ? { x: base.x, y: base.y, rotate: base.rotate }
                : { x: base.x * SPREAD[s].x, y: base.y + SPREAD[s].y, rotate: base.rotate * SPREAD[s].rotate },
        ]),
    );
    return (
        <motion.div
            variants={variants}
            transition={reduce ? instant : { ...spring, delay: slot === 2 ? 0 : 0.02 }}
            className="absolute rounded-[10px] bg-white p-[5px] shadow-[0_1px_2px_rgb(20_16_43/0.10),0_6px_16px_-6px_rgb(20_16_43/0.22)] ring-1 ring-black/[0.04]"
            style={{ width: PAPER_W, height: PAPER_H, left: (FOLDER_W - PAPER_W) / 2 + FAN_CX, top: 0, transformOrigin: '50% 100%' }}
        >
            <div
                className="flex size-full items-center justify-center overflow-hidden rounded-[6px]"
                style={{ background: paper.tint ?? 'var(--ds-lavender-strong)' }}
            >
                {paper.image ? (
                    <img src={paper.image} alt="" width={PAPER_W} height={PAPER_H} loading="eager" draggable={false} className="size-full object-cover" />
                ) : Icon ? (
                    <Icon className="size-8" style={{ color: paper.ink ?? 'var(--ds-primary)' }} strokeWidth={1.75} aria-hidden="true" />
                ) : (
                    // Blank note sheet: faint ruled lines
                    <div className="flex size-full flex-col justify-center gap-[9px] bg-white px-3">
                        {[0.9, 0.75, 0.85, 0.5].map((w, i) => (
                            <span key={i} className="h-[3px] rounded-full bg-ds-border" style={{ width: `${w * 100}%` }} />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const Sticker: React.FC<{ sticker: FolderSticker }> = ({ sticker }) => {
    const Icon = sticker.icon;
    return (
        <span
            className={cn(
                'absolute flex items-center justify-center border-[3px] border-white shadow-[0_1px_2px_rgb(20_16_43/0.14),0_6px_14px_-4px_rgb(20_16_43/0.25)]',
                sticker.shape === 'badge'
                    ? 'size-12 rounded-full bg-ds-primary text-white'
                    : 'h-8 gap-1.5 rounded-full bg-ds-lavender-strong pr-3 pl-2 text-[13px] leading-none font-semibold text-ds-primary',
                sticker.className,
            )}
            style={{ transform: `rotate(${sticker.rotate}deg)` }}
            aria-hidden="true"
        >
            <Icon className={sticker.shape === 'badge' ? 'size-[22px]' : 'size-4'} strokeWidth={2.1} />
            {sticker.text}
        </span>
    );
};

type FolderGraphicProps = {
    papers: FolderPaper[];
    stickers: FolderSticker[];
    reduce: boolean;
};

/** The folder artwork. Its parent sets `animate={state}`; every part reads the state through variants. */
export const FolderGraphic: React.FC<FolderGraphicProps> = ({ papers, stickers, reduce }) => {
    // Always three sheets: pad with blank note sheets, centre sheet = first item
    const sheets: FolderPaper[] = [...papers.slice(0, 3)];
    while (sheets.length < 3) sheets.push({ key: `blank-${sheets.length}` });
    const order = [sheets[1], sheets[2], sheets[0]]; // slots: left, right, centre

    const frontVariants: Variants = reduce
        ? { rest: { rotateX: 0 }, hover: { rotateX: 0 }, open: { rotateX: 0 } }
        : { rest: { rotateX: 0 }, hover: { rotateX: -6 }, open: { rotateX: -22 } };

    return (
        <motion.div
            className="relative"
            style={{ width: FOLDER_W, height: FOLDER_H, perspective: 900 }}
            variants={{
                rest: { y: 0 },
                hover: { y: reduce ? 0 : -4 },
                open: { y: reduce ? 0 : -4 },
            }}
            transition={reduce ? instant : spring}
        >
            {/* Ground shadow, stronger when lifted */}
            <motion.span
                aria-hidden="true"
                className="absolute inset-x-6 -bottom-2 h-6 rounded-[50%] bg-[rgb(20_16_43/0.22)] blur-[14px]"
                variants={{ rest: { opacity: 0.55, scale: 1 }, hover: { opacity: 0.9, scale: 1.04 }, open: { opacity: 0.9, scale: 1.04 } }}
                transition={reduce ? instant : spring}
            />
            <BackPanel />
            {order.map((p, slot) => (
                <Paper key={p.key} paper={p} slot={slot} reduce={reduce} />
            ))}
            {/* Front flap: frosted glass, hinged on its bottom edge */}
            <motion.div
                variants={frontVariants}
                transition={reduce ? instant : spring}
                className="absolute inset-x-0 bottom-0 overflow-hidden rounded-[24px] border border-white/80 bg-white/65 backdrop-blur-xl backdrop-saturate-150"
                style={{
                    height: FRONT_H,
                    transformOrigin: '50% 100%',
                    boxShadow:
                        'inset 0 1px 0 rgb(255 255 255 / 0.95), inset 0 -10px 24px -18px rgb(20 16 43 / 0.18), 0 0 0 1px rgb(20 16 43 / 0.05), 0 10px 28px -12px rgb(20 16 43 / 0.28)',
                }}
            >
                {/* Inner sheen */}
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent" />
                {/* Bottom lip lines */}
                <span aria-hidden="true" className="absolute inset-x-6 bottom-3 h-px bg-[rgb(20_16_43/0.07)] shadow-[0_1px_0_rgb(255_255_255/0.9)]" />
                <span aria-hidden="true" className="absolute inset-x-6 bottom-4 h-px bg-[rgb(20_16_43/0.05)] shadow-[0_1px_0_rgb(255_255_255/0.9)]" />
                {stickers.map((s) => (
                    <Sticker key={s.key} sticker={s} />
                ))}
            </motion.div>
        </motion.div>
    );
};
