import { useState, useEffect, useRef, useCallback } from 'react';
import { supportService, WS_URL } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    MessageSquare, Send, Check, AlertCircle,
    Headphones, Clock, CheckCircle, XCircle, RefreshCw, User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSupportPanel.css';

const AdminSupportPanel = () => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [filter, setFilter] = useState('');
    const [notification, setNotification] = useState(null);
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);
    const subscribedConvRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [messages]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const getAdminId = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.id || null;
        } catch { return null; }
    };

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const res = await supportService.listConversations(filter);
            setConversations(res.data);
        } catch (err) {
            showNotification('error', 'Không thể tải danh sách hội thoại');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    // WebSocket connection
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 5000,
            onConnect: () => console.log('Admin WS connected'),
        });
        client.activate();
        stompClientRef.current = client;
        return () => { if (stompClientRef.current) stompClientRef.current.deactivate(); };
    }, []);

    // Subscribe to selected conversation
    useEffect(() => {
        if (!selectedConv || !stompClientRef.current?.connected) return;
        // Unsubscribe previous
        if (subscribedConvRef.current?.unsub) {
            subscribedConvRef.current.unsub.unsubscribe();
        }
        const unsub = stompClientRef.current.subscribe(`/topic/support/${selectedConv.id}`, (frame) => {
            const msg = JSON.parse(frame.body);
            setMessages(prev => [...prev, msg]);
        });
        subscribedConvRef.current = { id: selectedConv.id, unsub };
        return () => { unsub.unsubscribe(); };
    }, [selectedConv]);

    // Load messages for selected conversation
    const selectConversation = async (conv) => {
        setSelectedConv(conv);
        setMsgLoading(true);
        try {
            const res = await supportService.getMessages(conv.id);
            setMessages(res.data);
        } catch {
            showNotification('error', 'Không thể tải tin nhắn');
        } finally {
            setMsgLoading(false);
        }
    };

    const handleReply = async () => {
        const trimmed = replyText.trim();
        if (!trimmed || !selectedConv) return;
        const adminId = getAdminId();
        if (!adminId) { showNotification('error', 'Không xác định được admin'); return; }
        try {
            await supportService.adminReply(selectedConv.id, adminId, trimmed);
            setReplyText('');
        } catch {
            showNotification('error', 'Gửi tin nhắn thất bại');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); }
    };

    const handleAssign = async (convId) => {
        const adminId = getAdminId();
        if (!adminId) return;
        try {
            await supportService.assignAdmin(convId, adminId);
            showNotification('success', 'Đã nhận hội thoại');
            fetchConversations();
        } catch { showNotification('error', 'Lỗi khi nhận hội thoại'); }
    };

    const handleClose = async (convId) => {
        try {
            await supportService.closeConversation(convId);
            showNotification('success', 'Đã đóng hội thoại');
            if (selectedConv?.id === convId) { setSelectedConv(null); setMessages([]); }
            fetchConversations();
        } catch { showNotification('error', 'Lỗi khi đóng hội thoại'); }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING_ADMIN': return { label: 'Chờ admin', cls: 'pending', icon: <Clock size={14} /> };
            case 'OPEN': return { label: 'Đang mở', cls: 'open', icon: <CheckCircle size={14} /> };
            case 'CLOSED': return { label: 'Đã đóng', cls: 'closed', icon: <XCircle size={14} /> };
            default: return { label: status, cls: '', icon: null };
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="admin-container light-theme">
            {notification && (
                <div className={`notification ${notification.type} slide-in`}>
                    {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span>{notification.message}</span>
                </div>
            )}

            <aside className="admin-sidebar light-sidebar">
                <div className="admin-logo">
                    <Headphones color="var(--primary)" size={32} />
                    <h2>Admin Panel</h2>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}><User size={20} /> Người dùng</Link>
                    <Link to="/admin/support" className={location.pathname === '/admin/support' ? 'active' : ''}><MessageSquare size={20} /> Hỗ trợ CSKH</Link>
                </nav>
            </aside>

            <main className="admin-main light-main support-main">
                <header className="admin-header light-header">
                    <h2 style={{ margin: 0 }}><Headphones size={22} /> Quản lý hỗ trợ khách hàng</h2>
                    <div className="support-filter-bar">
                        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                            <option value="">Tất cả</option>
                            <option value="PENDING_ADMIN">Chờ admin</option>
                            <option value="OPEN">Đang mở</option>
                            <option value="CLOSED">Đã đóng</option>
                        </select>
                        <button className="btn-refresh" onClick={fetchConversations}><RefreshCw size={16} /> Làm mới</button>
                    </div>
                </header>

                <div className="support-layout">
                    {/* Conversation list */}
                    <div className="conv-list-panel">
                        <div className="conv-list-header">Hội thoại ({conversations.length})</div>
                        {loading ? (
                            <div className="conv-loading">Đang tải...</div>
                        ) : conversations.length === 0 ? (
                            <div className="conv-empty">Không có hội thoại nào</div>
                        ) : (
                            <div className="conv-list">
                                {conversations.map(conv => {
                                    const st = getStatusInfo(conv.status);
                                    return (
                                        <div
                                            key={conv.id}
                                            className={`conv-item ${selectedConv?.id === conv.id ? 'selected' : ''}`}
                                            onClick={() => selectConversation(conv)}
                                        >
                                            <div className="conv-item-top">
                                                <span className="conv-user"><User size={14} /> {conv.username || `User #${conv.userId}`}</span>
                                                <span className={`conv-status ${st.cls}`}>{st.icon} {st.label}</span>
                                            </div>
                                            <div className="conv-item-bottom">
                                                <span className="conv-time">{formatTime(conv.createdAt)}</span>
                                                <div className="conv-actions-mini">
                                                    {conv.status === 'PENDING_ADMIN' && (
                                                        <button className="btn-mini assign" onClick={(e) => { e.stopPropagation(); handleAssign(conv.id); }} title="Nhận hội thoại">Nhận</button>
                                                    )}
                                                    {conv.status !== 'CLOSED' && (
                                                        <button className="btn-mini close" onClick={(e) => { e.stopPropagation(); handleClose(conv.id); }} title="Đóng"><XCircle size={14} /></button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Chat area */}
                    <div className="chat-panel">
                        {!selectedConv ? (
                            <div className="chat-empty">
                                <MessageSquare size={48} strokeWidth={1} />
                                <p>Chọn một hội thoại để xem tin nhắn</p>
                            </div>
                        ) : (
                            <>
                                <div className="chat-header-bar">
                                    <span><User size={16} /> {selectedConv.username || `User #${selectedConv.userId}`}</span>
                                    <span className={`conv-status ${getStatusInfo(selectedConv.status).cls}`}>
                                        {getStatusInfo(selectedConv.status).label}
                                    </span>
                                </div>
                                <div className="chat-messages">
                                    {msgLoading ? (
                                        <div className="conv-loading">Đang tải tin nhắn...</div>
                                    ) : messages.length === 0 ? (
                                        <div className="conv-empty">Chưa có tin nhắn</div>
                                    ) : (
                                        messages.map((msg, idx) => (
                                            <div key={idx} className={`chat-msg ${msg.senderType === 'ADMIN' ? 'admin' : msg.senderType === 'BOT' ? 'bot' : 'user'}`}>
                                                <div className="msg-bubble">
                                                    <div className="msg-sender">{msg.senderType === 'ADMIN' ? '🛡️ Admin' : msg.senderType === 'BOT' ? '🤖 Bot' : '👤 User'}</div>
                                                    <div className="msg-content">{msg.content}</div>
                                                    <div className="msg-time">{formatTime(msg.sentAt)}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                {selectedConv.status !== 'CLOSED' && (
                                    <div className="chat-input-bar">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Nhập tin nhắn trả lời..."
                                            rows={2}
                                        />
                                        <button onClick={handleReply} disabled={!replyText.trim()} className="btn-send"><Send size={18} /></button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminSupportPanel;
