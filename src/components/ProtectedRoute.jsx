import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
    const { user } = useContext(UserContext);
    const location = useLocation();

    // Loading state
    if (user === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (user === false) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated
    return <Outlet />;
};

export default ProtectedRoute;
