import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Search, BookOpen, Sparkles } from 'lucide-react';
import { chatbotService, mangaSearchService } from '../services/api';
import './ChatBox.css';

const WELCOME_MSG = {
    role: 'bot',
    content:
        'Xin chào! 👋 Tôi là trợ lý AI của **Nhom8 Story**.\n\nTôi có thể giúp bạn:\n• 🔍 Tìm kiếm truyện theo tên, thể loại\n• 📚 Đề xuất truyện hay\n• ❓ Trả lời câu hỏi về truyện tranh\n\nHãy nhắn tin cho tôi nhé!',
};

const QUICK_ACTIONS = [
    { label: '📚 Đề xuất', text: 'Đề xuất truyện hay' },
    { label: '⚔️ Hành động', text: 'Truyện hành động' },
    { label: '🆕 Mới nhất', text: 'Truyện mới nhất' },
];

export default function ChatBox() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MSG]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, searchResults]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const formatBotMessage = (text) =>
        text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg = { role: 'user', content: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setSearchResults(null);

        try {
            const history = messages
                .filter((m) => m.role === 'user' || m.role === 'bot')
                .map((m) => ({ role: m.role === 'bot' ? 'assistant' : m.role, content: m.content }));

            const res = await chatbotService.ask(trimmed, history);
            const botReply = res.data.response || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.';
            setMessages((prev) => [...prev, { role: 'bot', content: botReply }]);

            try {
                const searchRes = await mangaSearchService.search(trimmed, 5);
                if (searchRes.data.results && searchRes.data.results.length > 0) {
                    setSearchResults(searchRes.data.results);
                }
            } catch {
            }
        } catch (err) {
            console.error('Chatbot error:', err);
            setMessages((prev) => [
                ...prev,
                { role: 'bot', content: 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau! 🙏' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (text) => {
        setInput(text);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    return (
        <>
            <button
                className={`chatbox-trigger ${isOpen ? 'chatbox-trigger--hidden' : ''}`}
                onClick={() => setIsOpen(true)}
                aria-label="Mở chatbot hỗ trợ"
            >
                <MessageCircle size={22} />
                <span className="chatbox-trigger__badge">AI</span>
            </button>

            <div className={`chatbox ${isOpen ? 'chatbox--open' : ''}`}>
                <div className="chatbox__header">
                    <div className="chatbox__header-info">
                        <div className="chatbox__header-icon">
                            <Bot size={18} />
                        </div>
                        <div>
                            <h4>Trợ lý Nhom8 Story</h4>
                            <span className="chatbox__status">● Đang hoạt động</span>
                        </div>
                    </div>
                    <button className="chatbox__close" onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <div className="chatbox__messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chatbox__msg chatbox__msg--${msg.role}`}>
                            <div className="chatbox__msg-avatar">{msg.role === 'bot' ? <Bot size={15} /> : <User size={15} />}</div>
                            <div className="chatbox__msg-body">
                                <div className="chatbox__msg-bubble" dangerouslySetInnerHTML={{ __html: formatBotMessage(msg.content) }} />
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="chatbox__msg chatbox__msg--bot">
                            <div className="chatbox__msg-avatar">
                                <Bot size={15} />
                            </div>
                            <div className="chatbox__msg-bubble chatbox__msg-typing">
                                <Loader2 size={15} className="spin" />
                                <span>Đang suy nghĩ...</span>
                            </div>
                        </div>
                    )}

                    {searchResults && (
                        <div className="chatbox__search-results">
                            <div className="chatbox__search-label">
                                <Sparkles size={13} />
                                Gợi ý truyện liên quan
                            </div>
                            {searchResults.map((result, i) => (
                                <div key={i} className="chatbox__story-card">
                                    <BookOpen size={14} />
                                    <div>
                                        <strong>{result.title}</strong>
                                        {result.author && <span className="chatbox__story-author"> — {result.author}</span>}
                                        {result.genres && <div className="chatbox__story-genres">{result.genres.join(', ')}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chatbox__quick-actions">
                    {QUICK_ACTIONS.map((item) => (
                        <button key={item.label} onClick={() => handleQuickAction(item.text)}>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="chatbox__input-area">
                    <div className="chatbox__input-wrap">
                        <Search size={14} />
                        <input
                            ref={inputRef}
                            type="text"
                            className="chatbox__input"
                            placeholder="Hỏi về truyện, premium, tài khoản..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                    </div>
                    <button className="chatbox__send" onClick={handleSend} disabled={!input.trim() || loading}>
                        <Send size={17} />
                    </button>
                </div>
            </div>
        </>
    );
}
