import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    Briefcase,
    Code2,
    FileText,
    FolderGit2,
    GraduationCap,
    Hammer,
    MessagesSquare,
    type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import InteractiveCreature from './InteractiveCreature';
import { FolderGraphic, FOLDER_W, type FolderPaper, type FolderState, type FolderSticker } from './folders/Folder';

type MenuItem = {
    title: string;
    desc: string;
    to: string;
    /** Photo thumbnail where the menu already had one; otherwise an icon tile. */
    image?: string;
    icon?: LucideIcon;
    /** Paper tint + icon colour for icon tiles inside the folder. */
    tint?: string;
    ink?: string;
};

type Menu = { label: string; eyebrow: string; unit: [string, string]; items: MenuItem[]; stickers: FolderSticker[] };

const menus: Menu[] = [
    {
        label: 'Learn',
        eyebrow: 'Learn',
        unit: ['track', 'tracks'],
        items: [
            {
                title: 'Courses',
                desc: 'Role-focused tracks for elite engineering readiness.',
                to: '/learn/courses-overview',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300',
            },
            {
                title: 'Company learning modules',
                desc: 'Institutional training for corporate internal teams.',
                to: '/learn/company-modules',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=300',
            },
        ],
        stickers: [
            { key: 'code', icon: Code2, shape: 'tag', text: 'code', rotate: -6, className: 'top-6 left-6' },
            { key: 'cap', icon: GraduationCap, shape: 'badge', rotate: 8, className: 'right-6 bottom-6' },
        ],
    },
    {
        label: 'Jobs',
        eyebrow: 'Jobs',
        unit: ['tool', 'tools'],
        items: [
            { title: 'Build portfolio', desc: 'Showcase evidence of your engineering prowess.', to: '/job-prep/portfolio', icon: FolderGit2, tint: '#ECE6FF', ink: '#6D3FF0' },
            { title: 'Resume builder', desc: 'Create instant, ATS-friendly resumes.', to: '/job-prep/resume-builder', icon: FileText, tint: '#FFEDEA', ink: '#E5483A' },
            { title: 'Mock tests & interviews', desc: 'Practice clinical logic defense.', to: '/job-prep/mock-interview', icon: MessagesSquare, tint: '#E8F1FF', ink: '#2F6BDB' },
            { title: 'Build a project', desc: 'Scale industry projects.', to: '/job-prep/projects', icon: Hammer, tint: '#F4F2FA', ink: '#14102B' },
        ],
        stickers: [
            { key: 'resume', icon: FileText, shape: 'tag', text: 'resume', rotate: -6, className: 'top-6 left-6' },
            { key: 'case', icon: Briefcase, shape: 'badge', rotate: 8, className: 'right-6 bottom-6' },
        ],
    },
];

const PANEL_ID = 'studlyf-explore-panel';
// 8px grid. Buttons carry 16px padding, so 112 between buttons = 144 between the folder artworks.
const BTN_PAD = 16;
const CTA_GAP = 40; // hero CTA row → mascot top
const GAP = 112; // keep in sync with sm:gap-[112px] on the nav

const MenuCard: React.FC<{ item: MenuItem; onNavigate: () => void }> = ({ item, onNavigate }) => {
    const Icon = item.icon;
    return (
        <Link
            to={item.to}
            onClick={onNavigate}
            className="group flex h-full items-center gap-4 rounded-ds-card border border-ds-border bg-white p-4 transition-[background-color,transform,box-shadow] duration-200 outline-none hover:-translate-y-0.5 hover:bg-ds-lavender hover:shadow-ds-md focus-visible:ring-[3px] focus-visible:ring-ds-ring/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
            <span
                className="flex size-16 shrink-0 items-center sm:size-[88px] justify-center overflow-hidden rounded-ds-control bg-ds-lavender-strong"
                style={item.tint ? { background: item.tint } : undefined}
            >
                {item.image ? (
                    <img src={item.image} alt="" width={88} height={88} loading="lazy" className="size-full object-cover" />
                ) : Icon ? (
                    <Icon className="size-8" style={{ color: item.ink ?? 'var(--ds-primary)' }} strokeWidth={1.75} aria-hidden="true" />
                ) : null}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
                <span className="text-lg leading-6 font-semibold text-ds-foreground">{item.title}</span>
                {/* Always two lines tall so every card in a row matches */}
                <span className="line-clamp-2 min-h-10 text-[15px] leading-5 text-ds-muted-foreground">{item.desc}</span>
                <span className="inline-flex h-5 items-center gap-1 text-sm font-semibold text-ds-primary">
                    Explore
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
            </span>
        </Link>
    );
};

const PurpleNavbar: React.FC = () => {
    const [open, setOpen] = useState<string | null>(null);
    const [hot, setHot] = useState<string | null>(null);
    const location = useLocation();
    const reduce = !!useReducedMotion();
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const openedByKeyboard = useRef(false);
    const [panelH, setPanelH] = useState(0);
    const openMenu = menus.find((m) => m.label === open) ?? null;

    // Close on route change
    useEffect(() => {
        setOpen(null);
    }, [location.pathname]);

    // Track the panel content height so open/switch animates smoothly
    // Sit 40px under the hero's CTA row: the hero (rendered just before us) centres its content in a tall box,
    // so pull up into its empty lower part. Measured, so it keeps working if the hero's layout changes.
    const [pullUp, setPullUp] = useState<number | null>(null);
    useLayoutEffect(() => {
        const hero = rootRef.current?.previousElementSibling as HTMLElement | null;
        const content = hero?.lastElementChild as HTMLElement | null;
        // The CTA row is the content's last row; measure its border box (its bottom margin is dead space)
        const ctaRow = (content?.lastElementChild as HTMLElement | null) ?? content;
        if (!hero || !content || !ctaRow) return;
        const measure = () => {
            const gap = hero.getBoundingClientRect().bottom - ctaRow.getBoundingClientRect().bottom;
            setPullUp(Math.round(gap - CTA_GAP));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(hero);
        ro.observe(content);
        ro.observe(ctaRow);
        return () => ro.disconnect();
    }, []);

    useLayoutEffect(() => {
        const el = innerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setPanelH(el.offsetHeight));
        ro.observe(el);
        setPanelH(el.offsetHeight);
        return () => ro.disconnect();
    }, [open]);

    // On open: focus the first item (keyboard opens only, so a mouse open shows no ring), then bring the panel into view (only ever scrolling down)
    useEffect(() => {
        if (!open) return;
        const raf = requestAnimationFrame(() => {
            if (!openedByKeyboard.current) return;
            panelRef.current?.querySelector<HTMLAnchorElement>(`[data-menu="${open}"] a`)?.focus({ preventScroll: true });
        });
        const t = window.setTimeout(() => {
            const r = panelRef.current?.getBoundingClientRect();
            if (r && r.bottom > window.innerHeight - 16) {
                const by = Math.min(r.bottom - window.innerHeight + 24, r.top - 96);
                if (by > 0) window.scrollBy({ top: by, behavior: reduce ? 'auto' : 'smooth' });
            }
        }, reduce ? 0 : 320);
        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(t);
        };
    }, [open, reduce]);

    // Esc closes and returns focus to the folder
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || e.defaultPrevented) return;
            const active = document.activeElement;
            if (active && active !== document.body && !rootRef.current?.contains(active)) return;
            const label = open;
            setOpen(null);
            buttonRefs.current[label]?.focus({ preventScroll: true });
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    const toggle = (label: string) => setOpen((cur) => (cur === label ? null : label));
    const close = () => setOpen(null);

    // Mascot leans towards the folder in focus (hovered/focused, else the open one)
    const lean = hot ?? open;
    const leanDir = lean === 'Learn' ? -1 : lean === 'Jobs' ? 1 : 0;

    return (
        <div
            ref={rootRef}
            className="studlyf-ds relative z-10 w-full px-4 sm:px-6"
            style={{ marginTop: pullUp === null ? undefined : -pullUp }}
        >
            {/* Mascot (96px creature drawn in CSS, scaled 1.6 so it stays crisp) floats above the gap, 48px clear of the paper tops at rest: covers the 16px hover rise, the 28px open rise and its lean. It only floats upwards. */}
            <div className="pointer-events-none mb-8 flex justify-center" aria-hidden="true">
                <motion.div
                    className="flex size-40 items-center justify-center"
                    animate={{ x: reduce ? 0 : leanDir * 8, rotate: reduce ? 0 : leanDir * 6 }}
                    transition={{ type: 'spring', stiffness: 160, damping: 18 }}
                >
                    <motion.div
                        className="scale-[1.6]"
                        animate={reduce ? { y: 0 } : { y: [0, -12, 0] }}
                        transition={reduce ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        {/* The creature springs itself around on hover; its own offset is neutralised so it stays put here */}
                        <InteractiveCreature className="![transform:none]" />
                    </motion.div>
                </motion.div>
            </div>
            <nav aria-label="Explore STUDLYF" className="relative mx-auto flex max-w-[1200px] flex-col items-center justify-center gap-8 sm:flex-row sm:gap-[112px]">
                {menus.map((menu) => {
                    const isOpen = open === menu.label;
                    const state: FolderState = isOpen ? 'open' : hot === menu.label ? 'hover' : 'rest';
                    const papers: FolderPaper[] = menu.items.map((it) => ({ key: it.to, image: it.image, icon: it.icon, tint: it.tint, ink: it.ink }));
                    const count = menu.items.length;
                    return (
                        <motion.button
                            key={menu.label}
                            ref={(el: HTMLButtonElement | null) => {
                                buttonRefs.current[menu.label] = el;
                            }}
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={PANEL_ID}
                            onClick={(e) => {
                                // detail 0 = keyboard activation (Enter/Space); only then move focus into the panel
                                openedByKeyboard.current = e.detail === 0;
                                toggle(menu.label);
                            }}
                            onHoverStart={() => setHot(menu.label)}
                            onHoverEnd={() => setHot((h) => (h === menu.label ? null : h))}
                            onFocus={(e) => e.currentTarget.matches(':focus-visible') && setHot(menu.label)}
                            onBlur={() => setHot((h) => (h === menu.label ? null : h))}
                            initial={false}
                            animate={state}
                            className="group relative z-10 flex cursor-pointer flex-col items-center gap-4 rounded-ds-panel p-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ds-ring/40"
                            style={{ width: FOLDER_W + 2 * BTN_PAD }}
                        >
                            <FolderGraphic papers={papers} stickers={menu.stickers} reduce={reduce} />
                            <span className="flex h-8 items-center justify-center gap-2">
                                <span className="text-[20px] leading-8 font-semibold text-ds-foreground">{menu.label}</span>
                                <span className="flex h-6 items-center rounded-full bg-ds-muted px-3 text-[13px] leading-none font-medium text-ds-muted-foreground">
                                    {count} {menu.unit[count === 1 ? 0 : 1]}
                                </span>
                            </span>
                        </motion.button>
                    );
                })}
            </nav>

            {/* Inline panel: pushes the page down, never overlays the hero */}
            <motion.div
                id={PANEL_ID}
                ref={panelRef}
                role="region"
                aria-label={openMenu ? `${openMenu.label} menu` : 'Explore menu'}
                className="mx-auto max-w-[1008px] overflow-hidden sm:px-6"
                initial={false}
                animate={{ height: openMenu ? panelH : 0, opacity: openMenu ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 32, opacity: { duration: 0.2 } }}
            >
                <div ref={innerRef} className="pt-6 pb-12">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {openMenu && (
                            <motion.div
                                key={openMenu.label}
                                data-menu={openMenu.label}
                                className="relative rounded-ds-panel border border-ds-border bg-white p-4 shadow-ds-md sm:p-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: reduce ? 0 : 0.18 }}
                            >
                                {/* Caret pointing up at the open folder */}
                                <span
                                    aria-hidden="true"
                                    className="absolute -top-[9px] hidden size-4 -translate-x-1/2 rotate-45 rounded-tl-[4px] border-t border-l border-ds-border bg-white sm:block"
                                    style={{ left: `calc(50% ${openMenu.label === menus[0].label ? '-' : '+'} ${(FOLDER_W + 2 * BTN_PAD + GAP) / 2}px)` }}
                                />
                                <p className="ds-eyebrow mb-4">{openMenu.eyebrow}</p>
                                <motion.ul
                                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                                    initial="hidden"
                                    animate="show"
                                    variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: reduce ? 0 : 0.08 } } }}
                                >
                                    {openMenu.items.map((item) => (
                                        <motion.li
                                            key={item.to}
                                            variants={{
                                                hidden: reduce ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.96 },
                                                show: { opacity: 1, y: 0, scale: 1 },
                                            }}
                                            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
                                        >
                                            <MenuCard item={item} onNavigate={close} />
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default PurpleNavbar;
