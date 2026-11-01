import React from 'react';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type Testimonial = {
    name: string;
    college?: string;
    course: string;
    text: string;
    rating: number;
    /** Optional slots: only render when real data exists. Never invent placements. */
    avatar?: string;
    role?: string;
    placedAt?: string;
};

const testimonials: Testimonial[] = [
    {
        name: "Pantham Bhavya",
        college: "Sridevi women's engineering college",
        course: "UI / UX DESIGN",
        text: "The sessions felt practical and easy to follow, and I could see my confidence grow with every project.",
        rating: 5
    },
    {
        name: "Vadla Sudhasri",
        college: "Stanley women's college",
        course: "JAVA FULL STACK",
        text: "The guidance was consistent and the doubt-clearing support made the learning experience very smooth.",
        rating: 5
    },
    {
        name: "Ginuguntla Likhitha",
        college: "BVRIT",
        course: "DATA ANALYTICS",
        text: "I liked how the classes mixed concepts with hands-on work. It made every topic easy to understand.",
        rating: 5
    },
    {
        name: "Sajja Dhruwallika",
        college: "CBIT",
        course: "CLOUD COMPUTING",
        text: "The platform and mentor support helped me stay consistent and finish projects with confidence.",
        rating: 4
    },
    {
        name: "Modaboina Tejaswi",
        college: "Vasavi college of Engineering",
        course: "AI / ML",
        text: "The training style was simple, effective, and very motivating. I could actually apply what I learned.",
        rating: 5
    },
    {
        name: "Vishnu Vardhan",
        college: "Vasavi College of Engineering",
        course: "WEB DEVELOPMENT",
        text: "The training and project exposure here are top-notch. Trainer is really helpful and clearing the doubts till course end!",
        rating: 5
    },
    {
        name: "Vivek Goud Adula",
        college: "JBIT",
        course: "AI Engineer",
        text: "Training and doubt clarification were excellent. Mic access during class would help clear doubts more effectively.",
        rating: 5
    },
    {
        name: "Purushotham",
        course: "SERVICENOW",
        text: "Rakesh is teaching very well, patiently clearing every doubt. I also learned communication skills from him.",
        rating: 4
    },
    {
        name: "Anusha Goud",
        course: "FULL STACK DEVELOPMENT",
        text: "The curriculum is very industry-aligned. I feel much more confident in my coding skills now.",
        rating: 5
    },
    {
        name: "Kiran Kumar",
        course: "CYBER SECURITY",
        text: "Excellent hands-on labs. The mentors really know their stuff and guide us through complex scenarios.",
        rating: 4
    }
];


const initials = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

// Straight apostrophes in the data become typographic ones.
const curly = (text: string) => text.replace(/'/g, '\u2019');

const TestimonialCard = ({ testimonial, decorative }: { testimonial: Testimonial; decorative?: boolean }) => (
    <li aria-hidden={decorative || undefined} className="flex w-[300px] shrink-0 sm:w-[360px]">
        <figure className="flex w-full flex-col gap-5 rounded-ds-card border border-ds-border bg-ds-card p-6 shadow-ds-sm sm:p-7">
            <div className="flex gap-0.5" role="img" aria-label={`Rated ${testimonial.rating} out of 5`}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                        key={i}
                        aria-hidden="true"
                        className={`size-4 ${i < testimonial.rating ? 'fill-ds-primary text-ds-primary' : 'fill-ds-border text-ds-border'}`}
                    />
                ))}
            </div>
            <blockquote className="flex-1 text-[17px] leading-relaxed text-ds-foreground">
                &ldquo;{curly(testimonial.text)}&rdquo;
            </blockquote>
            <figcaption className="flex items-center gap-3 border-t border-ds-border pt-5">
                <Avatar className="size-11">
                    {testimonial.avatar && <AvatarImage src={testimonial.avatar} alt="" />}
                    <AvatarFallback>{initials(testimonial.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <div className="truncate font-semibold text-ds-foreground">{testimonial.name}</div>
                    <div className="truncate text-sm text-ds-muted-foreground">
                        {[testimonial.role ?? testimonial.course, testimonial.college].filter(Boolean).join(' · ')}
                    </div>
                    {testimonial.placedAt && (
                        <Badge variant="success" className="mt-1.5">Placed at {testimonial.placedAt}</Badge>
                    )}
                </div>
            </figcaption>
        </figure>
    </li>
);

const Testimonials: React.FC = () => {
    return (
        <section id="testimonials" aria-labelledby="testimonials-heading" className="studlyf-ds ds-section ds-band overflow-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes testimonial-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                .testimonial-track { animation: testimonial-scroll 80s linear infinite; }
                .testimonial-marquee:hover .testimonial-track, .testimonial-marquee:focus-within .testimonial-track { animation-play-state: paused; }
                .testimonial-marquee {
                    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%);
                    mask-image: linear-gradient(90deg, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%);
                }
                @media (prefers-reduced-motion: reduce) {
                    .testimonial-track { animation: none; }
                    .testimonial-marquee { overflow-x: auto; }
                }
            ` }} />

            <div className="ds-container">
                <header className="mx-auto mb-12 max-w-[820px] text-center md:mb-14">
                    <p className="ds-eyebrow mb-4">Learner stories</p>
                    <h2 id="testimonials-heading" className="ds-h2 text-ds-foreground">
                        See how learners like you <span className="ds-gradient-text">landed</span> jobs, built skills, and changed their&nbsp;lives.
                    </h2>
                </header>
            </div>

            <div className="testimonial-marquee relative overflow-hidden">
                <ul className="testimonial-track flex w-max items-stretch gap-4 px-4 py-2 sm:gap-6">
                    {[0, 1].map((copy) =>
                        testimonials.map((t) => <TestimonialCard key={`${t.name}-${copy}`} testimonial={t} decorative={copy > 0} />),
                    )}
                </ul>
            </div>
        </section>
    );
};

export default Testimonials;
