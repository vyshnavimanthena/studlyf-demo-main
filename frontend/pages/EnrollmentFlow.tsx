import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
    Check,
    ChevronRight,
    CreditCard,
    ShieldCheck,
    Zap,
    Star,
    ArrowRight,
    UserCheck,
    Package,
    Wallet,
    Unlock,
    Sparkles,
    ArrowLeft
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

/* ─────────────────────────── mock data ─────────────────────────── */
const tracks = {
    ai: { title: 'Artificial Intelligence', accent: '#7C3AED', icon: '🤖' },
    swe: { title: 'Software Engineering', accent: '#1D74F2', icon: '⚙️' },
    data: { title: 'Data & Analytics', accent: '#059669', icon: '📊' },
    pm: { title: 'Product Management', accent: '#F59E0B', icon: '🚀' },
    cyber: { title: 'Cyber Security', accent: '#DC2626', icon: '🛡️' }
};

const EnrollmentFlow: React.FC = () => {
    const { trackId } = useParams<{ trackId: string }>();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const initialPlan = searchParams.get('plan') || 'yearly';

    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(initialPlan);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const courseIdParam = searchParams.get('courseId');

    const decodedTrackId = decodeURIComponent(trackId || 'ai');
    let track = tracks[trackId as keyof typeof tracks];
    if (!track) {
        track = {
            title: decodedTrackId === 'custom' ? 'Specialized' : decodedTrackId,
            accent: '#111827',
            icon: '🎓'
        };
    }

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchCourses = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/courses`);
                const data = await res.json();
                setCourses(Array.isArray(data) ? data : []);
            } catch (error) {
                try { console.error('Failed to fetch courses:', error instanceof Error ? error.message : String(error)); } catch (_) {}
            }
        };
        if (courses.length === 0) fetchCourses();
    }, [step]);

    const targetCourse = courseIdParam && courses.length > 0 ? courses.find(c => c._id === courseIdParam) : null;
    const isSingleCourse = !!courseIdParam;
    const coursePrice = (targetCourse && typeof targetCourse.price === 'number') ? targetCourse.price : 4999;

    const handleNext = () => {
        if (step === 1) {
            if (isSingleCourse) setStep(3); // Skip plans for single course
            else setStep(2); 
        }
        else if (step === 2) setStep(3);
        else if (step === 3) handlePayment();
    };

    const handleBack = () => {
        if (step === 3) {
            if (isSingleCourse) setStep(1);
            else setStep(2);
        }
        else if (step > 1) setStep(step - 1);
        else navigate(-1);
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        setPaymentError(null);

        const price = isSingleCourse ? coursePrice : (selectedPlan === 'yearly' ? 14999 : 1999);

        if (price === 0) {
            try {
                if (user?.user_id) {
                    await fetch(`${API_BASE_URL}/api/enrollment-flow/confirm/${user.user_id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            track_title: isSingleCourse ? (targetCourse?.title || 'Course') : track.title,
                            selected_plan: isSingleCourse ? 'course' : selectedPlan,
                            amount: 0,
                            payment_id: `free_${Date.now()}`,
                            course_id: isSingleCourse ? targetCourse?._id : null,
                            track_id: !isSingleCourse ? trackId : null
                        })
                    });
                }
                setIsProcessing(false);
                setIsSuccess(true);
                setStep(4);
                return;
            } catch (err) {
                try { console.error('Free enrollment error:', err instanceof Error ? err.message : String(err)); } catch (_) {}
                setPaymentError('Could not process enrollment. Please try again.');
                setIsProcessing(false);
                return;
            }
        }

        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsProcessing(false);
            return;
        }

        try {
            const orderRes = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: price,
                    currency: 'INR',
                    receipt: `rcpt_${Date.now()}`,
                    user_id: user?.user_id || 'guest'
                })
            });
            
            if (!orderRes.ok) {
                setPaymentError('Order creation failed on the server. Please try again.');
                throw new Error('Order creation failed');
            }
            const order = await orderRes.json();

            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: 'Studlyf',
                description: isSingleCourse ? (targetCourse?.title || 'Course') : `${track.title} - ${selectedPlan.toUpperCase()} Plan`,
                image: '/images/studlyf.png',
                order_id: order.order_id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });
                        
                        if (verifyRes.ok) {
                            if (user?.user_id) {
                                await fetch(`${API_BASE_URL}/api/enrollment-flow/confirm/${user.user_id}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        track_title: isSingleCourse ? (targetCourse?.title || 'Course') : track.title,
                                        selected_plan: isSingleCourse ? 'course' : selectedPlan,
                                        amount: price,
                                        payment_id: response.razorpay_payment_id,
                                        course_id: isSingleCourse ? targetCourse?._id : null,
                                        track_id: !isSingleCourse ? trackId : null
                                    })
                                });
                            }
                            setIsProcessing(false);
                            setIsSuccess(true);
                            setStep(4);
                        } else {
                            alert('Payment verification failed.');
                            setIsProcessing(false);
                        }
                    } catch (err) {
                        alert('Payment verification error.');
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: user?.full_name || 'Studlyf User',
                    email: user?.email || '',
                },
                theme: { color: track.accent },
                modal: {
                    ondismiss: function () {
                        console.log("[Razorpay] Payment modal dismissed by user.");
                        setPaymentError("Payment canceled by user. You can try confirming the payment again.");
                        setIsProcessing(false);

                        // Log abandoned attempt to backend
                        fetch(`${API_BASE_URL}/api/payments/log-event`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order_id: order.order_id,
                                status: 'abandoned',
                                error_description: 'User dismissed the payment checkout popup.'
                            })
                        }).catch(err => { try { console.error('[Analytics] Failed to log abandoned checkout:', err instanceof Error ? err.message : String(err)); } catch (_) {} });
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                const errorDesc = response.error.description || 'Payment transaction failed';
                setPaymentError('Payment failed: ' + errorDesc);
                setIsProcessing(false);

                // Log failed attempt to backend
                fetch(`${API_BASE_URL}/api/payments/log-event`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        order_id: order.order_id,
                        status: 'failed',
                        error_description: errorDesc
                    })
                }).catch(err => { try { console.error('[Analytics] Failed to log failed checkout:', err instanceof Error ? err.message : String(err)); } catch (_) {} });
            });
            rzp.open();

        } catch (error) {
            try { console.error('Payment Error', error instanceof Error ? error.message : String(error)); } catch (_) {}
            setPaymentError('Could not initiate payment. Please check your internet connection and try again.');
            setIsProcessing(false);
        }
    };

    const steps = [
        { id: 1, name: 'Confirm Role', icon: UserCheck },
        { id: 2, name: 'Select Plan', icon: Package },
        { id: 3, name: 'Payment', icon: Wallet },
        { id: 4, name: 'Unlock', icon: Unlock },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-3 sm:px-4">
            <style>{`
                @keyframes premium-shimmer {
                    0%   { transform: translateX(-180%) skewX(-20deg); }
                    100% { transform: translateX(300%) skewX(-20deg); }
                }
                @keyframes premium-orb1 {
                    0%,100% { transform: translate(0px,0px) scale(1);    opacity: 0.55; }
                    40%     { transform: translate(8px,-6px) scale(1.3);  opacity: 0.9; }
                    70%     { transform: translate(-4px,4px) scale(0.8);  opacity: 0.4; }
                }
                @keyframes premium-orb2 {
                    0%,100% { transform: translate(0px,0px) scale(1);     opacity: 0.4; }
                    35%     { transform: translate(-10px,-8px) scale(1.4); opacity: 0.85; }
                    65%     { transform: translate(6px,5px) scale(0.75);   opacity: 0.35; }
                }
                @keyframes premium-orb3 {
                    0%,100% { transform: translate(0px,0px) scale(1);    opacity: 0.5; }
                    50%     { transform: translate(6px,8px) scale(1.25);  opacity: 0.9; }
                }
                .premium-btn {
                    position: relative;
                    padding: 10px 24px;
                    background: linear-gradient(to right, #7C3AED, #6D28D9);
                    color: #fff;
                    border: none;
                    border-radius: 16px;
                    font-weight: 900;
                    font-size: 12px;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    cursor: pointer;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
                    box-shadow: 0 4px 20px rgba(124,58,237,0.3), 0 1px 0 rgba(255,255,255,0.1) inset;
                    white-space: nowrap;
                }
                .premium-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 55%);
                    pointer-events: none;
                    z-index: 1;
                }
                .premium-btn::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 40%; height: 100%;
                    background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.22) 50%, transparent 80%);
                    animation: premium-shimmer 2.8s ease-in-out infinite;
                    pointer-events: none;
                    z-index: 2;
                }
                .premium-btn:hover {
                    transform: translateY(-2px) scale(1.01);
                    box-shadow: 0 0 0 5px rgba(139,92,246,0.15), 0 0 30px 10px rgba(139,92,246,0.4), 0 12px 30px rgba(109,40,217,0.45);
                }
                .premium-btn:active { transform: scale(0.98); }
                .premium-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .premium-orb {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(7px);
                    z-index: 1;
                }
                .premium-orb1 { width:28px; height:28px; background: radial-gradient(circle, rgba(196,168,255,0.95), transparent 70%); top:-4px; left:18px; animation: premium-orb1 3.2s ease-in-out infinite; }
                .premium-orb2 { width:22px; height:22px; background: radial-gradient(circle, rgba(255,255,255,0.8), transparent 70%);  bottom:-2px; right:52px; animation: premium-orb2 4s ease-in-out infinite; }
                .premium-orb3 { width:18px; height:18px; background: radial-gradient(circle, rgba(167,139,250,0.9), transparent 70%); top:4px; right:24px; animation: premium-orb3 2.6s ease-in-out infinite; }
                .premium-label { position: relative; z-index: 5; display: flex; align-items: center; gap: 8px; }
            `}</style>
            {/* ── Progress Header ── */}
            <div className="max-w-4xl mx-auto mb-16">
                <div className="flex items-center justify-between relative px-2">
                    {steps.map((s, i) => (
                        <div key={s.id} className="z-10 flex flex-col items-center">
                            <motion.div
                                animate={{
                                    backgroundColor: step >= s.id ? track.accent : '#fff',
                                    borderColor: step >= s.id ? track.accent : '#E5E7EB',
                                    color: step >= s.id ? '#fff' : '#9CA3AF'
                                }}
                                className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm mb-2 shadow-sm transition-colors duration-500"
                            >
                                {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s.name}
                            </span>
                        </div>
                    ))}
                    {/* connector line */}
                    <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-100 -z-0">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                            className="h-full"
                            style={{ backgroundColor: track.accent }}
                        />
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                    {/* ── STEP 1: CONFIRM ROLE ── */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center"
                        >
                            <div className="space-y-8">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 block" style={{ color: track.accent }}>Step 01 / Confirmation</span>
                                    <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-[0.9]">
                                         Confirm Your <br /> <span style={{ color: track.accent }}>{isSingleCourse ? 'Course' : 'Career Track'}</span>.
                                     </h2>
                                </div>
                                <p className="text-gray-500 text-lg">You have selected the <b>{isSingleCourse ? (targetCourse?.title || 'Course') : track.title}</b> {isSingleCourse ? 'course' : 'track'}. This intensive program is designed to move you from theory into verified engineering authority.</p>
                                <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 sm:gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl shadow-inner">{track.icon}</div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Selection</p>
                                        <h3 className="text-xl font-black text-gray-900 uppercase">{isSingleCourse ? (targetCourse?.title || 'Course') : `Engineering: ${track.title}`}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">
                                        <ArrowLeft className="w-4 h-4" /> Change Track
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="premium-btn flex-1 !py-5 !rounded-2xl"
                                    >
                                        <span className="premium-orb premium-orb1" />
                                        <span className="premium-orb premium-orb2" />
                                        <span className="premium-orb premium-orb3" />
                                        <span className="premium-label">Confirm & Proceed <ChevronRight className="w-4 h-4" /></span>
                                    </button>
                                </div>
                            </div>
                            <div className="hidden lg:block relative">
                                <div className="bg-[#111827] rounded-[3rem] p-12 text-white relative overflow-hidden">
                                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-6 underline decoration-[#7C3AED] underline-offset-8">Track Outcome</h4>
                                    <ul className="space-y-6">
                                        {[
                                            { icon: Sparkles, text: 'Proprietary Verified Certificate' },
                                            { icon: ShieldCheck, text: 'Clinical Evidence Portfolio' },
                                            { icon: Zap, text: 'Direct Hiring Pipeline Access' },
                                            { icon: Star, text: 'Elite Alumni Network' }
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-4">
                                                <item.icon className="w-5 h-5 text-gray-400" />
                                                <span className="text-sm font-bold uppercase tracking-widest text-white/80">{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: track.accent }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 2: SELECT PLAN ── */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            <div className="text-center max-w-2xl mx-auto">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 block" style={{ color: track.accent }}>Step 02 / Membership</span>
                                <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-[0.9] mb-6">
                                     Select Your <br /> <span style={{ color: track.accent }}>Mastery Plan</span>.
                                 </h2>
                                <p className="text-gray-500 font-medium">Choose how you want to invest in your engineering journey. Yearly plans include verified certification and hiring support.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                                <div
                                    onClick={() => setSelectedPlan('monthly')}
                                    className={`bg-white rounded-[2.5rem] p-6 sm:p-10 border-2 cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'border-gray-900 shadow-2xl scale-[1.02]' : 'border-gray-100 border-dashed opacity-60'}`}
                                >
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h4 className="text-xl font-black uppercase tracking-tighter">Monthly Sprint</h4>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pay as you go</p>
                                        </div>
                                        {selectedPlan === 'monthly' && <Check className="w-6 h-6 text-gray-900" />}
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-5xl font-black text-gray-900">₹1,999</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ Month</span>
                                    </div>
                                    <ul className="space-y-3 mb-10">
                                        {['Access to all Courses', 'Project Reviews', 'Community Access'].map(f => (
                                            <li key={f} className="flex items-center gap-3 text-xs font-bold text-gray-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div
                                    onClick={() => setSelectedPlan('yearly')}
                                    className={`bg-white rounded-[2.5rem] p-6 sm:p-10 border-2 cursor-pointer transition-all relative overflow-hidden ${selectedPlan === 'yearly' ? 'border-gray-900 shadow-2xl scale-[1.02]' : 'border-gray-100 border-dashed opacity-60'}`}
                                >
                                    <div className="absolute top-6 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Best Value</div>
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h4 className="text-xl font-black uppercase tracking-tighter">Yearly Mastery</h4>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full career support</p>
                                        </div>
                                        {selectedPlan === 'yearly' && <Check className="w-6 h-6 text-gray-900" />}
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-5xl font-black text-gray-900">₹14,999</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ Year</span>
                                    </div>
                                    <ul className="space-y-3 mb-10">
                                        {['Full Authority Track', 'Verified Certification', 'Hiring Pipeline Access', 'Resume Verification'].map(f => (
                                            <li key={f} className="flex items-center gap-3 text-xs font-bold text-gray-600">
                                                <Check className="w-4 h-4 text-green-500" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4">
                                <button
                                    onClick={handleBack}
                                    className="premium-btn !px-8 !py-5 !rounded-2xl"
                                >
                                    <span className="premium-orb premium-orb1" />
                                    <span className="premium-orb premium-orb2" />
                                    <span className="premium-orb premium-orb3" />
                                    <span className="premium-label">Back</span>
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="premium-btn !px-12 !py-5 !rounded-2xl"
                                >
                                    <span className="premium-orb premium-orb1" />
                                    <span className="premium-orb premium-orb2" />
                                    <span className="premium-orb premium-orb3" />
                                    <span className="premium-label">Select Plan & Pay <ChevronRight className="w-4 h-4" /></span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 3: PAYMENT ── */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
                                <div className="p-8 sm:p-10 md:p-14 border-b border-gray-50">
                                    <div className="flex justify-between items-center mb-10">
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Order Summary</span>
                                        <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500">{isSingleCourse ? 'Single Course' : `${selectedPlan} Plan`}</div>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                                            {isSingleCourse 
                                                ? (targetCourse ? targetCourse.title : 'Loading...') 
                                                : `${track ? track.title : 'Track'} Track`
                                            }
                                        </h3>
                                        <span className="text-xl font-black text-gray-900">₹{isSingleCourse ? coursePrice.toLocaleString('en-IN') : (selectedPlan === 'yearly' ? '14,999' : '1,999')}.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-400 mb-8">
                                        <p>{isSingleCourse ? 'Course Access Fee' : 'Membership Enrollment Fee'}</p>
                                        <span>₹{isSingleCourse ? coursePrice.toLocaleString('en-IN') : (selectedPlan === 'yearly' ? '14,999' : '1,999')}.00</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                                        <span className="text-2xl font-black text-gray-900 uppercase">Total</span>
                                        <span className="text-2xl font-black text-gray-900" style={{ color: track.accent }}>₹{isSingleCourse ? coursePrice.toLocaleString('en-IN') : (selectedPlan === 'yearly' ? '14,999' : '1,999')}.00</span>
                                    </div>
                                </div>

                                <div className="p-8 sm:p-10 md:p-14 bg-gray-50/50">
                                    <div className="space-y-6">
                                        <div className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#0051C3]/10 rounded-full flex items-center justify-center">
                                                    <CreditCard className="w-6 h-6 text-[#0051C3]" />
                                                </div>
                                                <div className="w-12 h-12 bg-[#00A526]/10 rounded-full flex items-center justify-center">
                                                    <Wallet className="w-6 h-6 text-[#00A526]" />
                                                </div>
                                            </div>
                                            <p className="text-center text-sm font-bold text-gray-500">You will be securely redirected to Razorpay to complete your payment.</p>
                                        </div>

                                        {paymentError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-5 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-start gap-4 text-left"
                                            >
                                                <span className="text-xl">⚠️</span>
                                                <div className="flex-grow">
                                                    <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Payment Status</p>
                                                    <p className="text-xs text-amber-700 font-bold leading-relaxed">{paymentError}</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        <p className="text-[10px] text-gray-400 font-bold uppercase text-center tracking-widest">Secured by Razorpay & Verified by Studlyf</p>

                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="premium-btn !px-8 !py-6 !rounded-3xl bg-transparent !text-gray-500 hover:!text-gray-900 border border-gray-200 !shadow-none hover:!bg-gray-100 flex items-center justify-center"
                                            >
                                                <ArrowLeft className="w-5 h-5 text-gray-400" />
                                            </button>
                                            <button
                                                onClick={handlePayment}
                                                disabled={isProcessing}
                                                className="premium-btn flex-grow !py-6 !rounded-3xl"
                                            >
                                                <span className="premium-orb premium-orb1" />
                                                <span className="premium-orb premium-orb2" />
                                                <span className="premium-orb premium-orb3" />
                                                <span className="premium-label">
                                                    {isProcessing ? (
                                                        <>
                                                            <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                                            Processing Protocol...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Confirm Payment <ArrowRight className="w-5 h-5" />
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 4: SUCCESS / UNLOCK ── */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-3xl mx-auto text-center py-10"
                        >
                            <div className="relative mb-12">
                                <motion.div
                                    initial={{ rotate: 0, scale: 0.8 }}
                                    animate={{ rotate: 360, scale: 1 }}
                                    transition={{ duration: 1, ease: 'backOut' }}
                                    className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40"
                                >
                                    <Check className="w-16 h-16 text-white stroke-[4px]" />
                                </motion.div>
                                {/* floating unlock badges */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute top-0 right-[25%] bg-white p-3 rounded-2xl shadow-xl border border-gray-50"
                                >
                                    <Unlock className="w-6 h-6 text-green-500" />
                                </motion.div>
                            </div>

                            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase mb-6 leading-[0.9]">
                                Clinical Access <br /> <span className="text-green-500">Unlocked</span>.
                            </h2>
                            <p className="text-gray-500 text-lg font-medium mb-12 max-w-xl mx-auto">Welcome to the elite tier. Your learning dashboard is now fully unlocked with the <b>{track.title}</b> curriculum.</p>

                            <div className="bg-white rounded-[3rem] p-6 sm:p-10 border border-gray-100 shadow-sm mb-12 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                                {[
                                    { label: 'Courses', val: 'Full' },
                                    { label: 'Mentors', val: 'Active' },
                                    { label: 'Projects', val: 'Ready' },
                                    { label: 'Hiring', val: 'Open' }
                                ].map((s, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                                        <p className="font-black text-green-500 uppercase">{s.val}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={() => {
                                        let targetId = courseIdParam || 'm1';

                                        if (courseIdParam && courses && courses.length > 0) {
                                            const match = courses.find((c: any) => c._id === courseIdParam);
                                            if (match) {
                                                const slug = match.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                                targetId = `${slug}--${match._id}`;
                                            }
                                        } else if (!courseIdParam) {
                                            const trackToCourse: Record<string, string> = {
                                                ai: 'm1',
                                                swe: 'm2',
                                                data: 'm3',
                                                pm: 'm4',
                                                cyber: 'm5'
                                            };
                                            targetId = trackToCourse[trackId || 'ai'] || 'm1';

                                            if (courses && courses.length > 0) {
                                                const match = courses.find((c: any) => c.role_tag === track.title || c.title.toLowerCase().includes(track.title.split(' ')[0].toLowerCase()));
                                                if (match && match._id) {
                                                    const slug = match.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                                    targetId = `${slug}--${match._id}`;
                                                }
                                            }
                                        }

                                        navigate(`/learn/course-player/${targetId}`);
                                    }}
                                    className="premium-btn !px-12 !py-6 !rounded-2xl"
                                >
                                    <span className="premium-orb premium-orb1" />
                                    <span className="premium-orb premium-orb2" />
                                    <span className="premium-orb premium-orb3" />
                                    <span className="premium-label">Start Learning Now <ArrowRight className="w-5 h-5" /></span>
                                </button>
                                <button
                                    onClick={() => navigate(`/learn/courses?category=${track.title}`)}
                                    className="premium-btn !px-12 !py-6 !rounded-2xl"
                                >
                                    <span className="premium-orb premium-orb1" />
                                    <span className="premium-orb premium-orb2" />
                                    <span className="premium-orb premium-orb3" />
                                    <span className="premium-label">View Other Courses</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Decorative background grids */}
            <div className="fixed inset-0 bg-grid-black/[0.02] pointer-events-none -z-10" />
        </div>
    );
};

export default EnrollmentFlow;

