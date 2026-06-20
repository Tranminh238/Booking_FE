import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
    getUserConversations,
    getConversationMessages,
    markReadAsCustomer,
} from '../../api/chatApi';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './MyMessages.css';

const WEBSOCKET_URL = 'http://localhost:8889/ws';

export default function MyMessages() {
    const [searchParams] = useSearchParams();
    const initConvId = searchParams.get('conversationId');

    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(false);

    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const messagesEndRef = useRef(null);

    const userId = Number(sessionStorage.getItem('userId'));
    const userName = sessionStorage.getItem('firstName') + ' ' + sessionStorage.getItem('lastName');

    // Load conversations
    const loadConversations = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await getUserConversations(userId);
            if (res.status === 200) {
                setConversations(res.data || []);
                return res.data || [];
            }
        } catch (err) {
            console.error('Lỗi tải conversations:', err);
        }
        return [];
    }, [userId]);

    useEffect(() => {
        loadConversations().then(convs => {
            // Nếu có conversationId từ URL, chọn luôn
            if (initConvId) {
                const found = convs.find(c => c.id === Number(initConvId));
                if (found) selectConversation(found);
            }
            setLoading(false);
        });
    }, []);

    // Kết nối WebSocket STOMP
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            reconnectDelay: 5000,
            onConnect: () => setConnected(true),
            onDisconnect: () => setConnected(false),
        });
        client.activate();
        stompClientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, []);

    const subscriptionsRef = useRef({});
    const selectedConvRef = useRef(selectedConv);

    // Đồng bộ selectedConv vào ref để tránh closure stale trong callback của WebSocket
    useEffect(() => {
        selectedConvRef.current = selectedConv;
    }, [selectedConv]);

    // Subscribe vào topic của tất cả các conversations
    useEffect(() => {
        if (!connected || !stompClientRef.current) return;

        const convIds = conversations.map(c => c.id);

        // Unsubscribe những conv không còn trong danh sách
        Object.keys(subscriptionsRef.current).forEach(id => {
            const numId = Number(id);
            if (!convIds.includes(numId)) {
                subscriptionsRef.current[id].unsubscribe();
                delete subscriptionsRef.current[id];
            }
        });

        // Subscribe vào các conv mới
        conversations.forEach(conv => {
            if (!subscriptionsRef.current[conv.id]) {
                const sub = stompClientRef.current.subscribe(
                    `/topic/conversation/${conv.id}`,
                    (frame) => {
                        const newMsg = JSON.parse(frame.body);
                        const currentSelectedConv = selectedConvRef.current;
                        
                        // Nếu là tin nhắn của cuộc hội thoại đang mở
                        if (currentSelectedConv && currentSelectedConv.id === conv.id) {
                            setMessages(prev => {
                                if (prev.some(m => m.id === newMsg.id)) return prev;
                                return [...prev, newMsg];
                            });
                            markReadAsCustomer(conv.id).catch(err => console.error(err));
                        }

                        // Cập nhật lastMessage và unread count cho danh sách
                        setConversations(prev =>
                            prev.map(c => {
                                if (c.id === conv.id) {
                                    const isCurrent = currentSelectedConv && currentSelectedConv.id === conv.id;
                                    const isMe = newMsg.senderId === userId && newMsg.senderRole === 'customer';
                                    const shouldIncUnread = !isCurrent && !isMe;
                                    return {
                                        ...c,
                                        lastMessage: newMsg.content,
                                        lastMessageAt: newMsg.createdAt,
                                        unreadCountCustomer: shouldIncUnread 
                                            ? (c.unreadCountCustomer || 0) + 1 
                                            : (isCurrent ? 0 : (c.unreadCountCustomer || 0))
                                    };
                                }
                                return c;
                            })
                        );
                    }
                );
                subscriptionsRef.current[conv.id] = sub;
            }
        });

        return () => {
            // Clean up subscriptions khi dependencies thay đổi hoặc unmount
        };
    }, [conversations, connected, userId]);

    // Clean up all subscriptions on unmount
    useEffect(() => {
        return () => {
            Object.keys(subscriptionsRef.current).forEach(id => {
                if (subscriptionsRef.current[id]) {
                    subscriptionsRef.current[id].unsubscribe();
                }
            });
            subscriptionsRef.current = {};
        };
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectConversation = async (conv) => {
        setSelectedConv(conv);
        setMessages([]);
        try {
            const res = await getConversationMessages(conv.id);
            if (res.status === 200) setMessages(res.data || []);
            // Đánh dấu đã đọc
            await markReadAsCustomer(conv.id);
            setConversations(prev =>
                prev.map(c => c.id === conv.id ? { ...c, unreadCountCustomer: 0 } : c)
            );
        } catch (err) {
            console.error('Lỗi tải messages:', err);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !selectedConv || sending) return;
        setSending(true);

        const request = {
            conversationId: selectedConv.id,
            senderId: userId,
            senderRole: 'customer',
            content: inputText.trim(),
        };

        try {
            if (connected && stompClientRef.current?.connected) {
                stompClientRef.current.publish({
                    destination: '/app/chat.send',
                    body: JSON.stringify(request),
                });
            } else {
                // Fallback REST
                const res = await fetch('http://localhost:8889/api/conversations/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request),
                });
                const data = await res.json();
                if (data.status === 200) {
                    setMessages(prev => [...prev, data.data]);
                }
            }
            setInputText('');
        } catch (err) {
            console.error('Lỗi gửi tin:', err);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dt) => {
        if (!dt) return '';
        const d = new Date(dt);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dt) => {
        if (!dt) return '';
        const d = new Date(dt);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Hôm nay';
        return d.toLocaleDateString('vi-VN');
    };

    if (!userId) {
        return (
            <div>
                <div className="mm-auth-warning">
                    <div className="mm-auth-icon">🔒</div>
                    <h2>Vui lòng đăng nhập để xem tin nhắn</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="mm-page">
            <div className="mm-container">
                {/* Sidebar danh sách conversations */}
                <aside className="mm-sidebar">
                    <div className="mm-sidebar-header">
                        <h2> Tin nhắn</h2>
                        <span className={`mm-status-dot ${connected ? 'mm-online' : 'mm-offline'}`}
                            title={connected ? 'Đang kết nối' : 'Mất kết nối'} />
                    </div>

                    {loading ? (
                        <div className="mm-loading">Đang tải...</div>
                    ) : conversations.length === 0 ? (
                        <div className="mm-empty-conv">
                            <span></span>
                            <p>Chưa có cuộc hội thoại nào.<br />Hãy liên hệ khách sạn để bắt đầu.</p>
                        </div>
                    ) : (
                        <ul className="mm-conv-list">
                            {conversations.map(conv => (
                                <li
                                    key={conv.id}
                                    className={`mm-conv-item ${selectedConv?.id === conv.id ? 'mm-conv-active' : ''}`}
                                    onClick={() => selectConversation(conv)}
                                >
                                    <div className="mm-conv-avatar">
                                        {conv.hotelName?.charAt(0).toUpperCase() || 'H'}
                                    </div>
                                    <div className="mm-conv-info">
                                        <div className="mm-conv-name">{conv.hotelName}</div>
                                        <div className="mm-conv-last">
                                            {conv.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                                        </div>
                                    </div>
                                    <div className="mm-conv-meta">
                                        <div className="mm-conv-time">
                                            {conv.lastMessageAt ? formatDate(conv.lastMessageAt) : ''}
                                        </div>
                                        {conv.unreadCountCustomer > 0 && (
                                            <span className="mm-unread-badge">{conv.unreadCountCustomer}</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* Khung chat */}
                <main className="mm-chat-area">
                    {!selectedConv ? (
                        <div className="mm-no-conv">
                            <div className="mm-no-conv-icon"></div>
                            <h3>Chọn cuộc hội thoại để bắt đầu nhắn tin</h3>
                            <p>Bạn có thể liên hệ khách sạn từ trang chi tiết khách sạn.</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="mm-chat-header">
                                <div className="mm-chat-avatar">
                                    {selectedConv.hotelName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="mm-chat-hotel-name">{selectedConv.hotelName}</div>
                                    <div className="mm-chat-status">
                                        {connected ? '🟢 Đang hoạt động' : '🔴 Ngoại tuyến'}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="mm-messages">
                                {messages.length === 0 ? (
                                    <div className="mm-messages-empty">
                                        <span></span>
                                        <p>Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId === userId && msg.senderRole === 'customer';
                                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                        const showDate = !prevMsg || formatDate(prevMsg.createdAt) !== formatDate(msg.createdAt);
                                        return (
                                            <React.Fragment key={msg.id || idx}>
                                                {showDate && (
                                                    <div className="mm-date-divider">
                                                        <span>{formatDate(msg.createdAt)}</span>
                                                    </div>
                                                )}
                                                <div className={`mm-msg-row ${isMe ? 'mm-msg-mine' : 'mm-msg-theirs'}`}>
                                                    {!isMe && (
                                                        <div className="mm-msg-avatar-sm">
                                                            {selectedConv.hotelName?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="mm-msg-bubble-wrap">
                                                        <div className={`mm-bubble ${isMe ? 'mm-bubble-me' : 'mm-bubble-them'}`}>
                                                            {msg.content}
                                                        </div>
                                                        <div className="mm-msg-time">{formatTime(msg.createdAt)}</div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="mm-input-area">
                                <textarea
                                    className="mm-input"
                                    placeholder="Nhập tin nhắn..."
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                />
                                <button
                                    className={`mm-send-btn ${sending ? 'mm-sending' : ''}`}
                                    onClick={handleSend}
                                    disabled={sending || !inputText.trim()}
                                >
                                    {sending ? (
                                        <span className="mm-spinner" />
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
