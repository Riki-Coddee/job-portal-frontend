// services/chatService.js
import api from "../api";

class ChatService {
  // Conversations
  static async getConversations(params = {}) {
    const response = await api.get('/api/chat/conversations/', { params });
    return response.data;
  }

  static async getArchivedConversations() {
    const response = await api.get('/api/chat/conversations/archived/');
    return response.data;
  }

  static async getConversation(id) {
    const response = await api.get(`/api/chat/conversations/${id}/`);
    return response.data;
  }

  // Messages
  static async sendMessage(conversationId, formData) {
    const response = await api.post(
      `/api/chat/conversations/${conversationId}/messages/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  static async getMessages(conversationId) {
    const response = await api.get(`/api/chat/conversations/${conversationId}/messages/`);
    return response.data;
  }

  // Conversation actions
  static async archiveConversation(conversationId) {
    const response = await api.post(`/api/chat/conversations/${conversationId}/archive/`);
    return response.data;
  }

  static async restoreConversation(conversationId) {
    const response = await api.post(`/api/chat/conversations/${conversationId}/restore/`);
    return response.data;
  }

  static async markMessagesAsRead(conversationId) {
    const response = await api.post(`/api/chat/conversations/${conversationId}/mark_read/`);
    return response.data;
  }

  static async getUnreadCount() {
    const response = await api.get('/api/chat/conversations/unread-count/');
    return response.data;
  }

  // Online status
  static async getUserOnlineStatus(userId) {
    const response = await api.get(`/api/chat/users/${userId}/online-status/`);
    return response.data;
  }

  static async getUsersOnlineStatus(userIds) {
    const response = await api.post('/api/chat/users/online-status/batch/', {
      user_ids: userIds
    });
    return response.data;
  }

  // Typing indicator
  static async sendTypingIndicator(conversationId, isTyping) {
    const response = await api.post(`/api/chat/conversations/${conversationId}/typing/`, {
      is_typing: isTyping
    });
    return response.data;
  }
}

export default ChatService;