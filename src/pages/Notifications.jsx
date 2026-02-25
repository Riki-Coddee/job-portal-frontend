// pages/Notifications.jsx - UPDATED WITH API INSTANCE
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Check, Trash2, Clock, Briefcase, MessageSquare, 
  AlertCircle, Filter, CheckCircle, XCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api'; // Import your api instance

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selected, setSelected] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0
  });

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let url = '/api/notifications/notifications/';
      if (filter === 'unread') {
        url += '?read=false';
      } else if (filter === 'read') {
        url += '?read=true';
      }
      
      const response = await api.get(url);
      setNotifications(response.data.results || response.data);
      
      // Calculate stats
      const unread = (response.data.results || response.data).filter(n => !n.is_read).length;
      const today = new Date().toISOString().split('T')[0];
      const todayCount = (response.data.results || response.data).filter(n => 
        n.created_at.split('T')[0] === today
      ).length;
      
      setStats({
        total: (response.data.results || response.data).length,
        unread,
        today: todayCount
      });
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.post('/api/notifications/notifications/mark_as_read/', {
        notification_ids: [id]
      });
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
      
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notifications/notifications/${id}/`);
      
      const notificationToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        unread: notificationToDelete && !notificationToDelete.is_read 
          ? Math.max(0, prev.unread - 1) 
          : prev.unread
      }));
      
      // Remove from selected if it was selected
      setSelected(prev => prev.filter(item => item !== id));
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleBulkAction = async (action) => {
    if (selected.length === 0) {
      toast.warning('Please select notifications first');
      return;
    }

    try {
      if (action === 'read') {
        await api.post('/api/notifications/notifications/mark_as_read/', {
          notification_ids: selected
        });
        
        setNotifications(prev => prev.map(n => 
          selected.includes(n.id) ? { ...n, is_read: true } : n
        ));
        
        // Update stats
        const newlyReadCount = notifications
          .filter(n => selected.includes(n.id) && !n.is_read)
          .length;
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - newlyReadCount)
        }));
        
        setSelected([]);
        toast.success(`Marked ${newlyReadCount} notifications as read`);
      } else if (action === 'delete') {
        // Use bulk delete if available, otherwise delete individually
        try {
          // Try bulk delete endpoint first
          await api.post('/api/notifications/notifications/delete_bulk/', {
            notification_ids: selected
          });
        } catch {
          // If bulk endpoint doesn't exist, delete individually
          for (const id of selected) {
            await api.delete(`/api/notifications/notifications/${id}/`);
          }
        }
        
        // Calculate how many unread were deleted
        const deletedUnreadCount = notifications
          .filter(n => selected.includes(n.id) && !n.is_read)
          .length;
        
        setNotifications(prev => prev.filter(n => !selected.includes(n.id)));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total - selected.length,
          unread: Math.max(0, prev.unread - deletedUnreadCount)
        }));
        
        setSelected([]);
        toast.success(`Deleted ${selected.length} notifications`);
      }
    } catch (error) {
      console.error(`Error in ${action} action:`, error);
      toast.error(`Failed to ${action} notifications`);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'application_update': <Briefcase className="w-5 h-5 text-blue-500" />,
      'application_status_change': <Briefcase className="w-5 h-5 text-blue-500" />,
      'interview_scheduled': <Clock className="w-5 h-5 text-green-500" />,
      'interview_reminder': <Clock className="w-5 h-5 text-green-500" />,
      'new_message': <MessageSquare className="w-5 h-5 text-purple-500" />,
      'recruiter_message': <MessageSquare className="w-5 h-5 text-purple-500" />,
      'offer_extended': <AlertCircle className="w-5 h-5 text-yellow-500" />,
    };
    return icons[type] || <Bell className="w-5 h-5 text-gray-500" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSelect = (id) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === notifications.length) {
      setSelected([]);
    } else {
      setSelected(notifications.map(n => n.id));
    }
  };

  // Click notification to mark as read (for unread notifications only)
  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
  };

  // Helper function to count selected unread notifications
  const countSelectedUnread = () => {
    return notifications.filter(n => selected.includes(n.id) && !n.is_read).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with Stats */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-2">
                  Stay updated with your job applications, interviews, and messages
                </p>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Bell className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Unread</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">{stats.unread}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Today</p>
                      <p className="text-2xl font-bold text-green-600">{stats.today}</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      filter === 'all'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      filter === 'unread'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => setFilter('read')}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      filter === 'read'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    Read
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {selected.length > 0 && (
                  <>
                    {/* Only show "Mark as read" button if selected notifications include unread ones */}
                    {countSelectedUnread() > 0 && (
                      <button
                        onClick={() => handleBulkAction('read')}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm transition-colors border border-green-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as read ({countSelectedUnread()})</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition-colors border border-red-200"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Delete ({selected.length})</span>
                    </button>
                  </>
                )}
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors border border-gray-200"
                >
                  {selected.length === notifications.length && notifications.length > 0 
                    ? 'Deselect all' 
                    : 'Select all'
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-16 text-center">
                <Bell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? "You don't have any notifications yet."
                    : `No ${filter} notifications found.`
                  }
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  View all notifications
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50 hover:bg-blue-100' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      {/* Checkbox for bulk selection */}
                      <div 
                        className="mr-4 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(notification.id)}
                          onChange={() => toggleSelect(notification.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Notification Icon */}
                      <div className="mr-4 mt-1">
                        {getNotificationIcon(notification.notification_type)}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className={`font-medium ${
                                !notification.is_read 
                                  ? 'text-gray-900 font-semibold' 
                                  : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h3>
                              {!notification.is_read && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mt-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.created_at)}
                              </span>
                              {notification.action_url && (
                                <a
                                  href={notification.action_url}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View details →
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons - Only show "Mark as read" for unread notifications */}
                          <div 
                            className="flex items-center space-x-2 ml-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Only show mark as read button if notification is unread */}
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Unread indicator - Only show for unread notifications */}
                    {!notification.is_read && (
                      <div className="flex items-center mt-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-blue-600">Click anywhere to mark as read</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Stats and Actions */}
          {!loading && notifications.length > 0 && (
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                <p>
                  Showing {notifications.length} of {stats.total} notifications • 
                  <span className="mx-2">•</span>
                  <span className="text-blue-600 font-medium">
                    {stats.unread} unread
                  </span>
                  <span className="mx-2">•</span>
                  <span className="text-green-600">
                    {stats.today} today
                  </span>
                </p>
              </div>
              
              <div className="flex space-x-3">
                {/* Only show "Mark all as read" button if there are unread notifications */}
                {stats.unread > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        await api.post('/api/notifications/notifications/mark_as_read/', {
                          mark_all: true
                        });
                        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                        setStats(prev => ({ ...prev, unread: 0 }));
                        toast.success('All notifications marked as read');
                      } catch (error) {
                        toast.error('Failed to mark all as read');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Mark all as read
                  </button>
                )}
                
                {/* Only show "Clear all read" button if there are read notifications */}
                {notifications.some(n => n.is_read) && (
                  <button
                    onClick={async () => {
                      try {
                        await api.delete('/api/notifications/notifications/clear_all/');
                        setNotifications(prev => prev.filter(n => !n.is_read));
                        setStats(prev => ({
                          ...prev,
                          total: prev.unread // Only unread remain
                        }));
                        toast.success('Cleared all read notifications');
                      } catch (error) {
                        toast.error('Failed to clear read notifications');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Clear all read
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;