// CourseContent component – extracted from CoursePlayer for lazy loading
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CheckCircle2, BookOpen, MessageCircle, StickyNote, AlignLeft, Code, Award, Trophy, ShieldAlert, Link, AlertTriangle } from 'lucide-react';

interface Props {
  activeStage: string;
  activeContentDb: any;
  isCurrentLessonComplete: boolean;
  handleMarkComplete: () => void;
}

const CourseContent: React.FC<Props> = ({ activeStage, activeContentDb, isCurrentLessonComplete, handleMarkComplete }) => {
  // Render based on activeStage – same logic as previously inline in CoursePlayer
  return (
    <>
      {/* Overview */}
      {activeStage === 'overview' && activeContentDb && (
        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cp-text-lesson">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 mt-8">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-bold text-[#7C3AED] mb-4 mt-6">{children}</h3>,
              p: ({ children }) => <p className="text-base text-gray-600 leading-relaxed mb-4">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>,
              li: ({ children }) => <li className="text-base text-gray-700 font-medium">{children}</li>,
            }}
          >
            {activeContentDb.overview}
          </ReactMarkdown>
          {/* Bottom button */}
          {!isCurrentLessonComplete && (
            <div style={{ marginTop: 40, paddingTop: 30, borderTop: '1px solid #e5e7eb' }}>
              <button className="cp-bottom-nav-btn next" style={{ width: '100%', justifyContent: 'center', padding: '16px', borderRadius: '12px' }} onClick={handleMarkComplete}>
                <CheckCircle2 size={18} /> I'm Ready! Mark Complete &amp; Start Reading
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Reading / Theory */}
      {(activeStage === 'text' || activeStage === 'theory') && activeContentDb && (
        <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cp-text-lesson">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 mt-8">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-bold text-[#7C3AED] mb-4 mt-6">{children}</h3>,
              p: ({ children }) => <p className="text-base text-gray-600 leading-relaxed mb-4">{children}</p>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#7C3AED] bg-purple-50 p-4 my-6 italic text-gray-700 rounded-r-xl">
                  {children}
                </blockquote>
              ),
              pre: ({ children }) => (
                <div className="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">{children}</div>
              ),
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '20px', fontSize: '14px', borderRadius: '0' }} {...props}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-100 text-[#7C3AED] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {activeContentDb.reading}
          </ReactMarkdown>
        </motion.div>
      )}
    </>
  );
};

export default CourseContent;

