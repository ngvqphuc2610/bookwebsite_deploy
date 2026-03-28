import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, User, Menu, LogOut, Headphones } from 'lucide-react';
import { getServerUrl } from '../services/api';
import './Navbar.css';

const Navbar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const getAvatarUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/40';
        if (url.startsWith('http')) return url;
        return getServerUrl(url);
    };

    return (
        <nav className="navbar glass">
            <div className="container nav-content">
                <Link to="/" className="logo">
                    <BookOpen size={32} className="logo-icon" />
                    <span>Nhom8 Story</span>
                </Link>

                <div className="nav-search">
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Tìm kiếm truyện..." />
                </div>

                <div className="nav-links">
                    <Link to="/genres">Thể loại</Link>
                    {user?.roles?.includes('ADMIN') && (
                        <Link to="/admin">Admin</Link>
                    )}
                    {(user?.roles?.includes('ADMIN') || user?.roles?.includes('STAFF')) && (
                        <Link to="/staff">Staff</Link>
                    )}
                    <Link to="/premium" className="premium-link">Premium</Link>
                    <Link to="/support" className="support-link" title="Hỗ trợ khách hàng">
                        <Headphones size={18} />
                        <span>Hỗ trợ</span>
                    </Link>
                    {user ? (
                        <div className="user-profile">
                            <img
                                src={getAvatarUrl(user.avatar)}
                                alt="Avatar"
                                className="user-avatar"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                            />
                            <span className="user-name">{user.username}</span>
                            <button onClick={handleLogout} className="logout-btn" title="Đăng xuất">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn">
                            <User size={20} />
                            <span>Đăng nhập</span>
                        </Link>
                    )}

                    <button className="mobile-menu">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
