import React, { useState } from 'react';
import { Briefcase, GraduationCap, Building2, ArrowRight, Check, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/* Small product previews, one per audience. Static markup in DS tokens; they lift slightly on card hover. */
const StudentVisual = () => (
    <div className="w-[250px] rounded-xl bg-white p-3.5 shadow-ds-md ring-1 ring-ds-border transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-1">
        <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-ds-primary text-xs font-bold text-white">AM</span>
            <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight text-ds-foreground">Aarav Mehta</p>
                <p className="text-xs text-ds-subtle-foreground">Backend lead · CampusRide</p>
            </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
            {['FastAPI', 'MongoDB', 'React'].map((t) => (
                <span key={t} className="rounded-md bg-ds-muted px-2 py-0.5 text-[11px] font-medium text-ds-muted-foreground">{t}</span>
            ))}
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <Check className="size-3" strokeWidth={3} aria-hidden="true" /> Confirmed by 2 teammates
        </p>
    </div>
);

const InstitutionVisual = () => (
    <div className="w-[250px] rounded-xl bg-white p-3.5 shadow-ds-md ring-1 ring-ds-border transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-1">
        <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ds-foreground">Build Sprint · Results</p>
            <span className="rounded-full bg-ds-lavender px-2 py-0.5 text-[10px] font-semibold text-ds-primary">Published</span>
        </div>
        <ol className="mt-3 flex flex-col gap-1.5">
            {[
                ['1', 'CampusRide', '8.5', 'bg-amber-100 text-amber-800'],
                ['2', 'StudyBuddy AI', '7.0', 'bg-slate-100 text-slate-600'],
                ['3', 'GreenPlate', '5.5', 'bg-orange-100 text-orange-800'],
            ].map(([rank, name, score, tone]) => (
                <li key={rank} className="flex items-center gap-2 text-xs">
                    <span className={cn('flex size-5 items-center justify-center rounded-md text-[10px] font-bold', tone)}>{rank}</span>
                    <span className="flex-1 font-medium text-ds-foreground">{name}</span>
                    <span className="font-semibold tabular-nums text-ds-muted-foreground">{score}</span>
                </li>
            ))}
        </ol>
    </div>
);

const RecruiterVisual = () => (
    <div className="w-[250px] rounded-xl bg-white p-3.5 shadow-ds-md ring-1 ring-ds-border transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-1">
        <div className="flex items-center gap-2 rounded-lg bg-ds-muted px-2.5 py-1.5 text-xs text-ds-subtle-foreground">
            <Search className="size-3.5" aria-hidden="true" /> react developer
        </div>
        <div className="mt-3 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white">PR</span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-ds-foreground">Priya Raman</p>
                <p className="text-xs text-ds-subtle-foreground">React · 2 projects</p>
            </div>
            <span className="rounded-md bg-ds-primary px-2.5 py-1 text-[11px] font-semibold text-white">Invite</span>
        </div>
    </div>
);

// Ordered along the journey: students build, institutions run events, recruiters hire
const cardData = [
    {
        key: "Students",
        title: "Students",
        tagline: "Build real projects and get noticed for them.",
        icon: GraduationCap,
        visual: StudentVisual,
        bullets: [
            "Learn by building real-world projects",
            "Career-focused roadmaps & mentorship",
            "Mock interviews & AI feedback system"
        ],
    },
    {
        key: "Institutions",
        title: "Institutions",
        tagline: "Run hackathons and lift placement outcomes.",
        icon: Building2,
        visual: InstitutionVisual,
        bullets: [
            "Host hackathons and publish judged results",
            "Live practice & project-based modules",
            "Placement-driven learning ecosystem"
        ],
    },
    {
        key: "Recruiters",
        title: "Recruiters",
        tagline: "Hire on proven work, not just resumes.",
        icon: Briefcase,
        visual: RecruiterVisual,
        bullets: [
            "Find builders with verified projects",
            "Share shortlists with your hiring team",
            "AI-powered assessment & hiring support"
        ],
    }
];

type ModalDataInfo = {
    heading: string;
    subheading: string;
    features: { title: string; desc: string; }[];
};

const modalData: Record<string, ModalDataInfo> = {
    "Recruiters": {
        heading: "How STUDLYF Helps Recruiters and Startups",
        subheading: "Build stronger talent pipelines and engage ambitious student communities.",
        features: [
            { title: "Hackathons & Innovation Challenges", desc: "Conduct startup-sponsored hackathons and idea challenges." },
            { title: "Opportunity Distribution", desc: "Share internships, jobs, gigs, startup opportunities, and campus hiring." },
            { title: "Community Access", desc: "Get visibility among ambitious builders and student communities." },
            { title: "Product Testing & Validation", desc: "Test ideas, gather feedback, and validate products with students." },
            { title: "Brand Visibility", desc: "Build startup awareness among future talent." },
            { title: "Talent Discovery", desc: "Find students interested in internships and projects." }
        ]
    },
    "Students": {
        heading: "What STUDLYF Gives Students",
        subheading: "A complete ecosystem to grow beyond academics.",
        features: [
            { title: "Industry-Level Learning", desc: "Learn real-world skills." },
            { title: "Internships & Opportunities", desc: "Discover career pathways." },
            { title: "Projects & Open Source", desc: "Build practical experience." },
            { title: "Mentorship", desc: "Learn from experts." },
            { title: "Networking & Events", desc: "Join hackathons and sessions." },
            { title: "Career Readiness", desc: "Resume, portfolio, placements." }
        ]
    },
    "Institutions": {
        heading: "How STUDLYF Supports Institutions",
        subheading: "Enable better student outcomes and engagement.",
        features: [
            { title: "Student Upskilling", desc: "Industry-ready learning programs." },
            { title: "Hackathons & Campus Events", desc: "Collaborative engagement activities." },
            { title: "Placement Readiness", desc: "Career-focused student development." },
            { title: "Skill Development Ecosystem", desc: "Bridge academia and industry." },
            { title: "Workshops & Sessions", desc: "Practical exposure." },
            { title: "Student Opportunities", desc: "Access internships and career programs." }
        ]
    }
};

const WhoWeServe: React.FC = () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const modal = activeModal ? modalData[activeModal] : null;

    const handleContactClick = () => {
        setActiveModal(null);
        // Let the dialog close before scrolling
        setTimeout(() => {
            document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
    };

    return (
        <section aria-labelledby="who-we-serve-heading" className="studlyf-ds ds-section bg-ds-background">
            <div className="ds-container">
                <header className="mx-auto mb-12 max-w-3xl text-center md:mb-14">
                    <p className="ds-eyebrow mb-4">Built for</p>
                    <h2 id="who-we-serve-heading" className="ds-h2 text-ds-foreground">
                        Who we <span className="ds-gradient-text">serve</span>
                    </h2>
                </header>

                <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-3">
                    {cardData.map((card) => (
                        <button
                            key={card.key}
                            type="button"
                            onClick={() => setActiveModal(card.key)}
                            className="group flex flex-col overflow-hidden rounded-[20px] bg-white text-left ring-1 ring-ds-border transition-all duration-300 hover:-translate-y-1 hover:shadow-ds-lg hover:ring-ds-primary/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-ring"
                        >
                            {/* Preview panel: what this audience actually sees in STUDLYF */}
                            <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden bg-ds-lavender">
                                <div aria-hidden="true" className="absolute -top-16 -right-16 size-48 rounded-full bg-ds-lavender-strong" />
                                <div aria-hidden="true" className="relative">
                                    <card.visual />
                                </div>
                            </div>
                            <div className="flex w-full flex-1 flex-col p-7">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-ds-lavender-strong text-ds-primary">
                                        <card.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                                    </span>
                                    <h3 className="text-xl font-bold text-ds-foreground">{card.title}</h3>
                                </div>
                                <p className="mt-3 text-base font-medium text-ds-foreground">{card.tagline}</p>
                                <ul className="mt-4 flex flex-1 flex-col gap-2.5">
                                    {card.bullets.map((bullet) => (
                                        <li key={bullet} className="flex items-start gap-2.5 text-[15px] leading-snug text-ds-muted-foreground">
                                            <Check className="mt-0.5 size-4 shrink-0 text-ds-primary" strokeWidth={2.5} aria-hidden="true" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ds-primary">
                                    See what {card.title.toLowerCase()} get
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <Dialog open={!!modal} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="max-w-4xl p-6 sm:p-10">
                    {modal && (
                        <>
                            <DialogHeader className="items-center pr-0 text-center">
                                <DialogTitle className="ds-h2 text-[28px] sm:text-4xl">{modal.heading}</DialogTitle>
                                <DialogDescription className="ds-subline mt-1 max-w-2xl">{modal.subheading}</DialogDescription>
                            </DialogHeader>
                            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {modal.features.map((feature) => (
                                    <li key={feature.title} className="flex flex-col gap-3 rounded-ds-card border border-ds-border bg-ds-lavender p-5">
                                        <CheckCircle2 className="size-6 text-ds-primary" aria-hidden="true" />
                                        <div>
                                            <h3 className="mb-1 text-base font-semibold leading-snug">{feature.title}</h3>
                                            <p className="text-sm leading-relaxed text-ds-muted-foreground">{feature.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 flex justify-center">
                                <Button size="lg" className="group" onClick={handleContactClick}>
                                    Contact us
                                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default WhoWeServe;
