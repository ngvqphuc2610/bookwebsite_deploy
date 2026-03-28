import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/api';
import { Loader2 } from 'lucide-react';

const OAuth2Redirect = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);

            // Fetch profile to verify and save user info
            const fetchUser = async () => {
                try {
                    const response = await userService.getProfile();
                    localStorage.setItem('user', JSON.stringify(response.data));
                    navigate('/');
                    window.location.reload(); // Refresh to update UI state
                } catch (error) {
                    console.error('OAuth2 login verification failed', error);
                    navigate('/login?error=auth_failed');
                }
            };
            fetchUser();
        } else {
            navigate('/login?error=no_token');
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
            <h2 className="text-xl font-bold text-slate-800">Đang xác thực tài khoản...</h2>
            <p className="text-slate-500">Vui lòng đợi trong giây lát ✨</p>
        </div>
    );
};

export default OAuth2Redirect;
