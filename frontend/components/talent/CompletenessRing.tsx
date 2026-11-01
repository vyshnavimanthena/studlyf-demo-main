import React from 'react';
import { cn } from '../../lib/utils';

export type CompletenessSection = { key: string; label: string; done: boolean; weight: number; hint: string; module: string };
export type Completeness = { score: number; sections: CompletenessSection[] };

/** Circular progress for the profile completeness score (0-100). */
const CompletenessRing: React.FC<{ score: number; size?: number; stroke?: number; className?: string; label?: string }> = ({
    score, size = 112, stroke = 10, className, label = 'Profile strength',
}) => {
    const value = Math.max(0, Math.min(100, Math.round(score)));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    return (
        <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${value}%`}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--ds-muted)" strokeWidth={stroke} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--ds-primary)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - value / 100)}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className={cn('font-bold tracking-tight text-ds-foreground', size >= 96 ? 'text-2xl' : 'text-sm')}>{value}%</span>
            </span>
        </div>
    );
};

export default CompletenessRing;
