import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CareerFit: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/learn/career-onboarding', { replace: true });
  }, [navigate]);

  return (
    <div className="pt-32 pb-24 px-3 sm:px-6 bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-4" />
        <p className="font-mono text-xs uppercase tracking-widest text-gray-500">Redirecting to Career Dreamer...</p>
      </div>
    </div>
  );
};

export default CareerFit;

