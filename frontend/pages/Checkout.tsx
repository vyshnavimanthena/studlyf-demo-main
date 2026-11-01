import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, BookOpen, Award } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../apiConfig';

interface EnrolledCourse {
  _id: string;
  course_id: string;
  course_title: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [confirming, setConfirming] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrolledCourses = (location.state as { enrolledCourses: EnrolledCourse[] })?.enrolledCourses || [];

  const handleConfirmEnrollment = async () => {
    setConfirming(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const userId = localStorage.getItem('user_id') || localStorage.getItem('uid');
      if (token && userId) {
        const res = await fetch(`${API_BASE_URL}/api/student/tracks/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ user_id: userId, courses: enrolledCourses }),
        });
        if (!res.ok) throw new Error('Enrollment failed');
      }
    } catch (e: any) {
      setError(e.message);
    }
    setCompleted(true);
  };

  useEffect(() => {
    if (completed) {
      // Redirect to first course after 3 seconds
      const timer = setTimeout(() => {
        if (enrolledCourses.length > 0) {
          navigate(`/learn/course-player/${enrolledCourses[0].course_id}`);
        } else {
          navigate('/dashboard/my-courses');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [completed, navigate, enrolledCourses]);

  if (enrolledCourses.length === 0) {
    return (
      <div className="pt-40 pb-32 px-3 sm:px-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#111827] mb-4">No courses to checkout</h1>
          <button
            onClick={() => navigate('/learn/courses')}
            className="px-8 py-4 bg-[#7C3AED] text-white font-black text-sm uppercase tracking-[0.2em] rounded-xl hover:bg-[#6D28D9]"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-3 sm:px-6 bg-white min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-tech opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#7C3AED]/5 to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {!completed ? (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 text-center"
            >
              <h1 className="text-4xl sm:text-6xl sm:text-7xl font-black text-[#111827] tracking-tighter uppercase mb-4">
                Complete Your <span className="text-[#7C3AED]">Enrollment</span>
              </h1>
              <p className="text-lg text-[#6B7280] font-medium">
                Confirm your enrollment in {enrolledCourses.length} {enrolledCourses.length === 1 ? 'course' : 'courses'}
              </p>
            </motion.div>

            {/* Course List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-8 mb-8"
            >
              <h2 className="text-2xl font-black text-[#111827] mb-6 uppercase tracking-tight">You're About to Start</h2>

              <div className="space-y-4">
                {enrolledCourses.map((course, idx) => (
                  <motion.div
                    key={course.course_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#7C3AED]/5 to-transparent rounded-xl border border-[#7C3AED]/10"
                  >
                    <div className="w-10 h-10 bg-[#7C3AED] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-[#111827] mb-1">{course.course_title}</h3>
                      <p className="text-xs text-[#6B7280] uppercase tracking-widest">Ready to learn</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Start Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleConfirmEnrollment}
              disabled={confirming}
              className="w-full py-6 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white font-black text-lg uppercase tracking-[0.3em] rounded-xl hover:shadow-lg hover:shadow-[#7C3AED]/40 active:scale-[0.98] transition-all shadow-lg shadow-[#7C3AED]/30 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {confirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <BookOpen className="w-6 h-6" />
                  Start Learning Now
                </>
              )}
            </motion.button>
          </>
        ) : (
          <>
            {/* Success State */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-5xl sm:text-6xl font-black text-green-600 tracking-tighter uppercase mb-4"
              >
                Enrollment Successful!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-[#6B7280] font-medium mb-8 max-w-2xl mx-auto"
              >
                Congratulations! You've successfully enrolled in {enrolledCourses.length} {enrolledCourses.length === 1 ? 'course' : 'courses'}. Your learning journey begins now!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12 inline-block"
              >
                <h2 className="font-black text-[#111827] mb-4 uppercase">Enrolled Courses</h2>
                <div className="space-y-2 text-left">
                  {enrolledCourses.map((course) => (
                    <div key={course.course_id} className="flex items-center gap-3 text-[#111827]">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-bold">{course.course_title}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-[#6B7280] text-sm mb-4"
              >
                Redirecting to your courses in 3 seconds...
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={() => enrolledCourses.length > 0 ? navigate(`/learn/course-player/${enrolledCourses[0].course_id}`) : navigate('/dashboard/my-courses')}
                className="px-8 py-4 bg-[#7C3AED] text-white font-black text-sm uppercase tracking-[0.2em] rounded-xl hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/30"
              >
                Start Learning Now
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;

