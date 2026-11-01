import React from 'react';
import DynamicBadges from './DynamicBadges';
import EventFAQ from './EventFAQ';
import EventTimeline from './EventTimeline';

interface Section {
  type: 'hero' | 'badges' | 'description' | 'timeline' | 'prizes' | 'faqs' | 'perks' | 'custom';
  data: any;
  title?: string;
}

interface SectionRendererProps {
  sections: Section[];
  className?: string;
}

function DescriptionSection({ data, title }: { data: any; title?: string }) {
  if (!data) return null;
  const content = (typeof data === 'string' ? data : data.content || data.html || '').replace(/<img/g, '<img loading="lazy"');
  if (!content) return null;
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
      {title && (
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
          <span className="w-1 h-7 bg-purple-600 rounded-full" />
          {title}
        </h2>
      )}
      <div className="text-slate-600 font-medium leading-loose whitespace-pre-wrap [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_a]:text-purple-600 [&_a]:underline [&_strong]:font-bold [&_b]:font-bold [&_i]:italic [&_em]:italic">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </section>
  );
}

function PerksSection({ data, title }: { data: any; title?: string }) {
  const perks = Array.isArray(data) ? data : data?.items || [];
  if (perks.length === 0) return null;
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
      {title && (
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
          <span className="w-1 h-7 bg-purple-600 rounded-full" />
          {title}
        </h2>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {perks.map((perk: any, i: number) => (
          <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
            {perk.icon && <span className="text-2xl mb-2 block">{perk.icon}</span>}
            {perk.label && <p className="text-sm font-black text-slate-900">{perk.label}</p>}
            {perk.description && <p className="text-xs text-slate-600 mt-1 font-medium">{perk.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function BadgesSection({ data }: { data: any }) {
  const badges = Array.isArray(data) ? data : data?.items || [];
  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DynamicBadges badges={badges} size="md" />
    </div>
  );
}

function renderSection(section: Section, idx: number) {
  switch (section.type) {
    case 'badges':
      return <BadgesSection key={idx} data={section.data} />;
    case 'description':
      return <DescriptionSection key={idx} data={section.data} title={section.title} />;
    case 'perks':
      return <PerksSection key={idx} data={section.data} title={section.title} />;
    case 'faqs':
      return <EventFAQ key={idx} faqs={Array.isArray(section.data) ? section.data : section.data?.items || []} title={section.title} />;
    case 'timeline':
      return <EventTimeline key={idx} stages={Array.isArray(section.data) ? section.data : section.data?.items || []} title={section.title} />;
    default:
      return null;
  }
}

export default function SectionRenderer({ sections, className = '' }: SectionRendererProps) {
  if (!sections || sections.length === 0) return null;
  return (
    <div className={`space-y-8 ${className}`}>
      {sections.map((section, idx) => renderSection(section, idx))}
    </div>
  );
}

