import React, { useState } from 'react';
import { ChevronDown, MessageSquare, HelpCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQ_CATEGORIES = [
  { value: 'General', icon: '📋' },
  { value: 'Registration', icon: '📝' },
  { value: 'Eligibility', icon: '✅' },
  { value: 'Participation', icon: '👥' },
  { value: 'Submission', icon: '📤' },
  { value: 'Technical', icon: '💻' },
  { value: 'Evaluation', icon: '📊' },
  { value: 'Prizes', icon: '🏆' },
  { value: 'Certificates', icon: '📜' },
  { value: 'Mentorship', icon: '🤝' },
  { value: 'Results', icon: '🏁' },
  { value: 'Timeline', icon: '📅' },
  { value: 'Rules', icon: '⚖️' },
  { value: 'Support', icon: '🆘' },
  { value: 'Opportunities', icon: '🚀' },
];

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  featured?: boolean;
  is_featured?: boolean;
  priority_score?: number;
  views?: number;
  helpful_count?: number;
  tags?: string[];
  auto_pin_enabled?: boolean;
}

interface EventFAQProps {
  faqs: FAQItem[];
  title?: string;
  className?: string;
  opportunityTitle?: string;
}

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@studlyf.com';

export default function EventFAQ({
  faqs,
  title = 'Frequently Asked Questions',
  className = '',
  opportunityTitle = '',
}: EventFAQProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'discussions'>('faq');
  const [question, setQuestion] = useState('');

  if (!faqs || faqs.length === 0) return null;

  const handleSendQuestion = () => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const subject = encodeURIComponent(
      `Question about ${opportunityTitle || 'Opportunity'}: ${trimmed.slice(0, 60)}${trimmed.length > 60 ? '...' : ''}`
    );
    const body = encodeURIComponent(
      `Hi Studlyf Team,\n\nI have a question about the opportunity "${opportunityTitle || 'Opportunity'}":\n\n${trimmed}\n\nLooking forward to your response.\n\nThanks`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setQuestion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const renderFaqItem = (faq: FAQItem, i: number) => {
    const key = faq.id || String(i);
    const isOpen = openId === key;
    return (
      <div key={key} className="border border-slate-100 rounded-xl overflow-hidden">
        <button
          onClick={() => setOpenId(isOpen ? null : key)}
          className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
        >
          <span className="text-sm font-bold text-slate-800 flex-1">{faq.question}</span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 md:px-8 pt-6 pb-0">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-4">
          <span className="w-1 h-7 bg-purple-600 rounded-full" />
          {title}
        </h2>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
              activeTab === 'faq'
                ? 'text-purple-600 border-purple-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => setActiveTab('discussions')}
            className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'discussions'
                ? 'text-purple-600 border-purple-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <MessageSquare size={14} />
            Discussions
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-8 pt-5 space-y-3">
        {activeTab === 'faq' ? (
          <>
            {/* FAQ Accordion */}
            <div className="space-y-2">
              {faqs.map((faq, i) => renderFaqItem(faq, i))}
            </div>

            {/* Ask a question CTA → switches to discussions tab */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-600">
                Can't find the answer you are looking for?{' '}
                <button
                  onClick={() => setActiveTab('discussions')}
                  className="text-purple-600 font-bold hover:underline"
                >
                  Ask a question (Be specific)
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Discussions Empty State */}
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl bg-slate-50 border border-slate-100">
              <HelpCircle size={32} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No posts yet!</p>
              <p className="text-xs text-slate-400 mt-1">Start a new discussion below.</p>
            </div>

            {/* Ask Question Input */}
            <div className="rounded-xl border border-slate-200 overflow-hidden focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question (be specific)"
                rows={3}
                className="w-full px-4 pt-3 pb-2 text-sm text-slate-700 placeholder-slate-400 bg-white outline-none resize-none"
              />
              <div className="flex justify-end px-3 pb-3 bg-white">
                <button
                  onClick={handleSendQuestion}
                  disabled={!question.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={12} />
                  Enter
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Pressing <span className="font-bold">Enter</span> will send your question to{' '}
              <span className="text-purple-500 font-medium">{SUPPORT_EMAIL}</span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}

