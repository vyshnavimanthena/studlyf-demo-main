
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="h-screen flex items-center justify-center font-mono text-xs tracking-widest uppercase text-[#7C3AED]">Verifying Authority...</div>;
    }

    if (!user) {
        const next = `${location.pathname}${location.search || ''}`;
        // For hackathon/opportunity share-links, push users to signup first.
        const authPath = location.pathname.startsWith('/opportunities/') ? '/signup' : '/login';
        return <Navigate to={`${authPath}?next=${encodeURIComponent(next)}`} replace />;
    }

    // If an Admin tries to access a regular protected route (like learner dashboard),
    // redirect them to the Admin System.
    if (role === 'super_admin' || role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
