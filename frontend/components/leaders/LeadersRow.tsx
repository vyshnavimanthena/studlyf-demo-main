import React from 'react';
import LeaderPhoto, { tileNumber } from './LeaderPhoto';
import { leaders } from './leaders';

/** Small screens: a plain horizontal snap row, no 3D. */
const LeadersRow: React.FC<{ onOpen: (index: number, opener: HTMLElement) => void }> = ({ onOpen }) => (
    <ul
        aria-label="Leaders’ quotes"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingInline: 16 }}
    >
        {leaders.map((leader, i) => (
            <li key={leader.name} className="w-[64vw] max-w-[240px] flex-shrink-0 snap-start">
                <button
                    type="button"
                    aria-label={`Quote from ${leader.name}`}
                    onClick={(e) => onOpen(i, e.currentTarget)}
                    className="block aspect-[196/268] w-full overflow-hidden rounded-[20px] bg-ds-muted shadow-[0_1px_2px_rgb(20_16_43/0.08),0_14px_32px_-14px_rgb(20_16_43/0.35)] outline-none ring-1 ring-ds-ink/[0.06] focus-visible:ring-[3px] focus-visible:ring-ds-ring"
                >
                    <LeaderPhoto leader={leader} />
                </button>
                <div aria-hidden className="mt-3 text-center">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-ds-primary tabular-nums">{tileNumber(i)}</p>
                    <p className="mt-1 truncate text-[15px] font-semibold leading-snug text-ds-foreground">{leader.name}</p>
                    <p className="truncate text-[13px] leading-snug text-ds-muted-foreground">{leader.role}</p>
                </div>
            </li>
        ))}
    </ul>
);

export default LeadersRow;
