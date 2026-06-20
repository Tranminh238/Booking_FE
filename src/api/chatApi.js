const BASE_URL = 'http://localhost:8889/api/conversations';

/**
 * Tạo hoặc lấy conversation giữa user và hotel
 */
export const startConversation = async (userId, hotelId) => {
    const response = await fetch(`${BASE_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hotelId }),
    });
    return response.json();
};

/**
 * Lấy danh sách conversation của khách hàng
 */
export const getUserConversations = async (userId) => {
    const response = await fetch(`${BASE_URL}/user/${userId}`);
    return response.json();
};

/**
 * Lấy danh sách conversation theo hotelId (dành cho chủ KS)
 */
export const getHotelConversations = async (hotelId) => {
    const response = await fetch(`${BASE_URL}/hotel/${hotelId}`);
    return response.json();
};

/**
 * Lấy danh sách tin nhắn của 1 conversation
 */
export const getConversationMessages = async (conversationId) => {
    const response = await fetch(`${BASE_URL}/${conversationId}/messages`);
    return response.json();
};

/**
 * Gửi tin nhắn qua REST (fallback khi WebSocket không có)
 */
export const sendMessageRest = async (conversationId, senderId, senderRole, content) => {
    const response = await fetch(`${BASE_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, senderId, senderRole, content }),
    });
    return response.json();
};

/**
 * Đánh dấu đã đọc cho khách hàng
 */
export const markReadAsCustomer = async (conversationId) => {
    const response = await fetch(`${BASE_URL}/${conversationId}/read/customer`, {
        method: 'POST',
    });
    return response.json();
};

/**
 * Đánh dấu đã đọc cho chủ khách sạn
 */
export const markReadAsOwner = async (conversationId) => {
    const response = await fetch(`${BASE_URL}/${conversationId}/read/owner`, {
        method: 'POST',
    });
    return response.json();
};
