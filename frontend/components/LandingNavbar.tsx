import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const sections = [
    { href: '#platform', label: 'Platform' },
    { href: '#who-its-for', label: "Who it's for" },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#community', label: 'Community' },
    { href: '#faq', label: 'FAQ' },
];

/** Landing top bar: compact wordmark (no box), section links on desktop and a "Sign in" button, vertically centred in a 64–72px bar. */
const LandingNavbar: React.FC = () => {
    return (
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-[100] flex h-16 items-center justify-between px-4 sm:px-8 md:h-[72px]">
            <Link
                to="/"
                className="pointer-events-auto rounded-ds-control outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-ring"
            >
                <img
                    src="/images-optimized/studlyf_secondary.webp"
                    alt="STUDLYF home"
                    width={133}
                    height={44}
                    className="h-9 w-auto md:h-11"
                />
            </Link>

            <nav aria-label="Page sections" className="pointer-events-auto hidden items-center gap-1 rounded-full border border-ds-border bg-white/80 p-1 backdrop-blur-sm lg:flex">
                {sections.map((s) => (
                    <a
                        key={s.href}
                        href={s.href}
                        onClick={(e) => {
                            // Router-managed scroll resets ignore plain hash links, so scroll explicitly.
                            e.preventDefault();
                            document.getElementById(s.href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="rounded-full px-4 py-1.5 text-sm font-medium text-ds-muted-foreground transition-colors hover:bg-ds-lavender hover:text-ds-foreground focus-visible:outline-2 focus-visible:outline-ds-ring"
                    >
                        {s.label}
                    </a>
                ))}
            </nav>

            <Button asChild variant="outline" className="pointer-events-auto rounded-ds-control bg-white/80 backdrop-blur-sm">
                <Link to="/login">Sign in</Link>
            </Button>
        </div>
    );
};

export default LandingNavbar;
