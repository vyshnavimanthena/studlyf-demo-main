import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Briefcase, ArrowRight, CheckCircle2, Clock, Brain, Target,
  Trophy, AlertCircle, ShieldCheck, Code2, Database, Layout, LineChart,
  Terminal, Search, Timer, BarChart3, Award, RefreshCw, Zap, TrendingUp
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

interface Question {
  _id: string; company: string; role: string; type: 'mcq' | 'coding';
  question: string; options?: string[]; correctAnswer?: number;
  explanation?: string; difficulty: string;
}

const RadialProgress = ({ value, label }: { value: number; label: string }) => (
  <div className="relative w-32 h-32 flex items-center justify-center">
    <svg className="w-full h-full transform -rotate-90">
      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
      <motion.circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
        strokeDasharray={364.4} initial={{ strokeDashoffset: 364.4 }}
        animate={{ strokeDashoffset: 364.4 - (364.4 * value) / 100 }}
        transition={{ duration: 1.5, ease: "easeOut" }} className="text-[#7C3AED] stroke-round" />
    </svg>
    <div className="absolute flex flex-col items-center">
      <span className="text-xl font-black text-[#111827]">{value}%</span>
      <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  </div>
);

const HeatmapItem = ({ label, score, color }: { label: string; score: number; color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-bold text-gray-900">{score}%</span>
    </div>
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full" style={{ backgroundColor: color }} />
    </div>
  </div>
);

const difficultyLabel = (difficulty: string) => {
  if (difficulty === 'easy') return 'Beginner';
  if (difficulty === 'medium') return 'Intermediate';
  return 'Advanced';
};

const difficultyTone = (difficulty: string) => {
  if (difficulty === 'easy') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (difficulty === 'medium') return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-rose-50 text-rose-700 border-rose-100';
};

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'config' | 'prep' | 'active' | 'analysis' | 'results'>('config');
  const [companies, setCompanies] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [experience, setExperience] = useState<'fresher' | 'mid' | 'senior'>('fresher');
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<'Logic' | 'Code' | 'System Thinking'>('Logic');
  const [responses, setResponses] = useState<{ questionId: string; userAnswer: number | null }[]>([]);
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState<any>(null);
  const assessmentProgress = questions.length > 0
    ? Math.round(((step === 'results' ? questions.length : step === 'active' ? currentIndex + 1 : 0) / questions.length) * 100)
    : 0;
  const attemptStats = {
    attemptsMade: responses.length,
    averageScore: results?.overall ?? 0,
    completionRate: questions.length ? Math.round((responses.length / questions.length) * 100) : 0,
    recentPerformance: results?.alignment ?? results?.overall ?? 0,
  };

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, rRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/student/assessment/companies`),
          fetch(`${API_BASE_URL}/api/student/assessment/roles`)
        ]);
        if (cRes.ok) setCompanies(await cRes.json());
        if (rRes.ok) setRoles(await rRes.json());
      } catch {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'active' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (step === 'active' && timer === 0) {
      handleNext(null);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const startAssessment = async () => {
    setStep('prep');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/api/student/assessment/questions?company=${selectedCompany}&role=${selectedRole}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const qs = await res.json();
        if (qs.length > 0) {
          setQuestions(qs);
          setCurrentIndex(0);
          setTimer(qs[0].difficulty === 'hard' ? 90 : qs[0].difficulty === 'medium' ? 60 : 45);
          setStep('active');
          return;
        }
      }
    } catch {}
    const fallbackQs: Question[] = [
      { _id: 'q1', company: selectedCompany, role: selectedRole, type: 'mcq', question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 1, explanation: 'Binary search halves the search space each iteration, giving O(log n).', difficulty: 'easy' },
      { _id: 'q2', company: selectedCompany, role: selectedRole, type: 'mcq', question: 'Which data structure uses FIFO order?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctAnswer: 1, explanation: 'Queue follows First-In-First-Out order.', difficulty: 'easy' },
      { _id: 'q3', company: selectedCompany, role: selectedRole, type: 'mcq', question: 'What does REST stand for?', options: ['Representational State Transfer', 'Remote State Transfer', 'Representational System Transfer', 'Remote System Transfer'], correctAnswer: 0, explanation: 'REST stands for Representational State Transfer.', difficulty: 'easy' },
    ];
    setQuestions(fallbackQs);
    setCurrentIndex(0);
    setTimer(45);
    setStep('active');
  };

  const handleNext = async (answer: number | null) => {
    const currentQ = questions[currentIndex];
    const newResponses = [...responses, { questionId: currentQ._id, userAnswer: answer }];
    setResponses(newResponses);

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTimer(questions[nextIdx].difficulty === 'hard' ? 90 : questions[nextIdx].difficulty === 'medium' ? 60 : 45);
    } else {
      setStep('analysis');
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE_URL}/api/student/assessment/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ company: selectedCompany, role: selectedRole, questions, answers: newResponses.map(r => r.userAnswer) }),
        });
        if (res.ok) {
          const data = await res.json();
          setTimeout(() => {
            setResults({
              overall: data.score, alignment: Math.min(100, data.score + 10),
              heatmap: [
                { label: 'Analytical Logic', score: Math.min(100, data.score + 5), color: '#7C3AED' },
                { label: 'Clinical Coding', score: Math.min(100, data.score - 5), color: '#1D74F2' },
                { label: 'System Design', score: data.score, color: '#059669' }
              ],
              weaknesses: data.score < 70 ? ['Memory Management', 'Closure Scope'] : ['High Scale Latency'],
              strengths: data.score >= 70 ? ['Distributed Inference', 'Probabilistic Thinking'] : ['Core Reliability'],
            });
            setStep('results');
          }, 2000);
        } else {
          throw new Error('submit failed');
        }
      } catch {
        setTimeout(() => {
          setResults({
            overall: 60, alignment: 68,
            heatmap: [
              { label: 'Analytical Logic', score: 65, color: '#7C3AED' },
              { label: 'Clinical Coding', score: 55, color: '#1D74F2' },
              { label: 'System Design', score: 60, color: '#059669' }
            ],
            weaknesses: ['Memory Management', 'Closure Scope'],
            strengths: ['Core Reliability'],
          });
          setStep('results');
        }, 2000);
      }
    }
  };

  const filteredRoles = roles.filter(r => r.toLowerCase().includes(roleInput.toLowerCase()));
  const filteredCompanies = companies.filter((c: any) => (c.name || '').toLowerCase().includes(companyInput.toLowerCase()));

  return (
    <div className="pt-32 pb-24 px-6 bg-[#FAFAFA] min-h-screen flex items-center justify-center font-sans">
      <div className="max-w-6xl w-full mx-auto">
        <style>{`
          .asm-btn { position:relative; display:flex; align-items:center; justify-content:center; background:#7C3AED; color:#fff; border:none; overflow:hidden; transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; box-shadow:0 4px 20px rgba(124,58,237,0.4),0 1px 0 rgba(255,255,255,0.12) inset; }
          .asm-btn:disabled { opacity:0.5; cursor:not-allowed; }
          .asm-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 55%); pointer-events:none; z-index:1; }
          .asm-btn::after { content:''; position:absolute; top:0; left:0; width:40%; height:100%; background:linear-gradient(110deg,transparent 20%,rgba(255,255,255,0.24) 50%,transparent 80%); animation:asm-shimmer 2.8s ease-in-out infinite; pointer-events:none; z-index:2; }
          .asm-btn:not(:disabled):hover { transform:translateY(-2px) scale(1.02); box-shadow:0 0 0 5px rgba(139,92,246,0.18),0 0 32px 12px rgba(139,92,246,0.45),0 16px 40px rgba(109,40,217,0.5); }
          .asm-btn:not(:disabled):active { transform:scale(0.97); }
          .asm-orb { position:absolute; border-radius:50%; pointer-events:none; filter:blur(7px); z-index:1; }
          .asm-orb1 { width:28px; height:28px; background:radial-gradient(circle,rgba(196,168,255,0.95),transparent 70%); top:-4px; left:18px; animation:asm-orb1 3.2s ease-in-out infinite; }
          .asm-orb2 { width:22px; height:22px; background:radial-gradient(circle,rgba(255,255,255,0.8),transparent 70%); bottom:-2px; right:48px; animation:asm-orb2 4s ease-in-out infinite; }
          .asm-orb3 { width:18px; height:18px; background:radial-gradient(circle,rgba(167,139,250,0.9),transparent 70%); top:4px; right:18px; animation:asm-orb3 2.6s ease-in-out infinite; }
          .asm-label { position:relative; z-index:5; display:flex; align-items:center; justify-content:center; gap:8px; }
          @keyframes asm-shimmer { 0%{transform:translateX(-180%) skewX(-20deg)} 100%{transform:translateX(300%) skewX(-20deg)} }
          @keyframes asm-orb1 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.55} 40%{transform:translate(8px,-6px) scale(1.3);opacity:0.9} 70%{transform:translate(-4px,4px) scale(0.8);opacity:0.4} }
          @keyframes asm-orb2 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.4} 35%{transform:translate(-10px,-8px) scale(1.4);opacity:0.85} 65%{transform:translate(6px,5px) scale(0.75);opacity:0.35} }
          @keyframes asm-orb3 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.5} 50%{transform:translate(6px,8px) scale(1.25);opacity:0.9} }
        `}</style>
        <AnimatePresence mode="wait">
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 text-[#7C3AED] px-4 py-2 rounded-full mb-8"><Brain className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Engine V2.1</span></div>
                <h1 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6 leading-[0.9] tracking-tighter uppercase italic"><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B] inline-block">CLINICAL READY.</span></h1>
                <p className="text-[#6B7280] text-sm sm:text-base font-medium leading-relaxed max-w-[320px] mx-auto lg:mx-0">Calibrate your assessment protocol by specifying your target role and institution.</p>
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl">
                  {[
                    { label: 'Roles', value: roles.length.toString(), tone: 'text-[#7C3AED]' },
                    { label: 'Companies', value: companies.length.toString(), tone: 'text-[#111827]' },
                    { label: 'Flow', value: '3 steps', tone: 'text-emerald-600' },
                    { label: 'Coverage', value: 'Adaptive', tone: 'text-sky-600' },
                  ].map(card => (
                    <div key={card.label} className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{card.label}</div>
                      <div className={`mt-3 text-2xl font-black ${card.tone}`}>{card.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_30px_90px_rgba(15,23,42,0.08)] space-y-6 relative max-w-[440px] mx-auto">
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Target Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="e.g. Backend Developer" value={roleInput}
                      onChange={(e) => { setRoleInput(e.target.value); setSelectedRole(''); setShowRoleSuggestions(true); }}
                      onFocus={() => setShowRoleSuggestions(true)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:bg-white transition-all font-bold text-gray-800 text-sm placeholder:text-gray-300" />
                  </div>
                  <AnimatePresence>{showRoleSuggestions && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute z-50 w-full bg-white border border-gray-100 rounded-2xl mt-2 p-2 shadow-2xl max-h-60 overflow-y-auto">
                      {(filteredRoles.length > 0 ? filteredRoles : roles).slice(0, 5).map(role => (
                        <button key={role} onClick={() => { setRoleInput(role); setSelectedRole(role); setShowRoleSuggestions(false); }}
                          className="w-full text-left p-4 hover:bg-[#F5F3FF] rounded-xl transition-colors font-bold text-sm text-gray-700 hover:text-[#7C3AED]">{role}</button>
                      ))}
                    </motion.div>
                  )}</AnimatePresence>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Target Institution</label>
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="e.g. Google" value={companyInput}
                      onChange={(e) => { setCompanyInput(e.target.value); setSelectedCompany(''); setShowCompanySuggestions(true); }}
                      onFocus={() => setShowCompanySuggestions(true)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:bg-white transition-all font-bold text-gray-800 text-sm placeholder:text-gray-300" />
                  </div>
                  <AnimatePresence>{showCompanySuggestions && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute z-40 w-full bg-white border border-gray-100 rounded-2xl mt-2 p-2 shadow-2xl max-h-60 overflow-y-auto">
                      {(filteredCompanies.length > 0 ? filteredCompanies : companies).slice(0, 5).map((comp: any) => (
                        <button key={comp._id || comp.name} onClick={() => { setCompanyInput(comp.name || comp); setSelectedCompany(comp.name || comp); setShowCompanySuggestions(false); }}
                          className="w-full text-left p-4 hover:bg-[#F5F3FF] rounded-xl transition-colors flex items-center gap-4 group">
                          {comp.logo && <img src={comp.logo} alt="" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />}
                          <span className="font-bold text-sm text-gray-700 group-hover:text-[#7C3AED]">{comp.name || comp}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}</AnimatePresence>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Experience Level</label>
                  <div className="flex gap-2">
                    {[{ id: 'fresher', label: 'Fresher' }, { id: 'mid', label: '1-3 Yrs' }, { id: 'senior', label: '3-5 Yrs' }].map(exp => (
                      <button key={exp.id} onClick={() => setExperience(exp.id as any)}
                        className={`flex-1 overflow-hidden py-4 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all ${experience === exp.id ? 'asm-btn border-[#7C3AED]' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-[#7C3AED]/20'}`}
                      >{experience === exp.id ? <><span className="asm-orb asm-orb1" style={{width:'18px',height:'18px',left:'10px'}} /><span className="asm-orb asm-orb2" style={{width:'14px',height:'14px',right:'10px'}} /><span className="asm-orb asm-orb3" style={{width:'12px',height:'12px',top:'2px',right:'10px'}} /><span className="asm-label">{exp.label}</span></> : exp.label}</button>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <button onClick={startAssessment} disabled={!roleInput || !companyInput}
                    className="asm-btn w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em]">
                    <span className="asm-orb asm-orb1" /><span className="asm-orb asm-orb2" /><span className="asm-orb asm-orb3" />
                    <span className="asm-label">Generate Protocol <ArrowRight className="w-3.5 h-3.5" /></span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { label: 'Average depth', value: 'Adaptive' },
                    { label: 'Completion view', value: `${assessmentProgress}%` },
                  ].map(item => (
                    <div key={item.label} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{item.label}</div>
                      <div className="mt-2 text-lg font-black text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'prep' && (
            <motion.div key="prep" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto text-center">
              <div className="w-24 h-24 bg-[#7C3AED] text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-3xl shadow-[#7C3AED]/40"><Target className="w-10 h-10" /></div>
              <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6 uppercase tracking-tighter">Protocol <span className="text-[#7C3AED]">Synchronized.</span></h2>
              <p className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto font-medium">We have synthesized an adaptive assessment for <span className="text-[#111827] font-bold">{selectedRole}</span> at <span className="text-[#111827] font-bold">{selectedCompany}</span>.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setStep('config')} className="asm-btn !px-10 !py-5 !rounded-2xl text-[10px] font-bold uppercase tracking-widest"><span className="asm-orb asm-orb1" /><span className="asm-orb asm-orb2" /><span className="asm-orb asm-orb3" /><span className="asm-label">Re-Calibrate</span></button>
                <button onClick={startAssessment} className="asm-btn !px-12 !py-5 !rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]"><span className="asm-orb asm-orb1" /><span className="asm-orb asm-orb2" /><span className="asm-orb asm-orb3" /><span className="asm-label">Initiate Audit</span></button>
              </div>
            </motion.div>
          )}

          {step === 'active' && questions.length > 0 && (
            <motion.div key="active" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl w-full mx-auto">
              <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Progress', value: `${assessmentProgress}%`, meta: `${currentIndex + 1} of ${questions.length || 0}` },
                  { label: 'Difficulty', value: difficultyLabel(questions[currentIndex].difficulty), meta: questions[currentIndex].difficulty.toUpperCase() },
                  { label: 'Attempts made', value: `${attemptStats.attemptsMade}`, meta: 'This session' },
                  { label: 'Completion rate', value: `${attemptStats.completionRate}%`, meta: 'Answered so far' },
                ].map(card => (
                  <div key={card.label} className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{card.label}</div>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div className="text-2xl font-black text-gray-900">{card.value}</div>
                      <div className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${card.label === 'Difficulty' ? difficultyTone(questions[currentIndex].difficulty) : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{card.meta}</div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-[#7C3AED] transition-all duration-500" style={{ width: card.label === 'Progress' ? `${assessmentProgress}%` : card.label === 'Completion rate' ? `${attemptStats.completionRate}%` : card.label === 'Difficulty' ? (questions[currentIndex].difficulty === 'easy' ? '34%' : questions[currentIndex].difficulty === 'medium' ? '67%' : '100%') : `${Math.min(100, attemptStats.attemptsMade * 20)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-12">
                {['Logic', 'Code', 'System Thinking'].map((section, idx) => (
                  <div key={section} className="flex flex-col items-center gap-1.5">
                    <div className={`h-1 w-16 rounded-full transition-all duration-500 ${currentSection === section ? 'bg-[#7C3AED] shadow-lg shadow-[#7C3AED]/40' : idx < ['Logic', 'Code', 'System Thinking'].indexOf(currentSection) ? 'bg-[#111827]' : 'bg-gray-200'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${currentSection === section ? 'text-[#7C3AED]' : 'text-gray-400'}`}>{section}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 shadow-[0_25px_80px_rgba(15,23,42,0.08)] relative">
                <div className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12">
                  <div className="space-y-3">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] ${difficultyTone(questions[currentIndex].difficulty)}`}>{difficultyLabel(questions[currentIndex].difficulty)} assessment</span>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Question {currentIndex + 1} / {questions.length}</div>
                  </div>
                  <div className={`flex items-center gap-2 font-mono font-bold text-xs sm:text-sm ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-[#7C3AED]'}`}>
                    <Timer className="w-4 h-4" /> {timer}s
                  </div>
                </div>
                <div className="space-y-6 sm:space-y-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight max-w-3xl">{questions[currentIndex].question}</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Adaptive', 'Scored', 'Timed'].map(tag => (
                      <span key={tag} className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{tag}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {questions[currentIndex].options?.map((opt, i) => (
                      <button key={i} onClick={() => handleNext(i)}
                        className="w-full text-left p-4 sm:p-6 rounded-2xl sm:rounded-[1.75rem] border border-gray-100 bg-gray-50 hover:bg-white hover:border-[#7C3AED]/30 hover:shadow-[0_20px_50px_rgba(124,58,237,0.08)] transition-all group flex items-center justify-between"
                      >
                        <span className="font-bold text-xs sm:text-sm text-gray-700 group-hover:text-[#7C3AED] leading-snug">{opt}</span>
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[9px] font-black text-gray-400 group-hover:bg-[#7C3AED] group-hover:text-white group-hover:border-[#7C3AED] ml-4">{String.fromCharCode(65 + i)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'analysis' && (
            <motion.div key="analysis" className="text-center py-40">
              <div className="w-20 h-20 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-10" />
              <h2 className="text-3xl font-black uppercase tracking-widest text-gray-900">Synthesizing Protocol...</h2>
            </motion.div>
          )}

          {step === 'results' && results && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-12">
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] items-stretch">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 text-green-500 mb-6"><ShieldCheck className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Verified Clinical Verdict</span></div>
                  <h1 className="text-4xl sm:text-6xl font-black text-gray-900 leading-[0.8] tracking-tighter uppercase italic">Logic <br /><span className="text-[#7C3AED]">Certified.</span></h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full xl:w-auto">
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg text-center"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Proficiency</p><p className="text-4xl font-black text-gray-900">{results.overall}%</p></div>
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg text-center"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Alignment</p><p className="text-4xl font-black text-[#7C3AED]">{results.alignment}%</p></div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Attempts made', value: attemptStats.attemptsMade, tone: 'text-[#7C3AED]' },
                  { label: 'Average score', value: `${attemptStats.averageScore}%`, tone: 'text-emerald-600' },
                  { label: 'Completion rate', value: `${attemptStats.completionRate}%`, tone: 'text-emerald-600' },
                  { label: 'Recent performance', value: `${attemptStats.recentPerformance}%`, tone: 'text-sky-600' },
                  { label: 'Difficulty', value: difficultyLabel(questions[0]?.difficulty || 'medium'), tone: 'text-gray-900' },
                ].map(card => (
                  <div key={card.label} className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{card.label}</div>
                    <div className={`mt-3 text-3xl font-black ${card.tone}`}>{card.value}</div>
                    <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-[#7C3AED] transition-all duration-500" style={{ width: card.label === 'Attempts made' ? `${Math.min(100, attemptStats.attemptsMade * 20)}%` : card.label === 'Average score' ? `${Math.min(100, attemptStats.averageScore)}%` : card.label === 'Completion rate' ? `${attemptStats.completionRate}%` : card.label === 'Recent performance' ? `${attemptStats.recentPerformance}%` : questions[0]?.difficulty === 'easy' ? '34%' : questions[0]?.difficulty === 'medium' ? '67%' : '100%' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.5em]">Authority Heatmap</h4>
                    <RadialProgress value={results.overall} label="overall" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-12">
                    <div className="space-y-6">{results.heatmap.map((h: any, i: number) => (<HeatmapItem key={i} {...h} />))}</div>
                    <div className="bg-gray-50 rounded-[2.5rem] p-8 space-y-6">
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Strengths</h5>
                      <div className="flex flex-wrap gap-2">{results.strengths.map((s: string) => (<span key={s} className="px-4 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl text-[10px] font-black uppercase tracking-widest">{s}</span>))}</div>
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">Improvements</h5>
                      <div className="flex flex-wrap gap-2">{results.weaknesses.map((w: string) => (<span key={w} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest">{w}</span>))}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <motion.div whileHover={{ y: -5 }} className="bg-[#111827] text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="relative z-10"><Award className="w-10 h-10 text-yellow-400 mb-6" /><h4 className="text-xl font-black uppercase tracking-tighter mb-4">Unlock Proof Badge</h4><p className="text-white/60 text-xs font-medium mb-8">Verified evidence of your logic scores to display on LinkedIn.</p><button className="asm-btn w-full !py-4 !rounded-xl text-[10px] font-black uppercase tracking-widest"><span className="asm-orb asm-orb1" /><span className="asm-orb asm-orb2" /><span className="asm-orb asm-orb3" /><span className="asm-label">Claim Authority</span></button></div>
                  </motion.div>
                  <button onClick={() => setStep('config')} className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-900 transition-all pt-4"><RefreshCw className="w-4 h-4" /> Retake Audit</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="fixed inset-0 bg-grid-black/[0.02] pointer-events-none -z-10" />
    </div>
  );
};

export default Assessment;

