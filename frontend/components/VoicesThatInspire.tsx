import React from 'react';
import CurvedGallery from './leaders/CurvedGallery';
import LeaderQuoteDialog from './leaders/LeaderQuoteDialog';
import LeadersRow from './leaders/LeadersRow';

const DESKTOP = '(min-width: 768px)';

const useIsDesktop = () => {
    const [matches, setMatches] = React.useState(() => typeof window === 'undefined' || window.matchMedia(DESKTOP).matches);
    React.useEffect(() => {
        const mq = window.matchMedia(DESKTOP);
        const onChange = () => setMatches(mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return matches;
};

const VoicesThatInspire: React.FC = () => {
    const isDesktop = useIsDesktop();
    const [open, setOpen] = React.useState<number | null>(null);
    const opener = React.useRef<HTMLElement | null>(null);
    const openQuote = React.useCallback((index: number, el: HTMLElement) => {
        opener.current = el;
        setOpen(index);
    }, []);

    return (
        <section aria-labelledby="voices-heading" className="studlyf-ds relative overflow-hidden bg-ds-background pt-[72px] pb-[72px] md:pt-[96px] md:pb-[88px] lg:pt-[120px] lg:pb-[104px]">
            <div className="ds-container mb-8 text-center md:mb-4">
                <p className="ds-eyebrow mb-4">Words that inspire us</p>
                <h2 id="voices-heading" className="ds-h2 mx-auto max-w-3xl text-ds-foreground">
                    Lessons from leaders we <span className="ds-gradient-text">admire</span>
                </h2>
                <p className="ds-subline mx-auto mt-4 max-w-2xl text-balance">
                    Public quotes from industry leaders that shape how we teach. They are not STUDLYF mentors.
                </p>
            </div>

            {isDesktop ? (
                <CurvedGallery onOpen={openQuote} paused={open !== null} />
            ) : (
                <LeadersRow onOpen={openQuote} />
            )}

            <p className="mt-2 text-center text-[13px] text-ds-subtle-foreground">
                {isDesktop ? 'Drag to explore. Select a portrait to read the quote.' : 'Swipe to explore. Tap a portrait to read the quote.'}
            </p>

            <LeaderQuoteDialog index={open} onClose={() => setOpen(null)} returnFocusTo={opener} />
        </section>
    );
};

export default VoicesThatInspire;
