import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    getHotelConversations,
    getConversationMessages,
    markReadAsOwner,
} from '../../../api/chatApi';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './PartnerMessages.css';

const WEBSOCKET_URL = 'http://localhost:8889/ws';

export default function PartnerMessages() {
    const [hotels, setHotels] = useState([]);
    const [selectedHotelId, setSelectedHotelId] = useState(null);
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

    const partnerUserId = Number(sessionStorage.getItem('partner_userId'));

    // Load danh sách hotel của partner
    useEffect(() => {
        if (!partnerUserId) return;
        const urlActive = `http://localhost:8889/api/hotel/gethotelactivebyuserid/${partnerUserId}`;
        const urlWait = `http://localhost:8889/api/hotel/gethotelwaitbyuserid/${partnerUserId}`;

        Promise.all([fetch(urlActive), fetch(urlWait)])
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(results => {
                let list = [];
                if (results[0].status === 200 && results[0].data) {
                    list = list.concat(results[0].data);
                }
                if (results[1].status === 200 && results[1].data) {
                    list = list.concat(results[1].data);
                }
                setHotels(list);
                if (list.length > 0) setSelectedHotelId(list[0].id);
            })
            .catch(err => console.error('Lỗi tải hotels:', err))
            .finally(() => setLoading(false));
    }, [partnerUserId]);

    // Load conversations khi chọn hotel
    useEffect(() => {
        if (!selectedHotelId) return;
        setConversations([]);
        setSelectedConv(null);
        setMessages([]);
        getHotelConversations(selectedHotelId)
            .then(res => {
                if (res.status === 200) setConversations(res.data || []);
            })
            .catch(err => console.error('Lỗi tải conversations:', err));
    }, [selectedHotelId]);

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
        return () => client.deactivate();
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
                            markReadAsOwner(conv.id).catch(err => console.error(err));
                        }

                        // Cập nhật lastMessage và unread count cho danh sách
                        setConversations(prev =>
                            prev.map(c => {
                                if (c.id === conv.id) {
                                    const isCurrent = currentSelectedConv && currentSelectedConv.id === conv.id;
                                    const isMe = newMsg.senderRole === 'hotel_owner';
                                    const shouldIncUnread = !isCurrent && !isMe;
                                    return {
                                        ...c,
                                        lastMessage: newMsg.content,
                                        lastMessageAt: newMsg.createdAt,
                                        unreadCountOwner: shouldIncUnread 
                                            ? (c.unreadCountOwner || 0) + 1 
                                            : (isCurrent ? 0 : (c.unreadCountOwner || 0))
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
    }, [conversations, connected]);

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

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectConversation = async (conv) => {
        setSelectedConv(conv);
        setMessages([]);
        try {
            const res = await getConversationMessages(conv.id);
            if (res.status === 200) setMessages(res.data || []);
            await markReadAsOwner(conv.id);
            setConversations(prev =>
                prev.map(c => c.id === conv.id ? { ...c, unreadCountOwner: 0 } : c)
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
            senderId: partnerUserId,
            senderRole: 'hotel_owner',
            content: inputText.trim(),
        };

        try {
            if (connected && stompClientRef.current?.connected) {
                stompClientRef.current.publish({
                    destination: '/app/chat.send',
                    body: JSON.stringify(request),
                });
            } else {
                const res = await fetch('http://localhost:8889/api/conversations/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request),
                });
                const data = await res.json();
                if (data.status === 200) setMessages(prev => [...prev, data.data]);
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
        return new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dt) => {
        if (!dt) return '';
        const d = new Date(dt);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Hôm nay';
        return d.toLocaleDateString('vi-VN');
    };

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCountOwner || 0), 0);

    return (
        <div className="pm-wrap">
            {/* Header */}
            <div className="pm-header">
                <div className="pm-header-left">
                    <h1> Tin nhắn khách hàng</h1>
                    {totalUnread > 0 && (
                        <span className="pm-total-unread">{totalUnread} chưa đọc</span>
                    )}
                </div>
                <div className="pm-header-right">
                    <span className={`pm-status ${connected ? 'pm-online' : 'pm-offline'}`}>
                        {connected ? '🟢 Đang kết nối' : '🔴 Mất kết nối'}
                    </span>
                </div>
            </div>

            <div className="pm-body">
                {/* Sidebar: chọn hotel + danh sách conversations */}
                <aside className="pm-sidebar">
                    {/* Chọn Hotel */}
                    {hotels.length > 1 && (
                        <div className="pm-hotel-select">
                            <label> Chọn khách sạn</label>
                            <select
                                value={selectedHotelId || ''}
                                onChange={e => setSelectedHotelId(Number(e.target.value))}
                            >
                                {hotels.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Conversation List */}
                    <div className="pm-conv-header">
                        <span>Cuộc hội thoại ({conversations.length})</span>
                    </div>

                    {loading ? (
                        <div className="pm-loading">⏳ Đang tải...</div>
                    ) : conversations.length === 0 ? (
                        <div className="pm-empty">
                            <div></div>
                            <p>Chưa có tin nhắn từ khách hàng.</p>
                        </div>
                    ) : (
                        <ul className="pm-conv-list">
                            {conversations.map(conv => (
                                <li
                                    key={conv.id}
                                    className={`pm-conv-item ${selectedConv?.id === conv.id ? 'pm-conv-active' : ''}`}
                                    onClick={() => selectConversation(conv)}
                                >
                                    <div className="pm-conv-avatar">
                                        {conv.userName?.charAt(0).toUpperCase() || 'K'}
                                    </div>
                                    <div className="pm-conv-info">
                                        <div className="pm-conv-name">{conv.userName || 'Khách hàng'}</div>
                                        <div className="pm-conv-last">
                                            {conv.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                                        </div>
                                    </div>
                                    <div className="pm-conv-meta">
                                        <div className="pm-conv-time">
                                            {conv.lastMessageAt ? formatDate(conv.lastMessageAt) : ''}
                                        </div>
                                        {conv.unreadCountOwner > 0 && (
                                            <span className="pm-unread">{conv.unreadCountOwner}</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* Chat Area */}
                <main className="pm-chat">
                    {!selectedConv ? (
                        <div className="pm-no-conv">
                            <div className="pm-no-conv-icon"></div>
                            <h3>Chọn cuộc hội thoại để trả lời</h3>
                            <p>Khách hàng sẽ liên hệ bạn từ trang chi tiết khách sạn.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="pm-chat-header">
                                <div className="pm-chat-avatar">
                                    {selectedConv.userName?.charAt(0).toUpperCase() || 'K'}
                                </div>
                                <div>
                                    <div className="pm-chat-name">{selectedConv.userName || 'Khách hàng'}</div>
                                    <div className="pm-chat-sub">Khách hàng · {selectedConv.hotelName}</div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="pm-messages">
                                {messages.length === 0 ? (
                                    <div className="pm-msg-empty">
                                        <span></span>
                                        <p>Chưa có tin nhắn. Hãy trả lời khách hàng!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderRole === 'hotel_owner';
                                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                        const showDate = !prevMsg || formatDate(prevMsg.createdAt) !== formatDate(msg.createdAt);
                                        return (
                                            <React.Fragment key={msg.id || idx}>
                                                {showDate && (
                                                    <div className="pm-date-divider">
                                                        <span>{formatDate(msg.createdAt)}</span>
                                                    </div>
                                                )}
                                                <div className={`pm-msg-row ${isMe ? 'pm-msg-mine' : 'pm-msg-theirs'}`}>
                                                    {!isMe && (
                                                        <div className="pm-msg-avatar-sm">
                                                            {selectedConv.userName?.charAt(0) || 'K'}
                                                        </div>
                                                    )}
                                                    <div className="pm-bubble-wrap">
                                                        <div className={`pm-bubble ${isMe ? 'pm-bubble-me' : 'pm-bubble-them'}`}>
                                                            {msg.content}
                                                        </div>
                                                        <div className="pm-msg-time">{formatTime(msg.createdAt)}</div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="pm-input-area">
                                <textarea
                                    className="pm-input"
                                    placeholder="Nhập tin nhắn... (Enter để gửi)"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                />
                                <button
                                    className="pm-send-btn"
                                    onClick={handleSend}
                                    disabled={sending || !inputText.trim()}
                                >
                                    {sending ? (
                                        <span className="pm-spinner" />
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
