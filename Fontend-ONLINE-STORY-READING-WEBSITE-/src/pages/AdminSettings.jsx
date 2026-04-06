import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin-layout';
import { 
    Settings2, Save, RefreshCcw, Info, 
    Globe, Mail, Lock, CreditCard, Layout, 
    Bell, ShieldCheck, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const AdminSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(response.data);
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSetting = (key, value) => {
        setSettings(prev => prev.map(s => s.settingKey === key ? { ...s, settingValue: value } : s));
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/settings`, settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Cập nhật cài đặt thành công!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Lỗi khi lưu cài đặt!");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const getIconByKey = (key) => {
        if (key.includes('SITE')) return <Globe className="w-5 h-5" />;
        if (key.includes('EMAIL')) return <Mail className="w-5 h-5" />;
        if (key.includes('MAINTENANCE')) return <ShieldCheck className="w-5 h-5" />;
        if (key.includes('VNPAY')) return <CreditCard className="w-5 h-5" />;
        if (key.includes('MOMO')) return <Zap className="w-5 h-5" />;
        return <Settings2 className="w-5 h-5" />;
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-widest mb-2">
                            <Settings2 size={14} />
                            Hệ thống tổng quan
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cài đặt chung</h1>
                        <p className="text-slate-500 font-medium">Tùy chỉnh các thông số vận hành và cấu hình kỹ thuật của website.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            className="rounded-xl border-slate-200 bg-white font-bold"
                            onClick={fetchSettings}
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" /> Hoàn tác
                        </Button>
                        <Button 
                            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-100 font-bold px-8"
                            onClick={saveSettings}
                            disabled={saving}
                        >
                            {saving ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                            Lưu tất cả thay đổi
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center opacity-50 font-bold uppercase tracking-widest text-[10px]">
                        <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
                        Đang chuẩn bị bảng cấu hình...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settings.map((setting) => (
                            <Card key={setting.id} className="border-slate-50 shadow-sm hover:shadow-md transition-shadow rounded-[2rem] overflow-hidden group">
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                {getIconByKey(setting.settingKey)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 leading-tight mb-1">{setting.settingKey}</h3>
                                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                                                    <Info size={12} /> {setting.description || 'Tham số hệ thống'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {setting.settingKey === 'MAINTENANCE_MODE' ? (
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <Label className="font-bold text-slate-700">Trạng thái bảo trì</Label>
                                                <Switch 
                                                    checked={setting.settingValue === 'true'}
                                                    onCheckedChange={(checked) => handleUpdateSetting(setting.settingKey, checked.toString())}
                                                />
                                            </div>
                                        ) : setting.settingValue?.length > 50 ? (
                                            <Textarea 
                                                value={setting.settingValue}
                                                onChange={(e) => handleUpdateSetting(setting.settingKey, e.target.value)}
                                                className="min-h-[100px] rounded-2xl border-slate-100 bg-white shadow-inner focus:ring-orange-200"
                                            />
                                        ) : (
                                            <Input 
                                                value={setting.settingValue}
                                                onChange={(e) => handleUpdateSetting(setting.settingKey, e.target.value)}
                                                className="h-12 rounded-2xl border-slate-100 bg-white shadow-inner focus:ring-orange-200 font-medium"
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Visual Help Card */}
                        <Card className="border-orange-100 shadow-sm rounded-[2rem] bg-gradient-to-br from-orange-500 to-rose-600 text-white p-8 md:col-span-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-2xl">
                                    <Lock size={40} className="text-white" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Khu vực nhạy cảm</h2>
                                    <p className="font-medium opacity-90 leading-relaxed max-w-2xl">
                                        Mọi thay đổi tại đây sẽ ảnh hưởng trực tiếp đến trải nghiệm của toàn bộ người dùng và luồng thanh toán chuyển tiền. Vui lòng kiểm tra kỹ các Key-Secret trước khi lưu.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
