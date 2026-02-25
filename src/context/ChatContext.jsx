// src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import ChatService from '../services/chatService';
import WebSocketService from '../services/websocketService';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [archivedConversations, setArchivedConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentConversationRef = useRef(null);
  const messagesRef = useRef([]);
  const conversationsRef = useRef([]);

  // Keep refs updated
  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ChatService.getConversations({ archived: false });
      const conversationsData = data.results || data;
      setConversations(conversationsData);
      setUnreadCount(conversationsData.reduce((sum, conv) => sum + (conv.unread_count || 0), 0));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadArchivedConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ChatService.getArchivedConversations();
      const conversationsData = data.results || data;
      setArchivedConversations(conversationsData);
      return conversationsData;
    } catch (error) {
      console.error('Failed to load archived conversations:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConversation = useCallback(async (conversationId) => {
    setLoading(true);
    try {
      const data = await ChatService.getConversation(conversationId);
      setCurrentConversation(data);
      setMessages(data.messages || []);
      
      // Mark messages as read when loading conversation
      if (data.messages && data.messages.length > 0) {
        // Send read receipts for unread messages
        data.messages.forEach((message) => {
          if (!message.is_own_message && !message.read_at) {
            WebSocketService.sendReadReceipt(message.id);
          }
        });
      }
      
      // Connect WebSocket for this conversation
      WebSocketService.connect(conversationId);
      return data;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content, attachments = []) => {
    const currentConv = currentConversationRef.current;
    if (!currentConv?.id) {
      console.error('No active conversation to send message');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (attachments.length > 0) {
        attachments.forEach(file => formData.append('attachments', file));
      }
      
      const data = await ChatService.sendMessage(currentConv.id, formData);
      const newMessage = { 
        ...data, 
        status: 'sent', 
        sender: user,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation list with last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConv.id 
            ? { 
                ...conv, 
                last_message_at: new Date().toISOString(),
                last_message: { content: content.substring(0, 100), sender_id: user.id }
              }
            : conv
        )
      );
      
      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [user]);

  const sendTyping = useCallback((isTyping) => {
    const currentConv = currentConversationRef.current;
    if (!currentConv?.id) {
      console.warn('No active conversation for typing indicator');
      return;
    }
    
    console.log('Sending typing indicator:', isTyping, 'for conversation:', currentConv.id);
    WebSocketService.sendTyping(isTyping);
  }, []);

  const archiveConversation = useCallback(async (conversationId) => {
    try {
      const response = await ChatService.archiveConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (response.conversation) {
        setArchivedConversations(prev => [response.conversation, ...prev]);
      }
      
      if (currentConversationRef.current?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, is_archived: true } : null);
        setMessages([]);
      }
      
      return response.conversation;
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      throw error;
    }
  }, []);

  const restoreConversation = useCallback(async (conversationId) => {
    try {
      const response = await ChatService.restoreConversation(conversationId);
      
      // Remove from archived
      setArchivedConversations(prev => 
        prev.filter(conv => conv.id !== conversationId)
      );
      
      // Find the restored conversation
      const restoredConv = response.conversation || { id: conversationId, is_archived: false };
      
      // Add to active conversations
      setConversations(prev => {
        // Remove if already exists
        const filtered = prev.filter(c => c.id !== conversationId);
        // Add to beginning
        return [restoredConv, ...filtered];
      });
      
      // Update current conversation if it's the one being restored
      if (currentConversationRef.current?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, is_archived: false } : null);
      }
      
      return restoredConv;
    } catch (error) {
      console.error('Failed to restore conversation:', error);
      throw error;
    }
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      const response = await ChatService.markMessagesAsRead(conversationId);
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.sender?.id !== user?.id && msg.status !== 'read') {
            return {
              ...msg,
              status: 'read',
              read_at: new Date().toISOString()
            };
          }
          return msg;
        })
      );
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 } 
            : conv
        )
      );
      
      // Update global unread count
      const currentConv = conversationsRef.current.find(c => c.id === conversationId);
      if (currentConv) {
        setUnreadCount(prev => Math.max(0, prev - (currentConv.unread_count || 0)));
      }
      
      return response;
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      throw error;
    }
  }, [user]);

  // Setup WebSocket event handlers
  useEffect(() => {
    if (!user) return;
    
    // Setup WebSocket event handlers
    WebSocketService.on('connected', () => {
      console.log('WebSocket connected event received');
    });
    
    WebSocketService.on('new_message', (message) => {
      console.log('New message via WebSocket:', message);
      
      const currentConv = currentConversationRef.current;
      
      // Only add message if it's for the current conversation and has a sender
      if (currentConv?.id === message.conversation && message.sender) {
        setMessages(prev => [...prev, message]);
        
        // IMPORTANT: Don't mark own messages as unread
        if (message.sender?.id === user.id) {
          // This is our own message, update status
          setTimeout(() => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === message.id ? { ...msg, status: 'delivered' } : msg
              )
            );
          }, 1000);
        }
      }
      
      // Update conversation list with last message - FIXED
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === message.conversation) {
            // Check if message is from current user
            const isOwnMessage = message.sender?.id === user.id;
            const currentUnread = conv.unread_count || 0;
            
            return {
              ...conv,
              last_message_at: message.created_at,
              last_message: { 
                content: message.content?.substring(0, 100) || '', 
                sender_id: message.sender?.id 
              },
              // Only increment unread if message is NOT from current user
              unread_count: isOwnMessage 
                ? currentUnread  // Keep same if own message
                : currentUnread + 1
            };
          }
          return conv;
        })
      );
      
      // Update global unread count - FIXED
      if (message.sender?.id !== user.id) {
        setUnreadCount(prev => prev + 1);
      }
    });
    
    WebSocketService.on('typing', (data) => {
      console.log('Typing event received:', data);
      
      // IMPORTANT: Check if typing is for current conversation
      const currentConv = currentConversationRef.current;
      
      // Make sure we have the right conversation ID
      if (currentConv && data.conversation_id === currentConv.id) {
        if (data.is_typing) {
          setTypingUsers(prev => {
            // Add user if not already in list
            if (!prev.includes(data.user_id)) {
              return [...prev, data.user_id];
            }
            return prev;
          });
          
          // Clear typing after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== data.user_id));
          }, 3000);
        } else {
          // Remove user from typing list
          setTypingUsers(prev => prev.filter(id => id !== data.user_id));
        }
      }
    });
    
    WebSocketService.on('message_read', (data) => {
      console.log('Message read receipt received:', data);
      
      // Update message status to read
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.message_id && msg.sender?.id === user.id 
            ? { ...msg, status: 'read', read_at: data.timestamp } 
            : msg
        )
      );
    });
    
    return () => {
      WebSocketService.off('connected');
      WebSocketService.off('new_message');
      WebSocketService.off('typing');
      WebSocketService.off('message_read');
    };
  }, [user]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  const getOtherParticipantInfo = useCallback((conversation) => {
    if (!conversation) return null;
    
    // If other_participant is already provided, use it
    if (conversation.other_participant) {
      return conversation.other_participant;
    }
    
    // Otherwise, determine based on user type
    if (!user) return { name: 'Unknown' };
    
    try {
      if (user.user_type === 'job_seeker' && conversation.recruiter) {
        const recruiterUser = conversation.recruiter.user || {};
        return {
          id: conversation.recruiter.id,
          user_id: recruiterUser.id,
          name: `${recruiterUser.first_name || ''} ${recruiterUser.last_name || ''}`.trim() || 'Recruiter',
          email: recruiterUser.email,
          company: conversation.recruiter.company?.name,
          type: 'recruiter'
        };
      } else if (user.user_type === 'recruiter' && conversation.job_seeker) {
        const jobSeekerUser = conversation.job_seeker.user || {};
        return {
          id: conversation.job_seeker.id,
          user_id: jobSeekerUser.id,
          name: `${jobSeekerUser.first_name || ''} ${jobSeekerUser.last_name || ''}`.trim() || 'Job Seeker',
          email: jobSeekerUser.email,
          title: conversation.job_seeker.title,
          type: 'job_seeker'
        };
      }
    } catch (error) {
      console.error('Error getting other participant info:', error);
    }
    
    return { name: 'Unknown' };
  }, [user]);

  const value = {
    conversations,
    archivedConversations,
    currentConversation,
    messages,
    loading,
    typingUsers,
    unreadCount,
    loadConversations,
    loadArchivedConversations,
    loadConversation,
    sendMessage,
    sendTyping,
    archiveConversation,
    restoreConversation,
    setCurrentConversation,
    getOtherParticipantInfo,
    setMessages,
    setConversations,
    setTypingUsers,
    setUnreadCount,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};