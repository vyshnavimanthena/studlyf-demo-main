
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthCard from './AuthCard';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../apiConfig';
import TermsOverlay from './TermsOverlay';

interface LoginFormProps {
    onSwitchToSignup: () => void;
    transparent?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, transparent = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedRole = queryParams.get('role') || 'student';
    const next = queryParams.get('next');
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [verificationEmail, setVerificationEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [waking, setWaking] = useState(false);

    // The hosted backend sleeps when idle; start waking it as soon as the form opens
    useEffect(() => {
        fetch(`${API_BASE_URL}/backend-health`).catch(() => {});
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const emailClean = email.trim().toLowerCase();
        const passwordClean = password.trim();
        if (!emailClean) {
            setError('Email is required.');
            return;
        }
        if (!passwordClean) {
            setError('Password is required.');
            return;
        }
        setLoading(true);
        try {
            // While a sleeping backend wakes, the proxy fails or answers 502–504; keep retrying for up to 90s
            const startedAt = Date.now();
            let response: Response | null = null;
            while (true) {
                try {
                    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: emailClean, password: passwordClean })
                    });
                    if (![502, 503, 504].includes(response.status)) break;
                } catch {
                    response = null;
                }
                if (Date.now() - startedAt > 90000) break;
                setWaking(true);
                await new Promise((r) => setTimeout(r, 4000));
            }
            setWaking(false);
            if (!response || [502, 503, 504].includes(response.status)) throw new Error('unreachable');

            const data = await response.json();

            if (response.ok) {
                login(data.access_token, data.user);

                // If we were deep-linked into a page, return there after auth.
                if (next && next.startsWith('/')) {
                    // Ignore opportunity deep-links for post-login landing and prefer dashboard
                    if (next.startsWith('/opportunities')) {
                        navigate('/dashboard');
                    } else {
                        navigate(next);
                    }
                    return;
                }

                // Default redirect based on role
            if (data.user.role === 'super_admin' || data.user.role === 'admin') navigate('/admin');
            else if (data.user.role === 'institution') navigate('/institution-dashboard?post=true');
            else if (data.user.role === 'judge') navigate('/judge-portal');
            else navigate('/dashboard');
            } else {
                const detail = data.detail || 'Login failed. Please check your credentials.';
                setError(detail);
                if (detail.toLowerCase().includes('verify your email')) {
                    setVerificationEmail(emailClean);
                }
            }
        } catch (err: any) {
            setError('We couldn’t reach the server. Please try again in a minute.');
        } finally {
            setLoading(false);
            setWaking(false);
        }
    };

    const handleResendVerification = async () => {
        const targetEmail = (verificationEmail || email).trim().toLowerCase();
        if (!targetEmail) {
            setError('Enter your email first to resend the verification link.');
            return;
        }

        setResendLoading(true);
        setResendMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail }),
            });

            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                setResendMessage(data.message || 'Verification link sent. Check your inbox.');
            } else {
                setError(data.detail || 'Unable to resend verification link.');
            }
        } catch {
            setError('Connection error while resending the verification link.');
        } finally {
            setResendLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 text-sm mb-1";
    const labelClasses = "block text-sm font-medium text-gray-800 mb-1.5";

    return (
        <AuthCard title="Welcome back" maxWidth="max-w-[450px]" transparent={transparent}>
            <div className="relative overflow-visible">
                <AnimatePresence>
                    {showTerms && <TermsOverlay onClose={() => setShowTerms(false)} />}
                </AnimatePresence>
                <form onSubmit={handleLogin} className="space-y-2.5">
                {error && (
                    <div className="p-3 bg-red-50 text-red-500 text-xs rounded-lg border border-red-100 space-y-3">
                        {error}
                        {error.toLowerCase().includes('verify your email') && (
                            <div className="pt-2 border-t border-red-100 flex flex-col gap-2">
                                <p className="text-[10px] text-red-400 font-semibold uppercase tracking-widest">
                                    Didn’t get the email?
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={resendLoading}
                                    className="self-start px-3 py-2 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
                                >
                                    {resendLoading ? 'Sending...' : 'Resend Verification Link'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {resendMessage && (
                    <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg border border-green-100">
                        {resendMessage}
                    </div>
                )}

                <div>
                     <label className={labelClasses}>Email Address</label>
                     <input
                         type="email"
                         name="email"
                         autoComplete="email"
                         placeholder={selectedRole === 'institution' ? "admin@institution.com" : "you@example.com"}
                         className={inputClasses}
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         required
                     />
                 </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className={labelClasses}>Password</label>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className={inputClasses}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-purple-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="mt-1 text-[13px] font-medium text-gray-500 hover:text-purple-600 transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#6d3ff0] text-[15px] font-semibold text-white transition-colors hover:bg-[#5b30d6] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d3ff0]"
                >
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
                {waking && (
                    <p role="status" className="mt-2 text-center text-[13px] text-gray-500">
                        Waking up the server. The first sign-in after a quiet spell can take up to a minute.
                    </p>
                )}
                </form>
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    New to STUDLYF?{' '}
                    <button
                        onClick={onSwitchToSignup}
                        className="ml-1 font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Create account
                    </button>
                </p>
            </div>
        </AuthCard>
    );
};

export default LoginForm;

