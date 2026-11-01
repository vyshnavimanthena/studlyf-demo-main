import React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const learningMethods = [
    { old: 'Syntax memorization', new: 'Practical problem solving' },
    { old: 'Passive watching', new: 'Active hands-on learning' },
    { old: 'Theory over practice', new: 'Career-focused paths' },
    { old: 'One-size-fits-all', new: 'Personalized skill mapping' },
    { old: 'No real feedback', new: 'AI-guided feedback' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** One swap: as the row scrolls into view, a line strikes through the old way and the new way rises in beside it. */
const SwapRow: React.FC<{ item: (typeof learningMethods)[number]; index: number }> = ({ item, index }) => {
    const reduced = useReducedMotion() ?? false;
    const ref = React.useRef<HTMLLIElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.8 });
    const on = reduced || inView;

    return (
        <li ref={ref} className="grid grid-cols-[32px_1fr] items-baseline gap-x-3 border-t border-ds-border py-5 first:border-t-0 md:grid-cols-[48px_1fr_40px_1.2fr] md:gap-x-4 md:py-7">
            <span aria-hidden="true" className="text-sm font-semibold text-ds-subtle-foreground tabular-nums">0{index + 1}</span>

            <p className="text-base font-medium text-ds-subtle-foreground md:text-xl">
                <span className="sr-only">Old way: </span>
                <span className="relative inline-block">
                    {item.old}
                    <motion.span
                        aria-hidden="true"
                        initial={false}
                        animate={{ scaleX: on ? 1 : 0 }}
                        transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
                        className="absolute top-[55%] left-0 h-[2px] w-full origin-left rounded-full bg-ds-primary/60"
                    />
                </span>
            </p>

            <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ opacity: on ? 1 : 0, x: on ? 0 : -8 }}
                transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.35 }}
                className="hidden self-center text-ds-primary md:block"
            >
                <ArrowRight className="size-5" />
            </motion.span>

            <span className="col-start-2 block overflow-hidden pb-1 md:col-start-auto">
                <motion.span
                    initial={false}
                    animate={{ y: on ? 0 : '110%', opacity: on ? 1 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.4, ease: EASE }}
                    className="mt-1 block text-[22px] leading-tight font-bold tracking-tight text-ds-foreground md:mt-0 md:text-[32px]"
                >
                    <span className="sr-only">The STUDLYF way: </span>
                    {item.new}
                </motion.span>
            </span>
        </li>
    );
};

const OldVsNewSection: React.FC = () => (
    <section aria-labelledby="old-vs-new-heading" className="studlyf-ds bg-ds-background pb-[72px] md:pb-[96px] lg:pb-[120px]">
        <div className="ds-container">
            <header className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
                <p className="ds-eyebrow mb-4">Old way vs new way</p>
                <h2 id="old-vs-new-heading" className="ds-h2 text-ds-foreground">
                    The era of human <span className="ds-gradient-text">authority</span>
                </h2>
                <p className="ds-subline mt-4">From outdated methods to intelligent, outcome-driven learning.</p>
            </header>

            <ol className="mx-auto max-w-[1040px]">
                {learningMethods.map((item, i) => (
                    <SwapRow key={item.old} item={item} index={i} />
                ))}
            </ol>
        </div>
    </section>
);

export default OldVsNewSection;
