import React, { useState, useEffect } from 'react';
import { userService, getServerUrl } from '../services/api';
import {
    Trash2,
    Search,
    X,
    Check,
    AlertCircle,
    User as UserIcon,
    Lock,
    Unlock,
    Shield,
    Mail,
    BadgeCheck,
    ShieldAlert,
    Settings2,
    UserCog,
    ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminLayout } from '@/components/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        roleIds: [],
    });
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll(searchTerm);
            setUsers(response.data || []);
        } catch (error) {
            showNotification('error', 'Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await userService.getRoles();
            setRoles(response.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy roles', error);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleOpenRoleModal = (user) => {
        setCurrentUser(user);
        setFormData({
            ...user,
            roleIds: user.roles ? user.roles.map((r) => r.id) : [],
        });
        setIsRoleModalOpen(true);
    };

    const handleOpenInfoModal = (user) => {
        setCurrentUser(user);
        setFormData({
            ...user,
            roleIds: user.roles ? user.roles.map((r) => r.id) : [],
        });
        setIsInfoModalOpen(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (roleId) => {
        setFormData((prev) => {
            const currentRoles = prev.roleIds;
            if (currentRoles.includes(roleId)) {
                return { ...prev, roleIds: currentRoles.filter((id) => id !== roleId) };
            }
            return { ...prev, roleIds: [...currentRoles, roleId] };
        });
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.updateRole(currentUser.id, formData.roleIds);
            showNotification('success', 'Cập nhật phân quyền thành công');
            setIsRoleModalOpen(false);
            fetchUsers();
        } catch (error) {
            showNotification('error', 'Có lỗi xảy ra');
        }
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.update(currentUser.id, formData);
            showNotification('success', 'Cập nhật thông tin thành công');
            setIsInfoModalOpen(false);
            fetchUsers();
        } catch (error) {
            showNotification('error', 'Có lỗi xảy ra');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await userService.toggleStatus(userId);
            showNotification('success', 'Đã thay đổi trạng thái tài khoản');
            fetchUsers();
        } catch (error) {
            showNotification('error', 'Thất bại khi đổi trạng thái');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
            try {
                await userService.delete(id);
                showNotification('success', 'Xóa người dùng thành công');
                fetchUsers();
            } catch (error) {
                showNotification('error', 'Không thể xóa người dùng');
            }
        }
    };

    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return getServerUrl(url);
    };

    const getRoleBadgeStyle = (roleName) => {
        switch (roleName) {
            case 'ADMIN':
                return 'bg-rose-50 text-rose-600 border-rose-100 ring-4 ring-rose-500/5';
            case 'STAFF':
                return 'bg-indigo-50 text-indigo-600 border-indigo-100 ring-4 ring-indigo-500/5';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <AdminLayout>
            {notification && (
                <div
                    className={`fixed top-24 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full backdrop-blur-md border border-white/20 ${notification.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                        }`}
                >
                    <div className="bg-white/20 p-1.5 rounded-full">
                        {notification.type === 'success' ? <Check size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={3} />}
                    </div>
                    <span className="font-bold tracking-tight">{notification.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
                        <Shield size={14} />
                        Hệ thống bảo mật
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Quản lý người dùng</h1>
                    <p className="text-slate-500 font-medium font-sans mt-2">
                        Kiểm soát danh tính, phân quyền và trạng thái hoạt động của thành viên.
                    </p>
                </div>
            </div>

            <div className="mb-10 group relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                    placeholder="Tìm theo tên đăng nhập, email hoặc ID..."
                    className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-lg font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-40 text-center flex flex-col items-center gap-4 text-slate-400 opacity-50 font-black uppercase tracking-[0.2em] text-[10px]">
                        <div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-500 rounded-full animate-spin mb-2" />
                        Đang truy vấn cơ sở dữ liệu...
                    </div>
                ) : users.length > 0 ? (
                    users.map((user) => {
                        const isEnabled = user.enabled ?? user.active;

                        return (
                            <div
                                key={user.id}
                                className={`group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden ${!isEnabled ? 'opacity-75 grayscale-[0.5]' : ''
                                    }`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Settings2 size={80} className="rotate-12" />
                                </div>

                                <Avatar className="h-20 w-20 rounded-2xl border-2 border-slate-50 shadow-md group-hover:shadow-indigo-200/50 transition-all">
                                    <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.username} />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 font-black text-xl">
                                        {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0 text-center md:text-left">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                        <h3 className="font-black text-2xl text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                                            {user.username}
                                        </h3>
                                        <div className="flex gap-2">
                                            {user.roles &&
                                                user.roles.map((role) => (
                                                    <Badge
                                                        key={role.id}
                                                        variant="outline"
                                                        className={`text-[10px] py-0.5 px-3 rounded-full font-black uppercase tracking-wider border ${getRoleBadgeStyle(
                                                            role.name,
                                                        )}`}
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                        </div>
                                        {!isEnabled && (
                                            <Badge className="bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-100 text-[10px] p-0 px-2 rounded-full flex items-center gap-1 font-bold">
                                                <ShieldAlert size={10} /> ĐÃ KHÓA
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 mb-4">
                                        <div className="text-sm text-slate-500 font-bold flex items-center gap-2">
                                            <div className="bg-slate-100 p-1.5 rounded-lg">
                                                <UserIcon size={14} className="text-indigo-500" />
                                            </div>
                                            {user.fullName || 'Chưa cập nhật tên'}
                                        </div>
                                        <div className="text-sm text-slate-500 font-bold flex items-center gap-2">
                                            <div className="bg-slate-100 p-1.5 rounded-lg">
                                                <Mail size={14} className="text-rose-400" />
                                            </div>
                                            {user.email}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <code className="text-[10px] bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full font-bold border border-indigo-100">
                                            ID: #{user.id}
                                        </code>
                                        <code
                                            className={`text-[10px] px-3 py-1 rounded-full font-bold border transition-colors ${isEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                                                }`}
                                        >
                                            {isEnabled ? 'MÁY CHỦ_ACTIVE' : 'MÁY CHỦ_LOCKED'}
                                        </code>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 shrink-0 relative z-10">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenInfoModal(user)}
                                        className="h-11 w-11 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all"
                                        title="Sửa thông tin"
                                    >
                                        <UserCog className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenRoleModal(user)}
                                        className="h-11 w-11 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-2xl transition-all"
                                        title="Phân quyền"
                                    >
                                        <BadgeCheck className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggleStatus(user.id)}
                                        className={`h-11 w-11 rounded-2xl transition-all ${isEnabled ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600' : 'text-rose-500 bg-rose-50 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                        title={isEnabled ? 'Khóa tài khoản' : 'Mở khóa'}
                                    >
                                        {isEnabled ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(user.id)}
                                        className="h-11 w-11 text-slate-400 hover:bg-red-50 hover:text-red-700 rounded-2xl transition-all"
                                        title="Xóa người dùng"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-slate-100/40 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50">
                            <UserIcon size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400 tracking-tight">Cơ sở dữ liệu trống</h3>
                        <p className="text-slate-400 mt-2 font-medium">Không tìm thấy người dùng nào phù hợp với tham số truy vấn.</p>
                    </div>
                )}
            </div>

            {isInfoModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in transition-all">
                    <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-8 md:p-10 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

                        <div className="flex justify-between items-center mb-8">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Cập Nhật Hồ Sơ</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Tài khoản: {currentUser?.username}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsInfoModalOpen(false)}
                                className="rounded-2xl h-12 w-12 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                                <X size={24} />
                            </Button>
                        </div>

                        <form onSubmit={handleInfoSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Họ và Tên đầy đủ</label>
                                <Input
                                    name="fullName"
                                    value={formData.fullName || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-indigo-500 transition-all font-bold text-slate-800"
                                    placeholder="Nhập họ và tên..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ Email</label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-indigo-500 transition-all"
                                    placeholder="example@gmail.com"
                                />
                            </div>

                            <div className="flex gap-4 justify-end pt-6 border-t border-slate-100 mt-6">
                                <Button type="button" variant="ghost" className="h-12 px-8 rounded-2xl font-bold text-slate-400" onClick={() => setIsInfoModalOpen(false)}>
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" className="h-12 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1">
                                    Lưu hồ sơ 🚀
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isRoleModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in transition-all">
                    <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-8 md:p-10 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />

                        <div className="flex justify-between items-center mb-8">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Phân Quyền</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Ủy quyền cho: {currentUser?.username}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsRoleModalOpen(false)}
                                className="rounded-2xl h-12 w-12 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                                <X size={24} />
                            </Button>
                        </div>

                        <form onSubmit={handleRoleSubmit}>
                            <div className="space-y-4 mb-8">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Cấp bậc vai trò (Roles)</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${formData.roleIds.includes(role.id)
                                                ? 'bg-indigo-50 border-indigo-200 shadow-md shadow-indigo-500/5'
                                                : 'bg-slate-50 border-transparent hover:bg-slate-100'
                                                }`}
                                            onClick={() => handleRoleChange(role.id)}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.roleIds.includes(role.id)
                                                    ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200'
                                                    : 'bg-slate-200 text-slate-400'
                                                    }`}
                                            >
                                                {role.name === 'ADMIN' ? <ShieldCheck size={20} /> : <UserIcon size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <span
                                                    className={`text-base font-black tracking-tight block uppercase ${formData.roleIds.includes(role.id) ? 'text-indigo-800' : 'text-slate-600'
                                                        }`}
                                                >
                                                    {role.name}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                                    {role.name === 'ADMIN' ? 'Toàn quyền kiểm soát hệ thống' : 'Quản lý nội dung & truyện'}
                                                </span>
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.roleIds.includes(role.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'
                                                    }`}
                                            >
                                                {formData.roleIds.includes(role.id) && <Check size={14} strokeWidth={4} className="text-white" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 justify-end pt-6 border-t border-slate-100">
                                <Button type="button" variant="ghost" className="h-12 px-8 rounded-2xl font-bold text-slate-400" onClick={() => setIsRoleModalOpen(false)}>
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" className="h-12 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1">
                                    Xác nhận cấp quyền 🚀
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUserManagement;
