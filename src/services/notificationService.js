// services/notificationService.js
export const notificationService = {
  async getNotifications(limit = 10, unreadOnly = false) {
    let url = `/api/notifications/notifications/?limit=${limit}`;
    if (unreadOnly) {
      url += '&read=false';
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return await response.json();
  },

  async getUnreadCount() {
    const response = await fetch('/api/notifications/notifications/unread_count/');
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    return await response.json();
  },

  async markAsRead(notificationIds) {
    const response = await fetch('/api/notifications/notifications/mark_as_read/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification_ids: notificationIds
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }
    return await response.json();
  },

  async markAllAsRead() {
    const response = await fetch('/api/notifications/notifications/mark_as_read/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mark_all: true }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all as read');
    }
    return await response.json();
  },

  async deleteNotification(notificationId) {
    const response = await fetch(`/api/notifications/notifications/${notificationId}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
    return { success: true };
  },

  async clearAllRead() {
    const response = await fetch('/api/notifications/notifications/clear_all/', {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear notifications');
    }
    return { success: true };
  },
};