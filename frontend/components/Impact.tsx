import React from 'react';
import CountUp from './CountUp';
import { cn } from '@/lib/utils';

const images = [
    { src: '/images-optimized/impact/hackathon.webp', alt: 'STUDLYF hackathon' },
    { src: '/images-optimized/impact/certificates.webp', alt: 'Certificates' },
    { src: '/images-optimized/impact/mentorship.webp', alt: 'Mentorship session' },
    { src: '/images-optimized/impact/online_sessions.webp', alt: 'Online sessions' },
];

const stats = [
    { number: 5000, suffix: '+', label: 'Strong community' },
    { number: 15000, suffix: '+', label: 'Students reached' },
    { number: 25, suffix: '+', label: 'Colleges partnered' },
    { number: 15, suffix: '+', label: 'Startup hiring partners' },
    // Shown as the full-width card so five stats never leave an orphan.
    { number: 1, suffix: ' Lakh+', label: 'Media reach', wide: true },
];

const Impact = () => {
    return (
        <section id="impact" aria-labelledby="impact-heading" className="studlyf-ds ds-section bg-ds-background">
            <div className="ds-container grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Collage: four equal tiles on a shared grid, no fades or float offsets */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {images.map((img) => (
                        <div key={img.src} className="aspect-[4/5] overflow-hidden rounded-ds-card bg-ds-muted shadow-ds-sm">
                            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        </div>
                    ))}
                </div>

                <div>
                    <p className="ds-eyebrow mb-4">By the numbers</p>
                    <h2 id="impact-heading" className="ds-h2 text-ds-foreground">
                        Our <span className="ds-gradient-text">impact</span>
                    </h2>
                    <p className="ds-subline mt-4 max-w-lg">
                        Creating a global ecosystem where engineering skills meet real-world opportunities.
                    </p>

                    <dl className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className={cn(
                                    'flex flex-col-reverse justify-end gap-1 rounded-ds-card bg-ds-ink p-5 text-white shadow-ds-md sm:p-6',
                                    stat.wide && 'col-span-2 bg-ds-primary',
                                )}
                            >
                                <dt className="text-[15px] text-white/90">{stat.label}</dt>
                                <dd className="text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                                    <CountUp value={stat.number} />
                                    <span className={stat.wide ? 'text-white' : 'text-[#a98bff]'}>{stat.suffix}</span>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
};

export default Impact;
