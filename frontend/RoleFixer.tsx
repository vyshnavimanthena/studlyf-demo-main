
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const RoleFixer: React.FC = () => {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const promoteToInstitution = async () => {
        if (!user) {
            setMessage("Please log in first.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/v1/auth/promote-to-institution', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ user_id: user.user_id })
            });
            
            if (res.ok) {
                setMessage("Success! Your role has been updated to 'Institution'. Redirecting...");
                setTimeout(() => {
                    navigate('/institution-dashboard');
                    window.location.reload(); 
                }, 2000);
            } else {
                throw new Error("Failed to update role via server.");
            }
        } catch (err: any) {
            setMessage("Error updating role: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-purple-100 max-w-md w-full text-center"
            >
                <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">Account Role Fixer</h1>
                <p className="text-sm text-gray-500 mb-8">
                    Use this tool to promote your current account <b>({user?.email || 'Not Logged In'})</b> to the Institutional role.
                </p>

                {message && (
                    <div className={`p-4 rounded-2xl mb-6 text-sm font-bold ${message.includes('Success') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {message}
                    </div>
                )}

                <button
                    onClick={promoteToInstitution}
                    disabled={loading || !user}
                    className="w-full py-4 bg-[#7C3AED] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-200 hover:bg-[#6D28D9] transition-all disabled:opacity-50 disabled:grayscale"
                >
                    {loading ? 'Promoting...' : 'Promote to Institution'}
                </button>
                
                <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    Current Detected Role: <span className="text-purple-600">{role || 'unknown'}</span>
                </p>
            </motion.div>
        </div>
    );
};

export default RoleFixer;

