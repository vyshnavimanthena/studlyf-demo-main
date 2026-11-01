import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import InteractiveCreature from './InteractiveCreature';
import { cn } from '@/lib/utils';

const faqData = [
  {
    question: "What is STUDLYF and how is it different?",
    answer: "STUDLYF is a student-first ecosystem built to help ambitious students learn, build, network, and grow through real opportunities. Unlike traditional communities focused only on events or certificates, STUDLYF focuses on mentorship, projects, innovation, collaborations, startup exposure, and long-term career growth."
  },
  {
    question: "What kind of opportunities does STUDLYF provide?",
    answer: "Students get access to workshops, hackathons, mentorship, startup exposure, collaborations, networking events, leadership roles, innovation initiatives, and real project opportunities designed to help them grow beyond classrooms."
  },
  {
    question: "Is STUDLYF only for tech students?",
    answer: "No. STUDLYF is built for ambitious students from different domains who want to learn, collaborate, innovate, build meaningful networks, and gain practical exposure beyond academics."
  },
  {
    question: "How can students grow through STUDLYF?",
    answer: "Students can participate in communities, collaborate on projects, attend events, connect with mentors, build leadership skills, explore startups, and gain exposure to real-world innovation ecosystems."
  },
  {
    question: "How can I join the STUDLYF ecosystem?",
    answer: "You can join by becoming part of the community, attending events, participating in initiatives, collaborating on projects, and staying active within the STUDLYF ecosystem as opportunities open up."
  }
];

// Every question row is the same height, so the mascot can slide between them with a transform
const ROW_H = 88;

/** Desktop: questions on the left, the chosen answer large on the right. The mascot rolls to whichever question is active. */
const SplitFAQ: React.FC = () => {
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <div className="hidden overflow-hidden rounded-ds-panel bg-white ring-1 ring-ds-border shadow-ds-md lg:grid lg:grid-cols-[5fr_6fr]">
      <div className="relative border-r border-ds-border px-8 py-8">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-8 left-8 z-10 flex size-8 items-center justify-center"
          style={{ marginTop: (ROW_H - 32) / 2 }}
          animate={{ y: active * ROW_H }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 22 }}
        >
          <div className="scale-[0.32]">
            <InteractiveCreature className="![transform:none]" />
          </div>
        </motion.div>

        <ul>
          {faqData.map((item, i) => (
            <li key={item.question} className="border-b border-ds-border last:border-b-0">
              <button
                type="button"
                aria-pressed={active === i}
                aria-controls="faq-answer"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                style={{ height: ROW_H - 1 }}
                className={cn(
                  'flex w-full items-center pl-12 text-left text-[17px] leading-snug font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-ring',
                  active === i ? 'text-ds-primary' : 'text-ds-muted-foreground hover:text-ds-foreground',
                )}
              >
                {item.question}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div id="faq-answer" aria-live="polite" className="flex flex-col justify-center bg-ds-lavender px-12 py-10">
        <span aria-hidden="true" className="mb-4 text-sm font-semibold tracking-[0.12em] text-ds-primary tabular-nums">
          {String(active + 1).padStart(2, '0')} / {String(faqData.length).padStart(2, '0')}
        </span>
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="text-2xl leading-[1.35] font-bold text-ds-foreground"
          >
            {faqData[active].answer}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section aria-labelledby="faq-heading" className="studlyf-ds ds-section bg-ds-background">
      <div className="ds-container">
        <div className="mx-auto max-w-[1120px]">
          <header className="mb-10 text-center md:mb-12">
            <p className="ds-eyebrow mb-4">FAQ</p>
            <h2 id="faq-heading" className="ds-h2 text-ds-foreground">
              Everything you need to <span className="ds-gradient-text">know</span>
            </h2>
          </header>

          <SplitFAQ />

          {/* Phones and tablets: there is no room for two columns */}
          <Accordion type="single" collapsible defaultValue="item-0" className="rounded-ds-card border border-ds-border bg-ds-card px-5 shadow-ds-sm sm:px-8 lg:hidden">
            {faqData.map((item, i) => (
              <AccordionItem key={item.question} value={`item-${i}`}>
                <AccordionTrigger className="text-[17px] md:text-lg">{item.question}</AccordionTrigger>
                {/* Answer sits under the question text; right padding clears the +/− button */}
                <AccordionContent className="pr-12 text-base">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-8 text-center text-base text-ds-muted-foreground">
            Still have questions?{' '}
            <a
              href="#enquiry-form"
              onClick={(e) => {
                // The app uses hash routing, so a plain hash link would change the route instead of scrolling
                e.preventDefault();
                document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-semibold text-ds-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              Connect with the STUDLYF team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
