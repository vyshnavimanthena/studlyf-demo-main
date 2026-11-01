import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
    /** Final value. This is what renders by default (first paint, screenshots, no-JS, reduced motion). */
    value: number;
    /** Optional formatter; defaults to locale grouping (5,000). */
    format?: (n: number) => string;
    /** Animation length in ms. */
    duration?: number;
    className?: string;
}

const defaultFormat = (n: number) => n.toLocaleString('en-IN');

/**
 * Renders the final number immediately. As a progressive enhancement, when the
 * element scrolls into view it briefly counts up from 60% of the value, so it
 * never shows 0. Skipped entirely under prefers-reduced-motion.
 */
const CountUp: React.FC<CountUpProps> = ({ value, format = defaultFormat, duration = 1200, className }) => {
    const [display, setDisplay] = useState(value);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        setDisplay(value);
        const el = ref.current;
        if (!el || value < 10 || typeof IntersectionObserver === 'undefined') return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

        let raf = 0;
        let started = false;
        const io = new IntersectionObserver(
            (entries) => {
                if (started || !entries.some((e) => e.isIntersecting)) return;
                started = true;
                io.disconnect();
                const from = Math.floor(value * 0.6);
                const start = performance.now();
                const tick = (now: number) => {
                    const t = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - t, 3);
                    setDisplay(t >= 1 ? value : Math.round(from + (value - from) * eased));
                    if (t < 1) raf = requestAnimationFrame(tick);
                };
                raf = requestAnimationFrame(tick);
            },
            { threshold: 0.6 },
        );
        io.observe(el);
        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
            setDisplay(value);
        };
    }, [value, duration]);

    return (
        <span ref={ref} className={className}>
            {format(display)}
        </span>
    );
};

export default CountUp;
