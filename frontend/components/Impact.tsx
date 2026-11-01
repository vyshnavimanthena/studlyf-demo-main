import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import CountUp from './CountUp';

// Photo pile: position as a share of the pile, plus the tilt each print settles at
const photos = [
    { src: '/images-optimized/impact/hackathon.webp', alt: 'AI Hackathon poster with a STUDLYF organizer', caption: 'AI Hackathon', left: '2%', top: '2%', rotate: -6 },
    { src: '/images-optimized/impact/certificates.webp', alt: 'Hackathon participants posing together', caption: 'SummerSaaS 2026', left: '50%', top: '0%', rotate: 4 },
    { src: '/images-optimized/impact/mentorship.webp', alt: 'A speaker addressing a full campus auditorium', caption: 'Learn. Leap. Lead.', left: '6%', top: '53%', rotate: 3 },
    { src: '/images-optimized/impact/online_sessions.webp', alt: 'Founders and investors at a panel discussion', caption: 'Startup Expo panel', left: '52%', top: '51%', rotate: -4 },
];

const stats = [
    { number: 5000, suffix: '+', label: 'Strong community' },
    { number: 15000, suffix: '+', label: 'Students reached' },
    { number: 25, suffix: '+', label: 'Colleges partnered' },
    { number: 15, suffix: '+', label: 'Startup hiring partners' },
];

/** Prints fan out of a single stack as the section appears; hovering one straightens it and brings it to the front. */
const PhotoPile: React.FC = () => {
    const reduced = useReducedMotion() ?? false;
    return (
        <div className="relative mx-auto aspect-[1/1.12] w-full max-w-[560px]">
            {photos.map((photo, i) => (
                <motion.figure
                    key={photo.src}
                    initial={reduced ? false : { left: '27%', top: '25%', rotate: 0, opacity: 0 }}
                    whileInView={{ left: photo.left, top: photo.top, rotate: photo.rotate, opacity: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={reduced ? undefined : { rotate: 0, scale: 1.08, zIndex: 20, transition: { duration: 0.3 } }}
                    className="absolute w-[46%] rounded-md bg-white p-2 pb-0 shadow-ds-lg ring-1 ring-ds-border sm:p-2.5 sm:pb-0"
                >
                    <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="aspect-square w-full rounded-sm object-cover" />
                    <figcaption className="py-2 text-center text-xs font-semibold text-ds-muted-foreground sm:py-2.5 sm:text-sm">{photo.caption}</figcaption>
                </motion.figure>
            ))}
        </div>
    );
};

const Impact = () => {
    return (
        <section id="impact" aria-labelledby="impact-heading" className="studlyf-ds ds-section overflow-hidden bg-ds-background">
            <div className="ds-container grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                    <p className="ds-eyebrow mb-4">By the numbers</p>
                    <h2 id="impact-heading" className="ds-h2 text-ds-foreground">
                        Our <span className="ds-gradient-text">impact</span>
                    </h2>
                    <p className="ds-subline mt-4 max-w-lg">
                        Creating a global ecosystem where engineering skills meet real-world opportunities.
                    </p>

                    <dl className="mt-10">
                        <div className="flex flex-col-reverse border-b border-ds-border pb-6">
                            <dt className="mt-1 text-base text-ds-muted-foreground">Media reach</dt>
                            <dd className="text-6xl font-bold tracking-tight text-ds-foreground tabular-nums sm:text-7xl">
                                <CountUp value={1} />
                                <span className="text-ds-primary"> Lakh+</span>
                            </dd>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6">
                            {stats.map((stat) => (
                                <div key={stat.label} className="flex flex-col-reverse">
                                    <dt className="mt-1 text-[15px] text-ds-muted-foreground">{stat.label}</dt>
                                    <dd className="text-3xl font-bold tracking-tight text-ds-foreground tabular-nums sm:text-4xl">
                                        <CountUp value={stat.number} />
                                        <span className="text-ds-primary">{stat.suffix}</span>
                                    </dd>
                                </div>
                            ))}
                        </div>
                    </dl>
                </div>

                <PhotoPile />
            </div>
        </section>
    );
};

export default Impact;
