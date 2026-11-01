import React from 'react';
import { cn } from '@/lib/utils';
import type { Leader } from './leaders';

export const curly = (text: string) => text.replace(/'/g, '’');

export const tileNumber = (index: number) => `#${String(index + 1).padStart(2, '0')}`;

const initials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2);

interface LeaderPhotoProps {
    leader: Leader;
    className?: string;
    eager?: boolean;
}

/** Portrait, with an initials panel if the remote photo fails to load (initials hide under the gallery's quote preview). */
const LeaderPhoto: React.FC<LeaderPhotoProps> = ({ leader, className, eager }) => {
    const [failed, setFailed] = React.useState(false);

    if (failed) {
        return (
            <span
                aria-hidden
                className={cn(
                    'flex h-full w-full select-none items-center justify-center bg-[linear-gradient(160deg,#8b6cf5_0%,#6d3ff0_45%,#3a1f9e_100%)] text-[56px] font-semibold tracking-[-0.03em] text-white/90',
                    className,
                )}
            >
                <span className="transition-opacity duration-200 group-data-[active=true]/tile:opacity-0 motion-reduce:transition-none">
                    {initials(leader.name)}
                </span>
            </span>
        );
    }

    return (
        <img
            src={leader.image}
            alt=""
            draggable={false}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            className={cn('h-full w-full select-none object-cover', className)}
            onError={() => setFailed(true)}
        />
    );
};

export default LeaderPhoto;
