import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    { label: 'Email', href: 'mailto:support@studlyf.com', icon: <Mail className="size-5" aria-hidden="true" />, external: false },
    { label: 'WhatsApp', href: 'https://whatsapp.com/channel/0029VbCHsjAHVvTRqLfOau24/113', icon: <WhatsAppIcon size={20} />, external: true },
    { label: 'Instagram', href: 'https://www.instagram.com/studlyf.in/', icon: <Instagram className="size-5" aria-hidden="true" />, external: true },
];

const linkClass =
    'rounded-ds-control text-[15px] text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

const Footer: React.FC = () => {
    return (
        <footer className="studlyf-ds w-full bg-ds-ink pt-16 pb-10 text-white md:pt-20">
            <div className="ds-container flex flex-col gap-14">
                {/* Contact card: founder photo and "Contact us" side by side */}
                <section aria-labelledby="footer-contact-heading" className="flex flex-col gap-8 rounded-ds-panel border border-white/10 bg-white/[0.04] p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                        <img
                            src="/images-optimized/Eshwar.webp"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/Eshwar.jpg'; }}
                            alt={FOUNDER.name ? `${FOUNDER.name}, founder of STUDLYF` : 'Founder of STUDLYF'}
                            width={128}
                            height={128}
                            loading="lazy"
                            className="size-28 shrink-0 rounded-ds-card object-cover sm:size-32"
                        />
                        <div>
                            <h2 id="footer-contact-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">Contact us</h2>
                            <p className="mt-2 text-base text-white/75">Connect with our founder. We&rsquo;re here to help, anytime.</p>
                            {FOUNDER.name && (
                                <p className="mt-3 text-[15px] text-white">
                                    {FOUNDER.link ? (
                                        <a href={FOUNDER.link} target="_blank" rel="noreferrer" className="font-semibold underline-offset-4 hover:underline">
                                            {FOUNDER.name}
                                        </a>
                                    ) : (
                                        <span className="font-semibold">{FOUNDER.name}</span>
                                    )}
                                    {FOUNDER.title && <span className="text-white/70">, {FOUNDER.title}</span>}
                                </p>
                            )}
                        </div>
                    </div>

                    <ul className="flex flex-wrap items-center justify-center gap-3">
                        {contactLinks.map((c) => (
                            <li key={c.label}>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 focus-visible:ring-white/40"
                                >
                                    <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                                        {c.icon}
                                        {c.label}
                                    </a>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
                        <Link to="/" className="flex w-fit items-center gap-2.5 rounded-ds-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                            <img src="/stud.png" alt="" width={40} height={40} className="size-10" />
                            <span className="text-xl font-bold tracking-tight">STUDLYF</span>
                        </Link>
                        <p className="max-w-xs text-[15px] leading-relaxed text-white/70">
                            Empowering the next generation of engineers with AI-driven career tools and resources.
                        </p>
                    </div>

                    {columns.map((col) => (
                        <nav key={col.heading} aria-labelledby={`footer-${col.heading.toLowerCase()}`}>
                            <h3 id={`footer-${col.heading.toLowerCase()}`} className="mb-4 text-[15px] font-semibold text-white">
                                {col.heading}
                            </h3>
                            <ul className="flex flex-col gap-3">
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

                <div>
                    <Separator className="bg-white/10" />
                    <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
                        <p className="text-sm text-white/60">
                            &copy; {new Date().getFullYear()} STUDLYF. All rights reserved.
                        </p>
                        <ul className="flex items-center gap-6">
                            <li><Link to="/privacy" className={linkClass}>Privacy policy</Link></li>
                            <li><Link to="/terms" className={linkClass}>Terms &amp; conditions</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
