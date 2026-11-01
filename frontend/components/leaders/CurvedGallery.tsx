import React from 'react';
import { useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion';
import LeaderPhoto, { curly, tileNumber } from './LeaderPhoto';
import { leaders } from './leaders';

// Geometry, in px at rest (centre tile).
const TILE_W = 176;
const TILE_H = 240;
const GAP = 22;
const STEP = TILE_W + GAP;
const TRACK = STEP * leaders.length;
const PERSPECTIVE = 1100;
const STAGE_H = 500;
const CENTRE_Y = 214;

const DRIFT = 24; // px per second
const CAPTION_W = STEP + 24;
// Captions are fully shown up to this share of the half-width, and gone by the second.
const CAPTION_FADE_START = 0.66;
const CAPTION_FADE_END = 0.82;
// Symmetric edge fade, wide enough that whichever tile is at the edge reads as fading.
const EDGE_MASK =
    'linear-gradient(90deg, transparent 0%, rgb(0 0 0 / 0.2) 5%, rgb(0 0 0 / 0.65) 11%, #000 19%, #000 81%, rgb(0 0 0 / 0.65) 89%, rgb(0 0 0 / 0.2) 95%, transparent 100%)';

interface Curve {
    bend: number; // how much spacing and size grow towards the edges
    maxAngle: number; // deg
    maxZ: number; // px towards the viewer at the edge
}
const CURVE: Curve = { bend: 0.2, maxAngle: 40, maxZ: 70 };
const GENTLE: Curve = { bend: 0.07, maxAngle: 18, maxZ: 24 };

/**
 * Lowest projected point of any tile whose caption is still visible, so every
 * caption can share one baseline instead of following its own tile.
 */
function baseline(W: number, curve: Curve) {
    let lowest = 0;
    for (let p = 0; p <= W * 1.2; p += 4) {
        const t = p / W;
        const t2 = t * t;
        const x = p * (1 + curve.bend * t2);
        if (x / W > CAPTION_FADE_END) break;
        const size = 1 + 3 * curve.bend * Math.min(t2, 2.25);
        const angle = curve.maxAngle * Math.min(1, t);
        const z = curve.maxZ * Math.min(t2, 1.5);
        const m = PERSPECTIVE / (PERSPECTIVE - z);
        const nearZ = z + (TILE_W / 2) * (size / m) * Math.sin((angle * Math.PI) / 180);
        lowest = Math.max(lowest, (TILE_H / 2) * (size / m) * (PERSPECTIVE / (PERSPECTIVE - nearZ)));
    }
    return Math.ceil(lowest + 18);
}

// Hover / keyboard-focus lift.
const HOVER_DELAY = 100; // ms
const LIFT_SCALE = 0.06;
const LIFT_Z = 30; // px
const LIFT_FLATTEN = 0.75; // share of the curve rotation removed while lifted
const DIM = 0.25; // other tiles drop to opacity 0.75

const preview = (quote: string) => {
    const text = curly(quote);
    if (text.length <= 96) return text;
    const cut = text.lastIndexOf(' ', 90);
    return `${text.slice(0, cut > 60 ? cut : 90).replace(/[,.;:]$/, '')}\u2026`;
};

const wrap = (v: number) => ((((v + TRACK / 2) % TRACK) + TRACK) % TRACK) - TRACK / 2;

interface CurvedGalleryProps {
    onOpen: (index: number, opener: HTMLElement) => void;
    paused: boolean;
}

/**
 * Portrait tiles on the inside of a cylinder. One motion value (the scroll
 * offset) drives every tile's transform each frame; nothing touches layout.
 */
const CurvedGallery: React.FC<CurvedGalleryProps> = ({ onOpen, paused }) => {
    const reduced = useReducedMotion() ?? false;
    const curve = reduced ? GENTLE : CURVE;

    // Start on a gap, so the composition is symmetric at rest (12 tiles, even count).
    const offset = useMotionValue(-STEP / 2);
    const stageRef = React.useRef<HTMLDivElement>(null);
    const tileRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const captionRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const buttonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const half = React.useRef(720);
    const [captionTop, setCaptionTop] = React.useState(0);

    const motion = React.useRef({
        velocity: reduced ? 0 : DRIFT,
        hover: false,
        focus: false,
        target: null as number | null,
    });
    // Hovered tile (pointer) and keyboard-focused tile; hover wins.
    const active = React.useRef<{ hover: number | null; focus: number | null }>({ hover: null, focus: null });
    const lift = React.useRef<number[]>(leaders.map(() => 0));
    const dim = React.useRef(0);
    const hoverTimer = React.useRef<number | undefined>(undefined);
    const keyboard = React.useRef(true); // last input was a key, not a pointer
    const drag = React.useRef<{ id: number; startX: number; lastX: number; lastT: number; v: number; moved: boolean } | null>(null);
    const suppressClick = React.useRef(false);

    const layout = React.useCallback(() => {
        const W = half.current;
        const o = offset.get();
        for (let i = 0; i < leaders.length; i++) {
            const tile = tileRefs.current[i];
            const caption = captionRefs.current[i];
            if (!tile || !caption) continue;

            const p = wrap(i * STEP - o); // position along the flat track
            const t = p / W; // -1..1 across the visible width
            const t2 = t * t;
            const x = p * (1 + curve.bend * t2); // spread out towards the edges
            const size = 1 + 3 * curve.bend * Math.min(t2, 2.25); // d(x)/d(p): tiles grow with their spacing
            const l = lift.current[i];
            const g = reduced ? 0 : l; // reduced motion: overlay only, no geometry change
            const angle = -curve.maxAngle * Math.max(-1, Math.min(1, t)) * (1 - LIFT_FLATTEN * g);
            const z = curve.maxZ * Math.min(t2, 1.5) + LIFT_Z * g;
            const m = PERSPECTIVE / (PERSPECTIVE - z); // perspective magnification at depth z
            const fade = 1 - DIM * dim.current * (1 - l);

            tile.style.transform =
                `translate3d(${(x / m).toFixed(2)}px,0,${z.toFixed(2)}px) rotateY(${angle.toFixed(2)}deg) scale(${((size * (1 + LIFT_SCALE * g)) / m).toFixed(4)})`;
            tile.style.opacity = fade.toFixed(3);
            tile.style.zIndex = l > 0 ? '2' : '1';

            // Captions sit on one shared baseline (see captionTop) and only track x.
            const u = Math.abs(x) / W;
            caption.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
            caption.style.opacity = String(fade * Math.max(0, Math.min(1, (CAPTION_FADE_END - u) / (CAPTION_FADE_END - CAPTION_FADE_START))));
        }
    }, [curve, offset, reduced]);

    React.useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const measure = () => {
            half.current = Math.max(320, stage.clientWidth / 2);
            setCaptionTop(baseline(half.current, curve));
            layout();
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(stage);
        const unsub = offset.on('change', layout);
        return () => {
            ro.disconnect();
            unsub();
        };
    }, [layout, offset, curve]);

    React.useEffect(() => {
        // Focus rings and focus-lift are for keyboard users only.
        const onKey = () => {
            keyboard.current = true;
            if (stageRef.current) stageRef.current.dataset.input = 'keyboard';
        };
        const onPointer = () => {
            keyboard.current = false;
            if (stageRef.current) stageRef.current.dataset.input = 'pointer';
        };
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('pointerdown', onPointer, true);
        return () => {
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('pointerdown', onPointer, true);
            window.clearTimeout(hoverTimer.current);
        };
    }, []);

    useAnimationFrame((_, delta) => {
        const s = motion.current;
        const dt = Math.min(delta, 64) / 1000;

        // Ease each tile's lift and the shared dim towards the active tile.
        const a = active.current.hover ?? active.current.focus;
        const k = reduced ? 1 : 1 - Math.exp(-dt * 14);
        let changed = false;
        for (let i = 0; i < leaders.length; i++) {
            const l = lift.current[i];
            const goal = i === a ? 1 : 0;
            const next = Math.abs(goal - l) < 0.002 ? goal : l + (goal - l) * k;
            if (next !== l) {
                lift.current[i] = next;
                changed = true;
            }
            const tile = tileRefs.current[i];
            if (tile && (tile.dataset.active === 'true') !== (i === a)) tile.dataset.active = String(i === a);
        }
        const dimGoal = a === null ? 0 : 1;
        const nextDim = Math.abs(dimGoal - dim.current) < 0.002 ? dimGoal : dim.current + (dimGoal - dim.current) * k;
        if (nextDim !== dim.current) {
            dim.current = nextDim;
            changed = true;
        }
        if (changed) layout();

        if (drag.current) return;

        if (s.target !== null) {
            const o = offset.get();
            const next = o + (s.target - o) * (reduced ? 1 : 1 - Math.exp(-dt * 9));
            offset.set(Math.abs(s.target - next) < 0.3 ? s.target : next);
            if (offset.get() === s.target) s.target = null;
            s.velocity = 0;
            return;
        }

        const stopped = reduced || paused || s.hover || s.focus;
        const goal = stopped ? 0 : DRIFT;
        // Ease towards the drift speed; after a fling this is the inertia decay.
        s.velocity += (goal - s.velocity) * (1 - Math.exp(-dt * (Math.abs(s.velocity) > DRIFT * 2 ? 2.2 : 3)));
        if (Math.abs(s.velocity) < 0.05 && goal === 0) s.velocity = 0;
        if (s.velocity !== 0) offset.set(offset.get() + s.velocity * dt);
    });

    const hoverIn = (i: number) => {
        if (drag.current?.moved) return;
        window.clearTimeout(hoverTimer.current);
        hoverTimer.current = window.setTimeout(() => (active.current.hover = i), HOVER_DELAY);
    };
    const hoverOut = (i: number) => {
        window.clearTimeout(hoverTimer.current);
        if (active.current.hover === i) active.current.hover = null;
    };
    const focusIn = (i: number) => {
        centreOn(i);
        if (keyboard.current) active.current.focus = i;
    };

    const centreOn = (i: number) => {
        const o = offset.get();
        motion.current.target = o + wrap(i * STEP - o);
    };

    const onPointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        motion.current.target = null;
        suppressClick.current = false;
        drag.current = { id: e.pointerId, startX: e.clientX, lastX: e.clientX, lastT: performance.now(), v: 0, moved: false };
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        if (!d.moved && Math.abs(e.clientX - d.startX) > 6) {
            d.moved = true;
            window.clearTimeout(hoverTimer.current);
            active.current.hover = null;
            stageRef.current?.setPointerCapture(e.pointerId);
        }
        if (!d.moved) return;
        const now = performance.now();
        const dx = e.clientX - d.lastX;
        const dtMs = Math.max(1, now - d.lastT);
        d.v = 0.75 * d.v + 0.25 * (-dx / dtMs) * 1000;
        d.lastX = e.clientX;
        d.lastT = now;
        offset.set(offset.get() - dx);
    };

    const endDrag = (e: React.PointerEvent) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        drag.current = null;
        if (d.moved) {
            suppressClick.current = true;
            // Stale samples mean the pointer stopped before release.
            const fresh = performance.now() - d.lastT < 80;
            motion.current.velocity = reduced || !fresh ? 0 : Math.max(-2400, Math.min(2400, d.v));
        }
    };

    const onWheel = (e: React.WheelEvent) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        motion.current.target = null;
        motion.current.velocity = 0;
        offset.set(offset.get() + e.deltaX);
    };

    const onKeyDown = (e: React.KeyboardEvent, i: number) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const n = leaders.length;
        buttonRefs.current[(i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n]?.focus();
    };

    return (
        <div
            className="relative mx-auto max-w-[1600px] select-none"
            style={{
                maskImage: EDGE_MASK,
                WebkitMaskImage: EDGE_MASK,
            }}
        >
            <div
                ref={stageRef}
                data-input="keyboard"
                role="group"
                aria-roledescription="carousel"
                aria-label="Leaders’ quotes. Drag or use the arrow keys to browse."
                className="group/stage relative cursor-grab touch-pan-y overflow-clip active:cursor-grabbing"
                style={{ height: STAGE_H }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onWheel={onWheel}
                onScroll={(e) => {
                    // Focusing an off-stage tile must not scroll the stage; the curve moves instead.
                    e.currentTarget.scrollLeft = 0;
                    e.currentTarget.scrollTop = 0;
                }}
                onPointerEnter={() => (motion.current.hover = true)}
                onPointerLeave={() => {
                    motion.current.hover = false;
                    window.clearTimeout(hoverTimer.current);
                    active.current.hover = null;
                }}
                onFocus={() => (motion.current.focus = true)}
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) motion.current.focus = false;
                }}
                onClickCapture={(e) => {
                    // A drag that ended over a tile is not a click.
                    if (suppressClick.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        suppressClick.current = false;
                    }
                }}
            >
                <div
                    className="absolute inset-0"
                    // No preserve-3d: each tile is flattened on its own, so z-index (not depth) decides stacking.
                    style={{ perspective: PERSPECTIVE, perspectiveOrigin: `50% ${CENTRE_Y}px` }}
                >
                    {leaders.map((leader, i) => (
                        <div
                            key={leader.name}
                            ref={(el) => { tileRefs.current[i] = el; }}
                            data-active="false"
                            className="group/tile absolute left-1/2 will-change-transform"
                            style={{ width: TILE_W, height: TILE_H, marginLeft: -TILE_W / 2, top: CENTRE_Y - TILE_H / 2, backfaceVisibility: 'hidden' }}
                            onPointerEnter={() => hoverIn(i)}
                            onPointerLeave={() => hoverOut(i)}
                        >
                            <button
                                ref={(el) => { buttonRefs.current[i] = el; }}
                                type="button"
                                aria-label={`Quote from ${leader.name}`}
                                onClick={(e) => onOpen(i, e.currentTarget)}
                                onFocus={() => focusIn(i)}
                                onBlur={() => {
                                    if (active.current.focus === i) active.current.focus = null;
                                }}
                                onKeyDown={(e) => onKeyDown(e, i)}
                                className="relative block h-full w-full cursor-[inherit] overflow-hidden rounded-[20px] bg-ds-muted shadow-[0_1px_2px_rgb(20_16_43/0.08),0_14px_32px_-14px_rgb(20_16_43/0.35)] outline-none ring-1 ring-ds-ink/[0.06] transition-shadow duration-300 group-data-[active=true]/tile:shadow-[0_2px_4px_rgb(20_16_43/0.12),0_30px_60px_-18px_rgb(20_16_43/0.55)] group-data-[input=keyboard]/stage:focus-visible:ring-[3px] group-data-[input=keyboard]/stage:focus-visible:ring-ds-ring"
                            >
                                <LeaderPhoto
                                    leader={leader}
                                    eager={i < 4 || i > leaders.length - 4}
                                    className="pointer-events-none transition-transform duration-500 ease-out group-data-[active=true]/tile:scale-[1.03] motion-reduce:transition-none"
                                />
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col bg-[linear-gradient(to_top,rgb(20_16_43/0.94)_0%,rgb(20_16_43/0.9)_calc(100%-44px),transparent_100%)] px-3.5 pt-12 pb-3.5 text-left opacity-0 transition-opacity duration-200 group-data-[active=true]/tile:opacity-100 motion-reduce:transition-none"
                                >
                                    <span className="text-[15px] leading-[1.35] font-medium text-white">
                                        &ldquo;{preview(leader.quote)}&rdquo;
                                    </span>
                                    <span className="mt-2 text-[12px] font-semibold tracking-[0.02em] text-white/85">Read &rarr;</span>
                                </span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Captions live outside the 3D layer so the text stays crisp and upright. */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0" style={{ top: CENTRE_Y + captionTop }}>
                    {leaders.map((leader, i) => (
                        <div
                            key={leader.name}
                            ref={(el) => { captionRefs.current[i] = el; }}
                            className="absolute left-1/2 top-0 text-center will-change-transform"
                            style={{ width: CAPTION_W, marginLeft: -CAPTION_W / 2 }}
                        >
                            <p className="text-[11px] font-semibold tracking-[0.14em] text-ds-primary tabular-nums">{tileNumber(i)}</p>
                            <p className="mt-1 truncate text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ds-foreground">{leader.name}</p>
                            <p className="truncate text-[13px] leading-snug text-ds-muted-foreground">{leader.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CurvedGallery;
