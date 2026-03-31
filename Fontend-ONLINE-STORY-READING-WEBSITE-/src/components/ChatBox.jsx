import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Search, BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import { chatbotService, storyService } from '../services/api';
import { getServerUrl } from '../services/api';
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
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const formatBotMessage = (text) =>
        text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

    /**
     * Fetch story details for suggested manga IDs and attach as StoryCards.
     */
    const fetchSuggestedStories = async (mangaIds) => {
        if (!mangaIds || mangaIds.length === 0) return [];
        try {
            const storyPromises = mangaIds.slice(0, 5).map(id =>
                storyService.getById(id).then(res => res.data).catch(() => null)
            );
            const stories = await Promise.all(storyPromises);
            return stories.filter(Boolean);
        } catch {
            return [];
        }
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg = { role: 'user', content: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const history = messages
                .filter((m) => m.role === 'user' || m.role === 'bot')
                .map((m) => ({ role: m.role === 'bot' ? 'assistant' : m.role, content: m.content }));

            const res = await chatbotService.ask(trimmed, history);
            const botReply = res.data.response || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.';
            const suggestedIds = res.data.suggestedMangaIds || [];

            // Fetch rich story data for suggested IDs
            const suggestedStories = await fetchSuggestedStories(suggestedIds);

            setMessages((prev) => [
                ...prev,
                {
                    role: 'bot',
                    content: botReply,
                    suggestedStories: suggestedStories.length > 0 ? suggestedStories : null,
                },
            ]);
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

    const handleStoryClick = (story) => {
        window.open(`/story/${story.id}`, '_blank');
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
                            <Bot size={22} strokeWidth={2.5} />
                        </div>
                        <div className="chatbox__header-text">
                            <h4>Trợ lý Nhom8 Story</h4>
                            <span className="chatbox__status">Đang hoạt động</span>
                        </div>
                    </div>
                    <button className="chatbox__close" onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <div className="chatbox__messages">
                    {messages.map((msg, i) => (
                        <div key={i}>
                            <div className={`chatbox__msg chatbox__msg--${msg.role}`}>
                                <div className="chatbox__msg-avatar">
                                    {msg.role === 'bot' ? <Bot size={18} /> : <User size={18} strokeWidth={2.5} />}
                                </div>
                                <div className="chatbox__msg-body">
                                    <div
                                        className="chatbox__msg-bubble"
                                        dangerouslySetInnerHTML={{ __html: formatBotMessage(msg.content) }}
                                    />
                                </div>
                            </div>

                            {/* Rich Manga Cards — rendered below the bot message */}
                            {msg.suggestedStories && msg.suggestedStories.length > 0 && (
                                <div className="chatbox__manga-cards">
                                    <div className="chatbox__manga-cards-label">
                                        <Sparkles size={13} />
                                        Truyện gợi ý
                                    </div>
                                    {msg.suggestedStories.map((story) => (
                                        <div
                                            key={story.id}
                                            className="chatbox__manga-card"
                                            onClick={() => handleStoryClick(story)}
                                            title={`Đọc ${story.title}`}
                                        >
                                            <div className="chatbox__manga-card-cover">
                                                <img
                                                    src={getServerUrl(story.coverImage)}
                                                    alt={story.title}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/60x80?text=No+Cover';
                                                    }}
                                                />
                                            </div>
                                            <div className="chatbox__manga-card-info">
                                                <strong>{story.title}</strong>
                                                {story.author && (
                                                    <span className="chatbox__manga-card-author">{story.author}</span>
                                                )}
                                                {story.genres && story.genres.length > 0 && (
                                                    <div className="chatbox__manga-card-genres">
                                                        {story.genres.slice(0, 3).map((g) => (
                                                            <span key={g.name || g} className="chatbox__manga-card-tag">
                                                                {g.name || g}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {story.status && (
                                                    <span
                                                        className={`chatbox__manga-card-status chatbox__manga-card-status--${story.status?.toLowerCase()}`}
                                                    >
                                                        {story.status === 'COMPLETED' ? '✅ Hoàn thành' : '📝 Đang cập nhật'}
                                                    </span>
                                                )}
                                            </div>
                                            <ExternalLink size={14} className="chatbox__manga-card-link" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="chatbox__msg chatbox__msg--bot">
                            <div className="chatbox__msg-avatar">
                                <Bot size={18} />
                            </div>
                            <div className="chatbox__msg-bubble chatbox__msg-typing">
                                <Loader2 size={15} className="spin" />
                                <span>Đang suy nghĩ...</span>
                            </div>
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
                        <Send size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </>
    );
}
