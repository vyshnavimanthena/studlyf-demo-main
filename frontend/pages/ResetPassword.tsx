
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError("Missing reset token. Please use the link sent to your email.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                const data = await res.json();
                setError(data.detail || "Failed to reset password. Link may be expired.");
            }
        } catch (err) {
            setError("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard title="New Credentials" maxWidth="max-w-[450px]">
                {!success ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <p className="text-sm text-gray-500 text-center px-4">
                            Establish a new secure password for your account. Ensure it's strong and unique.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-gray-300" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-purple-500 transition-all outline-none text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-purple-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-gray-300" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-purple-500 transition-all outline-none text-sm"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 mt-2 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Updating...' : 'Reset Password'}
                                <ShieldCheck size={16} />
                            </button>
                        </form>
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
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Access Restored</h2>
                        <p className="text-sm text-gray-500 mb-8">
                            Your password has been successfully updated in our MongoDB cluster.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-purple-600 font-bold text-[10px] uppercase tracking-widest">
                            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            Redirecting to Login...
                        </div>
                    </motion.div>
                )}
            </AuthCard>
        </AuthLayout>
    );
};

export default ResetPasswordPage;

