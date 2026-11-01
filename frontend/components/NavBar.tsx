import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NavBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute bottom-6 left-6 z-50">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-base shadow-lg border border-purple-400/40 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-purple-500/40 hover:shadow-xl"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
        <span>Back</span>
      </button>
    </div>
  );
};

export default NavBar;

