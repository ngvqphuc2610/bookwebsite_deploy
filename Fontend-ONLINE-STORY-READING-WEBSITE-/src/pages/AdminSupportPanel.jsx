import { useState, useEffect, useRef, useCallback } from 'react';
import { supportService } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    MessageSquare, Send, Check, AlertCircle,
    Headphones, Clock, CheckCircle, XCircle, RefreshCw, User, ShieldCheck, Search
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AdminLayout } from '@/components/admin-layout';
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

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Admin WS connected');
                client.subscribe('/topic/support/pending', (frame) => {
                    fetchConversations();
                });
            },
        });
        client.activate();
        stompClientRef.current = client;
        return () => { if (stompClientRef.current) stompClientRef.current.deactivate(); };
    }, [fetchConversations]);

    useEffect(() => {
        if (!selectedConv || !stompClientRef.current?.connected) return;
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
        
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: '/app/admin.support.reply',
                body: JSON.stringify({ conversationId: selectedConv.id, adminId, content: trimmed }),
            });
            setReplyText('');
        } else {
            showNotification('error', 'Lỗi kết nối Websocket');
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
            case 'PENDING_ADMIN': return { label: 'Chờ admin', cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={12} /> };
            case 'OPEN': return { label: 'Đang xử lý', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} /> };
            case 'CLOSED': return { label: 'Đã đóng', cls: 'bg-slate-100 text-slate-500 border-slate-200', icon: <XCircle size={12} /> };
            default: return { label: status, cls: 'bg-slate-100 text-slate-500', icon: null };
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    };

    return (
        <AdminLayout>
            {notification && (
                <div className={`fixed top-24 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full backdrop-blur-md border border-white/20 ${notification.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
                    <div className="bg-white/20 p-1.5 rounded-full">
                        {notification.type === 'success' ? <Check size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={3} />}
                    </div>
                    <span className="font-bold tracking-tight">{notification.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest mb-2">
                        <Headphones size={14} />
                        Trung Tâm Hỗ Trợ
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Quản lý CSKH</h1>
                    <p className="text-slate-500 font-medium font-sans mt-2">
                        Tư vấn, hỗ trợ và giải quyết khiếu nại của người dùng.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="h-12 px-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-rose-500 focus:border-rose-500 font-bold text-slate-700 outline-none"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING_ADMIN">Chờ phản hồi</option>
                        <option value="OPEN">Đang xử lý</option>
                        <option value="CLOSED">Đã hoàn tất</option>
                    </select>
                    <button
                        onClick={fetchConversations}
                        className="h-12 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-600 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                {/* Conversation List */}
                <div className="w-full lg:w-[340px] flex gap-0 flex-col bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden shrink-0">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-black text-lg text-slate-800 tracking-tight flex items-center gap-2">
                            <MessageSquare className="text-rose-500" size={20} />
                            Hội thoại ({conversations.length})
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {loading ? (
                            <div className="text-center py-20 text-slate-400 font-bold text-sm">Đang tải biểu mẫu...</div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 font-bold text-sm">Không có hội thoại nào</div>
                        ) : (
                            conversations.map(conv => {
                                const st = getStatusInfo(conv.status);
                                const isSelected = selectedConv?.id === conv.id;
                                return (
                                    <div
                                        key={conv.id}
                                        className={`p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300 relative group overflow-hidden ${isSelected ? 'border-rose-500 bg-rose-50 shadow-md shadow-rose-100' : 'border-transparent hover:bg-slate-50'}`}
                                        onClick={() => selectConversation(conv)}
                                    >
                                        {isSelected && <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 rounded-r-full" />}
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <User size={14} />
                                                </div>
                                                <span className="truncate max-w-[120px]">{conv.username || `User #${conv.userId}`}</span>
                                            </div>
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black flex items-center gap-1 border ${st.cls}`}>
                                                {st.icon} {st.label}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                                <Clock size={12} /> {formatTime(conv.createdAt)}
                                            </span>
                                            <div className="flex gap-2">
                                                {conv.status === 'PENDING_ADMIN' && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleAssign(conv.id); }} className="px-3 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[11px] font-bold rounded-lg hover:shadow-md hover:scale-105 transition-all">Nhận</button>
                                                )}
                                                {conv.status !== 'CLOSED' && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleClose(conv.id); }} className="px-2 py-1 bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50 text-[11px] font-bold rounded-lg transition-all" title="Đóng">Đóng</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col relative">
                    {!selectedConv ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                                <Headphones size={40} className="text-slate-300" />
                            </div>
                            <p className="font-bold">Chọn một hội thoại để bắt đầu hỗ trợ</p>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center z-10 shadow-sm relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-md">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800">{selectedConv.username || `User #${selectedConv.userId}`}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusInfo(selectedConv.status).cls}`}>
                                            {getStatusInfo(selectedConv.status).label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-slate-50/30 custom-scrollbar relative">
                                {msgLoading ? (
                                    <div className="text-center py-10 text-slate-400 font-bold text-sm">Đang tải tin nhắn...</div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 font-bold text-sm">Chưa có tin nhắn</div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isAdmin = msg.senderType === 'ADMIN';
                                        const isBot = msg.senderType === 'BOT';
                                        
                                        return (
                                            <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} w-full`}>
                                                <div className={`flex gap-3 max-w-[80%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className="shrink-0 mt-1">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isAdmin ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white' : isBot ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                                                            {isAdmin ? <ShieldCheck size={14} /> : isBot ? <span className="font-black text-[10px]">BOT</span> : <User size={14} />}
                                                        </div>
                                                    </div>
                                                    <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">
                                                            {isAdmin ? 'Quản trị viên' : isBot ? 'Hệ thống tự động' : 'Khách hàng'}
                                                        </span>
                                                        <div className={`px-5 py-3.5 shadow-sm text-[15px] leading-relaxed relative ${isAdmin 
                                                            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl rounded-tr-sm' 
                                                            : isBot 
                                                            ? 'bg-amber-100 text-amber-900 rounded-2xl rounded-tl-sm border border-amber-200/50' 
                                                            : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                                                            {msg.content}
                                                        </div>
                                                        <span className="text-[10px] font-semibold text-slate-400 mt-1 px-1">
                                                            {formatTime(msg.sentAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {selectedConv.status !== 'CLOSED' ? (
                                <div className="p-4 bg-white border-t border-slate-100">
                                    <div className="flex gap-3 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Gửi tin nhắn tư vấn an toàn & bảo mật..."
                                            className="flex-1 bg-transparent resize-none h-[44px] max-h-[120px] px-4 py-2.5 outline-none text-slate-700 font-medium custom-scrollbar"
                                            rows={1}
                                        />
                                        <button 
                                            onClick={handleReply} 
                                            disabled={!replyText.trim()} 
                                            className="w-11 h-11 shrink-0 rounded-[1rem] bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                                        >
                                            <Send size={18} className="-ml-0.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                                    <p className="text-sm font-bold text-slate-400">Hội thoại này đã được đóng. Bạn không thể gửi thêm tin nhắn.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
        </AdminLayout>
    );
};

export default AdminSupportPanel;
