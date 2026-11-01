import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Upload,
  FileText,
  Layout,
  Wand2,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  Briefcase,
  FolderKanban,
  Award,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  ChevronRight,
  User,
  Star,
  X,
  Eye,
} from 'lucide-react';

import { API_BASE_URL } from '../apiConfig';

/* ── Reusable animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.34, 1.56, 0.64, 1] },
  }),
};

/* ── Animated counter ── */
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) raw.set(target);
  }, [inView, target, raw]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

/* ── Particle burst on success ── */
function ConfettiParticle({ i }: { i: number }) {
  const colors = ['#7c3aed', '#8b5cf6', '#a78bfa', '#6d28d9', '#c4b5fd', '#4ade80'];
  const angle = (i / 20) * 360;
  const distance = 80 + Math.random() * 120;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  return (
    <motion.div
      className="absolute w-2.5 h-2.5 rounded-sm"
      style={{ backgroundColor: colors[i % colors.length], top: '50%', left: '50%' }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ x, y, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1), scale: 0 }}
      transition={{ duration: 0.9 + Math.random() * 0.4, ease: 'easeOut', delay: 0.1 }}
    />
  );
}

/* ── Animated background orb ── */
function Orb({ className }: { className: string }) {
  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
    />
  );
}

/* ── Section fade-in wrapper ── */
function FadeSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Template image with graceful fallback ── */
function TemplateImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 border-b border-gray-200`}
        style={style}
      >
        <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center mb-2">
          <Layout size={20} className="text-gray-400" />
        </div>
        <p className="text-xs font-medium text-gray-400 text-center px-4 leading-relaxed">
          Template Preview<br />Coming Soon
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={style}>
      {/* Skeleton shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

const PortfolioBuilder: React.FC = () => {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [inputMethod, setInputMethod] = useState<'upload' | 'manual' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', skills: '', summary: '' });
  const [experience, setExperience] = useState([{ company: '', role: '', year: '', details: '' }]);
  const [projects, setProjects] = useState([{ name: '', description: '', technologies: '', link: '' }]);
  const [certifications, setCertifications] = useState([{ name: '', issuer: '', date: '', link: '' }]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // ── Preview modal state ──
  const [previewTemplate, setPreviewTemplate] = useState<{ id: string; name: string; desc: string; image: string; tag: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('section') === 'templates') {
      setStep(3);
    }
  }, [location.search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleExpChange = (i: number, f: string, v: string) => {
    const n = [...experience]; n[i] = { ...n[i], [f]: v }; setExperience(n);
  };
  const handleProjChange = (i: number, f: string, v: string) => {
    const n = [...projects]; n[i] = { ...n[i], [f]: v }; setProjects(n);
  };
  const handleCertChange = (i: number, f: string, v: string) => {
    const n = [...certifications]; n[i] = { ...n[i], [f]: v }; setCertifications(n);
  };
  const addExperience = () => setExperience([...experience, { company: '', role: '', year: '', details: '' }]);
  const removeExperience = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));
  const addProject = () => setProjects([...projects, { name: '', description: '', technologies: '', link: '' }]);
  const removeProject = (i: number) => setProjects(projects.filter((_, idx) => idx !== i));
  const addCertification = () => setCertifications([...certifications, { name: '', issuer: '', date: '', link: '' }]);
  const removeCertification = (i: number) => setCertifications(certifications.filter((_, idx) => idx !== i));

  const generatePortfolio = async () => {
    setIsGenerating(true);
    const data = new FormData();
    data.append('template_id', selectedTemplate || 'neon_glass');
    if (inputMethod === 'upload' && file) {
      data.append('resume', file);
    } else {
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('role', formData.role);
      data.append('skills', formData.skills);
      data.append('summary', formData.summary);
      data.append('experience', JSON.stringify(experience));
      data.append('projects', JSON.stringify(projects));
      data.append('certifications', JSON.stringify(certifications));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/generate-portfolio/`, { method: 'POST', body: data });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Portfolio API failed (${response.status}): ${text}`);
      }
      const result = await response.json();
      if (result.portfolio_url) {
        setGeneratedUrl(result.portfolio_url);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
        setStep(4);
      }
    } catch (error) {
      alert('Failed to generate portfolio');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Template definitions — images served from public/template-previews/ ──
  // Drop your screenshots at:
  //   public/template-previews/neon-glass.png
  //   public/template-previews/swiss-minimal.png
  //   public/template-previews/creative-clean.png
  //   public/template-previews/editorial-dark.png
  //   public/template-previews/ocean-minimal.png
  //   public/template-previews/bold-grid.png
  const templates = [
    {
      id: 'neon_glass',
      name: 'Neon Glass',
      desc: 'Modern futuristic developer portfolio',
      image: '/template-previews/neon-glass.png',
      tag: 'Popular',
    },
    {
      id: 'swiss_minimal',
      name: 'Swiss Minimal',
      desc: 'Minimal clean typography aesthetic',
      image: '/template-previews/swiss-minimal.png',
      tag: 'Elegant',
    },
    {
      id: 'creative_clean',
      name: 'Creative Clean',
      desc: 'Creative portfolio for modern builders',
      image: '/template-previews/creative-clean.png',
      tag: 'Creative',
    },
    {
      id: 'editorial_dark',
      name: 'Editorial Dark',
      desc: 'Premium dark portfolio with bold storytelling',
      image: '/template-previews/editorial-dark.png',
      tag: 'Premium',
    },
    {
      id: 'ocean_minimal',
      name: 'Ocean Minimal',
      desc: 'Calm professional layout for clean resumes',
      image: '/template-previews/ocean-minimal.png',
      tag: 'Calm',
    },
    {
      id: 'bold_grid',
      name: 'Bold Grid',
      desc: 'Structured grid for metrics, projects, and proof',
      image: '/template-previews/bold-grid.png',
      tag: 'Structured',
    },
  ];
  const scrollingTemplates = [...templates, ...templates];

  const builderFeatures = [
    { title: 'Live URL', desc: 'Generate a shareable public portfolio link.' },
    { title: 'ATS Friendly', desc: 'Keep your story readable for recruiters.' },
    { title: 'Project Blocks', desc: 'Showcase detailed projects and outcomes.' },
    { title: 'Social Links', desc: 'Add GitHub, LinkedIn, and external proof.' },
  ];

  const requiredChecklist = [
    'Full name and role',
    'Skills and summary',
    'At least 1 project',
    'Optional experience and certifications',
    'Choose a template',
  ];

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  /* Animated form card */
  const SectionCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <FadeSection delay={delay} className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-6 mb-6">
      {children}
    </FadeSection>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 overflow-hidden relative">

      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
        <Orb className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-100/60 blur-3xl" />
        <Orb className="absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full bg-blue-50/80 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #6d28d9 1px, transparent 0)`, backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: LANDING ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="overflow-x-hidden"
            >
              {/* Hero */}
              <section className="max-w-6xl mx-auto px-3 sm:px-6 pt-28 sm:pt-36 pb-12 sm:pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center min-h-[60vh] lg:min-h-[80vh]">

                  {/* Left — staggered text reveal */}
                  <motion.div variants={stagger} initial="hidden" animate="show">

                    <motion.div variants={fadeUp} custom={0}>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-semibold mb-8 tracking-wide uppercase">
                        <motion.span
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Zap size={11} className="fill-purple-500 stroke-purple-500" />
                        </motion.span>
                        AI-Powered Portfolio Builder
                      </div>
                    </motion.div>

                    <motion.h1
                      variants={fadeUp}
                      custom={1}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black leading-[1.0] tracking-[-0.03em] mb-6 text-gray-950"
                    >
                      Build a Portfolio
                      <br />
                      <motion.span
                        className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-500"
                        initial={{ backgroundPosition: '0%' }}
                        animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200%' }}
                      >
                        Recruiters Love.
                      </motion.span>
                    </motion.h1>

                    <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500 leading-relaxed max-w-lg mb-10 font-normal">
                      Transform your resume into a stunning developer portfolio with
                      premium templates. Ship in minutes, not days.
                    </motion.p>

                    <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 mb-14">
                      <motion.button
                        whileHover={{ y: -2, boxShadow: '0 12px 36px rgba(124,58,237,0.4)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setInputMethod('upload'); setStep(2); }}
                        className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors duration-200"
                      >
                        <Upload size={16} />
                        Upload Resume
                        <motion.span
                          className="inline-flex"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                          <ArrowRight size={14} />
                        </motion.span>
                      </motion.button>

                      <motion.button
                        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setInputMethod('manual'); setStep(2); }}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-semibold text-sm transition-colors duration-200"
                      >
                        <FileText size={16} />
                        Enter Manually
                      </motion.button>
                    </motion.div>

                    {/* Animated stats */}
                    <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-6 sm:gap-8">
                      {[
                        { target: 10000, suffix: '+', label: 'Portfolios built' },
                        { target: 50, suffix: '+', label: 'Templates' },
                        { target: 95, suffix: '%', label: 'Recruiter approval' },
                      ].map((stat) => (
                        <div key={stat.label}>
                          <p className="text-2xl font-black text-gray-900 tracking-tight">
                            <AnimatedNumber target={stat.target} suffix={stat.suffix} />
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </motion.div>

                    <div className="mt-10 grid sm:grid-cols-2 gap-3 max-w-xl">
                      {builderFeatures.map((feature) => (
                        <div key={feature.title} className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">{feature.title}</div>
                          <div className="mt-2 text-sm text-gray-600 leading-6">{feature.desc}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Right — floating cards */}
                  <div className="relative hidden lg:block h-[580px]">
                    <motion.div
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {/* Main card */}
                      <motion.div
                        animate={{ y: [0, -14, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ scale: 1.02, boxShadow: '0 28px 70px rgba(0,0,0,0.12)' }}
                        className="absolute top-4 left-6 w-[300px] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.05)] cursor-default"
                      >
                        {/* Hero card uses the first template's real preview image */}
                        <div className="w-full h-[180px] overflow-hidden">
                          <TemplateImage
                            src={templates[0].image}
                            alt={templates[0].name}
                            className="w-full h-[180px] object-cover object-top"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">AM</div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Alex Morgan</p>
                              <p className="text-xs text-purple-600 font-medium">Frontend Developer</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {['React', 'TypeScript', 'Next.js'].map((skill, si) => (
                              <motion.span
                                key={skill}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + si * 0.1, type: 'spring', stiffness: 200 }}
                                className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100"
                              >
                                {skill}
                              </motion.span>
                            ))}
                          </div>
                          <div className="space-y-2">
                            {[100, 80, 60].map((w, wi) => (
                              <motion.div
                                key={wi}
                                className="h-2 rounded-full bg-gray-100"
                                initial={{ scaleX: 0, originX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.8 + wi * 0.1, duration: 0.6 }}
                                style={{ width: `${w}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>

                      {/* Template badge */}
                      <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        whileHover={{ scale: 1.03 }}
                        className="absolute bottom-16 right-4 w-[220px] rounded-2xl bg-white border border-gray-200 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.07),0_4px_16px_rgba(0,0,0,0.04)] cursor-default"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Layout size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Neon Glass</p>
                            <p className="text-xs text-gray-500">Template</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1.0 + i * 0.08, type: 'spring', stiffness: 300 }}
                            >
                              <Star size={11} className="fill-amber-400 stroke-amber-400" />
                            </motion.div>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">4.9</span>
                        </div>
                      </motion.div>

                      {/* Published badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 1.1, type: 'spring', stiffness: 200, damping: 14 }}
                        className="absolute top-20 right-8 px-3 py-2 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2 shadow-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-green-700">Published live</span>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* How it works */}
              <section className="py-16 sm:py-24 bg-white border-y border-gray-100">
                <div className="max-w-6xl mx-auto px-3 sm:px-6">
                  <FadeSection className="text-center mb-14">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-3">Process</p>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 mb-4">How it works</h2>
                    <p className="text-base text-gray-500 max-w-md mx-auto">From resume to live portfolio in four seamless steps.</p>
                  </FadeSection>

                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                  >
                    {[
                      { icon: '📄', step: '01', title: 'Upload Resume', desc: 'Drop your PDF or DOCX for instant AI parsing.' },
                      { icon: '🤖', step: '02', title: 'AI Analysis', desc: 'We extract and structure your professional data.' },
                      { icon: '🎨', step: '03', title: 'Pick Template', desc: 'Choose from premium portfolio designs.' },
                      { icon: '🚀', step: '04', title: 'Go Live', desc: 'Publish and share your portfolio instantly.' },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        variants={scaleIn}
                        custom={idx}
                        whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(109,40,217,0.1)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative p-6 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-purple-200 hover:bg-purple-50/30 transition-colors duration-300 group"
                      >
                        <motion.span
                          className="text-2xl mb-4 block"
                          animate={{ rotate: [0, 8, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, repeatDelay: idx * 1.2 + 1 }}
                        >
                          {item.icon}
                        </motion.span>
                        <p className="text-xs font-bold text-purple-400 mb-2 font-mono">{item.step}</p>
                        <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </section>

              {/* Scrolling templates marquee */}
              <section className="py-16 sm:py-24">
                <div className="max-w-6xl mx-auto px-3 sm:px-6 text-center mb-8 sm:mb-12">
                  <FadeSection>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-3">Templates</p>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 mb-4">Premium portfolio designs</h2>
                    <p className="text-base text-gray-500">Crafted for developers who care about first impressions.</p>
                  </FadeSection>
                </div>

                <div className="relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none" />
                  <motion.div
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
                    className="flex gap-5 w-max px-5"
                  >
                    {scrollingTemplates.map((template, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-[300px] flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow duration-300"
                      >
                        <div className="relative overflow-hidden w-full h-[180px]">
                          <motion.div
                            className="w-full h-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                          >
                            <TemplateImage
                              src={template.image}
                              alt={template.name}
                              className="w-full h-[180px] object-cover object-top"
                            />
                          </motion.div>
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 border border-gray-200/80">
                            {template.tag}
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 mb-1.5">{template.name}</h3>
                          <p className="text-sm text-gray-500">{template.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </section>

              {/* CTA */}
              <section className="max-w-6xl mx-auto px-3 sm:px-6 pb-16 sm:pb-24">
                <FadeSection>
                  <motion.div
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 p-14 text-center"
                    style={{ boxShadow: '0 30px 80px rgba(109,40,217,0.25), 0 8px 24px rgba(109,40,217,0.15)' }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                    <div
                      className="absolute inset-0 opacity-[0.06]"
                      style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '32px 32px' }}
                    />
                    {/* Floating orb inside CTA */}
                    <motion.div
                      className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full bg-white/10 blur-2xl"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="relative z-10">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold mb-8 tracking-wide uppercase">
                          <Globe size={11} />
                          Free to get started
                        </div>
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
                          Your dream portfolio,<br />built in minutes.
                        </h2>
                        <p className="text-white/70 text-base max-w-md mx-auto mb-10">
                          Join 10,000+ developers who landed interviews with a Folio portfolio.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                          <motion.button
                            whileHover={{ y: -2, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setInputMethod('upload'); setStep(2); }}
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-purple-700 font-bold text-sm shadow-xl transition-shadow"
                          >
                            <Upload size={16} />
                            Upload Resume
                          </motion.button>
                          <motion.button
                            whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.18)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setInputMethod('manual'); setStep(2); }}
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 border border-white/25 text-white font-semibold text-sm transition-colors duration-200"
                          >
                            Start Manually
                            <ArrowRight size={14} />
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </FadeSection>
              </section>
            </motion.div>
          )}

          {/* ── STEP 2: FORM ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-6xl mx-auto px-3 sm:px-6 pt-28 sm:pt-36 pb-10"
            >
              <FadeSection className="mb-6 sm:mb-8">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-1.5">Step 2 of 3</p>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 mb-2">Tell us about yourself</h2>
                <p className="text-gray-500 text-sm">Fill in your professional details — or upload your resume to autofill.</p>
              </FadeSection>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 sm:gap-8 items-start">
                <div className="space-y-0">

                  {inputMethod === 'upload' ? (
                    <SectionCard delay={0.05}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                          <Upload size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">Upload Resume</h3>
                          <p className="text-xs text-gray-500">PDF or DOCX supported</p>
                        </div>
                      </div>
                      <label className="block w-full cursor-pointer">
                        <motion.div
                          whileHover={{ borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.03)' }}
                          whileTap={{ scale: 0.99 }}
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${file ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-gray-50/50'}`}
                        >
                          <AnimatePresence mode="wait">
                            {file ? (
                              <motion.div
                                key="file-ready"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center gap-3"
                              >
                                <motion.div
                                  className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center"
                                  initial={{ rotate: -10 }}
                                  animate={{ rotate: 0 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                >
                                  <FileText size={22} className="text-purple-600" />
                                </motion.div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{file.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                                </div>
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 14 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold"
                                >
                                  <Check size={12} />
                                  File ready
                                </motion.span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="file-empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-3"
                              >
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                  <Upload size={20} className="text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-700">Drop your resume here</p>
                                  <p className="text-xs text-gray-400 mt-0.5">or click to browse files</p>
                                </div>
                                <span className="text-xs text-gray-400 px-3 py-1 rounded-lg bg-gray-100">PDF, DOCX up to 10MB</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      </label>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Prefer to enter details manually?</span>
                        <button onClick={() => setInputMethod('manual')} className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                          Switch to manual →
                        </button>
                      </div>
                    </SectionCard>
                  ) : (
                    <>
                      {/* Personal info */}
                      <SectionCard delay={0.05}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                            <User size={16} className="text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">Personal Info</h3>
                            <p className="text-xs text-gray-500">Your basic details</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div><label className={labelCls}>Full Name</label><input className={inputCls} type="text" name="name" placeholder="Alex Morgan" value={formData.name} onChange={handleInputChange} /></div>
                          <div><label className={labelCls}>Email</label><input className={inputCls} type="email" name="email" placeholder="alex@example.com" value={formData.email} onChange={handleInputChange} /></div>
                          <div className="md:col-span-2"><label className={labelCls}>Current Role</label><input className={inputCls} type="text" name="role" placeholder="Frontend Developer" value={formData.role} onChange={handleInputChange} /></div>
                          <div className="md:col-span-2"><label className={labelCls}>Skills</label><input className={inputCls} type="text" name="skills" placeholder="React, TypeScript, Node.js, Figma..." value={formData.skills} onChange={handleInputChange} /></div>
                          <div className="md:col-span-2"><label className={labelCls}>Summary</label><textarea className={`${inputCls} resize-none`} name="summary" placeholder="Write a short professional summary..." rows={4} value={formData.summary} onChange={handleInputChange} /></div>
                        </div>
                      </SectionCard>

                      {/* Experience */}
                      <SectionCard delay={0.1}>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                              <Briefcase size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">Work Experience</h3>
                              <p className="text-xs text-gray-500">{experience.length} position{experience.length !== 1 ? 's' : ''} added</p>
                            </div>
                          </div>
                          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={addExperience} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition-colors">
                            <Plus size={13} /> Add Position
                          </motion.button>
                        </div>
                        <AnimatePresence>
                          {experience.map((exp, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 12, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -8, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 relative group mb-4 overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Position {idx + 1}</span>
                                {experience.length > 1 && (
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeExperience(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all duration-200">
                                    <Trash2 size={13} />
                                  </motion.button>
                                )}
                              </div>
                              <div className="grid md:grid-cols-3 gap-3">
                                <div><label className={labelCls}>Company</label><input className={inputCls} type="text" placeholder="Acme Corp" value={exp.company} onChange={(e) => handleExpChange(idx, 'company', e.target.value)} /></div>
                                <div><label className={labelCls}>Role</label><input className={inputCls} type="text" placeholder="Senior Dev" value={exp.role} onChange={(e) => handleExpChange(idx, 'role', e.target.value)} /></div>
                                <div><label className={labelCls}>Year</label><input className={inputCls} type="text" placeholder="2021 – Present" value={exp.year} onChange={(e) => handleExpChange(idx, 'year', e.target.value)} /></div>
                                <div className="md:col-span-3"><label className={labelCls}>Details</label><textarea className={`${inputCls} resize-none`} rows={2} placeholder="Key responsibilities..." value={exp.details} onChange={(e) => handleExpChange(idx, 'details', e.target.value)} /></div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </SectionCard>

                      {/* Projects */}
                      <SectionCard delay={0.15}>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                              <FolderKanban size={16} className="text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">Projects</h3>
                              <p className="text-xs text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''} added</p>
                            </div>
                          </div>
                          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={addProject} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition-colors">
                            <Plus size={13} /> Add Project
                          </motion.button>
                        </div>
                        <AnimatePresence>
                          {projects.map((proj, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 12, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -8, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 relative group mb-4 overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Project {idx + 1}</span>
                                {projects.length > 1 && (
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeProject(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all duration-200">
                                    <Trash2 size={13} />
                                  </motion.button>
                                )}
                              </div>
                              <div className="grid md:grid-cols-2 gap-3">
                                <div><label className={labelCls}>Project Name</label><input className={inputCls} type="text" placeholder="My Awesome App" value={proj.name} onChange={(e) => handleProjChange(idx, 'name', e.target.value)} /></div>
                                <div><label className={labelCls}>Technologies</label><input className={inputCls} type="text" placeholder="React, Supabase..." value={proj.technologies} onChange={(e) => handleProjChange(idx, 'technologies', e.target.value)} /></div>
                                <div className="md:col-span-2"><label className={labelCls}>Description</label><textarea className={`${inputCls} resize-none`} rows={2} placeholder="What it does and why you built it..." value={proj.description} onChange={(e) => handleProjChange(idx, 'description', e.target.value)} /></div>
                                <div className="md:col-span-2"><label className={labelCls}>Link</label><input className={inputCls} type="url" placeholder="https://github.com/..." value={proj.link} onChange={(e) => handleProjChange(idx, 'link', e.target.value)} /></div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </SectionCard>

                      {/* Certifications */}
                      <SectionCard delay={0.2}>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                              <Award size={16} className="text-amber-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">Certifications</h3>
                              <p className="text-xs text-gray-500">{certifications.length} added</p>
                            </div>
                          </div>
                          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={addCertification} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition-colors">
                            <Plus size={13} /> Add Cert
                          </motion.button>
                        </div>
                        <AnimatePresence>
                          {certifications.map((cert, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 12, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -8, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 relative group mb-4 overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Certification {idx + 1}</span>
                                {certifications.length > 1 && (
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeCertification(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all duration-200">
                                    <Trash2 size={13} />
                                  </motion.button>
                                )}
                              </div>
                              <div className="grid md:grid-cols-2 gap-3">
                                <div><label className={labelCls}>Certificate Name</label><input className={inputCls} type="text" placeholder="AWS Solutions Architect" value={cert.name} onChange={(e) => handleCertChange(idx, 'name', e.target.value)} /></div>
                                <div><label className={labelCls}>Issuer</label><input className={inputCls} type="text" placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => handleCertChange(idx, 'issuer', e.target.value)} /></div>
                                <div><label className={labelCls}>Date</label><input className={inputCls} type="text" placeholder="Dec 2023" value={cert.date} onChange={(e) => handleCertChange(idx, 'date', e.target.value)} /></div>
                                <div><label className={labelCls}>Credential Link</label><input className={inputCls} type="url" placeholder="https://..." value={cert.link} onChange={(e) => handleCertChange(idx, 'link', e.target.value)} /></div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </SectionCard>
                    </>
                  )}
                </div>

                {/* Sticky progress panel */}
                <div className="hidden lg:block">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.2 }}
                    className="sticky top-20 space-y-4"
                  >
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Your progress</p>
                      <div className="space-y-3">
                        {[
                          { label: 'Personal Info', done: !!(formData.name && formData.email) },
                          { label: 'Role & Skills', done: !!(formData.role && formData.skills) },
                          { label: 'Experience', done: experience.some(e => e.company) },
                          { label: 'Projects', done: projects.some(p => p.name) },
                          { label: 'Certifications', done: certifications.some(c => c.name) },
                        ].map((item) => (
                          <motion.div
                            key={item.label}
                            className="flex items-center gap-3"
                            animate={item.done ? { x: [0, 2, 0] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors duration-300 ${item.done ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
                              animate={item.done ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              {item.done && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                                  <Check size={11} className="text-white" />
                                </motion.div>
                              )}
                            </motion.div>
                            <span className={`text-sm transition-colors duration-300 ${item.done ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{item.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      className="bg-purple-50 rounded-2xl border border-purple-100 p-5"
                      animate={{ borderColor: ['#e9d5ff', '#c4b5fd', '#e9d5ff'] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <p className="text-xs font-semibold text-purple-700 mb-2">💡 Pro tip</p>
                      <p className="text-xs text-purple-600/80 leading-relaxed">
                        The more details you add, the better your portfolio will look. Try to include at least 2 projects.
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Sticky CTA */}
              <div className="sticky bottom-0 left-0 right-0 z-30 mt-6">
                <div className="max-w-6xl mx-auto px-0 py-4 bg-white/90 backdrop-blur-sm border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <motion.button
                      whileHover={{ x: -2 }}
                      onClick={() => setStep(1)}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                    >
                      ← Back
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(124,58,237,0.35)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors duration-200"
                    >
                      Continue to Templates
                      <ArrowRight size={15} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: TEMPLATE SELECTION ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-6xl mx-auto px-3 sm:px-6 pt-28 sm:pt-36 pb-10"
            >
              <FadeSection className="mb-6 sm:mb-10">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-1.5">Step 3 of 3</p>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 mb-2">Choose your template</h2>
                <p className="text-gray-500 text-sm">Select a design that represents your personal brand.</p>
              </FadeSection>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-10"
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {templates.map((template, tidx) => (
                  <motion.div
                    key={template.id}
                    variants={scaleIn}
                    custom={tidx}
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 ${selectedTemplate === template.id
                        ? 'border-purple-500 shadow-[0_0_0_4px_rgba(124,58,237,0.12)]'
                        : 'border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
                      }`}
                  >
                    <div className="relative overflow-hidden group w-full h-[220px]">
                      <motion.div
                        className="w-full h-full"
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.4 }}
                      >
                        <TemplateImage
                          src={template.image}
                          alt={template.name}
                          className="w-full h-[220px] object-cover object-top"
                        />
                      </motion.div>
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 border border-white/80 z-10">
                        {template.tag}
                      </span>
                      {/* Preview button — appears on hover */}
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                        initial={{ opacity: 0, y: 4 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm border border-white/80 text-gray-800 text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white z-10"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <Eye size={12} />
                        Preview
                      </motion.button>
                      <AnimatePresence>
                        {selectedTemplate === template.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-purple-600/10 flex items-center justify-center z-20"
                          >
                            <motion.div
                              initial={{ scale: 0, rotate: -20 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
                              className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg"
                            >
                              <Check size={20} className="text-white" />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="p-5 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-500">{template.desc}</p>
                        </div>
                        <motion.div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${selectedTemplate === template.id ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}
                          animate={selectedTemplate === template.id ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.25 }}
                        >
                          {selectedTemplate === template.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mb-10 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-600 mb-4">Requirements</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {requiredChecklist.map((item) => (
                      <div key={item} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[2rem] border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-[0_8px_30px_rgba(124,58,237,0.08)]">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-600 mb-4">More features</div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Share link', 'Portfolio preview', 'Template swap', 'Resume upload', 'Project gallery', 'Social proof'].map((item) => (
                      <div key={item} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky CTA */}
              <div className="sticky bottom-0 z-30">
                <div className="py-4 bg-white/90 backdrop-blur-sm border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <motion.button whileHover={{ x: -2 }} onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                      ← Back
                    </motion.button>
                    <motion.button
                      whileHover={(!isGenerating && selectedTemplate) ? { y: -2, boxShadow: '0 12px 30px rgba(124,58,237,0.35)' } : {}}
                      whileTap={(!isGenerating && selectedTemplate) ? { scale: 0.97 } : {}}
                      onClick={generatePortfolio}
                      disabled={isGenerating || !selectedTemplate}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors duration-200"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 size={15} />
                          </motion.div>
                          Generating Portfolio...
                        </>
                      ) : (
                        <>
                          <Wand2 size={15} />
                          Generate Portfolio
                          <ArrowRight size={14} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: SUCCESS ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.34, 1.2, 0.64, 1] }}
              className="max-w-2xl mx-auto px-3 sm:px-6 py-16 sm:py-20 text-center"
            >
              {/* Confetti burst */}
              <div className="relative flex justify-center mb-8">
                <div className="relative">
                  {showConfetti && [...Array(20)].map((_, i) => <ConfettiParticle key={i} i={i} />)}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 12 }}
                    className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center shadow-[0_8px_32px_rgba(34,197,94,0.15)]"
                  >
                    <motion.div
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                    >
                      <Check size={36} className="text-green-600 stroke-[2.5px]" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={fadeUp} custom={0}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-6">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Portfolio published live
                  </div>
                </motion.div>

                <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">
                  Your portfolio is live! 🎉
                </motion.h2>
                <motion.p variants={fadeUp} custom={2} className="text-gray-500 text-base mb-10 max-w-md mx-auto leading-relaxed">
                  Your portfolio has been generated and published. Share it with recruiters and start landing interviews.
                </motion.p>

                {generatedUrl && (
                  <motion.div
                    variants={scaleIn}
                    custom={3}
                    className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-5 mb-8 text-left"
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your portfolio URL</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 min-w-0">
                        <Globe size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-purple-600 truncate">{generatedUrl}</span>
                      </div>
                      <motion.a
                        whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}
                        whileTap={{ scale: 0.96 }}
                        href={generatedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors duration-200 flex-shrink-0"
                      >
                        <ExternalLink size={14} />
                        Open
                      </motion.a>
                    </div>
                  </motion.div>
                )}

                <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.a
                    whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(124,58,237,0.35)' }}
                    whileTap={{ scale: 0.97 }}
                    href={generatedUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors duration-200"
                  >
                    <ExternalLink size={16} />
                    View Portfolio
                  </motion.a>
                  <motion.button
                    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setStep(1); setGeneratedUrl(null); setSelectedTemplate(null); }}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm transition-colors duration-200"
                  >
                    Build Another
                  </motion.button>
                </motion.div>

                <motion.p variants={fadeUp} custom={5} className="text-xs text-gray-400 mt-8">
                  Share your portfolio link with recruiters, add it to your resume, and pin it on LinkedIn.
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── TEMPLATE PREVIEW MODAL ── */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            key="preview-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.25, ease: [0.34, 1.2, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.25)] border border-gray-200"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold">
                    {previewTemplate.tag}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{previewTemplate.name}</h3>
                    <p className="text-xs text-gray-500">{previewTemplate.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedTemplate(previewTemplate.id); setPreviewTemplate(null); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors duration-200"
                  >
                    <Check size={13} />
                    Use this template
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPreviewTemplate(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 transition-colors duration-200"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Modal image */}
              <div className="relative overflow-hidden bg-gray-50" style={{ maxHeight: '60vh' }}>
                <div style={{ maxHeight: '60vh', overflow: 'hidden' }}>
                  <TemplateImage
                    src={previewTemplate.image}
                    alt={previewTemplate.name}
                    className="w-full object-cover object-top"
                    style={{ maxHeight: '60vh' }}
                  />
                </div>
                {/* Subtle bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">Click outside or press Esc to close</p>
                <div className="flex items-center gap-2">
                  {/* Prev / Next template navigation */}
                  {(() => {
                    const currentIdx = templates.findIndex(t => t.id === previewTemplate.id);
                    const prevT = templates[(currentIdx - 1 + templates.length) % templates.length];
                    const nextT = templates[(currentIdx + 1) % templates.length];
                    return (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setPreviewTemplate(prevT)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          ← {prevT.name}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setPreviewTemplate(nextT)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {nextT.name} →
                        </motion.button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PortfolioBuilder;

