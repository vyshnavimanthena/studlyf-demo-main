import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, FileText, Globe, ArrowUpRight, Zap, ChevronLeft, ChevronDown, HelpCircle } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface CreditBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade?: () => void;
}

const CreditBalanceModal: React.FC<CreditBalanceModalProps> = ({ isOpen, onClose }) => {
    const [view, setView] = useState<'overview' | 'plans'>('overview');
    const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
    const [plansLoading, setPlansLoading] = useState(false);
    useEffect(() => {
        if (!isOpen) return;
        const fetchPlans = async () => {
            try {
                setPlansLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/v1/institution/hackathon/plans`, { headers: authHeaders() });
                if (!res.ok) return;
                const data = await res.json();
                setCurrentPlanId(data?.currentPlanId || null);
            } catch (e) {
                console.debug('Failed to load plans', e);
            } finally {
                setPlansLoading(false);
            }
        };
        fetchPlans();
    }, [isOpen]);

    const credits = [
        { icon: <FileText size={20} />, label: 'Assessment', remaining: 50, color: 'text-slate-600' },
        { icon: <Video size={20} />, label: 'Interview', remaining: 10, color: 'text-slate-600' },
        { icon: <Globe size={20} />, label: 'Public Listings', remaining: 3, color: 'text-slate-600' },
    ];

    const faqs = [
        {
            q: "What is the difference between the Free and Paid Plans?",
            a: "The Free Plan offers limited job/internship listings, a shorter listing duration, and lower candidate access limits. The Paid Plan extends these limits, allowing for more live listings, longer listing durations, and increased access to candidate data."
        },
        {
            q: "How do I upgrade to a Paid Plan?",
            a: "You can upgrade by purchasing a plan directly on Studylf. You can buy either Pack of 3, Pack of 7 or reach out to us via the Contact Us button under the custom plan."
        },
        {
            q: "If I downgrade from a Paid Plan, what happens to my existing Job/Internship listings?",
            a: "Existing public listings remain live until they reach their registration limit or end date. However, you won’t be able to create new public listings if you exceed the Basic Plan limit."
        },
        {
            q: "How long can I keep a job/internship listing live?",
            a: "Free Plan users can keep listings live for up to 7 days from the registration start date, while Paid Plan users can extend them as per the registration timeline defined for their plan."
        },
        {
            q: "Can I extend a Job/Internship listing after purchasing a Paid Plan?",
            a: "Yes, if you purchase a Paid Plan after listing a job, you can extend the registration period upto the defined limit within that plan."
        },
        {
            q: "What happens if I try to list more than the allowed number of opportunities?",
            a: "You will be able to list jobs and internships beyond the defined limit, however these listings would be approved only in private mode and won't be visible to candidates on the Studylf platform."
        },
        {
            q: "How does the candidate Match Score impact my access to registration data?",
            a: "The Candidate Compatibility Score is for reference only and does not impact your access to candidate data."
        },
        {
            q: "Can I still access candidate data after my Paid Plan expires?",
            a: "Yes, recruiters can access candidate data for 15 days once the opportunity is over. Post that you won't be able to access the candidate data for the specific opportunity."
        },
        {
            q: "How many interviews can I schedule and complete?",
            a: "Under Basic plan, recruiters can schedule upto 10 interviews across their live listing, while Paid Plan users can schedule interviews as per the interview credits alloted to them (1 interview credit = 1 interview schedule access)."
        },
        {
            q: "Can I reset/reschedule an interview after the interview is completed?",
            a: "Once an interview is marked completed (at least one evaluator and candidate joined), it is counted as complete. Once the interview is marked complete, you can reschedule it using your available credits."
        },
        {
            q: "Can I reset/reschedule an upcoming interview?",
            a: "You can reschedule/reset upcoming interviews. No new interview credit will be consumed in such scenario."
        },
        {
            q: "How many candidates can complete an assessment?",
            a: "You can invite as many candidates to participate/complete an assessment as per the available assessment credits in your plan (1 assessment credit = 1 candidate attempt)."
        },
        {
            q: "Can I reset a candidate's assessment attempt?",
            a: "Except for enterprise plan users, you cannot reset candidate's assessment attempt."
        },
        {
            q: "Why should I subscribe to auto renewal my plan?",
            a: "You can subscribe to Pack of 3 and Pack of 7 plans directly on Studylf. This ensures your team has uninterruppted access to the desired features at times. You can cancel the plan subscription aynytime from the payment page."
        },
        {
            q: "What is the Enterprise Plan, and how do I get it?",
            a: "The Enterprise Plan offers exclusive features and can be purchased by contacting recruit@studylf.com."
        },
        {
            q: "Can I get refund of my payment?",
            a: "Currently we do not allow refund once the payment is completed."
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full ${view === 'overview' ? 'max-w-lg' : 'max-w-6xl my-10'} bg-white rounded-[2.5rem] shadow-2xl overflow-hidden font-sans transition-all duration-500`}
                    >
                        {view === 'overview' ? (
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-slate-900">Credit Balance</h2>
                                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                                        <X size={24} className="text-slate-400" />
                                    </button>
                                </div>

                                {/* Plan Card */}
                                <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-between mb-8">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
                                        <p className="text-xl font-black text-slate-900">Free plan</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-1">
                                            <ArrowUpRight size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                        <p className="text-sm font-black text-slate-900">Upgrade <span className="text-blue-600">Plan</span></p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1">Get 3x more visibility</p>
                                        <button 
                                            onClick={() => setView('plans')} 
                                            className="text-[11px] font-black text-blue-600 mt-2 hover:underline"
                                        >
                                            View plans
                                        </button>
                                    </div>
                                </div>

                                {/* Credit List */}
                                <div className="space-y-4">
                                    {credits.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 hover:border-slate-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{item.label}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Credit Remaining:</p>
                                                </div>
                                            </div>
                                            <div className="px-5 py-2 bg-slate-50 rounded-full">
                                                <span className="text-sm font-black text-slate-900">{item.remaining}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="max-h-[90vh] overflow-y-auto no-scrollbar">
                                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 p-8 flex items-center justify-between border-b border-slate-50">
                                    <button 
                                        onClick={() => setView('overview')}
                                        className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest"
                                    >
                                        <ChevronLeft size={20} /> Back to Balance
                                    </button>
                                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                                        <X size={24} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-16">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-4xl font-black text-slate-800">Available Plans</h3>
                                        <p className="text-sm text-slate-400 font-medium tracking-wide">Flexible options tailored to your specific hiring needs</p>
                                    </div>

                                    {/* Plans Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 px-4">
                                        {/* Basic Plan */}
                                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col hover:shadow-xl transition-all">
                                            <div className="mb-6 space-y-2">
                                                <h4 className="text-xl font-black text-slate-700">Basic Plan</h4>
                                                <p className="text-4xl font-black text-slate-800">Free</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Auto renews every 30 days</p>
                                            </div>
                                            <button className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-widest mb-10 ${currentPlanId === 'basic' ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl shadow-indigo-900/20'}`} onClick={() => setView('plans')}>
                                                {currentPlanId === 'basic' ? 'Current Plan' : 'View Plans'}
                                            </button>
                                            <div className="space-y-6 flex-1">
                                                <p className="text-sm font-black text-slate-700">Includes:</p>
                                                <ul className="space-y-4">
                                                    {[
                                                        '2 Jobs/Internship listings',
                                                        '7 days registration window per listing',
                                                        'Upto 30 applications view access per listing',
                                                        'Access listing upto 15 days after registration window ends',
                                                        '10 interviews credits',
                                                        '0 assessments credits'
                                                    ].map((f, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-500 leading-relaxed relative pl-4">
                                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Pack of 3 */}
                                        <div className="p-8 bg-white border-2 border-blue-500 rounded-[2.5rem] shadow-2xl shadow-blue-50 flex flex-col relative scale-[1.03] z-10">
                                            <div className="absolute top-6 right-6 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md">Recommended</div>
                                            <div className="mb-6 space-y-2">
                                                <h4 className="text-xl font-black text-slate-700">Pack of 3</h4>
                                                <p className="text-4xl font-black text-slate-800">₹4,999</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Valid for 30 days</p>
                                            </div>
                                            <button className="w-full py-4 bg-blue-600 text-white rounded-full font-black text-sm uppercase tracking-widest mb-10 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                                                <Zap size={18} className="fill-white" /> Upgrade
                                            </button>
                                            <div className="space-y-6 flex-1">
                                                <p className="text-sm font-black text-slate-700">Includes:</p>
                                                <ul className="space-y-4">
                                                    {[
                                                        '3 Jobs/Internship listings',
                                                        '30 days registration window per listing',
                                                        'Unlimited Application views',
                                                        'Access listing upto 15 days after registration window ends',
                                                        '50 interviews credits',
                                                        '100 assessments credits'
                                                    ].map((f, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600 leading-relaxed relative pl-4">
                                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-slate-500 rounded-full" />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Pack of 7 */}
                                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col hover:shadow-xl transition-all">
                                            <div className="mb-6 space-y-2">
                                                <h4 className="text-xl font-black text-slate-700">Pack of 7</h4>
                                                <p className="text-4xl font-black text-slate-800">₹9,999</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Valid for 90 days</p>
                                            </div>
                                            <button className="w-full py-4 bg-blue-600 text-white rounded-full font-black text-sm uppercase tracking-widest mb-10 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                                                <Zap size={18} className="fill-white" /> Upgrade
                                            </button>
                                            <div className="space-y-6 flex-1">
                                                <p className="text-sm font-black text-slate-700">Includes:</p>
                                                <ul className="space-y-4">
                                                    {[
                                                        'Upto 7 Jobs/Internship',
                                                        '30 days registration window per listing',
                                                        'Unlimited Application views',
                                                        'Access listing upto 15 days after registration window ends',
                                                        '100 interviews credits',
                                                        '200 assessments credits'
                                                    ].map((f, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-500 leading-relaxed relative pl-4">
                                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Enterprise */}
                                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col hover:shadow-xl transition-all">
                                            <div className="mb-6 space-y-2">
                                                <h4 className="text-xl font-black text-slate-700">Enterprise</h4>
                                                <p className="text-4xl font-black text-slate-800">Custom</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Custom duration</p>
                                            </div>
                                            <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-full font-black text-sm uppercase tracking-widest mb-10 hover:bg-slate-50 transition-all shadow-sm">Contact Us</button>
                                            <div className="space-y-6 flex-1">
                                                <p className="text-sm font-black text-slate-700">Includes:</p>
                                                <ul className="space-y-4">
                                                    {[
                                                        'Host custom jobs/listing',
                                                        'Custom duration for registration window',
                                                        'Unlimited Application views',
                                                        'Access listing upto 30 days after registration window ends',
                                                        'Custom interviews credits',
                                                        'Custom assessments credits',
                                                        'Download access'
                                                    ].map((f, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-500 leading-relaxed relative pl-4">
                                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FAQ Section */}
                                    <div className="space-y-12 pb-12">
                                        <h3 className="text-4xl font-black text-slate-800 text-center font-sans">Frequently asked questions</h3>
                                        <div className="max-w-4xl mx-auto space-y-3">
                                            {faqs.map((item, i) => (
                                                <div key={i} className="overflow-hidden">
                                                    <details className="group">
                                                        <summary className="flex items-center justify-between p-4 bg-[#F4F9FF] rounded-xl cursor-pointer list-none transition-all hover:bg-[#EBF5FF]">
                                                            <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.q}</p>
                                                            <div className="flex-shrink-0 text-slate-400 font-light text-2xl group-open:hidden">+</div>
                                                            <div className="flex-shrink-0 text-slate-400 font-light text-2xl hidden group-open:block">−</div>
                                                        </summary>
                                                        <div className="px-5 py-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                                {item.a}
                                                            </p>
                                                        </div>
                                                    </details>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreditBalanceModal;

// Fetch current plan when modal is opened
// (placed after export to avoid hoisting issues in this file structure)

