import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';
import { VisualizerEngine } from '../utils/visualizers/VisualizerEngine';
import {
  ShieldCheck,
  ChevronRight,
  Search,
  LayoutGrid,
  Unlock,
  CheckCircle2,
  Clock,
  Medal,
  Cpu,
  Terminal,
  Briefcase,
  ArrowLeft,
  Play,
  Pause,
  Bot,
  MessageSquare,
  FileText,
  Zap,
  BarChart3,
  BookOpen,
  Info,
  ChevronDown,
  Globe,
  ChevronLeft,
  Volume2,
  VolumeX,
  Bookmark,
  Sparkles,
  Award,
  TrendingUp,
  User,
  Star,
  Check,
  FileSpreadsheet,
  Grid,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronUp,
  BookMarked
} from 'lucide-react';

import { PREMIUM_COMPANIES, Company, DSAQuestion } from '../data/premiumCompaniesData';
import { useAuth } from '../AuthContext';

class InlineErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-8 bg-red-50 text-red-900 border border-red-200 rounded-xl">
          <h2 className="text-xl font-bold mb-4">React Runtime Crash!</h2>
          <pre className="whitespace-pre-wrap text-sm bg-red-100 p-4 rounded overflow-auto">
            {this.state.error?.stack || this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const CompanyModulesContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Sidebar state
  const [activeTab, setActiveTab] = useState<'companies' | 'overview' | 'dsa' | 'tech' | 'hr' | 'resume' | 'mock' | 'progress'>('companies');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [savedQuestions, setSavedQuestions] = useState<string[]>(() => {
    const saved = localStorage.getItem('studlyf_saved_questions');
    return saved ? JSON.parse(saved) : [];
  });

  // Track user progress
  const [solvedQuestions, setSolvedQuestions] = useState<string[]>(() => {
    const solved = localStorage.getItem('studlyf_solved_questions');
    return solved ? JSON.parse(solved) : [];
  });
  const [streaks, setStreaks] = useState(0);
  const [progressSynced, setProgressSynced] = useState(false);

  // --- Dynamic DSA Visualizer States ---
  const [selectedQuestion, setSelectedQuestion] = useState<DSAQuestion | null>(null);
  const [visStep, setVisStep] = useState(0);
  const [visPlaying, setVisPlaying] = useState(false);
  const [visSpeed, setVisSpeed] = useState(1000); // ms
  const [customInput, setCustomInput] = useState('');
  const [visualizerState, setVisualizerState] = useState<any>(null);
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'java' | 'cpp' | 'javascript'>('python');
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Tech Round States ---
  const [activeTechIndex, setActiveTechIndex] = useState<number | null>(null);
  const [speechSpeaking, setSpeechSpeaking] = useState<string | null>(null); // tracks active tech question id
  const [techQuizMode, setTechQuizMode] = useState(false);
  const [techQuizScore, setTechQuizScore] = useState<number | null>(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [key: string]: string }>({});
  const [techFlashcardsMode, setTechFlashcardsMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // --- HR Round States ---
  const [hrIndex, setHrIndex] = useState(0);
  const [hrAnswer, setHrAnswer] = useState('');
  const [hrEvaluation, setHrEvaluation] = useState<any>(null);
  const [evaluatingHr, setEvaluatingHr] = useState(false);
  const [starTab, setStarTab] = useState<'S' | 'T' | 'A' | 'R'>('S');
  const [starInputs, setStarInputs] = useState({ S: '', T: '', A: '', R: '' });

  // --- DSA Matrix Search & Filter ---
  const [dsaFilter, setDsaFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [dsaSearch, setDsaSearch] = useState('');

  // HR Simulator State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [simActive, setSimActive] = useState(false);
  const [simSessionId, setSimSessionId] = useState<string | null>(null);
  const [simFeedback, setSimFeedback] = useState<any>(null);
  const [simUserText, setSimUserText] = useState('');
  const [simSpeaking, setSimSpeaking] = useState(false);
  const [isSimLoading, setIsSimLoading] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState(localStorage.getItem('groq_api_key') || '');

  // --- ATS Dynamic Scoring Helper ---
  const calculateAtsScore = (data: any) => {
    if (!data) return 75;
    let score = 0;

    // 1. About section (max 20 pts)
    const aboutStr = data.about || '';
    const aboutWords = aboutStr.trim().split(/\s+/).filter(Boolean).length;
    if (aboutWords >= 3) score += 5;
    if (aboutWords >= 12) score += 10;
    if (/\b(built|engineered|developed|designed|scalable|lead|optimized|created|managed|architected|implemented)\b/i.test(aboutStr)) score += 5;

    // 2. Technical Skills (max 25 pts)
    const skillList = (data.skills || '').split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean);
    score += Math.min(25, skillList.length * 3);

    // 3. Projects (max 20 pts)
    const projStr = data.projects || '';
    const projWords = projStr.trim().split(/\s+/).filter(Boolean).length;
    if (projWords >= 3) score += 10;
    if (projWords >= 10) score += 10;

    // 4. Experience (max 15 pts)
    const expStr = data.experience || '';
    const expWords = expStr.trim().split(/\s+/).filter(Boolean).length;
    if (expWords >= 3) score += 8;
    if (expWords >= 8) score += 7;

    // 5. Certifications & Achievements (max 10 pts)
    if ((data.certifications || '').trim().length > 3) score += 5;
    if ((data.achievements || '').trim().length > 3) score += 5;

    // 6. Profiles (max 10 pts)
    if ((data.github || '').includes('github.com')) score += 5;
    if ((data.linkedin || '').includes('linkedin.com')) score += 5;

    return Math.min(98, Math.max(20, score));
  };

  // --- Resume Portfolio States ---
  const [portfolioData, setPortfolioData] = useState(() => {
    const saved = localStorage.getItem('studlyf_portfolio_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      about: 'Enthusiastic SDE looking to build dynamic, scalable systems utilizing Modern React and Node.js.',
      skills: 'React, TypeScript, Node.js, Python, MongoDB, System Design, SQL, Docker',
      projects: 'Studlyf - Placement Prep, Smart IoT Controller, Cloud Scale Analytics System',
      experience: 'Summer Internship at Google (Cloud Engineering Intern), Hackathon Lead Dev',
      certifications: 'Google Cloud Associate, AWS Solutions Architect Associate, DSA Mastery Certificate',
      achievements: 'Winner of National Hackathon 2025, Top 1% in Algorithmic Code Competition',
      github: 'https://github.com/studlyf-pro',
      linkedin: 'https://linkedin.com/in/studlyf'
    };
  });
  const [atsScore, setAtsScore] = useState(() => {
    const savedScore = localStorage.getItem('studlyf_ats_score');
    if (savedScore) {
      const parsed = parseInt(savedScore, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const savedData = localStorage.getItem('studlyf_portfolio_data');
    const dataToUse = savedData ? (function() { try { return JSON.parse(savedData); } catch (e) { return null; } })() : null;
    return calculateAtsScore(dataToUse || {
      about: 'Enthusiastic SDE looking to build dynamic, scalable systems utilizing Modern React and Node.js.',
      skills: 'React, TypeScript, Node.js, Python, MongoDB, System Design, SQL, Docker',
      projects: 'Studlyf - Placement Prep, Smart IoT Controller, Cloud Scale Analytics System',
      experience: 'Summer Internship at Google (Cloud Engineering Intern), Hackathon Lead Dev',
      certifications: 'Google Cloud Associate, AWS Solutions Architect Associate, DSA Mastery Certificate',
      achievements: 'Winner of National Hackathon 2025, Top 1% in Algorithmic Code Competition',
      github: 'https://github.com/studlyf-pro',
      linkedin: 'https://linkedin.com/in/studlyf'
    });
  });
  const [showImprovementList, setShowImprovementList] = useState(false);
  const [portfolioPreviewDevice, setPortfolioPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSavedToastOpen, setIsSavedToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Handle URL navigation redirects (e.g. from LearnerDashboard)
  useEffect(() => {
    const state = location.state as { companyId?: string } | null;
    if (state?.companyId) {
      const company = PREMIUM_COMPANIES.find(c => c.id === state.companyId);
      if (company) {
        setSelectedCompany(company);
        setActiveTab('dsa');
      }
    }
  }, [location.state]);

  const syncProgressToServer = async (payload: { solved_questions?: string[]; saved_questions?: string[]; streaks?: number }) => {
    const uid = user?.uid || user?.user_id;
    if (!uid) return;
    try {
      await fetch(`${API_BASE_URL}/api/company-prep/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, ...payload }),
      });
    } catch {
      // keep local progress if offline
    }
  };

  useEffect(() => {
    const uid = user?.uid || user?.user_id;
    if (!uid) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/company-prep/progress?user_id=${encodeURIComponent(uid)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.saved_questions)) setSavedQuestions(data.saved_questions);
        if (Array.isArray(data.solved_questions)) setSolvedQuestions(data.solved_questions);
        if (typeof data.streaks === 'number') setStreaks(data.streaks);
        setProgressSynced(true);
      } catch {
        setProgressSynced(true);
      }
    };
    load();
    const interval = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [user?.uid, user?.user_id]);

  useEffect(() => {
    localStorage.setItem('studlyf_saved_questions', JSON.stringify(savedQuestions));
    if (!progressSynced) return;
    syncProgressToServer({ saved_questions: savedQuestions });
  }, [savedQuestions, progressSynced]);

  useEffect(() => {
    localStorage.setItem('studlyf_solved_questions', JSON.stringify(solvedQuestions));
    if (!progressSynced) return;
    syncProgressToServer({ solved_questions: solvedQuestions });
  }, [solvedQuestions, progressSynced]);

  // Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setIsSavedToastOpen(true);
    setTimeout(() => setIsSavedToastOpen(false), 3000);
  };

  // --- Visualizer Step Generator ---
  useEffect(() => {
    if (!selectedQuestion) return;

    // Reset steps when question changes
    setVisStep(0);
    setVisPlaying(false);

    const generatedState = VisualizerEngine.generate(
      selectedQuestion.id,
      selectedQuestion.visualizerType,
      customInput,
      selectedQuestion.input
    );
    
    setVisualizerState(generatedState);

  }, [selectedQuestion, customInput]);

  // Autoplay Timer
  useEffect(() => {
    if (visPlaying) {
      playTimerRef.current = setInterval(() => {
        setVisStep((prev) => {
          const maxSteps = visualizerState?.steps?.length || 0;
          if (prev >= maxSteps - 1) {
            setVisPlaying(false);
            if (playTimerRef.current) clearInterval(playTimerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, visSpeed);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [visPlaying, visSpeed, visualizerState]);

  // --- Voice Synthesis implementation ---
  const speakExplanation = (questionId: string, textToSpeak: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speechSpeaking === questionId) {
        setSpeechSpeaking(null);
        return;
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => {
      setSpeechSpeaking(null);
    };
    utterance.onerror = () => {
      setSpeechSpeaking(null);
    };

    setSpeechSpeaking(questionId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // --- Bookmark / Solver Triggers ---
  const toggleBookmark = (id: string) => {
    if (savedQuestions.includes(id)) {
      setSavedQuestions(prev => prev.filter(q => q !== id));
      triggerToast('Question removed from bookmarks');
    } else {
      setSavedQuestions(prev => [...prev, id]);
      triggerToast('Question added to bookmarks!');
    }
  };

  const markAsSolved = (id: string) => {
    if (!solvedQuestions.includes(id)) {
      setSolvedQuestions(prev => [...prev, id]);
      triggerToast('Marked as completed! Points added.');
      setStreaks(prev => prev + 1);
    } else {
      setSolvedQuestions(prev => prev.filter(q => q !== id));
      triggerToast('Question marked uncompleted.');
    }
  };

  const [techAnswer, setTechAnswer] = useState('');
  const [evaluatingTech, setEvaluatingTech] = useState(false);
  const [techEvaluation, setTechEvaluation] = useState<any>(null);

  const runTechEvaluation = async (questionText: string) => {
    if (!techAnswer.trim()) {
      alert('Kindly type an answer first!');
      return;
    }
    setEvaluatingTech(true);
    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        company: selectedCompany?.name,
        role: 'Technical Round',
        questions: [{ question: questionText, type: 'text', correctAnswer: '' }],
        answers: [techAnswer]
      };

      const res = await fetch(`${API_BASE_URL}/api/student/assessment/submit-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setTechEvaluation(data);
      } else {
        triggerToast('Failed to evaluate. Please try again.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Evaluation request failed.');
    } finally {
      setEvaluatingTech(false);
    }
  };

  const runHrEvaluation = async (questionText: string) => {
    if (!hrAnswer.trim()) {
      alert('Kindly type an answer first!');
      return;
    }
    setEvaluatingHr(true);
    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        company: selectedCompany?.name,
        role: 'HR Round',
        questions: [{ question: questionText, type: 'text', correctAnswer: '' }],
        answers: [hrAnswer]
      };

      const res = await fetch(`${API_BASE_URL}/api/student/assessment/submit-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setHrEvaluation(data);
      } else {
        triggerToast('Failed to evaluate. Please try again.');
      }
    } catch (err) {
      triggerToast('Evaluation request failed.');
    } finally {
      setEvaluatingHr(false);
    }
  };

  // Construct STAR Answer helper
  const importStarAnswer = () => {
    const combined = `[Situation] ${starInputs.S} \n[Task] ${starInputs.T} \n[Action] ${starInputs.A} \n[Result] ${starInputs.R}`;
    setHrAnswer(combined);
    triggerToast('STAR narrative synced to active text editor!');
  };

  // --- HR Simulator Flow ---
  const launchHrSimulator = async () => {
    if (!selectedCompany) return;
    setSimActive(true);
    setSimFeedback(null);
    setChatMessages([]);
    setIsSimLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/company-simulator/start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Groq-Api-Key': groqApiKey.trim()
        },
        body: JSON.stringify({ company_name: selectedCompany.name })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to start simulator');
      }
      
      setSimSessionId(data.session_id);
      setChatMessages([{ sender: 'ai', text: data.response }]);
    } catch (err: any) {
      console.error(err);
      triggerToast(`Error: ${err.message}`);
      setSimActive(false);
    } finally {
      setIsSimLoading(false);
    }
  };

  const handleSimSubmit = async () => {
    if (!simUserText.trim() || !selectedCompany || !simSessionId) return;

    const userMsg = simUserText;
    const history = chatMessages.map(msg => ({ role: msg.sender === 'ai' ? 'assistant' : 'user', content: msg.text }));
    
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSimUserText('');
    setSimSpeaking(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/company-simulator/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Groq-Api-Key': groqApiKey.trim()
        },
        body: JSON.stringify({
          company_name: selectedCompany.name,
          user_message: userMsg,
          chat_history: history
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to get response');
      }
      
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
    } catch (err: any) {
      console.error(err);
      triggerToast(`Error: ${err.message}`);
    } finally {
      setSimSpeaking(false);
    }
  };

  const endHrSimulator = async () => {
    if (!selectedCompany || chatMessages.length < 2) {
      setSimActive(false);
      return;
    }
    setSimSpeaking(true);
    
    try {
      const history = chatMessages.map(msg => ({ role: msg.sender === 'ai' ? 'assistant' : 'user', content: msg.text }));
      const res = await fetch(`${API_BASE_URL}/api/company-simulator/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Groq-Api-Key': groqApiKey.trim()
        },
        body: JSON.stringify({
          company_name: selectedCompany.name,
          chat_history: history
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to generate feedback');
      }
      
      setSimFeedback(data.feedback);
      triggerToast('Placement readiness report generated.');
      setStreaks(prev => prev + 1);
    } catch (err: any) {
      console.error(err);
      triggerToast(`Error generating feedback: ${err.message}`);
    } finally {
      setSimSpeaking(false);
    }
  };

  // --- Tech Round Quiz Logic ---
  const handleQuizSubmit = () => {
    if (!selectedCompany) return;
    let score = 0;
    selectedCompany.technical.forEach((q, idx) => {
      const selected = selectedQuizAnswers[q.id];
      // simple mock correct checker (index-based)
      if (selected === q.keyPoints[0]) {
        score++;
      }
    });
    setTechQuizScore(Math.round((score / selectedCompany.technical.length) * 100));
    triggerToast('Practice quiz graded successfully!');
  };

  // Resume Analyzer dynamic scoring update
  const handleResumeChange = (field: string, val: string) => {
    setPortfolioData(prev => {
      const updated = { ...prev, [field]: val };
      localStorage.setItem('studlyf_portfolio_data', JSON.stringify(updated));
      const newScore = calculateAtsScore(updated);
      setAtsScore(newScore);
      localStorage.setItem('studlyf_ats_score', newScore.toString());
      return updated;
    });
  };

  // Reset page helper
  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setActiveTab('companies');
  };

  // Filtering companies lists
  const filteredCompanies = PREMIUM_COMPANIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-slate-800 font-['Poppins'] selection:bg-purple-600 selection:text-white pt-28 sm:pt-32 pb-12 transition-colors duration-500 relative">
      
      {/* Background Neon Glowing Orbs */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-purple-100/30 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-pink-50/20 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-violet-50/20 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Toast Notification */}
      <AnimatePresence>
        {isSavedToastOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-[999] bg-gradient-to-r from-purple-900/90 to-violet-800/90 backdrop-blur-xl border border-purple-500/30 px-6 py-3.5 rounded-2xl flex items-center gap-3 shadow-lg shadow-purple-200/50"
          >
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <AnimatePresence mode="wait">
        <InlineErrorBoundary>
          {/* UPPER DASHBOARD BANNER */}
          {!selectedCompany ? (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center max-w-4xl mx-auto mb-12">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-purple-100 text-purple-700 border border-purple-300 px-5 py-2 rounded-full font-black uppercase tracking-[0.35em] text-[9px] mb-6 inline-block backdrop-blur-md"
              >
                STUDLYF v2 • Placement Command Center
              </motion.span>
              <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight tracking-tighter uppercase">
                PLACEMENT{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-violet-500 inline-block animate-pulse">
                  GATES.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Crack the most rigorous algorithmic, core technology, and behavioral interviews at global tech giants using high-fidelity simulations.
              </p>
            </div>

            {/* Premium Stats Blocks */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {[
                { label: 'Active Gates', val: '12+', icon: ShieldCheck, color: 'text-purple-400' },
                { label: 'DSA Visualizers', val: 'Dynamic', icon: Cpu, color: 'text-pink-400' },
                { label: 'HR Simulations', val: 'Speech Sync', icon: MessageSquare, color: 'text-violet-400' },
                { label: 'Streak Status', val: `${streaks} Days 🔥`, icon: Zap, color: 'text-yellow-400' }
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="bg-white backdrop-blur-xl border border-gray-200 shadow-sm hover:border-purple-500/30 p-6 rounded-3xl relative overflow-hidden transition-all group shadow-2xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/15">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="text-2xl font-black text-slate-800 mb-1">{s.val}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Header controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/80 border border-gray-200 p-4 rounded-[2rem] mb-12">
              <div className="relative w-full max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search placement target (e.g. Google)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-xs focus:outline-none focus:border-purple-500 transition-all text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span>Filter Level:</span>
                {['All', 'Elite', 'High', 'Moderate'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setRoleFilter(lvl)}
                    className={`px-4 py-2 rounded-xl border transition-all ${roleFilter === lvl ? 'bg-purple-100 border-purple-500 text-slate-700' : 'bg-transparent border-gray-200 hover:border-white/[0.2]'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompanies
                .filter((comp) => roleFilter === 'All' || comp.difficulty === roleFilter)
                .map((comp) => {
                  return (
                    <motion.div
                      key={comp.id}
                      onClick={() => {
                        setSelectedCompany(comp);
                        setActiveTab('overview');
                      }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="bg-white backdrop-blur-xl border border-gray-200 shadow-sm hover:border-purple-500/40 rounded-[2.5rem] p-8 relative overflow-hidden group cursor-pointer shadow-2xl transition-all"
                    >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent blur-2xl rounded-full" />
                    
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-16 h-16 bg-white p-3 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <img src={comp.logo} alt={comp.name} className="max-w-full max-h-full object-contain" onError={(e) => { const t = e.currentTarget; const domain = comp.id === 'flipkart' ? 'flipkart.com' : comp.id === 'tcs' ? 'tcs.com' : comp.id === 'atlassian' ? 'atlassian.com' : comp.id + '.com'; t.onerror = null; t.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`; }} />
                      </div>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${comp.difficulty === 'Elite' ? 'bg-red-950 text-red-400 border border-red-500/30' : comp.difficulty === 'High' ? 'bg-orange-950 text-orange-400 border border-orange-500/30' : 'bg-green-950 text-green-400 border border-green-500/30'}`}>
                        {comp.difficulty}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-purple-400 transition-colors mb-2">{comp.name}</h3>
                    <p className="text-xs text-slate-400 mb-6 font-semibold">{comp.industry}</p>

                    {/* Status Indicator */}
                    <div className="mb-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        comp.completion === 100 
                          ? 'bg-green-100/50 text-green-600 border border-green-200' 
                          : comp.completion === 0 
                            ? 'bg-gray-100/50 text-slate-500 border border-gray-200'
                            : 'bg-purple-100/50 text-purple-600 border border-purple-200'
                      }`}>
                        {comp.completion === 100 && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                        {comp.completion > 0 && comp.completion < 100 && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />}
                        {comp.completion === 0 && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                        {comp.completion === 100 ? 'Completed' : comp.completion === 0 ? 'Not Started' : 'In Progress'}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-gray-200 pt-5 text-slate-400">
                      <div>
                        <span className="block font-black text-slate-700">{comp.stats.placed}+ Placed</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-600">Alumni</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-purple-400">{comp.stats.avgpackage}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-600">Avg Package</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </motion.div>
        ) : (
          
          /* ACTIVE COMPANY TARGET DASHBOARD */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col lg:flex-row items-start gap-8"
          >
            
            {/* LEFT GLOWING SIDEBAR */}
            <div className="flex-shrink-0 transition-all duration-300 w-full lg:w-72 lg:sticky lg:top-28 z-20 self-start">
              <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[2rem] p-3.5 sm:p-4 shadow-2xl space-y-3.5 max-h-[calc(100vh-8.5rem)] overflow-y-auto no-scrollbar">
                
                {/* Header Back Button */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                  <button
                    onClick={handleBackToCompanies}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Exit Gate
                  </button>
                  <span className="text-[8px] bg-purple-100/50 px-2 py-0.5 rounded border border-purple-500/20 text-purple-400 font-bold uppercase">Active</span>
                </div>

                {/* Company logo profile */}
                <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-white p-1.5 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <img src={selectedCompany.logo} alt="" className="max-w-full max-h-full object-contain" onError={(e) => { const t = e.currentTarget; const domain = selectedCompany.id === 'flipkart' ? 'flipkart.com' : selectedCompany.id === 'tcs' ? 'tcs.com' : selectedCompany.id === 'atlassian' ? 'atlassian.com' : selectedCompany.id + '.com'; t.onerror = null; t.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`; }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider truncate">{selectedCompany.name}</h3>
                    <p className="text-[9px] text-slate-400 font-semibold">{selectedCompany.difficulty} Target</p>
                  </div>
                </div>

                {/* Required Skills Highlight */}
                <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/50">
                  <h4 className="text-[9px] font-black uppercase text-purple-800 tracking-wider mb-1.5 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCompany.hiringRoles?.map((role, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-white border border-purple-200 text-purple-700 rounded-md text-[8px] font-bold">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Navigation items */}
                <div className="space-y-1">
                  {[
                    { id: 'overview', label: 'Company Overview', icon: Info },
                    { id: 'dsa', label: 'DSA Matrix', icon: Terminal },
                    { id: 'tech', label: 'Tech Round', icon: Cpu },
                    { id: 'hr', label: 'HR Round', icon: Briefcase },
                    { id: 'resume', label: 'Resume Portfolio', icon: FileText },
                    { id: 'mock', label: 'Mock Interview', icon: Zap },
                    { id: 'progress', label: 'Progress Tracker', icon: BarChart3 }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab(t.id as any);
                        setSimActive(false);
                        setSelectedQuestion(null);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === t.id
                        ? 'bg-purple-500/10 border-purple-500/40 text-purple-700 shadow-sm'
                        : 'bg-transparent border-transparent text-slate-700 hover:bg-white hover:text-slate-900'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <t.icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </div>
                      {activeTab === t.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm" />}
                    </button>
                  ))}
                </div>

                {/* Status Indicator */}
                <div className="bg-[#130E26]/90 p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center text-[9px] uppercase font-black text-slate-400">
                    <span>Gate Status</span>
                    <span className={`px-2 py-0.5 rounded border ${
                      selectedCompany.completion === 100 
                        ? 'bg-green-950 text-green-400 border-green-500/30' 
                        : selectedCompany.completion === 0 
                          ? 'bg-gray-800 text-slate-300 border-gray-600'
                          : 'bg-purple-950 text-purple-400 border-purple-500/30'
                    }`}>
                      {selectedCompany.completion === 100 ? 'Completed' : selectedCompany.completion === 0 ? 'Not Started' : 'In Progress'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT MAIN WORKSPACE */}
            <div className="flex-grow min-w-0">
              <div className="bg-white backdrop-blur-xl border border-gray-200 shadow-sm rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-2xl min-h-[600px] relative overflow-hidden">
                
                {/* Visual Background Orbs inside container */}
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >

                    {/* ====================================================
                        TAB: OVERVIEW
                        ==================================================== */}
                    {activeTab === 'overview' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center justify-center p-3 flex-shrink-0">
                            <img src={selectedCompany.logo} alt={selectedCompany.name} className="max-w-full max-h-full object-contain" onError={(e) => { const t = e.currentTarget; const domain = selectedCompany.id + '.com'; t.onerror = null; t.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`; }} />
                          </div>
                          <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800 mb-1">{selectedCompany.name} Overview</h2>
                            <p className="text-xs font-semibold text-slate-400">Everything you need to know to crack {selectedCompany.name}.</p>
                          </div>
                        </header>

                        {/* Company Stats Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl text-white shadow-lg shadow-purple-200">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-80 block mb-1">Industry</span>
                            <p className="text-xs font-bold leading-tight">{selectedCompany.industry.split('&')[0].trim()}</p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-80 block mb-1">Difficulty</span>
                            <p className="text-xs font-bold">{selectedCompany.difficulty}</p>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl text-white shadow-lg shadow-emerald-200">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-80 block mb-1">Avg Package</span>
                            <p className="text-xs font-bold">{selectedCompany.salaryRange}</p>
                          </div>
                          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl text-white shadow-lg shadow-orange-200">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-80 block mb-1">Roles</span>
                            <p className="text-xs font-bold">{selectedCompany.hiringRoles.length} Openings</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow">
                            <h3 className="text-sm font-black uppercase text-slate-800 mb-4 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-purple-500" /> Industry & Culture
                            </h3>
                            <p className="text-xs text-slate-600 mb-4"><span className="font-bold text-slate-800">Industry:</span> {selectedCompany.industry}</p>
                            <p className="text-xs text-slate-600"><span className="font-bold text-slate-800">Culture:</span> {selectedCompany.culture}</p>
                          </div>
                          
                          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow">
                            <h3 className="text-sm font-black uppercase text-slate-800 mb-4 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-purple-500" /> Hiring Pipeline
                            </h3>
                            <ul className="space-y-3">
                              {selectedCompany.interviewRounds?.map((round, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-black text-[10px]">{idx + 1}</div>
                                  {round}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Founders & Focus Section */}
                        {(selectedCompany.founders || selectedCompany.focus) && (
                          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl">
                            <h3 className="text-sm font-black uppercase text-slate-800 mb-6 flex items-center gap-2">
                              <User className="w-4 h-4 text-purple-500" /> Key People & Mission
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                              {selectedCompany.focus && (
                                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                                  <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3"/> Company Focus</span>
                                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{selectedCompany.focus}</p>
                                </div>
                              )}
                              
                              {selectedCompany.motto && (
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                  <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider block mb-1 flex items-center gap-1"><Award className="w-3 h-3"/> Motto</span>
                                  <p className="text-sm text-slate-700 font-medium leading-relaxed italic">{selectedCompany.motto}</p>
                                </div>
                              )}
                            </div>

                            {selectedCompany.hiringPhilosophy && (
                              <div className="mb-8 p-5 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500"/> Hiring Philosophy</span>
                                <p className="text-sm text-slate-700 font-medium leading-relaxed relative z-10">{selectedCompany.hiringPhilosophy}</p>
                              </div>
                            )}

                            {selectedCompany.founders && (
                              <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-4">Founders / Leadership</span>
                                <div className="flex flex-wrap gap-8">
                                  {selectedCompany.founders?.map((founder, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-gray-50/50 pr-6 rounded-full border border-gray-100 transition-all hover:border-purple-200 hover:bg-purple-50/30">
                                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md relative group">
                                        <img src={founder.image} alt={founder.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { const t = e.currentTarget; t.onerror = null; t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.name)}&background=random&color=fff&bold=true&size=128`; }} />
                                      </div>
                                      <div>
                                        <h4 className="font-black text-sm text-slate-800">{founder.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{founder.title}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Required Roles Section */}
                        {selectedCompany.hiringRoles && selectedCompany.hiringRoles.length > 0 && (
                          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl">
                            <h3 className="text-sm font-black uppercase text-slate-800 mb-4 flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-purple-500" /> Open Roles
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedCompany.hiringRoles?.map((role, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-bold rounded-full">{role}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ====================================================
                        TAB: DSA MATRIX
                        ==================================================== */}
                    {activeTab === 'dsa' && (
                      <div className="space-y-8">
                        {!selectedQuestion ? (
                          <>
                            <header>
                              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800 mb-2">DSA Matrix</h2>
                              <p className="text-xs font-semibold text-slate-400">Master frequently asked coding challenges for {selectedCompany.name}.</p>
                            </header>

                            <div className="grid gap-6">
                              {selectedCompany.dsa?.map((q) => (
                                <div
                                  key={q.id}
                                  className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-purple-500/30 p-6 rounded-3xl transition-all shadow-xl group"
                                >
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                      <span className={`w-2.5 h-2.5 rounded-full ${q.difficulty === 'Hard' ? 'bg-red-500' : q.difficulty === 'Medium' ? 'bg-orange-400' : 'bg-green-400'}`} />
                                      <h4 className="text-xl font-bold text-slate-800">{q.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] uppercase font-black px-2.5 py-1 bg-purple-50/70 border border-purple-500/20 text-purple-400 rounded-lg">Freq: {q.frequency}%</span>
                                      <button
                                        onClick={() => toggleBookmark(q.id)}
                                        className="p-2 bg-gray-100 border border-gray-100 hover:border-purple-500/30 rounded-xl transition-all"
                                      >
                                        <Bookmark className={`w-4 h-4 ${savedQuestions.includes(q.id) ? 'fill-purple-500 text-purple-500' : 'text-slate-400'}`} />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                    <div className="p-4 bg-gray-100/50 rounded-2xl border border-gray-100">
                                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Time | Space</span>
                                      <span className="font-bold text-slate-700 text-xs">{q.time} | {q.space}</span>
                                    </div>
                                    <div className="p-4 bg-gray-100/50 rounded-2xl border border-gray-100 lg:col-span-2">
                                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Algorithmic Approach</span>
                                      <span className="text-xs text-slate-400 font-medium leading-relaxed">{q.approach}</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">
                                    <div className="flex gap-2">
                                      {q.tags?.map(t => (
                                        <span key={t} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{t}</span>
                                      ))}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => setSelectedQuestion(q)}
                                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2"
                                      >
                                        <Play className="w-3 h-3 fill-white" /> Practice challenge
                                      </button>
                                      <button
                                        onClick={() => markAsSolved(q.id)}
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${solvedQuestions.includes(q.id) ? 'bg-green-950 border-green-500/40 text-green-400' : 'bg-transparent border-gray-200 hover:border-white/[0.2] text-slate-600'}`}
                                      >
                                        {solvedQuestions.includes(q.id) ? '✓ Completed' : 'Mark Completed'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          
                          /* DSA QUESTION ACTIVE PREPARATION INTERFACE */
                          <div className="space-y-8">
                            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
                              <div>
                                <button
                                  onClick={() => setSelectedQuestion(null)}
                                  className="text-xs font-black uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 mb-2"
                                >
                                  <ArrowLeft className="w-4 h-4" /> Back to Matrix
                                </button>
                                <div className="flex items-center gap-3">
                                  <span className={`w-2.5 h-2.5 rounded-full ${selectedQuestion.difficulty === 'Hard' ? 'bg-red-500' : selectedQuestion.difficulty === 'Medium' ? 'bg-orange-400' : 'bg-green-400'}`} />
                                  <h3 className="text-2xl font-bold text-slate-800">{selectedQuestion.title}</h3>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-[9px] uppercase font-black px-3 py-1.5 bg-gray-100 border border-gray-200 text-slate-400 rounded-lg">Time: {selectedQuestion.time}</span>
                                <button
                                  onClick={() => toggleBookmark(selectedQuestion.id)}
                                  className="p-2.5 bg-gray-100 border border-gray-200 rounded-xl transition-all"
                                >
                                  <Bookmark className={`w-4 h-4 ${savedQuestions.includes(selectedQuestion.id) ? 'fill-purple-500 text-purple-500' : 'text-slate-400'}`} />
                                </button>
                              </div>
                            </header>

                            {/* 3D DSA VISUALIZER SCREEN */}
                            <div className="bg-gray-100 rounded-[2rem] border border-gray-200 p-4 sm:p-6 shadow-xl relative overflow-hidden">

                              {/* Dynamic Step Action Header Bar */}
                              {visualizerState && !visualizerState.unsupported && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 bg-[#0C061E] text-white p-3.5 sm:px-5 sm:py-3 rounded-2xl border border-purple-500/30 shadow-lg">
                                  <div className="flex items-center gap-2.5 shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                                      Step {visStep + 1} of {visualizerState?.steps?.length || 1}
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-purple-400/60 hidden md:inline-block">| STUDLYF 3D Visualizer</span>
                                  </div>
                                  <p className="text-xs text-slate-200 font-semibold leading-snug sm:text-right">
                                    {visualizerState?.steps?.[visStep]?.desc || 'Executing algorithm...'}
                                  </p>
                                </div>
                              )}

                              {/* Canvas visualizer viewport */}
                              <div className="w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[400px] bg-gradient-to-br from-[#1e1b4b] via-[#0C061E] to-black border border-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center overflow-hidden relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]" style={{ perspective: '1000px' }}>

                                {/* Unsupported Visualizer Fallback */}
                                {visualizerState?.unsupported && (
                                  <div className="flex flex-col items-center justify-center w-full h-full text-center p-6 text-gray-400">
                                    <Terminal className="w-12 h-12 mb-4 text-gray-500 opacity-50" />
                                    <p className="font-semibold text-lg">{visualizerState.message}</p>
                                    <p className="text-sm mt-2 max-w-sm">Our engineers are working to build a dynamic algorithm engine for this specific question.</p>
                                  </div>
                                )}

                                {/* 3D Traversal rendering */}
                                {selectedQuestion.visualizerType === 'tree' && visualizerState && !visualizerState.unsupported && (
                                  <div className="w-full h-full min-h-[260px] sm:min-h-[320px] lg:min-h-[360px] flex items-center justify-center relative overflow-hidden py-6 sm:py-8">
                                    <div className="relative w-[320px] sm:w-[380px] h-[240px] sm:h-[280px] scale-[0.8] sm:scale-[1.0] md:scale-[1.2] lg:scale-[1.3]">
                                      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                                      {/* Render link connections */}
                                      {(visualizerState.nodes || []).map((node: any) => {
                                        const myVal = visualizerState?.steps?.[visStep]?.nodeVals?.[node.id] ?? node.val;
                                        if (myVal === null || myVal === '') return null;
                                        
                                        const res = [];
                                        if (node.left !== undefined) {
                                          const target = visualizerState.nodes.find((n: any) => n.id === node.left) || visualizerState.nodes[node.left];
                                          if (target) {
                                            const tVal = visualizerState?.steps?.[visStep]?.nodeVals?.[target.id] ?? target.val;
                                            if (tVal !== null && tVal !== '') {
                                              res.push(<line key={`l-${node.id}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} stroke="rgba(124,58,237,0.2)" strokeWidth={2} />);
                                            }
                                          }
                                        }
                                        if (node.right !== undefined) {
                                          const target = visualizerState.nodes.find((n: any) => n.id === node.right) || visualizerState.nodes[node.right];
                                          if (target) {
                                            const tVal = visualizerState?.steps?.[visStep]?.nodeVals?.[target.id] ?? target.val;
                                            if (tVal !== null && tVal !== '') {
                                              res.push(<line key={`r-${node.id}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} stroke="rgba(124,58,237,0.2)" strokeWidth={2} />);
                                            }
                                          }
                                        }
                                        return res;
                                      })}
                                    </svg>

                                    {/* Render Node Bubbles */}
                                    {(visualizerState.nodes || []).map((node: any) => {
                                      const activeHighlight = visualizerState?.steps?.[visStep]?.highlight || [];
                                      const isHighlighted = activeHighlight.includes(node.id);
                                      const currentNode = visualizerState?.steps?.[visStep]?.node === node.id;
                                      
                                      const dynamicVal = visualizerState?.steps?.[visStep]?.nodeVals?.[node.id];
                                      const displayVal = dynamicVal !== undefined ? dynamicVal : node.val;
                                      if (displayVal === null) return null; // allow hiding node
                                      
                                      const isEmptySlot = displayVal === '';

                                      return (
                                        <motion.div
                                          key={`n-${node.id}`}
                                          style={{ left: node.x - 20, top: node.y - 20 }}
                                          className={`absolute w-10 h-10 rounded-full flex flex-col items-center justify-center font-black text-xs transition-all duration-300 ${
                                            isHighlighted
                                              ? 'bg-yellow-400 border-yellow-200 text-black scale-125 z-30 shadow-[0_0_30px_rgba(250,204,21,0.8)]'
                                              : currentNode
                                              ? 'bg-fuchsia-500 border-fuchsia-300 text-white z-20 shadow-[0_0_20px_rgba(217,70,239,0.8)]'
                                              : isEmptySlot
                                              ? 'bg-transparent border border-dashed border-white/20 text-transparent'
                                              : 'bg-white/5 border border-white/20 text-slate-200 shadow-lg backdrop-blur-md'
                                          }`}
                                          animate={isHighlighted ? { scale: [1, 1.25, 1] } : {}}
                                          transition={{ repeat: isHighlighted ? Infinity : 0, duration: 1.5 }}
                                        >
                                          <span>{displayVal}</span>
                                        </motion.div>
                                      );
                                    })}
                                    </div>
                                  </div>
                                )}

                                {/* Dynamic Rain Water Elevation Chart Visualizer */}
                                {(selectedQuestion.visualizerType === 'rain-water' || selectedQuestion.title === 'Trapping Rain Water') && visualizerState && !visualizerState.unsupported && (
                                  <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 w-full px-2 sm:px-8 py-4">
                                    <div className="flex items-end justify-center gap-1.5 sm:gap-3 w-full max-w-3xl h-56 sm:h-64 px-2 sm:px-4 bg-black/40 border border-white/10 rounded-3xl p-4 sm:p-6 backdrop-blur-md relative shadow-2xl overflow-x-auto no-scrollbar">
                                      {(() => {
                                        const heightArr = visualizerState.height || [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
                                        const step = visualizerState?.steps?.[visStep] || {};
                                        const trappedArr = step.trappedWater || new Array(heightArr.length).fill(0);
                                        const maxBarVal = Math.max(...heightArr, 1);
                                        const scaleFactor = 150 / maxBarVal;

                                        return heightArr.map((hVal: number, idx: number) => {
                                          const isLeft = step.left === idx;
                                          const isRight = step.right === idx;
                                          const isActive = step.activeIdx === idx;
                                          const waterVal = trappedArr[idx] || 0;

                                          const barPx = Math.max(16, hVal * scaleFactor);
                                          const waterPx = waterVal * scaleFactor;

                                          return (
                                            <div key={idx} className="flex flex-col items-center relative group flex-1 max-w-[48px]">
                                              <div className="absolute -top-10 flex flex-col items-center z-30 transition-all duration-300">
                                                {isLeft && (
                                                  <span className="bg-purple-600 border border-purple-300 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-bounce">
                                                    LEFT
                                                  </span>
                                                )}
                                                {isRight && !isLeft && (
                                                  <span className="bg-yellow-400 border border-yellow-200 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-bounce">
                                                    RIGHT
                                                  </span>
                                                )}
                                                {isLeft && isRight && (
                                                  <span className="bg-emerald-500 border border-emerald-300 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-bounce">
                                                    MEET
                                                  </span>
                                                )}
                                              </div>

                                              {waterPx > 0 && (
                                                <motion.div
                                                  initial={{ scaleY: 0 }}
                                                  animate={{ scaleY: 1 }}
                                                  transition={{ duration: 0.4 }}
                                                  style={{ height: `${waterPx}px` }}
                                                  className="w-full bg-gradient-to-t from-cyan-600/80 to-cyan-400/90 border border-cyan-300/60 rounded-t-lg flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_15px_rgba(6,182,212,0.6)] backdrop-blur-sm z-10"
                                                >
                                                  +{waterVal}
                                                </motion.div>
                                              )}

                                              <div
                                                style={{ height: `${barPx}px` }}
                                                className={`w-full rounded-t-md border-x border-t transition-all duration-300 flex flex-col items-center justify-between py-1 font-black text-xs ${
                                                  isActive
                                                    ? 'bg-gradient-to-t from-purple-800 to-purple-500 border-purple-300 text-white shadow-[0_0_25px_rgba(168,85,247,0.8)] scale-105 z-20'
                                                    : 'bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700 border-slate-600 text-slate-200 shadow-md'
                                                }`}
                                              >
                                                <span>{hVal}</span>
                                              </div>

                                              <span className="text-[9px] text-slate-400 font-mono mt-2">{idx}</span>
                                            </div>
                                          );
                                        });
                                      })()}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[10px] sm:text-xs font-black uppercase text-slate-200 bg-black/60 px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl sm:rounded-full border border-purple-500/20 backdrop-blur-md shadow-xl">
                                      <span className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" /> 
                                        Trapped Water: <span className="text-cyan-300 text-xs sm:text-sm">{visualizerState?.steps?.[visStep]?.totalWater ?? 0} Units</span>
                                      </span>
                                      <span className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-purple-400" /> 
                                        Left Max: <span className="text-purple-300">{visualizerState?.steps?.[visStep]?.leftMax ?? 0}</span>
                                      </span>
                                      <span className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> 
                                        Right Max: <span className="text-yellow-300">{visualizerState?.steps?.[visStep]?.rightMax ?? 0}</span>
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* 3D Sliding Window rendering */}
                                {selectedQuestion.visualizerType === 'sliding-window' && visualizerState && !visualizerState.unsupported && (
                                  <div className="flex flex-col items-center justify-center space-y-8 w-full px-6">
                                    <div className="flex gap-3 relative py-4">
                                      {(visualizerState.chars || []).map((char: string, idx: number) => {
                                        const step = visualizerState?.steps?.[visStep] || { left: 0, right: 0, conflictIdx: -1 };
                                        const insideWindow = idx >= step.left && idx <= step.right;
                                        const isConflict = idx === step.conflictIdx;
                                        return (
                                          <div
                                            key={idx}
                                            className={`w-12 h-12 rounded-xl border backdrop-blur-md flex flex-col items-center justify-center font-black transition-all duration-300 relative ${
                                              isConflict
                                                ? 'bg-red-500/20 border-red-500 text-red-200 animate-bounce shadow-[0_0_20px_rgba(239,68,68,0.5)] z-20'
                                                : insideWindow
                                                ? 'bg-purple-500/20 border-purple-400 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.4)] z-10'
                                                : 'bg-white/5 border-white/10 text-slate-300'
                                            }`}
                                          >
                                            <span className="text-lg drop-shadow-md">{char}</span>
                                            <span className="text-[7px] text-slate-400 absolute bottom-1">{idx}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {/* Stats panel */}
                                    <div className="flex gap-4 text-[10px] font-black uppercase text-purple-200/70 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /> Window: [{visualizerState?.steps?.[visStep]?.left} - {visualizerState?.steps?.[visStep]?.right}]</span>
                                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400" /> {visualizerState?.steps?.[visStep]?.statLabel || 'Max Substring Length'}: {visualizerState?.steps?.[visStep]?.statValue ?? visualizerState?.steps?.[visStep]?.maxLen}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Linked list Pointer rendering */}
                                {selectedQuestion.visualizerType === 'linked-list' && visualizerState && !visualizerState.unsupported && (
                                  <div className="flex flex-wrap items-center justify-center gap-4 w-full px-6">
                                    {(visualizerState?.steps?.[visStep]?.nodes || visualizerState.nodes || []).map((nodeObj: any, idx: number, arr: any[]) => {
                                      const node = typeof nodeObj === 'object' ? nodeObj.val : nodeObj;
                                      const label = typeof nodeObj === 'object' ? nodeObj.label : null;
                                      const isHead = typeof nodeObj === 'object' && nodeObj.isHead;
                                      const isTail = typeof nodeObj === 'object' && nodeObj.isTail;
                                      const step = visualizerState?.steps?.[visStep] || { curr: -1, prev: -1 };
                                      const isCurr = step.curr === idx || step.curr === nodeObj?.id;
                                      const isPrev = step.prev === idx || step.prev === nodeObj?.id;
                                      const isReversed = visualizerState.isReverseProblem ? idx < visStep : false;
                                      return (
                                        <React.Fragment key={typeof nodeObj === 'object' ? nodeObj.id : idx}>
                                          <div
                                            className={`w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center font-black transition-all duration-300 relative ${
                                              isCurr
                                                ? 'bg-yellow-400 border-yellow-200 text-black scale-125 z-30 shadow-[0_0_30px_rgba(250,204,21,0.8)]'
                                                : isPrev
                                                ? 'bg-fuchsia-500 border-fuchsia-300 text-white z-20 shadow-[0_0_20px_rgba(217,70,239,0.8)]'
                                                : 'bg-white/5 border-white/20 text-slate-200 shadow-lg'
                                            }`}
                                          >
                                            <span className="text-xs">{node}</span>
                                            {isCurr && <span className="absolute -top-6 text-[8px] uppercase tracking-wider text-yellow-400 font-bold">curr</span>}
                                            {isPrev && <span className="absolute -top-6 text-[8px] uppercase tracking-wider text-purple-400 font-bold">prev</span>}
                                            {label && !isCurr && !isPrev && <span className="absolute -top-6 text-[8px] uppercase tracking-wider text-blue-400 font-bold">{label}</span>}
                                            {isHead && <span className="absolute -bottom-6 text-[8px] uppercase tracking-wider text-emerald-400 font-bold">head</span>}
                                            {isTail && <span className="absolute -bottom-6 text-[8px] uppercase tracking-wider text-rose-400 font-bold">tail</span>}
                                          </div>
                                          {idx < arr.length - 1 && (
                                            <motion.div
                                              animate={isReversed ? { rotate: 180 } : { rotate: 0 }}
                                              className="text-purple-500 font-bold text-lg flex items-center gap-1"
                                            >
                                              {visualizerState.isDoublyLinked ? '↔' : '➔'}
                                            </motion.div>
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Dynamic DP table filling visualization */}
                                {selectedQuestion.visualizerType === 'dp' && visualizerState && !visualizerState.unsupported && (
                                  <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${visualizerState.cols || visualizerState.n}, minmax(0, 1fr))` }}>
                                      {Array(visualizerState.rows || visualizerState.n).fill(null).map((_, r) => (
                                        Array(visualizerState.cols || visualizerState.n).fill(null).map((_, c) => {
                                          const currentStep = visualizerState?.steps?.[visStep] || { row: -1, col: -1 };
                                          const isActiveCell = currentStep.row === r && currentStep.col === c;
                                          
                                          // check if filled in current history steps
                                          let isFilled = false;
                                          let cellVal: any = false;
                                          for (let s = 0; s <= visStep; s++) {
                                            const step = visualizerState?.steps?.[s];
                                            if (step.row === r && step.col === c) {
                                              isFilled = true;
                                              cellVal = step.val;
                                            }
                                          }

                                          const isBoolVal = typeof cellVal === 'boolean';
                                          const displayVal = isFilled ? (isBoolVal ? (cellVal ? 'T' : 'F') : cellVal) : '-';

                                          return (
                                            <div
                                              key={`${r}-${c}`}
                                              className={`w-9 h-9 rounded-lg border text-[10px] font-mono flex items-center justify-center transition-all duration-300 ${
                                                isActiveCell
                                                  ? 'bg-yellow-400 border-yellow-200 text-black scale-125 z-20 shadow-[0_0_20px_rgba(250,204,21,0.8)]'
                                                  : isFilled
                                                  ? (isBoolVal ? (cellVal ? 'bg-green-500/20 border-green-400/50 text-green-300 font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-red-500/20 border-red-500/50 text-red-300') : 'bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-200 font-bold shadow-[0_0_10px_rgba(217,70,239,0.3)]')
                                                  : 'bg-white/5 border-white/10 text-slate-400 backdrop-blur-sm'
                                              }`}
                                            >
                                              {displayVal}
                                            </div>
                                          );
                                        })
                                      ))}
                                    </div>
                                    <div className="bg-black/40 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                      <span className="text-[9px] font-black text-purple-200/70 uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"/> DP State Matrix</span>
                                    </div>
                                  </div>
                                )}

                                {/* Sorting/Array visualizer bar list */}
                                {(selectedQuestion.visualizerType === 'sorting' || selectedQuestion.visualizerType === 'array') && visualizerState && !visualizerState.unsupported && (
                                  <div className="flex items-end justify-center gap-4 w-full h-48 px-6">
                                    {(() => {
                                      const arr = visualizerState?.steps?.[visStep]?.arr || visualizerState.initialArr || [];
                                      if (arr.length === 0) {
                                        return (
                                          <div className="flex flex-col items-center justify-center w-full h-full text-slate-500/50">
                                            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-600/50 flex items-center justify-center mb-4">
                                              <span className="text-2xl font-black text-slate-600/50">?</span>
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest">Empty Array</span>
                                          </div>
                                        );
                                      }
                                      return arr.map((val: number, idx: number) => {
                                        const step = visualizerState?.steps?.[visStep] || { pivot: -1, active: [-1, -1] };
                                        const isPivot = step.pivot === idx;
                                        const isActive = step.active && step.active.includes(idx);
                                        return (
                                          <div key={idx} className="flex flex-col items-center">
                                            <div
                                              style={{ height: `${Math.max(24, Math.min(val * 20, 160))}px` }}
                                              className={`w-10 rounded-t-xl transition-all duration-300 flex items-center justify-center font-black text-xs backdrop-blur-sm border-x border-t ${
                                                isPivot
                                                  ? 'bg-yellow-400 border-yellow-200 text-black shadow-[0_0_30px_rgba(250,204,21,0.6)] z-20'
                                                  : isActive
                                                  ? 'bg-fuchsia-500 border-fuchsia-300 text-white shadow-[0_0_20px_rgba(217,70,239,0.6)] z-10 animate-pulse'
                                                  : 'bg-white/10 border-white/20 text-slate-300 shadow-lg'
                                              }`}
                                            >
                                              {val}
                                            </div>
                                            <span className="text-[8px] text-slate-400 mt-2">{idx}</span>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                )}

                                {/* Graph visualizer rendering */}
                                {selectedQuestion.visualizerType === 'graph' && visualizerState && !visualizerState.unsupported && (
                                  <div className="w-full h-full min-h-[260px] sm:min-h-[320px] lg:min-h-[360px] flex items-center justify-center relative overflow-hidden">
                                    <div className="relative w-[320px] sm:w-[380px] h-[240px] sm:h-[280px] scale-[0.8] sm:scale-[1.0] md:scale-[1.25] lg:scale-[1.35]">
                                      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                                      <defs>
                                        <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(168,85,247,0.8)" />
                                        </marker>
                                        <marker id="arrow-processed" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(34,197,94)" />
                                        </marker>
                                        <marker id="arrow-processing" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(234,179,8)" />
                                        </marker>
                                      </defs>
                                      {(visualizerState.edges || []).map((edge: any) => {
                                        const fromNode = visualizerState.nodes.find((n: any) => n.id === edge.from) || visualizerState.nodes[edge.from];
                                        const toNode = visualizerState.nodes.find((n: any) => n.id === edge.to) || visualizerState.nodes[edge.to];
                                        
                                        if (!fromNode || !toNode) return null;
                                        
                                        const step = visualizerState?.steps?.[visStep];
                                        const key = `${edge.from}-${edge.to}`;
                                        const edgeState = step?.edgesState?.[key] || 'normal';
                                        
                                        return (
                                          <line
                                            key={key}
                                            x1={fromNode.x}
                                            y1={fromNode.y}
                                            x2={toNode.x}
                                            y2={toNode.y}
                                            stroke={edgeState === 'processed' ? '#22c55e' : edgeState === 'processing' ? '#eab308' : '#ffffff'}
                                            strokeWidth={edgeState === 'normal' ? 3 : 5}
                                            markerEnd={edgeState === 'processed' ? 'url(#arrow-processed)' : edgeState === 'processing' ? 'url(#arrow-processing)' : 'url(#arrow)'}
                                          />
                                        );
                                      })}
                                    </svg>

                                    {/* Render Graph Nodes */}
                                    {(visualizerState.nodes || []).map((node: any) => {
                                      const step = visualizerState?.steps?.[visStep];
                                      const nodeState = step?.nodesState?.[node.id] || 'normal';
                                      const inQueue = step?.queue?.includes(node.id);
                                      
                                      return (
                                        <motion.div
                                          key={node.id}
                                          style={{ left: node.x - 20, top: node.y - 20 }}
                                          className={`absolute w-10 h-10 rounded-full flex flex-col items-center justify-center font-black text-xs border backdrop-blur-md transition-all duration-300 ${
                                            nodeState === 'processing' || nodeState === 'highlight'
                                              ? 'bg-yellow-400 border-yellow-200 text-black scale-125 z-30 shadow-[0_0_30px_rgba(250,204,21,0.8)]'
                                              : nodeState === 'processed'
                                              ? 'bg-fuchsia-500 border-fuchsia-300 text-white z-20 shadow-[0_0_20px_rgba(217,70,239,0.8)]'
                                              : nodeState === 'error'
                                              ? 'bg-red-500 border-red-300 text-white z-20 shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                                              : 'bg-white/5 border-white/20 text-slate-200 shadow-lg'
                                          }`}
                                          animate={nodeState === 'processing' || nodeState === 'highlight' ? { scale: [1, 1.25, 1] } : nodeState === 'error' ? { x: [-5, 5, -5, 5, 0] } : {}}
                                          transition={nodeState === 'error' ? { duration: 0.4 } : { repeat: Infinity, duration: 1.5 }}
                                        >
                                          <span>{node.label || node.val || node.id}</span>
                                          {inQueue && <span className="absolute -top-6 text-[9px] text-yellow-400 font-bold uppercase tracking-wider">Queue</span>}
                                        </motion.div>
                                      );
                                    })}
                                    </div>

                                    {/* Stats panel for graph */}
                                    {(visualizerState?.steps?.[visStep]?.queue || visualizerState?.steps?.[visStep]?.inDegrees) && (
                                      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex flex-wrap gap-2 text-[9px] font-black uppercase text-slate-300 z-10 bg-[#0C061E]/90 backdrop-blur border border-purple-500/20 px-3 py-1.5 rounded-xl max-w-[calc(100%-1.5rem)]">
                                        {visualizerState?.steps?.[visStep]?.queue && <span>Queue: [{visualizerState.steps[visStep].queue.join(', ')}]</span>}
                                        {visualizerState?.steps?.[visStep]?.inDegrees && <span>In-degrees: {JSON.stringify(visualizerState.steps[visStep].inDegrees)}</span>}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Matrix visualizer rendering */}
                                {selectedQuestion.visualizerType === 'matrix' && visualizerState && !visualizerState.unsupported && (
                                  <div className="flex flex-col items-center justify-center space-y-6 w-full h-full px-4 overflow-x-auto no-scrollbar py-4">
                                    <div 
                                      className="grid gap-2" 
                                      style={{ gridTemplateColumns: `repeat(${visualizerState.matrix?.[0]?.length || 1}, minmax(0, 1fr))` }}
                                    >
                                      {(visualizerState.matrix || []).map((row: any[], rIdx: number) => (
                                        row.map((cell: any, cIdx: number) => {
                                          const step = visualizerState?.steps?.[visStep] || { active: [-1, -1], visited: [] };
                                          const isActive = step.active?.[0] === rIdx && step.active?.[1] === cIdx;
                                          const isVisited = step.visited?.some((v: any) => v[0] === rIdx && v[1] === cIdx);
                                          
                                          return (
                                            <div
                                              key={`${rIdx}-${cIdx}`}
                                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border backdrop-blur-md flex items-center justify-center font-black transition-all duration-300 relative ${
                                                isActive
                                                  ? 'bg-yellow-400 border-yellow-200 text-black scale-110 z-20 shadow-[0_0_20px_rgba(250,204,21,0.8)]'
                                                  : isVisited
                                                  ? 'bg-fuchsia-500 border-fuchsia-300 text-white z-10 shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                                                  : 'bg-white/5 border-white/10 text-slate-300 shadow-lg'
                                              }`}
                                            >
                                              {cell}
                                            </div>
                                          );
                                        })
                                      ))}
                                    </div>
                                    <div className="bg-black/40 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                      <span className="text-[9px] font-black text-purple-200/70 uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"/> Matrix Traversal</span>
                                    </div>
                                  </div>
                                )}

                                {/* Binary Search / Two Pointers visualizer rendering */}
                                {(selectedQuestion.visualizerType === 'binary-search' || selectedQuestion.visualizerType === 'two-pointers') && visualizerState && !visualizerState.unsupported && (
                                  <div className="flex flex-col items-center justify-center w-full h-full gap-6 sm:gap-10 px-2 sm:px-4 overflow-x-auto no-scrollbar py-6">
                                    {/* Array 1 */}
                                    <div className="flex items-center gap-2 sm:gap-4 max-w-full">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 w-12 text-right">nums1</span>
                                      <div className="flex gap-1.5 sm:gap-2 relative">
                                        {(visualizerState.nums1 || visualizerState.arr || visualizerState.chars || []).map((val: number, idx: number) => {
                                          const step = visualizerState?.steps?.[visStep] || {};
                                          const isLeftPartition = step.i !== undefined ? idx < step.i : false;
                                          const isRightPartition = step.i !== undefined ? idx >= step.i : false;
                                          const isLo = step.lo === idx || step.left === idx;
                                          const isHi = step.hi === idx || step.right === idx;
                                          const isMid = step.mid === idx || step.i === idx;
                                          
                                          return (
                                            <div key={`n1-${idx}`} className="flex flex-col items-center relative">
                                              {isLo && <span className="absolute -top-6 text-[9px] font-black text-purple-400">{step.left !== undefined ? "left" : "lo"}</span>}
                                              {isHi && <span className="absolute -top-6 text-[9px] font-black text-blue-400">{step.right !== undefined ? "right" : "hi"}</span>}
                                              {isMid && <span className="absolute -bottom-6 text-[9px] font-black text-yellow-400">mid</span>}
                                              <div
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border backdrop-blur-md flex items-center justify-center font-black transition-all duration-300 ${
                                                  isMid
                                                    ? 'bg-yellow-400 border-yellow-200 text-black scale-110 z-20 shadow-[0_0_20px_rgba(250,204,21,0.8)]'
                                                    : isLeftPartition
                                                    ? 'bg-fuchsia-500/80 border-fuchsia-300 text-white z-10 shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                                                    : isRightPartition
                                                    ? 'bg-blue-500/80 border-blue-300 text-white z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                                    : 'bg-white/5 border-white/10 text-slate-300 shadow-lg'
                                                }`}
                                              >
                                                {val}
                                              </div>
                                              <span className="text-[8px] text-slate-500 mt-2">{idx}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    
                                    {/* Array 2 (if exists) */}
                                    {visualizerState.nums2 && (
                                      <div className="flex items-center gap-2 sm:gap-4 max-w-full">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 w-12 text-right">nums2</span>
                                        <div className="flex gap-1.5 sm:gap-2 relative">
                                          {visualizerState.nums2.map((val: number, idx: number) => {
                                            const step = visualizerState?.steps?.[visStep] || {};
                                            const isLeftPartition = step.j !== undefined ? idx < step.j : false;
                                            const isRightPartition = step.j !== undefined ? idx >= step.j : false;
                                            
                                            return (
                                              <div key={`n2-${idx}`} className="flex flex-col items-center relative">
                                                <div
                                                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border backdrop-blur-md flex items-center justify-center font-black transition-all duration-300 ${
                                                    isLeftPartition
                                                      ? 'bg-fuchsia-500/80 border-fuchsia-300 text-white z-10 shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                                                      : isRightPartition
                                                      ? 'bg-blue-500/80 border-blue-300 text-white z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                                      : 'bg-white/5 border-white/10 text-slate-300 shadow-lg'
                                                  }`}
                                                >
                                                  {val}
                                                </div>
                                                <span className="text-[8px] text-slate-500 mt-2">{idx}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Playback Controls */}
                              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 border-t border-gray-100 pt-5">
                                <div className="text-xs text-slate-400 max-w-md text-center md:text-left">
                                  <span className="block font-black text-slate-700 mb-1">Current State Description:</span>
                                  <p className="font-semibold text-[11px] leading-relaxed">{visualizerState?.steps?.[visStep]?.desc || 'Ready to run.'}</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 w-full md:w-auto">
                                  {/* Speed Slider */}
                                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-2xl border border-gray-200">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{(visSpeed / 1000).toFixed(1)}s</span>
                                    <input
                                      type="range"
                                      min="200"
                                      max="2000"
                                      step="100"
                                      value={visSpeed}
                                      onChange={(e) => setVisSpeed(Number(e.target.value))}
                                      className="w-20 accent-purple-600 cursor-pointer"
                                      style={{ height: '4px' }}
                                    />
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => setVisStep(prev => Math.max(0, prev - 1))}
                                      className="p-3 bg-gray-100 border border-gray-200 hover:border-purple-500/30 rounded-2xl transition-all"
                                      title="Previous step"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!visPlaying && visStep >= (visualizerState?.steps?.length || 1) - 1) {
                                          setVisStep(0);
                                        }
                                        setVisPlaying(!visPlaying);
                                      }}
                                      className="p-4 bg-purple-600 hover:bg-purple-500 rounded-full transition-all text-white"
                                    >
                                      {visPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                                    </button>
                                    <button
                                      onClick={() => setVisStep(prev => {
                                        const max = visualizerState?.steps?.length || 1;
                                        return Math.min(max - 1, prev + 1);
                                      })}
                                      className="p-3 bg-gray-100 border border-gray-200 hover:border-purple-500/30 rounded-2xl transition-all"
                                      title="Next step"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Custom input controls */}
                              <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 bg-gray-50 border border-gray-200 p-4 rounded-2xl shadow-xs">
                                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Custom Visualizer Input:</span>
                                <input
                                  type="text"
                                  placeholder={selectedQuestion.input}
                                  value={customInput}
                                  onChange={(e) => setCustomInput(e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 text-slate-900 font-mono shadow-xs"
                                />
                                <button
                                  onClick={() => {
                                    setCustomInput('');
                                    setVisStep(0);
                                    setVisPlaying(false);
                                  }}
                                  className="px-4 py-2 bg-gray-100 hover:bg-purple-100 border border-gray-200 text-[10px] font-black uppercase text-slate-700 hover:text-purple-700 rounded-xl transition-all cursor-pointer"
                                >
                                  Reset
                                </button>
                              </div>

                            </div>

                            {/* AI EXPLANATION WORKSPACE */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              
                              {/* Conceptual Details */}
                              <div className="lg:col-span-2 space-y-6">
                                <div className="bg-gray-50 border border-gray-200 rounded-[2rem] p-6 lg:p-8 space-y-6 shadow-xs">
                                  <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Bot className="w-5 h-5 text-purple-600" /> AI Conceptual Breakdown
                                  </h4>
                                  <div>
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-2">Intuition & Mechanics</span>
                                    <p className="text-xs text-slate-800 leading-relaxed font-semibold">{selectedQuestion.explanation.intuition}</p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-2">Brute Force Approach</span>
                                    <p className="text-xs text-slate-800 leading-relaxed mb-3 font-medium">{selectedQuestion.explanation.brute}</p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-2">Optimized System Strategy</span>
                                    <p className="text-xs text-slate-800 leading-relaxed mb-4 font-medium">{selectedQuestion.explanation.optimized}</p>
                                  </div>
                                </div>

                                {/* Live Code Editor Preview */}
                                <div className="bg-[#05020F] border border-gray-200 rounded-[2rem] p-6 lg:p-8">
                                  <div className="flex justify-between items-center mb-6">
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">Algorithmic Production Code</span>
                                    <div className="relative flex items-center">
                                      <select
                                        value={codeLanguage}
                                        onChange={(e) => setCodeLanguage(e.target.value as any)}
                                        className="appearance-none bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:border-purple-500 cursor-pointer"
                                      >
                                        <option value="python" className="bg-[#05020F] text-purple-300">Python</option>
                                        <option value="java" className="bg-[#05020F] text-purple-300">Java</option>
                                      </select>
                                      <ChevronDown className="w-3.5 h-3.5 text-purple-300 absolute right-2 pointer-events-none" />
                                    </div>
                                  </div>
                                  <pre className="font-mono text-xs text-purple-300 bg-[#0C061E]/90 p-6 rounded-2xl overflow-x-auto border border-purple-500/10 leading-relaxed">
                                    {selectedQuestion.code[codeLanguage] || selectedQuestion.code.python || selectedQuestion.code.java}
                                  </pre>
                                </div>
                              </div>

                              {/* Sidebar edgecases & tips */}
                              <div className="space-y-6">
                                <div className="bg-gray-50 border border-gray-200 rounded-[2rem] p-6 lg:p-8 space-y-5 shadow-xs">
                                  <h4 className="text-lg font-black text-slate-900">Edge Cases</h4>
                                  <ul className="space-y-3">
                                    {selectedQuestion.explanation?.edgeCases?.map((ec, idx) => (
                                      <li key={idx} className="text-xs text-slate-800 font-medium leading-relaxed flex items-start gap-2.5">
                                        <span className="text-purple-600 font-bold text-sm mt-0.5 flex-shrink-0">•</span>
                                        <span className="text-slate-800">{ec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-[2rem] p-6 lg:p-8 space-y-5 shadow-xs">
                                  <h4 className="text-lg font-black text-slate-900">Interview Tips</h4>
                                  <ul className="space-y-3">
                                    {selectedQuestion.explanation?.tips?.map((tip, idx) => (
                                      <li key={idx} className="text-xs text-slate-800 font-medium leading-relaxed flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-800">{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ====================================================
                        TAB: TECH ROUND SECTION
                        ==================================================== */}
                    {activeTab === 'tech' && (
                      <div className="space-y-8 max-w-4xl mx-auto">
                        <header className="mb-8 border-b pb-4">
                          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800 mb-2">Technical Evaluation</h2>
                          <p className="text-xs font-semibold text-slate-400">Written technical assessment for {selectedCompany.name}.</p>
                        </header>
                        
                        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] uppercase tracking-widest font-black text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">
                              {selectedCompany.technical[flashcardIndex].category}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Question {flashcardIndex + 1} of {selectedCompany.technical.length}
                            </span>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-slate-800 mb-6 leading-relaxed">
                            "{selectedCompany.technical[flashcardIndex].question}"
                          </h3>

                          <textarea
                            value={techAnswer}
                            onChange={(e) => setTechAnswer(e.target.value)}
                            placeholder="Type your technical reasoning or architecture approach here..."
                            className="w-full h-48 p-5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono text-sm text-gray-800 mb-4 transition-all"
                          />

                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFlashcardIndex(prev => Math.max(0, prev - 1));
                                  setTechEvaluation(null);
                                  setTechAnswer('');
                                }}
                                disabled={flashcardIndex === 0}
                                className="px-5 py-2.5 bg-gray-100 border border-gray-200 hover:border-purple-500/30 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 disabled:opacity-40"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => {
                                  setFlashcardIndex(prev => Math.min(selectedCompany.technical.length - 1, prev + 1));
                                  setTechEvaluation(null);
                                  setTechAnswer('');
                                }}
                                disabled={flashcardIndex === selectedCompany.technical.length - 1}
                                className="px-5 py-2.5 bg-gray-100 border border-gray-200 hover:border-purple-500/30 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 disabled:opacity-40"
                              >
                                Next
                              </button>
                            </div>

                            <button
                              onClick={() => runTechEvaluation(selectedCompany.technical[flashcardIndex].question)}
                              disabled={evaluatingTech || !techAnswer.trim()}
                              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                            >
                              {evaluatingTech ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Evaluating</>
                              ) : 'Submit for AI Evaluation'}
                            </button>
                          </div>
                        </div>

                        {/* Premium Evaluation Results */}
                        {techEvaluation && techEvaluation.results && techEvaluation.results.length > 0 && (
                          <div className="mt-8 bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm animate-fade-in-up">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-6">
                              <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-1">Evaluation Complete</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${techEvaluation.results[0].verdict === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {techEvaluation.results[0].verdict} ({techEvaluation.results[0].aiScore}%)
                                </span>
                              </div>
                              <div className="text-right mt-4 sm:mt-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Total Score</span>
                                <span className="text-4xl font-black text-purple-600">{techEvaluation.score}%</span>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                              {techEvaluation.results[0].strengths?.length > 0 && (
                                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="w-4 h-4" /> Strengths
                                  </h4>
                                  <ul className="space-y-3">
                                      {techEvaluation.results[0].strengths?.map((s: string, i: number) => (
                                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" /> {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {techEvaluation.results[0].gaps?.length > 0 && (
                                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2 mb-3">
                                    <span className="w-4 h-4 flex items-center justify-center font-bold">!</span> Gaps
                                  </h4>
                                  <ul className="space-y-3">
                                      {techEvaluation.results[0].gaps?.map((s: string, i: number) => (
                                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" /> {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {techEvaluation.results[0].idealApproach && (
                              <div className="mt-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Ideal Approach</h4>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{techEvaluation.results[0].idealApproach}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ====================================================
                        TAB: HR ROUND SECTION
                        ==================================================== */}
                    {activeTab === 'hr' && (
                      <div className="space-y-8 max-w-4xl mx-auto">
                        <header className="mb-8">
                          <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Behavioral Matrix</h2>
                          <p className="text-xs font-semibold text-gray-400">Master real HR behavioral placement assessments for {selectedCompany.name}.</p>
                        </header>

                        <div className="bg-[#120B2E] border border-white/10 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                          
                          <span className="text-[10px] uppercase tracking-widest font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full mb-6 inline-block">
                            Behavioral Scenario
                          </span>
                          
                          <h3 className="text-2xl font-bold text-white italic leading-relaxed mb-4">
                            "{selectedCompany.hr[0].question}"
                          </h3>
                          <p className="text-xs text-gray-400 font-medium bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                            <span className="text-purple-400 font-bold block mb-1">AI Tip:</span>
                            {selectedCompany.hr[0].aiTips}
                          </p>

                          {/* Tabs inside STAR */}
                          <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8">
                            <div className="flex flex-wrap gap-2 mb-4">
                              {(['S', 'T', 'A', 'R'] as const).map((tab) => (
                                <button
                                  key={tab}
                                  onClick={() => setStarTab(tab)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${starTab === tab ? 'bg-purple-500/20 border border-purple-500/40 text-white' : 'bg-transparent border border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                >
                                  {tab === 'S' ? 'Situation' : tab === 'T' ? 'Task' : tab === 'A' ? 'Action' : 'Result'}
                                </button>
                              ))}
                            </div>
                            
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                {starTab === 'S' ? 'Situation (The background story)' : starTab === 'T' ? 'Task (The challenge at hand)' : starTab === 'A' ? 'Action (What YOU specifically did)' : 'Result (The measurable metrics)'}
                              </label>
                              <textarea
                                value={starInputs[starTab]}
                                onChange={(e) => setStarInputs(prev => ({ ...prev, [starTab]: e.target.value }))}
                                placeholder={
                                  starTab === 'S' ? selectedCompany.hr[0].starTips.situation
                                  : starTab === 'T' ? selectedCompany.hr[0].starTips.task
                                  : starTab === 'A' ? selectedCompany.hr[0].starTips.action
                                  : selectedCompany.hr[0].starTips.result
                                }
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 font-mono transition-all"
                                rows={3}
                              />
                            </div>

                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={importStarAnswer}
                                className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                              >
                                <Zap className="w-3 h-3" /> Sync to Master Editor
                              </button>
                            </div>
                          </div>

                          {/* Final Answer Editor */}
                          <div className="space-y-3 relative z-10">
                            <div className="flex justify-between items-end">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Master Answer (Final Submission)</label>
                              <span className="text-[10px] text-gray-500 font-bold bg-black/30 px-2 py-1 rounded-md">{hrAnswer.split(' ').filter(Boolean).length} Words</span>
                            </div>
                            <textarea
                              value={hrAnswer}
                              onChange={(e) => setHrAnswer(e.target.value)}
                              placeholder="Combine your STAR components into a fluid, professional narrative..."
                              className="w-full h-48 bg-white border-2 border-transparent focus:border-purple-500 rounded-xl p-5 text-sm text-slate-800 placeholder-gray-400 shadow-inner font-mono transition-all"
                            />
                          </div>

                          <div className="mt-6 flex justify-end gap-3 relative z-10">
                            <button
                              onClick={() => setHrAnswer('')}
                              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                            >
                              Clear
                            </button>
                            <button
                              onClick={() => runHrEvaluation(selectedCompany.hr[0].question)}
                              disabled={evaluatingHr || !hrAnswer.trim()}
                              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                            >
                              {evaluatingHr ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Assessing...</>
                              ) : 'Submit for AI Evaluation'}
                            </button>
                          </div>
                        </div>

                        {/* Premium Evaluation Results */}
                        {hrEvaluation && hrEvaluation.results && hrEvaluation.results.length > 0 && (
                          <div className="mt-8 bg-[#120B2E] border border-white/10 p-8 rounded-[2rem] shadow-xl animate-fade-in-up">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 mb-6">
                              <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">Behavioral Evaluation</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hrEvaluation.results[0].verdict === 'PASS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {hrEvaluation.results[0].verdict} ({hrEvaluation.results[0].aiScore}%)
                                </span>
                              </div>
                              <div className="text-right mt-4 sm:mt-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Overall Score</span>
                                <span className="text-4xl font-black text-purple-400">{hrEvaluation.score}%</span>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                              {hrEvaluation.results[0].strengths?.length > 0 && (
                                <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/20">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="w-4 h-4" /> Strengths
                                  </h4>
                                  <ul className="space-y-3">
                                      {hrEvaluation.results[0].strengths?.map((s: string, i: number) => (
                                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" /> {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {hrEvaluation.results[0].gaps?.length > 0 && (
                                <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2 mb-3">
                                    <span className="w-4 h-4 flex items-center justify-center font-bold">!</span> Gaps
                                  </h4>
                                  <ul className="space-y-2">
                                    {hrEvaluation.results[0].gaps?.map((s: string, i: number) => (
                                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" /> {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {hrEvaluation.results[0].idealApproach && (
                              <div className="mt-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3">Ideal Approach</h4>
                                <p className="text-sm text-gray-300 leading-relaxed font-medium">{hrEvaluation.results[0].idealApproach}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ====================================================
                        TAB: RESUME PORTFOLIO REDESIGN
                        ==================================================== */}
                    {activeTab === 'resume' && (
                      <div className="space-y-8">
                        
                        <header>
                          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800 mb-2">Resume & Portfolio Workspace</h2>
                          <p className="text-xs font-semibold text-slate-400">Optimize and design your ATS-readiness resume and glassmorphic portfolio dashboard.</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          
                          {/* Resume Form editor */}
                          <div className="lg:col-span-2 space-y-6 bg-gray-50/80 border border-gray-200 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl">
                            
                            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-400" /> Professional Profile Editor
                              </h3>
                              <span className="text-[8px] bg-purple-100/50 border border-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded uppercase">Synced</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">About Me Description</label>
                                <textarea
                                  value={portfolioData.about}
                                  onChange={(e) => handleResumeChange('about', e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 focus:border-purple-500 rounded-xl p-3 text-xs h-20 focus:outline-none text-slate-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">Core Technical Skills</label>
                                <textarea
                                  value={portfolioData.skills}
                                  onChange={(e) => handleResumeChange('skills', e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 focus:border-purple-500 rounded-xl p-3 text-xs h-20 focus:outline-none text-slate-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">Featured Project Highlights</label>
                                <textarea
                                  value={portfolioData.projects}
                                  onChange={(e) => handleResumeChange('projects', e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 focus:border-purple-500 rounded-xl p-3 text-xs h-20 focus:outline-none text-slate-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">Professional Work Experience</label>
                                <textarea
                                  value={portfolioData.experience}
                                  onChange={(e) => handleResumeChange('experience', e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 focus:border-purple-500 rounded-xl p-3 text-xs h-20 focus:outline-none text-slate-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">Certifications</label>
                                <input
                                  type="text"
                                  value={portfolioData.certifications}
                                  onChange={(e) => handleResumeChange('certifications', e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 focus:border-purple-500 rounded-xl p-3.5 text-xs focus:outline-none text-slate-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">Achievements</label>
                                <input
                                  type="text"
                                  value={portfolioData.achievements}
                                  onChange={(e) => handleResumeChange('achievements', e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 focus:border-purple-500 rounded-xl p-3.5 text-xs focus:outline-none text-slate-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">GitHub Profile Link</label>
                                <input
                                  type="text"
                                  value={portfolioData.github}
                                  onChange={(e) => handleResumeChange('github', e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 focus:border-purple-500 rounded-xl p-3.5 text-xs focus:outline-none text-slate-700"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 block">LinkedIn Profile Link</label>
                                <input
                                  type="text"
                                  value={portfolioData.linkedin}
                                  onChange={(e) => handleResumeChange('linkedin', e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 focus:border-purple-500 rounded-xl p-3.5 text-xs focus:outline-none text-slate-700"
                                />
                              </div>

                            </div>

                            <button
                              onClick={() => {
                                const score = calculateAtsScore(portfolioData);
                                setAtsScore(score);
                                localStorage.setItem('studlyf_ats_score', score.toString());
                                triggerToast(`Portfolio compiled & saved! ATS Readiness Score: ${score}%`);
                              }}
                              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-purple-200 transition-all cursor-pointer"
                            >
                              Compile & Re-Score Portfolio
                            </button>

                          </div>

                          {/* Score widget sidebar */}
                          <div className="space-y-6">
                            
                            {/* ATS SCORE CARD */}
                            <div className="bg-gray-50 border border-gray-200 rounded-[2rem] p-6 lg:p-8 flex flex-col items-center justify-center text-center shadow-xs relative">
                              <h4 className="text-base font-black uppercase text-slate-800 mb-6">ATS Compatibility</h4>
                              
                              {/* Glowing Circle ring */}
                              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                                <svg className="transform -rotate-90" width={160} height={160}>
                                  <circle cx={80} cy={80} r={65} stroke="rgba(0,0,0,0.06)" strokeWidth={10} fill="transparent" />
                                  <circle
                                    cx={80}
                                    cy={80}
                                    r={65}
                                    stroke="rgb(168,85,247)"
                                    strokeWidth={10}
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 65}
                                    strokeDashoffset={2 * Math.PI * 65 * (1 - atsScore / 100)}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                  />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                  <span className="text-4xl font-black text-slate-900">{atsScore}</span>
                                  <span className="text-[7px] uppercase tracking-wider text-slate-500 font-bold mt-1">SDE Ready</span>
                                </div>
                              </div>

                              <button
                                onClick={() => setShowImprovementList(!showImprovementList)}
                                className="text-xs font-black uppercase tracking-wider text-purple-600 hover:text-purple-700 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                {showImprovementList ? 'Hide details' : 'Show suggested improvements'}
                                <ChevronDown className={`w-4 h-4 transition-transform ${showImprovementList ? 'rotate-180' : ''}`} />
                              </button>

                              {showImprovementList && (
                                <div className="mt-6 w-full text-left bg-white p-4 rounded-xl border border-gray-200 text-xs text-slate-700 space-y-2.5 shadow-xs font-medium">
                                  <div className="flex gap-2 items-start"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /> <span className="text-slate-700">Valid GitHub & LinkedIn connection linked.</span></div>
                                  <div className="flex gap-2 items-start"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /> <span className="text-slate-700">Strong core programming stack matching Google.</span></div>
                                  <div className="flex gap-2 items-start"><Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" /> <span className="text-slate-700">Add more metrics-driven achievements (e.g. Optimized speed by 25%).</span></div>
                                </div>
                              )}
                            </div>

                            {/* Portfolio preview buttons */}
                            <div className="bg-gray-50 border border-gray-200 rounded-[2rem] p-6 lg:p-8 space-y-6">
                              <h4 className="text-lg font-bold text-slate-800">Share Public URL</h4>
                              <p className="text-xs text-slate-600 font-semibold leading-relaxed">Publish your resume-portfolio directly into global placement pools.</p>
                              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-xs font-mono text-purple-600 break-all select-all">
                                https://studlyf.pro/portfolio/{selectedCompany.id}_candidate_772
                              </div>
                              <button
                                onClick={() => triggerToast('Share link copied to clipboard!')}
                                className="w-full py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-600 hover:text-purple-700 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Copy Shareable Link
                              </button>
                            </div>

                          </div>

                        </div>
                      </div>
                    )}

                    {/* ====================================================
                        TAB: MOCK INTERVIEW
                        ==================================================== */}
                    {activeTab === 'mock' && (
                      <div className="space-y-8">
                        <header>
                          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800 mb-2">Neural Placement Simulator</h2>
                          <p className="text-xs font-semibold text-slate-400">Practice with a live avatar calibrated for {selectedCompany.name}'s rigorous interview standards.</p>
                        </header>

                        {!simActive ? (
                          <div className="flex flex-col items-center justify-center text-center py-20 bg-gray-50/80 border border-gray-200 rounded-[2.5rem]">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mb-8 shadow-2xl relative">
                              <Bot className={`w-12 h-12 text-white ${isSimLoading ? 'animate-spin' : 'animate-pulse'}`} />
                            </div>
                            <h3 className="text-3xl font-black mb-4">Initialize {selectedCompany.name} Calibration</h3>
                            <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed font-medium">
                              Our neural pipeline calibrates questions dynamically based on current tech openings and behavioral rubrics.
                            </p>
                            
                            <div className="mb-8 w-full max-w-md">
                              <label className="block text-left text-xs font-bold text-slate-600 mb-2">Groq API Key</label>
                              <input 
                                type="password" 
                                value={groqApiKey}
                                onChange={(e) => {
                                  setGroqApiKey(e.target.value);
                                  localStorage.setItem('groq_api_key', e.target.value);
                                }}
                                placeholder="gsk_..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none bg-white shadow-sm"
                              />
                              <p className="text-[10px] text-slate-400 mt-2 text-left">Optional. Built-in AI engine will run if no Groq API Key is provided.</p>
                            </div>

                            <button
                              onClick={launchHrSimulator}
                              disabled={isSimLoading}
                              className="px-12 py-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-purple-100/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {isSimLoading ? 'Initializing...' : 'Initialize Neural Round'}
                            </button>
                          </div>
                        ) : (
                          
                          /* ACTIVE CHAT WORKSPACE */
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Chat history list */}
                            <div className="lg:col-span-2 flex flex-col justify-between bg-gray-100/50 border border-gray-200 rounded-[2rem] h-[500px] overflow-hidden">
                              <div className="p-6 overflow-y-auto space-y-4 flex-grow max-h-[420px]">
                                {chatMessages?.map((msg, i) => (
                                  <div
                                    key={i}
                                    className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                  >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-slate-400 border border-gray-200'}`}>
                                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed ${msg.sender === 'user' ? 'bg-purple-100 text-purple-900 rounded-tr-none' : 'bg-white text-slate-600 rounded-tl-none border border-gray-200 shadow-sm'}`}>
                                      {msg.text}
                                    </div>
                                  </div>
                                ))}
                                {simSpeaking && (
                                  <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gray-100 text-slate-400 border border-gray-200 flex items-center justify-center">
                                      <Bot className="w-4 h-4 animate-spin" />
                                    </div>
                                    <div className="p-4 bg-white border border-gray-200 shadow-sm text-slate-400 rounded-2xl text-xs rounded-tl-none">
                                      Thinking...
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Input typing text area */}
                              <div className="p-4 border-t border-gray-200 bg-white flex gap-3">
                                <input
                                  type="text"
                                  value={simUserText}
                                  onChange={(e) => setSimUserText(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSimSubmit()}
                                  disabled={simSpeaking || !!simFeedback}
                                  placeholder={simFeedback ? "Interview completed" : "Type your response to the interviewer..."}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 text-slate-700 disabled:opacity-50"
                                />
                                <button
                                  onClick={handleSimSubmit}
                                  disabled={simSpeaking || !!simFeedback}
                                  className="px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Send
                                </button>
                              </div>
                            </div>

                            {/* Scoring details sidebar */}
                            <div className="bg-gray-50/80 border border-gray-200 p-6 lg:p-8 rounded-[2rem] flex flex-col justify-between h-[500px] overflow-y-auto">
                              {!simFeedback ? (
                                <>
                                  <div>
                                    <h4 className="text-lg font-bold text-slate-700 mb-6">Simulation Status</h4>
                                    <div className="space-y-4">
                                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-1">Session Target</span>
                                        <span className="text-xs font-black text-slate-600">{selectedCompany.name} HR Calibration</span>
                                      </div>
                                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-1">Session ID</span>
                                        <span className="text-xs font-black text-slate-600 truncate block">{simSessionId || 'Initializing...'}</span>
                                      </div>
                                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-1">Interaction Count</span>
                                        <span className="text-xs font-black text-purple-600">{Math.floor(chatMessages.length / 2)} Exchanges</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <button
                                      onClick={endHrSimulator}
                                      disabled={chatMessages.length < 2 || simSpeaking}
                                      className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs uppercase transition-all shadow-lg shadow-purple-200 disabled:opacity-50"
                                    >
                                      End Interview & Evaluate
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSimActive(false);
                                        setChatMessages([]);
                                        setSimFeedback(null);
                                      }}
                                      className="w-full py-4 bg-white border border-gray-200 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl font-black text-xs uppercase transition-all"
                                    >
                                      Abort Session
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="space-y-6">
                                  <h4 className="text-lg font-bold text-slate-700">Interview Evaluation</h4>
                                  
                                  <div className="space-y-2">
                                    <h5 className="text-[10px] font-black uppercase text-green-600">Strengths</h5>
                                    <ul className="space-y-2">
                                      {simFeedback.strengths?.map((s: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-600 bg-green-50 border border-green-100 p-2.5 rounded-xl">{s}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="space-y-2">
                                    <h5 className="text-[10px] font-black uppercase text-red-600">Areas for Improvement</h5>
                                    <ul className="space-y-2">
                                      {simFeedback.weaknesses?.map((w: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-600 bg-red-50 border border-red-100 p-2.5 rounded-xl">{w}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="space-y-2">
                                    <h5 className="text-[10px] font-black uppercase text-purple-600">Actionable Advice</h5>
                                    <ul className="space-y-2">
                                      {simFeedback.improvements?.map((imp: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-600 bg-purple-50 border border-purple-100 p-2.5 rounded-xl">{imp}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setSimActive(false);
                                      setChatMessages([]);
                                      setSimFeedback(null);
                                    }}
                                    className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl font-black text-xs uppercase transition-all"
                                  >
                                    Close Report
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    )}

                    {/* ====================================================
                        TAB: PROGRESS TRACKER
                        ==================================================== */}
                    {activeTab === 'progress' && (
                      <div className="space-y-8">
                        <header>
                          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800 mb-2">Gate Performance Overview</h2>
                          <p className="text-xs font-semibold text-slate-400">Detailed analytics of your placement readiness for {selectedCompany.name}.</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          
                          {/* Left core charts grid */}
                          <div className="lg:col-span-2 space-y-6">
                            
                            {/* Analytics Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-gray-50/80 border border-gray-200 p-6 rounded-3xl relative overflow-hidden">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-2">Solved Questions</span>
                                <div className="text-4xl font-black text-purple-400">{solvedQuestions.length}</div>
                                <span className="text-[9px] text-slate-400 font-bold block mt-2">Target goal: {selectedCompany.dsa.length} Challenges</span>
                              </div>
                              <div className="bg-gray-50/80 border border-gray-200 p-6 rounded-3xl relative overflow-hidden">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-2">Saved Bookmarks</span>
                                <div className="text-4xl font-black text-pink-400">{savedQuestions.length}</div>
                                <span className="text-[9px] text-slate-400 font-bold block mt-2">Saved questions to review</span>
                              </div>
                            </div>

                            {/* Topic mastery visualization chart */}
                            <div className="bg-gray-50/80 border border-gray-200 p-6 lg:p-8 rounded-[2rem] space-y-6">
                              <h3 className="text-lg font-bold text-slate-700">Algorithmic Topic Mastery</h3>
                              
                              <div className="space-y-4">
                                {[
                                  { topic: 'Trees & DFS', mastery: 85, color: 'bg-purple-500' },
                                  { topic: 'Sliding Window', mastery: 72, color: 'bg-pink-500' },
                                  { topic: 'Linked List Pointers', mastery: 95, color: 'bg-violet-500' },
                                  { topic: 'Dynamic Programming', mastery: 40, color: 'bg-orange-500' }
                                ].map((tp) => (
                                  <div key={tp.topic} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                      <span>{tp.topic}</span>
                                      <span>{tp.mastery}% Mastery</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-white/[0.02]">
                                      <div className={`h-full ${tp.color}`} style={{ width: `${tp.mastery}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* Streak widgets */}
                          <div className="space-y-6">
                            
                            {/* Streak Score */}
                            <div className="bg-[#120B2E] border border-gray-200 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Zap className="w-24 h-24" />
                              </div>
                              <span className="text-[9px] uppercase tracking-widest font-black text-purple-400 mb-4 block">Placement Momentum</span>
                              <div className="text-5xl font-black text-yellow-400 mb-2">{streaks} Day Streak!</div>
                              <p className="text-xs text-slate-400 font-semibold leading-relaxed px-4">
                                Solve a challenge or run a calibration simulation daily to protect your streak score.
                              </p>
                            </div>

                            {/* Bookmarks quick solve list */}
                            <div className="bg-gray-50/80 border border-gray-200 rounded-[2rem] p-6 lg:p-8 space-y-4">
                              <h4 className="text-base font-bold text-slate-700">Saved Bookmarks</h4>
                              {savedQuestions.length === 0 ? (
                                <p className="text-xs text-slate-400 font-semibold">No questions bookmarked yet. Start practice challenges to save them!</p>
                              ) : (
                                <div className="space-y-2">
                                  {savedQuestions?.map((qid) => {
                                    const question = selectedCompany.dsa.find(q => q.id === qid);
                                    if (!question) return null;
                                    return (
                                      <div
                                        key={qid}
                                        onClick={() => setSelectedQuestion(question)}
                                        className="p-3 bg-gray-100/50 rounded-xl border border-white/[0.02] hover:border-purple-500/20 cursor-pointer flex justify-between items-center transition-all group"
                                      >
                                        <span className="text-xs text-slate-600 group-hover:text-purple-400 transition-colors font-bold">{question.title}</span>
                                        <ChevronRight className="w-4 h-4 text-slate-600" />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                          </div>

                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>

              </div>
            </div>
          </motion.div>
        )}
        </InlineErrorBoundary>
      </AnimatePresence>
    </div>
  </div>
  );
};

const CompanyModules = () => (
  <InlineErrorBoundary>
    <CompanyModulesContent />
  </InlineErrorBoundary>
);

export default CompanyModules;
