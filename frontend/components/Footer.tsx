import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const WhatsAppIcon = ({ size = 22 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

/**
 * Founder details for the contact card. Slots render only when filled in;
 * name and profile link are pending from the STUDLYF team (see tasks.md).
 */
const FOUNDER: { name?: string; title?: string; link?: string } = {
    name: undefined,
    title: undefined,
    link: undefined,
};

type FooterLink = { label: string; to?: string; href?: string };

const columns: { heading: string; links: FooterLink[] }[] = [
    {
        heading: 'Learn',
        links: [
            { label: 'Courses', to: '/learn/courses-overview' },
            { label: 'Company modules', to: '/learn/company-modules' },
            { label: 'AI tools', to: '/ai-tools' },
            { label: 'Resources', to: '/roadmaps' },
            { label: 'Blogs', to: '/blog' },
        ],
    },
    {
        heading: 'Career',
        links: [
            { label: 'Portfolio', to: '/job-prep/portfolio' },
            { label: 'Resume', to: '/job-prep/resume-builder' },
            { label: 'Skills assessment', to: '/learn/assessment-intro' },
            { label: 'Interviews', to: '/job-prep/mock-interview' },
            { label: 'Projects', to: '/job-prep/projects' },
        ],
    },
    {
        heading: 'Company',
        links: [
            { label: 'About', to: '/about' },
            { label: 'Contact us', href: 'mailto:support@studlyf.com' },
        ],
    },
];

const contactLinks = [
    { label: 'Email', href: 'mailto:support@studlyf.com', icon: <Mail className="size-4" aria-hidden="true" />, external: false },
    { label: 'WhatsApp', href: 'https://whatsapp.com/channel/0029VbCHsjAHVvTRqLfOau24/113', icon: <WhatsAppIcon size={16} />, external: true },
    { label: 'Instagram', href: 'https://www.instagram.com/studlyf.in/', icon: <Instagram className="size-4" aria-hidden="true" />, external: true },
];

const linkClass =
    'rounded-ds-control text-sm text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

const Footer: React.FC = () => {
    return (
        <footer className="studlyf-ds w-full bg-ds-ink pt-10 pb-5 text-white">
            <div className="ds-container">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
                    <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
                        <Link to="/" className="flex w-fit items-center gap-2 rounded-ds-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                            <img src="/stud.png" alt="" width={28} height={28} className="size-7" />
                            <span className="text-lg font-bold tracking-tight">STUDLYF</span>
                        </Link>
                        <p className="max-w-[280px] text-sm leading-relaxed text-white/70">
                            Empowering the next generation of engineers with AI-driven career tools and resources.
                        </p>
                        {/* Founder and the three ways to reach us */}
                        <div className="flex items-center gap-2">
                            {/* The source photo is a wide shot, so zoom in on the founder */}
                            <span className="mr-1 size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
                                <img
                                    src="/images-optimized/Eshwar.webp"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/Eshwar.jpg'; }}
                                    alt={FOUNDER.name ? `${FOUNDER.name}, founder of STUDLYF` : 'Founder of STUDLYF'}
                                    width={36}
                                    height={36}
                                    loading="lazy"
                                    className="size-full origin-[50%_42%] scale-[2.4] object-cover"
                                />
                            </span>
                            {contactLinks.map((c) => (
                                <a
                                    key={c.label}
                                    href={c.href}
                                    aria-label={c.label}
                                    title={c.label}
                                    {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                                    className="flex size-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    {c.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {columns.map((col) => (
                        <nav key={col.heading} aria-labelledby={`footer-${col.heading.toLowerCase()}`}>
                            <h3 id={`footer-${col.heading.toLowerCase()}`} className="mb-2.5 text-sm font-semibold text-white">
                                {col.heading}
                            </h3>
                            <ul className="flex flex-col gap-1.5">
                                {col.links.map((l) => (
                                    <li key={l.label}>
                                        {l.to ? (
                                            <Link to={l.to} className={linkClass}>{l.label}</Link>
                                        ) : (
                                            <a href={l.href} className={linkClass}>{l.label}</a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <Separator className="mt-7 bg-white/10" />
                <div className="flex flex-col items-center justify-between gap-2 pt-4 sm:flex-row">
                    <p className="text-[13px] text-white/60">
                        &copy; {new Date().getFullYear()} STUDLYF. All rights reserved.
                    </p>
                    <ul className="flex items-center gap-5">
                        <li><Link to="/privacy" className={linkClass}>Privacy policy</Link></li>
                        <li><Link to="/terms" className={linkClass}>Terms &amp; conditions</Link></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
