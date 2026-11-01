import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AssessmentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  quizId: string;
  quizTitle: string;
  stageName: string;
}

const AssessmentReviewModal: React.FC<AssessmentReviewModalProps> = ({
  isOpen,
  onClose,
  eventId,
  quizId,
  quizTitle,
  stageName,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          className="relative w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl overflow-hidden border border-slate-200"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Assessment Review</h2>
              <p className="text-sm text-slate-500">Review quiz details for the selected stage.</p>
            </div>
            <button onClick={onClose} className="p-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Event ID</p>
                <p className="mt-2 text-sm font-semibold text-slate-900 break-all">{eventId || 'N/A'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Stage</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{stageName || 'Unknown'}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Quiz</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{quizTitle || quizId || 'No quiz selected'}</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">This mock review modal is a placeholder for the assessment review flow. Replace with detailed results, score breakdowns, and review actions as needed.</p>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition">Close</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssessmentReviewModal;

