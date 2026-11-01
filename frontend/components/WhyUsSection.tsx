import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from './CountUp';
import {
    Server, Users, GraduationCap, Building2,
    Pause, Play, Sun, Moon, Cloud,
    Sunrise as SunriseIcon, Sunset as SunsetIcon
} from 'lucide-react';

const stats = [
    { value: "1 Lakh+", label: "Media Reach", icon: <Server className="w-5 h-5 text-[#7C3AED]" /> },
    { value: "40+", label: "Sessions", icon: <GraduationCap className="w-5 h-5 text-[#7C3AED]" /> },
    { value: "3+", label: "Startups Supported", icon: <Building2 className="w-5 h-5 text-[#7C3AED]" /> },
    { value: "15+", label: "Hiring Partners", icon: <Users className="w-5 h-5 text-[#7C3AED]" /> },
];

const features = [
    "Industry Expert Mentors",
    "Direct Hiring Pipeline",
    "Verified Proficiency Score",
    "Hands-on Project Portfolio"
];

interface StripeBurstProps {
    isPaused: boolean;
    theme: string;
}

const themes: Record<string, string[]> = {
    'Pre-dawn': ['#1E1B4B', '#312E81', '#4338CA', '#5850EC'],
    'Sunrise': ['#F59E0B', '#EF4444', '#7C3AED', '#A78BFA'],
    'Daytime': ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
    'Dusk': ['#7C3AED', '#A78BFA', '#DDD6FE', '#C4B5FD'],
    'Sunset': ['#F87171', '#F472B6', '#818CF8', '#6366F1'],
    'Night': ['#0F172A', '#1E293B', '#334155', '#475569']
};

const StripeBurst: React.FC<StripeBurstProps> = ({ isPaused, theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        let height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;

        const particles: any[] = [];
        const particleCount = 200;

        class Particle {
            x: number;
            y: number;
            angle: number;
            length: number;
            speed: number;
            opacity: number;
            color: string;
            lineWidth: number;

            constructor() {
                this.x = width / 2;
                this.y = height;
                this.angle = (Math.random() * Math.PI) - Math.PI;
                this.length = Math.random() * 200 + 100;
                this.speed = Math.random() * 3 + 1.5;
                this.opacity = Math.random() * 0.8 + 0.3;
                this.lineWidth = Math.random() * 2 + 0.5;
                const colors = themes[theme] || themes['Dusk'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.strokeStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.lineWidth = this.lineWidth;
                const endX = this.x + Math.cos(this.angle) * this.length;
                const endY = this.y + Math.sin(this.angle) * this.length;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.arc(endX, endY, this.lineWidth * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                if (isPaused) return;
                this.length += this.speed;
                this.opacity -= 0.003;
                if (this.opacity <= 0) this.reset();
            }

            reset() {
                this.x = width / 2;
                this.y = height;
                this.angle = (Math.random() * Math.PI) - Math.PI;
                this.length = Math.random() * 100 + 50;
                this.opacity = Math.random() * 0.7 + 0.4;
                const colors = themes[theme] || themes['Dusk'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isPaused, theme]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full pointer-events-none"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

// Renders the final value by default; CountUp only animates as an enhancement.
const Counter: React.FC<{ value: string; delay: number }> = ({ value }) => {
    const target = parseInt(value.match(/\d+/)?.[0] || '0');
    const suffix = value.replace(/[0-9]/g, '');
    if (isNaN(target)) return <span>{value}</span>;
    return <span><CountUp value={target} />{suffix}</span>;
};

const WhyUsSection: React.FC = () => {
    const [isPaused, setIsPaused] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('Dusk');
    const [showThemePanel, setShowThemePanel] = useState(false);

    const themeIcons: Record<string, React.ReactNode> = {
        'Pre-dawn': <Moon className="w-3 h-3" />,
        'Sunrise': <SunriseIcon className="w-3 h-3" />,
        'Daytime': <Sun className="w-3 h-3" />,
        'Dusk': <Cloud className="w-3 h-3" />,
        'Sunset': <SunsetIcon className="w-3 h-3" />,
        'Night': <Moon className="w-3 h-3 text-indigo-400" />
    };

    return (
        <section className="py-16 bg-white overflow-hidden relative font-poppins">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl sm:text-5xl font-black text-[#111827] uppercase tracking-tighter"
                    >
                        Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B]">US?</span>
                    </motion.h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2.5rem] p-4 mb-8 flex flex-wrap justify-around items-center border border-gray-100 shadow-[0_32px_64px_-16px_rgba(124,58,237,0.1)] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7C3AED]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, scale: 1.05 }}
                            className="flex flex-col items-center px-6 py-2 border-r border-gray-100 last:border-none relative z-10"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{ delay: i * 0.1 + 0.5, type: 'spring' }}
                                className="w-10 h-10 bg-[#F5F3FF] rounded-2xl flex items-center justify-center mb-4 text-[#7C3AED]"
                            >
                                {stat.icon}
                            </motion.div>
                            <span className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tighter">
                                <Counter value={stat.value} delay={i * 0.2 + 0.3} />
                            </span>
                            <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.2em] opacity-80">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 items-stretch">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col h-[500px] lg:h-full min-h-[450px] bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative"
                    >
                        <div className="p-6 md:p-8 pb-4 z-20 bg-white relative">
                            <h3 className="text-xl md:text-2xl font-black text-[#111827] uppercase tracking-tight">
                                Institutional Outreach
                            </h3>
                            <p className="text-[10px] sm:text-xs font-bold text-[#7C3AED] uppercase tracking-[0.2em] mt-1">
                                CEO Campus Visits
                            </p>
                        </div>

                        {/* Horizontal Marquee */}
                        <div className="relative flex-1 flex items-center overflow-hidden bg-gray-50/30 group">
                            <motion.div
                                className="flex gap-6 px-6"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                                style={{ width: "fit-content" }}
                            >
                                {[
                                    { img: '/images/s1.jpg', college: 'MVSR Engineering College' },
                                    { img: '/images/s2.jpg', college: 'Matrusri Engineering College' },
                                    { img: '/images/s3.jpg', college: 'IIT Hyderabad' },
                                    { img: '/images/s4.jpg', college: 'CMR Group of Institutions' },
                                    { img: '/images/s5.jpg', college: 'Vignan Jyothi Institute of Management' },
                                    { img: '/images/s6.jpg', college: 'IIT Madras' },
                                    { img: '/images/s7.jpg', college: 'SRM University' },
                                    { img: '/images/s8.jpg', college: 'IIT Bombay' },
                                    { img: '/images/s1.jpg', college: 'MVSR Engineering College' },
                                    { img: '/images/s2.jpg', college: 'Matrusri Engineering College' },
                                    { img: '/images/s3.jpg', college: 'IIT Hyderabad' },
                                    { img: '/images/s4.jpg', college: 'CMR Group of Institutions' },
                                    { img: '/images/s5.jpg', college: 'Vignan Jyothi Institute of Management' },
                                    { img: '/images/s6.jpg', college: 'IIT Madras' },
                                    { img: '/images/s7.jpg', college: 'SRM University' },
                                    { img: '/images/s8.jpg', college: 'IIT Bombay' },
                                ].map((visit, idx) => (
                                    <div key={idx} className="flex flex-col gap-3 group/card cursor-pointer shrink-0 w-[260px] sm:w-[300px]">
                                        <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                                            <img
                                                src={visit.img}
                                                alt={visit.college}
                                                className="w-full h-40 sm:h-48 object-cover transform transition-transform duration-700 group-hover/card:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <div className="px-1 flex flex-col">
                                            <h4 className="text-sm font-bold text-gray-900 group-hover/card:text-[#7C3AED] transition-colors truncate">{visit.college}</h4>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Leadership Session</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Gradient fades for left and right edges */}
                            <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
                            <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
                        </div>
                    </motion.div>

                    <div className="relative h-full min-h-[300px] flex items-end justify-center bg-gradient-to-b from-transparent to-[#F5F3FF]/30 rounded-[3rem]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="absolute inset-0 z-0 bg-white shadow-inner rounded-[2.5rem] border border-[#7C3AED]/10 overflow-hidden"
                        >
                            <StripeBurst isPaused={isPaused} theme={currentTheme} />
                        </motion.div>

                        <div className="absolute top-8 right-8 z-20 flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsPaused(!isPaused)}
                                    className="p-3 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 text-gray-600 hover:text-[#7C3AED] hover:shadow-lg transition-all shadow-sm"
                                >
                                    {isPaused
                                        ? <Play className="w-4 h-4 fill-current" />
                                        : <Pause className="w-4 h-4 fill-current" />}
                                </button>

                                <button
                                    onClick={() => setShowThemePanel(!showThemePanel)}
                                    className="p-3 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 text-gray-600 hover:text-[#7C3AED] hover:shadow-lg transition-all shadow-sm"
                                >
                                    <Sun className="w-4 h-4" />
                                </button>
                            </div>

                            {showThemePanel && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-gray-100 shadow-2xl flex flex-col gap-1 w-40"
                                >
                                    {Object.keys(themes).map(theme => (
                                        <button
                                            key={theme}
                                            onClick={() => {
                                                setCurrentTheme(theme);
                                                setShowThemePanel(false);
                                            }}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${currentTheme === theme
                                                ? 'bg-[#7C3AED] text-white shadow-lg'
                                                : 'text-gray-500 hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
                                                }`}
                                        >
                                            {themeIcons[theme]}
                                            {theme}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#7C3AED]/5 blur-[120px] rounded-full -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7C3AED]/5 blur-[150px] rounded-full translate-x-1/4 translate-y-1/4" />
        </section>
    );
};

export default WhyUsSection;

