import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const normalizedEmail = email.trim().toLowerCase();
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail })
            });
            
            if (res.ok) {
                setSuccess(true);
            } else {
                const data = await res.json();
                setError(data.detail || "Failed to send reset link.");
            }
        } catch (err) {
            setError("Connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard title="Reset Access" maxWidth="max-w-[450px]">
                {!success ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <p className="text-sm text-gray-500 text-center px-4">
                            Enter your registered email and we'll send you a secure link to reset your credentials.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-gray-300" size={18} />
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-purple-500 transition-all outline-none text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 mt-2 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Send Reset Link'}
                                <Send size={16} />
                            </button>
                        </form>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-purple-600 transition-colors pt-4"
                        >
                            <ArrowLeft size={14} /> Back to Login
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Email Sent</h2>
                        <p className="text-sm text-gray-500 mb-8">
                            If <b>{email}</b> is in our system, you will receive a reset link shortly.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-gray-50 text-gray-500 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-gray-100 transition-all"
                        >
                            Return to Login
                        </button>
                    </motion.div>
                )}
            </AuthCard>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;

