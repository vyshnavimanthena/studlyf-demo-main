import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Instagram, Linkedin, Share2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface ResourceItem {
    slug: string;
    type: string;
    title: string;
    desc: string;
    image: string;
    overview: string;
    whyItMatters: string[];
    takeaways: string[];
    impact: string;
}

const resources: ResourceItem[] = [
    {
        slug: 'elm-graduate-program',
        type: 'CASE STUDY',
        title: 'Elm Partners with Studlyf to Build a Graduate Development Program',
        desc: 'How modern graduate development programs are redesigned using rapid feedback systems and experiential learning.',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
        overview: 'Traditional graduate programs rely heavily on passive, slide-based training that delays time-to-value. Elm partnered with Studlyf to fundamentally rethink their graduate onboarding. By implementing an experiential learning platform powered by rapid prototyping and live feedback loops, Elm transitioned their training into a project-driven curriculum. This paradigm shift empowered new hires to deploy robust, production-ready code weeks ahead of schedule.',
        whyItMatters: [
            'Replaces passive consumption with active, project-based learning for higher retention.',
            'Accelerates the time-to-value for new engineering hires by immersing them in real codebases.',
            'Creates continuous, real-time feedback loops via integrated AI mentors, reducing senior developer burden.'
        ],
        takeaways: ['Experiential learning', 'Live feedback', 'Accelerated onboarding'],
        impact: 'Within the first cohort, graduate engineers began committing production-ready code 40% faster. Furthermore, 90-day retention and engagement metrics showed a 25% improvement over previous years.'
    },
    {
        slug: 'generative-ai-playbook',
        type: 'REPORT',
        title: 'Generative AI Leadership Playbook',
        desc: 'Strategic frameworks and tactical steps for product teams adopting AI-powered workflows.',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
        overview: 'As AI transitions from experimental novelty to business-critical infrastructure, data-driven leaders are forced to rethink their product strategies. This comprehensive playbook distills complex market signals into tactical implementation steps. It provides governance models and execution frameworks for product teams looking to safely and effectively integrate AI-powered workflows into their daily operations.',
        whyItMatters: [
            'Bridges the crucial gap between AI hype and practical, scalable product integration.',
            'Establishes clear, actionable frameworks for measuring tangible Return on Investment (ROI) for AI initiatives.',
            'Provides strict security and compliance guardrails necessary for safe enterprise deployment.'
        ],
        takeaways: ['Strategic integration', 'ROI frameworks', 'Enterprise security'],
        impact: 'Early adopting teams utilizing these frameworks successfully reduced their AI integration timelines by 50%, all while navigating strict enterprise compliance standards without a single breach.'
    },
    {
        slug: 'siemens-data-empowerment',
        type: 'CASE STUDY',
        title: "Studlyf's Data Empowerment Initiative at Siemens",
        desc: 'Transforming how engineering teams make data-driven decisions through contextual collaboration.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
        overview: 'Siemens Smart Infrastructure sought to democratize data across its highly siloed manufacturing departments. Partnering with Studlyf, they launched a comprehensive Data Empowerment initiative. By combining advanced analytics education with intuitive contextual collaboration tools, Siemens transformed how their engineers interact with data, shifting from centralized reporting to decentralized, real-time decision-making.',
        whyItMatters: [
            'Democratizes critical data access across previously isolated manufacturing and engineering departments.',
            'Equips non-technical field teams with the foundational analytics skills needed to interpret complex data.',
            'Drives decentralized, highly accurate decision-making directly at the edge of operations.'
        ],
        takeaways: ['Data democratization', 'Cross-functional analytics', 'Decentralized decisions'],
        impact: 'Over 500 engineers were upskilled within six months, directly leading to a measurable 15% increase in predictive maintenance efficiency and significantly reduced operational downtime.'
    },
    {
        slug: 'ai-agents-capabilities',
        type: 'WEBINAR',
        title: 'What AI Agents can and can not do',
        desc: 'A definitive guide cutting through the noise surrounding agentic workflows and capabilities.',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
        overview: 'The hype surrounding autonomous agents has created significant misalignment between business expectations and technical reality. This definitive guide cuts through the noise to explore the genuine capabilities of agentic workflows today. We unpack current technical limitations, discuss the necessity of human-in-the-loop safeguards, and identify the ideal scenarios where human-AI collaboration truly shines in modern software development.',
        whyItMatters: [
            'Provides product and engineering leaders with realistic expectations for autonomous agent performance.',
            'Highlights critical failure modes and the necessity of designing robust human-in-the-loop safeguards.',
            'Maps out a pragmatic trajectory of agent capabilities and evolution over the next 24 months.'
        ],
        takeaways: ['Realistic capabilities', 'Human-in-the-loop', 'Future trajectories'],
        impact: 'By leveraging this guide, engineering teams can accurately scope and prioritize AI projects, preventing costly architectural mistakes and misalignment between technical delivery and business goals.'
    },
    {
        slug: 'mcp-explained',
        type: 'CASE STUDY',
        title: 'How Agentic AI works: MCP explained',
        desc: 'A deep dive into the underlying architecture of modern agent orchestration.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4628c9757?auto=format&fit=crop&q=80&w=1400',
        overview: 'As AI agents become more prevalent, the challenge of connecting them securely to enterprise data has emerged as a major bottleneck. This deep dive explores the Model Context Protocol (MCP)—the underlying architecture of modern agent orchestration. We demonstrate how standardized, secure context sharing simplifies complex business processes and allows agents to reason over proprietary data while keeping human operators firmly in control.',
        whyItMatters: [
            'Standardizes the complex integration patterns of how AI models interact with disparate, secure data sources.',
            'Significantly reduces the engineering integration burden and boilerplate code for enterprise AI deployments.',
            "Ensures consistent, predictable, and secure context sharing across a company's entire application ecosystem."
        ],
        takeaways: ['Model Context Protocol', 'Secure data integration', 'Standardized architecture'],
        impact: 'Developers can now rapidly deploy interconnected, intelligent AI agents that seamlessly and securely access internal company data, drastically reducing integration overhead from weeks to days.'
    },
    {
        slug: '2025-ai-work-report',
        type: 'MEDIA',
        title: '2025 State of AI at work report',
        desc: 'A comprehensive snapshot covering AI adoption, skills demand, and workplace transformation.',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200',
        overview: 'Drawing on survey data from over 10,000 technology professionals and engineering leaders, this exhaustive report provides a definitive snapshot of the modern workplace. It covers accelerating AI adoption rates, shifting demands for new technical skills, and comprehensive forecasts for workplace transformation. It serves as a vital compass for organizations navigating the unprecedented shift brought on by generative AI.',
        whyItMatters: [
            'Identifies the most valuable and highly sought-after skills for the future engineering and product workforce.',
            'Quantifies the actual, measurable productivity gains achieved by early enterprise AI adopters.',
            'Reveals the most common organizational and technical obstacles to scaling AI across large enterprises.'
        ],
        takeaways: ['Adoption trends', 'Skills forecasting', 'Productivity metrics'],
        impact: 'This report provides actionable intelligence for talent acquisition and organizational development leaders, allowing them to proactively future-proof their workforce strategies and training programs.'
    }
];

// One tag style for every resource type; data keeps its original uppercase values.
const typeLabel = (type: string) => type.charAt(0) + type.slice(1).toLowerCase();

const ResourceCenter: React.FC = () => {
    const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);

    // Deep linking: ?resource=<slug> opens that resource
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const resourceSlug = params.get('resource');
        if (resourceSlug) {
            const found = resources.find(r => r.slug === resourceSlug);
            if (found) {
                setSelectedResource(found);
                setTimeout(() => {
                    document.getElementById('resource-center')?.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        }
    }, []);

    // Keep the URL in sync with the open resource (Dialog handles scroll locking)
    useEffect(() => {
        const url = new URL(window.location.href);
        if (selectedResource) {
            url.searchParams.set('resource', selectedResource.slug);
            window.history.replaceState({}, '', url.toString());
        } else if (url.searchParams.has('resource')) {
            url.searchParams.delete('resource');
            window.history.replaceState({}, '', url.toString());
        }
    }, [selectedResource]);

    const handleShare = (slug: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('resource', slug);
        navigator.clipboard?.writeText(url.toString());
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
        <section id="resource-center" aria-labelledby="resource-center-heading" className="studlyf-ds ds-section bg-ds-background">
            <div className="ds-container">
                <header className="mx-auto mb-12 max-w-3xl text-center md:mb-14">
                    <p className="ds-eyebrow mb-4">Resource centre</p>
                    <h2 id="resource-center-heading" className="ds-h2 text-ds-foreground">
                        Stay ahead of what&rsquo;s <span className="ds-gradient-text">next</span>
                    </h2>
                    <p className="ds-subline mx-auto mt-4 max-w-2xl">
                        Research and insights from tech experts and thought leaders so you&rsquo;re always on top of tech&rsquo;s latest trends.
                    </p>
                </header>

                <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((res) => (
                        <li key={res.slug} className="flex">
                            <Card className="group relative w-full overflow-hidden p-0 transition-shadow duration-200 hover:shadow-ds-md">
                                <div className="aspect-[16/9] overflow-hidden bg-ds-muted">
                                    <img
                                        src={res.image}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col gap-3 p-6">
                                    <Badge>{typeLabel(res.type)}</Badge>
                                    <h3 className="text-xl font-semibold leading-snug tracking-tight text-ds-foreground">{res.title}</h3>
                                    <p className="text-[15px] leading-relaxed text-ds-muted-foreground">{res.desc}</p>
                                    <Button
                                        variant="link"
                                        className="mt-auto w-fit gap-1.5 pt-2 after:absolute after:inset-0 after:content-['']"
                                        onClick={() => setSelectedResource(res)}
                                    >
                                        Read more<span className="sr-only">: {res.title}</span>
                                        <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                    </Button>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>

                <div className="mt-12 flex justify-center">
                    <Button variant="outline" size="lg" asChild>
                        <a href="https://example.com/case-studies" target="_blank" rel="noreferrer">
                            Explore all resources
                            <ArrowRight aria-hidden="true" />
                        </a>
                    </Button>
                </div>
            </div>

            <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
                <DialogContent className="max-w-3xl gap-0 p-0">
                    {selectedResource && (
                        <>
                            <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-t-ds-card sm:h-72">
                                <img src={selectedResource.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-ds-ink via-ds-ink/60 to-ds-ink/10" />
                                <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 sm:p-10">
                                    <Badge variant="ink" className="bg-white/15 text-white">{typeLabel(selectedResource.type)}</Badge>
                                    <DialogTitle className="text-2xl font-bold leading-tight text-white text-balance sm:text-4xl">
                                        {selectedResource.title}
                                    </DialogTitle>
                                    <DialogDescription className="max-w-2xl text-[15px] text-white/85">{selectedResource.desc}</DialogDescription>
                                </div>
                            </div>

                            <div className="flex flex-col gap-10 p-6 sm:p-10">
                                <section>
                                    <h3 className="mb-3 text-base font-semibold text-ds-primary">Overview</h3>
                                    <p className="text-[17px] leading-relaxed text-ds-foreground">{selectedResource.overview}</p>
                                </section>

                                <Separator />

                                <section>
                                    <h3 className="mb-4 text-base font-semibold text-ds-primary">Why this matters</h3>
                                    <ul className="flex flex-col gap-3">
                                        {selectedResource.whyItMatters.map((point) => (
                                            <li key={point} className="flex items-start gap-3 text-[15px] leading-relaxed text-ds-muted-foreground">
                                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ds-primary" aria-hidden="true" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <div className="grid gap-8 md:grid-cols-2">
                                    <section>
                                        <h3 className="mb-3 text-base font-semibold text-ds-primary">Key takeaways</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedResource.takeaways.map((takeaway) => (
                                                <Badge key={takeaway} variant="outline" className="px-3 py-1 text-[13px] font-medium">{takeaway}</Badge>
                                            ))}
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="mb-3 text-base font-semibold text-ds-primary">Real-world impact</h3>
                                        <p className="rounded-ds-control border border-ds-border bg-ds-lavender p-4 text-[15px] leading-relaxed text-ds-foreground">
                                            {selectedResource.impact}
                                        </p>
                                    </section>
                                </div>

                                <div className="flex flex-col items-center justify-between gap-4 border-t border-ds-border pt-6 sm:flex-row">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-ds-muted-foreground">Follow STUDLYF</span>
                                        <Button variant="outline" size="icon-sm" asChild>
                                            <a href="https://www.instagram.com/stuudent.lyf/" target="_blank" rel="noreferrer" aria-label="STUDLYF on Instagram">
                                                <Instagram />
                                            </a>
                                        </Button>
                                        <Button variant="outline" size="icon-sm" asChild>
                                            <a href="https://www.linkedin.com/company/studlyf/posts/?feedView=all" target="_blank" rel="noreferrer" aria-label="STUDLYF on LinkedIn">
                                                <Linkedin />
                                            </a>
                                        </Button>
                                    </div>
                                    <Button variant="outline" onClick={() => handleShare(selectedResource.slug)} className="w-full sm:w-auto">
                                        {copiedLink ? <Check className="text-ds-success" /> : <Share2 />}
                                        {copiedLink ? 'Link copied' : 'Share resource'}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default ResourceCenter;
