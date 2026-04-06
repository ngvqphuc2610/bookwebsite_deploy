import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, ArrowLeft, Headphones, ShieldCheck } from 'lucide-react';
import { supportService, getWsUrl } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useNavigate } from 'react-router-dom';
import './SupportChat.css';

const WELCOME_MSG = {
    role: 'bot',
    content:
        'Chào bạn! 🎧 Đây là kênh **Hỗ trợ CSKH**.\n\nBạn có thể hỏi về:\n• 💳 Thanh toán & Premium\n• 📖 Hướng dẫn sử dụng\n• 🐛 Báo lỗi\n\nCâu hỏi phổ biến sẽ được trả lời tự động.\nNếu cần, nhân viên sẽ hỗ trợ bạn!',
};

const QUICK_HELP = ['Cách nâng cấp Premium', 'Tôi bị lỗi thanh toán', 'Tài khoản bị khóa'];

export default function SupportChat() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([WELCOME_MSG]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [status, setStatus] = useState('connecting');
    const stompClientRef = useRef(null);
    const initializedRef = useRef(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const hasToken = () => !!localStorage.getItem('token');

    const formatMsg = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

    const connectSupport = useCallback(async () => {
        if (!hasToken()) {
            setStatus('needLogin');
            setMessages((prev) => [...prev, { role: 'bot', content: 'Bạn cần **đăng nhập** để sử dụng CSKH.' }]);
            return;
        }

        setLoading(true);
        try {
            const response = await supportService.openConversation();
            const conversation = response.data;
            setConversationId(conversation.id);

            const messageResponse = await supportService.getMessages(conversation.id);
            if (messageResponse.data && messageResponse.data.length > 0) {
                const mapped = messageResponse.data.map((msg) => {
                    let r = 'user';
                    if (msg.senderType === 'ADMIN') r = 'admin';
                    else if (msg.senderType === 'BOT') r = 'bot';
                    return { role: r, content: msg.content };
                });
                setMessages([WELCOME_MSG, ...mapped]);
            }

            if (stompClientRef.current) stompClientRef.current.deactivate();

            const client = new Client({
                webSocketFactory: () => new SockJS(getWsUrl()),
                reconnectDelay: 5000,
                onConnect: () => {
                    setStatus('connected');
                    client.subscribe(`/topic/support/${conversation.id}`, (frame) => {
                        const msg = JSON.parse(frame.body);
                        let assignedRole = 'user';
                        if (msg.senderType === 'ADMIN') assignedRole = 'admin';
                        else if (msg.senderType === 'BOT') assignedRole = 'bot';

                        setMessages((prev) => [
                            ...prev,
                            { role: assignedRole, content: msg.content },
                        ]);
                    });
                },
                onDisconnect: () => setStatus('connecting'),
            });

            client.activate();
            stompClientRef.current = client;
        } catch (err) {
            console.error('Support connect error:', err);
            setStatus('error');
            setMessages((prev) => [...prev, { role: 'bot', content: 'Không thể kết nối CSKH. Vui lòng thử lại.' }]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        connectSupport();
    }, [connectSupport]);

    useEffect(() => {
        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
        };
    }, []);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || loading || !conversationId || status === 'needLogin') return;

        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: '/app/support.send',
                body: JSON.stringify({ conversationId, content: trimmed }),
            });
        }
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const applyQuickHelp = (text) => {
        setInput(text);
        setTimeout(() => inputRef.current?.focus(), 30);
    };

    return (
        <div className="support-chat-page">
            <div className="support-chat">
                <div className="support-chat__header">
                    <button className="support-chat__back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </button>
                    <div className="support-chat__title">
                        <div className="support-chat__icon">
                            <Headphones size={17} />
                        </div>
                        <div>
                            <h4>Chăm sóc khách hàng</h4>
                            <span className={`support-chat__status support-chat__status--${status}`}>
                                {status === 'connected'
                                    ? '● Đã kết nối nhân viên'
                                    : status === 'needLogin'
                                        ? '○ Cần đăng nhập'
                                        : status === 'error'
                                            ? '○ Lỗi kết nối'
                                            : '◌ Đang kết nối...'}
                            </span>
                        </div>
                    </div>
                    <div className="support-chat__safe">
                        <ShieldCheck size={14} />
                        Bảo mật
                    </div>
                </div>

                <div className="support-chat__messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`support-chat__msg support-chat__msg--${msg.role}`}>
                            <div className="support-chat__msg-avatar">
                                {msg.role === 'admin' ? <ShieldCheck size={14} /> : msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                            </div>
                            <div className="support-chat__msg-bubble" dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }} />
                        </div>
                    ))}

                    {loading && (
                        <div className="support-chat__msg support-chat__msg--bot">
                            <div className="support-chat__msg-avatar">
                                <Bot size={14} />
                            </div>
                            <div className="support-chat__msg-bubble support-chat__msg-typing">
                                <Loader2 size={14} className="spin" /> <span>Đang kết nối...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="support-chat__quick-help">
                    {QUICK_HELP.map((item) => (
                        <button key={item} onClick={() => applyQuickHelp(item)}>
                            {item}
                        </button>
                    ))}
                </div>

                <div className="support-chat__input-area">
                    <input
                        ref={inputRef}
                        type="text"
                        className="support-chat__input"
                        placeholder="Mô tả vấn đề của bạn..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading || status === 'needLogin'}
                    />
                    <button
                        className="support-chat__send"
                        onClick={handleSend}
                        disabled={!input.trim() || loading || !conversationId || status === 'needLogin'}
                    >
                        <Send size={17} />
                    </button>
                </div>
            </div>
        </div>
    );
}
