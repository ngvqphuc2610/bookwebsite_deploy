import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { User, Lock, Mail, Type, Image as ImageIcon, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        avatar: null
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        if (e.target.name === 'avatar') {
            setFormData({ ...formData, avatar: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleAuth = async (type, e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (type === 'login') {
                const res = await authService.login({
                    username: formData.username,
                    password: formData.password
                });
                localStorage.setItem('token', res.data.accessToken);
                localStorage.setItem('user', JSON.stringify({
                    id: res.data.id,
                    username: res.data.username,
                    avatar: res.data.avatar,
                    roles: res.data.roles
                }));
                window.location.href = '/';
            } else {
                await authService.register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    avatar: formData.avatar
                });
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
            }
        } catch (err) {
            setError(err.response?.data || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
            {/* Background with blur */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero-bg.jpg"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover blur-sm brightness-[0.3]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
            </div>

            <Card className="relative z-10 w-full max-w-md border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-serif font-bold tracking-tight">AlexStore</CardTitle>
                    <CardDescription className="text-muted-foreground italic">Thế giới truyện trong tầm tay bạn</CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/20 p-1.5 rounded-xl border border-border/50">
                            <TabsTrigger
                                value="login"
                                className="py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                            >
                                Đăng Nhập
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                            >
                                Đăng Ký
                            </TabsTrigger>
                        </TabsList>

                        {error && (
                            <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <TabsContent value="login">
                            <form onSubmit={(e) => handleAuth('login', e)} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="login-username">Tên đăng nhập / Email</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-username"
                                            name="username"
                                            type="text"
                                            placeholder="admin@example.com hoặc admin"
                                            className="pl-10 h-11 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="login-password">Mật khẩu</Label>
                                        <Link to="/forgot-password" name="forgot-password-link" className="text-xs text-primary hover:underline">Quên mật khẩu?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-password"
                                            name="password"
                                            type={showLoginPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-11 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                                    {loading ? 'Đang đăng nhập...' : 'Bắt đầu đọc ngay'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={(e) => handleAuth('register', e)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-fullname">Họ và Tên</Label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="reg-fullname"
                                            name="fullName"
                                            type="text"
                                            placeholder="Nguyễn Văn A"
                                            className="pl-10 h-10 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="reg-email"
                                            name="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            className="pl-10 h-10 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-username">Tên đăng nhập</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="reg-username"
                                            name="username"
                                            type="text"
                                            placeholder="my_awesome_id"
                                            className="pl-10 h-10 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">Mật khẩu</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="reg-password"
                                            name="password"
                                            type={showRegPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-10 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRegPassword(!showRegPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-avatar">Ảnh đại diện (Tùy chọn)</Label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="reg-avatar"
                                            name="avatar"
                                            type="file"
                                            accept="image/*"
                                            className="pl-10 h-10 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-11 mt-4 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                                    {loading ? 'Đang tạo tài khoản...' : 'Tham gia ngay'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pb-8">
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background/80 px-2 text-muted-foreground">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 h-10 border-border/50 hover:bg-muted/50 w-full"
                            onClick={() => window.location.href = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8080') + '/oauth2/authorization/google'}
                        >
                            Google
                        </Button>
                    </div>

                    <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang chủ
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
