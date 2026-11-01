
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from './AuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const AdminProtectedRoute: React.FC<AdminRouteProps> = ({
    children,
    allowedRoles = ['super_admin']
}) => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#09090B] font-mono text-xs tracking-widest uppercase text-[#7C3AED]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
                    Authenticating System Access...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && !allowedRoles.includes(role)) {
        // Not authorized for admin area
        console.warn(`Unauthorized access attempt by ${typeof role === 'string' ? role : JSON.stringify(role)}`);
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;

