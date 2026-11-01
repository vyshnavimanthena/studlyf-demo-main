import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';

const VerifyEmailPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setError("Missing verification token. Please use the link sent to your email.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                
                if (res.ok) {
                    setSuccess(true);
                } else {
                    const data = await res.json();
                    setError(data.detail || "Failed to verify email. Link may be expired.");
                }
            } catch (err) {
                setError("Connection failed. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <AuthLayout>
            <AuthCard title="Email Verification" maxWidth="max-w-[450px]">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Verifying...</h2>
                        <p className="text-sm text-gray-500">
                            Please wait while we verify your email address.
                        </p>
                    </motion.div>
                ) : success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Email Verified</h2>
                        <p className="text-sm text-gray-500 mb-8">
                            Your email has been successfully verified. You can now access your account.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                        >
                            Proceed to Login
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <XCircle size={32} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Verification Failed</h2>
                        <p className="text-sm text-gray-500 mb-8">
                            {error || "Unable to verify your email. The link may be expired or invalid."}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 text-gray-500 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-gray-100 transition-all"
                        >
                            <ArrowLeft size={16} /> Back to Login
                        </button>
                    </motion.div>
                )}
            </AuthCard>
        </AuthLayout>
    );
};

export default VerifyEmailPage;

