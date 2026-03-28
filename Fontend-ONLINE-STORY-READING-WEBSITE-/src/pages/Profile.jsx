import React, { useState, useEffect, useRef } from 'react';
import { userService, getServerUrl } from '../services/api';
import { User, Mail, Camera, Save, Key, Shield, Calendar, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
        otp: ''
    });
    const [sendingOtp, setSendingOtp] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userService.getProfile();
            setProfile(response.data);
            setFormData({
                fullName: response.data.fullName || '',
                email: response.data.email || '',
                newPassword: '',
                confirmPassword: '',
                otp: ''
            });
            if (response.data.avatar) {
                setAvatarPreview(getServerUrl(response.data.avatar));
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            showNotification('error', 'Không thể tải thông tin hồ sơ.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtp = async () => {
        try {
            setSendingOtp(true);
            const response = await userService.requestOtp();
            showNotification('success', response.data || 'Mã xác nhận đã được gửi!');
        } catch (error) {
            showNotification('error', error.response?.data || 'Không thể gửi mã xác nhận.');
        } finally {
            setSendingOtp(false);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            showNotification('error', 'Mật khẩu xác nhận không khớp.');
            return;
        }

        try {
            setSaving(true);
            const dataToUpdate = {
                fullName: formData.fullName,
                email: formData.email,
                avatar: avatarFile,
                newPassword: formData.newPassword,
                otp: formData.otp
            };

            const response = await userService.updateProfile(dataToUpdate);
            setProfile(response.data);

            // Update preview to use the server URL instead of blob URL
            if (response.data.avatar) {
                setAvatarPreview(getServerUrl(response.data.avatar));
            }

            showNotification('success', 'Cập nhật hồ sơ thành công!');

            // Re-sync local storage user info
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...storedUser,
                fullName: response.data.fullName,
                avatar: response.data.avatar
            }));

            // Clear password fields
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '', otp: '' }));
        } catch (error) {
            showNotification('error', error.response?.data || 'Lỗi khi cập nhật hồ sơ.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                <p className="font-bold uppercase tracking-widest text-xs">Đang đồng bộ hồ sơ...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] py-20 px-4">
            {notification && (
                <div className={`fixed top-24 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full backdrop-blur-md border border-white/20 ${notification.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                    }`}>
                    {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="font-bold">{notification.message}</span>
                </div>
            )}

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Left Panel - Profile Card */}
                <div className="w-full md:w-1/3">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-28">
                        <div className="h-32 bg-gradient-to-br from-amber-600 via-amber-700 to-orange-900 relative">
                            {/* Decorative pattern */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
                        </div>

                        <div className="px-6 pb-8 text-center relative">
                            <div className="relative inline-block group -mt-16 mb-4">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden">
                                    <img
                                        src={avatarPreview || "https://via.placeholder.com/150"}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://github.com/shadcn.png";
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera className="text-white h-8 w-8" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{profile?.fullName || profile?.username}</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1 mb-5">@{profile?.username}</p>

                            <div className="flex justify-center gap-2 mb-6">
                                {profile?.premiumExpiry && new Date(profile.premiumExpiry) > new Date() ? (
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold flex items-center gap-1.5 px-3 py-1">
                                        <Sparkles size={12} fill="currentColor" /> Premium Member
                                    </Badge>
                                ) : (
                                    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-bold px-3 py-1">
                                        Free Account
                                    </Badge>
                                )}
                            </div>

                            <div className="border-t border-slate-100 pt-5 text-left space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5"><Calendar size={12} /> Ngày tham gia</span>
                                    <span className="font-semibold text-slate-700">{new Date(profile?.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5"><Mail size={12} /> Email</span>
                                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">{profile?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Settings Form */}
                <div className="w-full md:w-2/3">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
                        <div className="mb-8 border-b border-slate-100 pb-6">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <User className="text-amber-600 h-6 w-6" /> Thiết Lập Hồ Sơ
                            </h2>
                            <p className="text-slate-500 text-sm mt-2 font-medium">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Thông tin cơ bản</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <label className="text-[12px] font-bold text-slate-600 ml-1">Họ và tên hiển thị</label>
                                        <Input
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium transition-all"
                                            placeholder="Tên của bạn..."
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[12px] font-bold text-slate-600 ml-1">Địa chỉ Email</label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium transition-all"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password section */}
                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Bảo mật</h3>
                                    <p className="text-xs text-amber-600 mt-1 font-medium bg-amber-50 inline-block px-2 py-1 rounded-md">Bỏ trống nếu không thay đổi mật khẩu</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <label className="text-[12px] font-bold text-slate-600 ml-1">Mật khẩu mới</label>
                                        <Input
                                            name="newPassword"
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[12px] font-bold text-slate-600 ml-1">Xác nhận mật khẩu</label>
                                        <Input
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {(formData.newPassword || formData.confirmPassword) && (
                                        <div className="col-span-full space-y-2.5 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[12px] font-bold text-slate-600 ml-1">Mã xác nhận (OTP) gửi qua Email</label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRequestOtp}
                                                    disabled={sendingOtp}
                                                    className="h-8 text-amber-600 font-bold hover:text-amber-700 hover:bg-amber-50"
                                                >
                                                    {sendingOtp ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : null}
                                                    Gửi mã OTP
                                                </Button>
                                            </div>
                                            <Input
                                                name="otp"
                                                value={formData.otp}
                                                onChange={handleInputChange}
                                                className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium transition-all"
                                                placeholder="Nhập mã 6 chữ số..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="h-12 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-900/10 transition-all hover:-translate-y-0.5"
                                >
                                    {saving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                                    {saving ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
