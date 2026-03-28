import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !user) {
        // Redirect to login but save the current location to come back later
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0) {
        const hasAccess = user.roles?.some(role => allowedRoles.includes(role));
        if (!hasAccess) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
