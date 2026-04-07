import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.jsx'; // Reuse existing styles or create new ones

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            setMessage(response.data);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await axios.post('http://localhost:8080/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            alert(response.data);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
            <div style={{ width: '400px', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Quên mật khẩu</h2>
                
                {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
                {message && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP}>
                        <div style={{ marginBottom: '20px' }}>
                            <label>Nhập Email của bạn:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                placeholder="example@gmail.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            {loading ? 'Đang xử lý...' : 'Gửi mã xác nhận'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Mã OTP (6 số):</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label>Mật khẩu mới:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ width: '100%', padding: '12px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                )}
                
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <a href="/login" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Quay lại đăng nhập</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
