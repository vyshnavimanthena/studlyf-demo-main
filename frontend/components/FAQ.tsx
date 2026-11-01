import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const FAQ: React.FC = () => {
  return (
    <section aria-labelledby="faq-heading" className="studlyf-ds ds-section bg-ds-background">
      <div className="ds-container">
        <div className="mx-auto max-w-[760px]">
          <header className="mb-10 text-center md:mb-12">
            <p className="ds-eyebrow mb-4">FAQ</p>
            <h2 id="faq-heading" className="ds-h2 text-ds-foreground">
              Everything you need to <span className="ds-gradient-text">know</span>
            </h2>
          </header>

          <Accordion type="single" collapsible defaultValue="item-0" className="rounded-ds-card border border-ds-border bg-ds-card px-5 shadow-ds-sm sm:px-8">
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
            <a href="#enquiry-form" className="font-semibold text-ds-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
              Connect with the STUDLYF team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
