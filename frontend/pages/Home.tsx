import React, { Suspense, lazy } from 'react';
import LandingHero from '../components/LandingHero';
import WhatIsStudlyf from '../components/WhatIsStudlyf';
import VoicesThatInspire from '../components/VoicesThatInspire';
import OldVsNewSection from '../components/OldVsNewSection';
import MentorCredibility from '../components/MentorCredibility';
import WhoWeServe from '../components/WhoWeServe';
import FeaturedInstitutions from '../components/FeaturedInstitutions';
import FAQ from '../components/FAQ';
import LandingNavbar from '../components/LandingNavbar';
import PurpleNavbar from '../components/PurpleNavbar';
import RoadmapSection from '../components/RoadmapSection';

const Impact = lazy(() => import('../components/Impact'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const ResourceCenter = lazy(() => import('../components/ResourceCenter'));
const EnquiryForm = lazy(() => import('../components/EnquiryForm'));

/** Anchor target for the landing nav; offset so the fixed bar doesn't cover the heading. */
const Anchor: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <div id={id} className="scroll-mt-20">{children}</div>
);

/*
 * Landing story, in order:
 * what it is -> who it's for -> how it works -> why it's different -> proof -> learn more -> questions -> contact.
 */
const Home: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="flex flex-col relative overflow-hidden pt-16 md:pt-[72px] pb-12">
        <LandingNavbar />
        <LandingHero />
        <PurpleNavbar />
      </div>

      <Anchor id="platform"><WhatIsStudlyf /></Anchor>
      <Anchor id="who-its-for"><WhoWeServe /></Anchor>
      <Anchor id="how-it-works"><RoadmapSection /></Anchor>
      <OldVsNewSection />

      <Suspense fallback={null}>
        <Anchor id="community">
          <Impact />
          <FeaturedInstitutions />
          <MentorCredibility />
          <Testimonials />
        </Anchor>
        <VoicesThatInspire />
        <ResourceCenter />
        <Anchor id="faq"><FAQ /></Anchor>
        <EnquiryForm />
      </Suspense>
    </div>
  );
};

export default Home;
