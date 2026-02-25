// src/pages/JobSeekerMessages.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Paperclip,
  Send,
  Check,
  CheckCheck,
  Circle,
  MessageSquare,
  User,
  Briefcase,
  Calendar,
  Archive,
  Building,
  FileText,
  X,
  MoreVertical,
  Eye,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import ChatAttachment from "../components/ChatAttachment";
import { useNavigate } from 'react-router-dom';
import ChatService from "../services/chatService";

const JobSeekerMessages = () => {
  const navigate = useNavigate();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    typingUsers,
    unreadCount,
    loadConversations,
    loadConversation,
    sendMessage,
    sendTyping,
    setCurrentConversation,
    archiveConversation,
    getOtherParticipantInfo,
    setMessages,
    setConversations,
    setTypingUsers,
    setUnreadCount,
    markAsRead
  } = useChat();

  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [lastSeenTimes, setLastSeenTimes] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Use refs to prevent infinite loops
  const onlineStatusIntervalRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper function to get avatar initials safely
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "RC";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (message.trim()) {
      sendTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
        setTimeout(() => {
          setTypingUsers([]);
        }, 3000);
      }, 1000);
    } else {
      sendTyping(false);
      setTimeout(() => setTypingUsers([]), 500);
    }

    return () => {
      clearTimeout(typingTimeoutRef.current);
      sendTyping(false);
    };
  }, [message, sendTyping, setTypingUsers]);

  // Memoize filtered conversations to prevent unnecessary re-renders
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      if (filter === "unread") return conversation.unread_count > 0;
      if (filter === "archived") return conversation.is_archived;
      return !conversation.is_archived;
    });
  }, [conversations, filter]);

  // Get unique user IDs from conversations
  const getUserIds = useCallback(() => {
    return filteredConversations
      .map(conv => conv.other_participant?.user_id)
      .filter(id => id);
  }, [filteredConversations]);

  // Batch fetch online status for all conversations
  const fetchOnlineStatuses = useCallback(async () => {
    const userIds = getUserIds();
    
    if (userIds.length === 0 || isFetchingRef.current) return;

    isFetchingRef.current = true;
    
    try {
      const response = await ChatService.getUsersOnlineStatus(userIds);
      
      // Update state with new data
      setOnlineUsers(prev => ({
        ...prev,
        ...Object.keys(response).reduce((acc, userId) => {
          acc[userId] = response[userId].is_online;
          return acc;
        }, {})
      }));
      
      setLastSeenTimes(prev => ({
        ...prev,
        ...Object.keys(response).reduce((acc, userId) => {
          acc[userId] = response[userId].last_activity;
          return acc;
        }, {})
      }));
      
    } catch (error) {
      console.error('Error fetching batch online statuses:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [getUserIds]);

  // Set up online status polling
  useEffect(() => {
    // Clear any existing interval
    if (onlineStatusIntervalRef.current) {
      clearInterval(onlineStatusIntervalRef.current);
    }

    // Initial fetch
    if (filteredConversations.length > 0) {
      fetchOnlineStatuses();
      
      // Set up interval for periodic refresh (every 30 seconds)
      onlineStatusIntervalRef.current = setInterval(fetchOnlineStatuses, 30000);
    }

    // Cleanup
    return () => {
      if (onlineStatusIntervalRef.current) {
        clearInterval(onlineStatusIntervalRef.current);
        onlineStatusIntervalRef.current = null;
      }
    };
  }, [filteredConversations.length, fetchOnlineStatuses]);

  // Check online status for current conversation participant
  useEffect(() => {
    const checkOnlineStatus = async () => {
      const userId = currentConversation?.other_participant?.user_id;
      if (!userId) return;

      try {
        const response = await ChatService.getUserOnlineStatus(userId);
        setOnlineUsers(prev => ({
          ...prev,
          [userId]: response.is_online
        }));
        if (response.last_activity) {
          setLastSeenTimes(prev => ({
            ...prev,
            [userId]: response.last_activity
          }));
        }
      } catch (error) {
        console.error('Error checking online status:', error);
      }
    };

    const userId = currentConversation?.other_participant?.user_id;
    if (userId) {
      checkOnlineStatus();
      const interval = setInterval(checkOnlineStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [currentConversation?.other_participant?.user_id]);

  // Format last seen time
  const formatLastSeen = useCallback((timestamp) => {
    if (!timestamp) return "Never";
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      
      if (diffDays < 30) {
        const diffWeeks = Math.floor(diffDays / 7);
        return `${diffWeeks}w ago`;
      }
      
      if (diffDays < 365) {
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths}mo ago`;
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return "Recently";
    }
  }, []);

  const handleSelectConversation = async (conversation) => {
    setTypingUsers([]);
    setCurrentConversation(conversation);
    
    try {
      await loadConversation(conversation.id);
      
      if (conversation.unread_count > 0 && markAsRead) {
        setTimeout(async () => {
          try {
            await markAsRead(conversation.id);
          } catch (error) {
            console.error("Failed to mark messages as read:", error);
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() || attachments.length > 0) {
      try {
        await sendMessage(message, attachments);
        setMessage("");
        setAttachments([]);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleArchiveConversation = async (conversationId, e) => {
    e?.stopPropagation?.();
    setDropdownOpen(false);
    try {
      await archiveConversation(conversationId);
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error("Failed to archive conversation:", error);
    }
  };

  const handleViewProfile = () => {
    setDropdownOpen(false);
    if (currentConversation?.other_participant?.id) {
      navigate(`/recruiter/${currentConversation.other_participant.id}`);
    }
  };

  // Get status icon for messages
  const getStatusIcon = useCallback((message) => {
    if (!message.sender || message.sender.id !== user?.id) return null;

    switch (message.status) {
      case "sent":
        return <Circle size={14} className="ml-1 opacity-50" />;
      case "delivered":
        return <Check size={14} className="ml-1" />;
      case "read":
        return <CheckCheck size={14} className="ml-1 text-green-500" />;
      default:
        return <Circle size={14} className="ml-1 opacity-30" />;
    }
  }, [user?.id]);

  // Format time
  const formatTime = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      return "";
    }
  }, []);

  // Format date for conversation list
  const formatConversationTime = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: "short" });
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    } catch (error) {
      return "";
    }
  }, []);

  // Get avatar color based on email
  const getAvatarColor = useCallback((email) => {
    const colors = [
      "bg-gradient-to-r from-blue-500 to-cyan-500",
      "bg-gradient-to-r from-purple-500 to-pink-500",
      "bg-gradient-to-r from-green-500 to-emerald-500",
      "bg-gradient-to-r from-orange-500 to-amber-500",
      "bg-gradient-to-r from-red-500 to-rose-500",
    ];
    if (!email) return colors[0];
    const hash = email
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, []);

  // Get job info from conversation
  const getJobInfo = useCallback((conversation) => {
    if (!conversation.job) return null;
    return {
      title: conversation.job.title,
      company: conversation.job.company?.name || conversation.recruiter?.company?.name,
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with job seeker welcome */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {user?.first_name || "Job Seeker"}!
              </h1>
              <p className="text-gray-600">
                Manage your conversations with recruiters and employers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Your Role</p>
                <p className="font-medium text-blue-600">Job Seeker</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Stats for job seeker */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Chats</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredConversations.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <MessageSquare className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {unreadCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Companies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      [
                        ...new Set(
                          conversations
                            .map((c) => c.recruiter?.company?.name)
                            .filter(Boolean)
                        ),
                      ].length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Applications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {conversations.filter((c) => c.application).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Conversation list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">
                  Recruiter Conversations
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Click to chat with recruiters
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setFilter("all")}
                  className={`flex-1 py-3 text-sm font-medium ${
                    filter === "all"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`flex-1 py-3 text-sm font-medium relative ${
                    filter === "unread"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Unread
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="search"
                    placeholder="Search recruiters or companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="overflow-y-auto max-h-[calc(100vh-450px)]">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading conversations...
                    </p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">
                      {filter === "unread"
                        ? "No unread messages from recruiters"
                        : "No conversations with recruiters yet"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Recruiters will message you when they're interested in
                      your profile
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherParticipant = conversation.other_participant;
                    const unread = conversation.unread_count || 0;
                    const isSelected = currentConversation?.id === conversation.id;
                    const jobInfo = getJobInfo(conversation);

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border-l-4 border-blue-600"
                            : ""
                        } ${unread > 0 ? "bg-blue-50/30" : ""}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <div
                              className={`h-12 w-12 rounded-full ${getAvatarColor(
                                otherParticipant?.email
                              )} flex items-center justify-center text-white font-bold`}
                            >
                              {getInitials(otherParticipant?.name)}
                            </div>
                            {unread > 0 && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Recruiter name and job title */}
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {otherParticipant?.name || "Recruiter"}
                                </h3>
                                {otherParticipant?.company && (
                                  <p className="text-xs text-gray-600 truncate flex items-center mt-1">
                                    <Building size={10} className="mr-1" />
                                    {otherParticipant.company}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                {jobInfo && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded whitespace-nowrap">
                                    {jobInfo.title?.substring(0, 15) || "Job"}
                                    {jobInfo.title?.length > 15 ? "..." : ""}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Last message and time */}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-sm text-gray-600 truncate flex-1">
                                {conversation.last_message?.content ||
                                  "Start conversation..."}
                                {conversation.last_message?.sender_id ===
                                  user?.id && (
                                  <span className="ml-2 inline-flex">
                                    {conversation.last_message?.status ===
                                    "read" ? (
                                      <CheckCheck
                                        size={12}
                                        className="text-green-500"
                                      />
                                    ) : conversation.last_message?.status ===
                                      "delivered" ? (
                                      <Check
                                        size={12}
                                        className="text-gray-400"
                                      />
                                    ) : (
                                      <Circle
                                        size={12}
                                        className="text-gray-300"
                                      />
                                    )}
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {conversation.last_message_at &&
                                    formatConversationTime(
                                      conversation.last_message_at
                                    )}
                                </span>
                                {unread > 0 && (
                                  <span className="h-5 min-w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center px-1">
                                    {unread}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right panel - Chat area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[calc(100vh-250px)] flex flex-col shadow-sm">
              {currentConversation ? (
                <>
                  {/* Chat Header - Shows recruiter info with three-dot menu */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`h-12 w-12 rounded-full ${getAvatarColor(
                            currentConversation.recruiter?.user?.email
                          )} flex items-center justify-center text-white font-bold`}
                        >
                          {getInitials(
                            currentConversation.other_participant?.name
                          )}
                        </div>
                        <div>
                          <h2 className="font-bold text-gray-900 flex items-center">
                            {currentConversation.other_participant?.name ||
                              "Recruiter"}
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Recruiter
                            </span>
                          </h2>
                          <div className="flex items-center space-x-3 mt-1">
                            {currentConversation.other_participant?.company && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Building size={12} className="mr-1" />
                                {currentConversation.other_participant.company}
                              </p>
                            )}
                            {currentConversation.job && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Briefcase size={12} className="mr-1" />
                                {currentConversation.job.title}
                              </p>
                            )}
                            
                            {/* Online status indicator */}
                            {currentConversation.other_participant?.user_id && (
                              <div className="flex items-center space-x-1">
                                {onlineUsers[currentConversation.other_participant.user_id] ? (
                                  <div className="flex items-center text-xs text-green-600">
                                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                    <span>Online</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock size={10} className="mr-1" />
                                    <span>
                                      Last seen {formatLastSeen(lastSeenTimes[currentConversation.other_participant.user_id])}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Typing indicator */}
                            {typingUsers.length > 0 && (
                              <p className="text-sm text-blue-600 italic animate-pulse">
                                <span className="flex items-center">
                                  <span className="h-2 w-2 bg-blue-600 rounded-full mr-1 animate-pulse"></span>
                                  typing...
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3" ref={dropdownRef}>
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={20} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={handleViewProfile}
                                  className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                >
                                  <Eye size={16} className="mr-3 text-gray-500" />
                                  View Profile
                                </button>
                                <button
                                  onClick={(e) => handleArchiveConversation(currentConversation.id, e)}
                                  className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                >
                                  <Archive size={16} className="mr-3 text-gray-500" />
                                  {currentConversation.is_archived ? "Unarchive Chat" : "Archive Chat"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-gray-50">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="text-center max-w-md">
                          <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mb-4">
                            <MessageSquare className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Start a conversation with{" "}
                            {currentConversation.other_participant?.name ||
                              "the recruiter"}
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Introduce yourself and ask about the job
                            opportunity. Be professional and concise.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="text-left p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-xs font-medium text-blue-800 mb-1">
                                Good questions to ask:
                              </p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li>
                                  • "Can you tell me more about the role?"
                                </li>
                                <li>
                                  • "What are the next steps in the process?"
                                </li>
                                <li>• "When can we schedule an interview?"</li>
                              </ul>
                            </div>
                            <div className="text-left p-3 bg-green-50 rounded-lg border border-green-100">
                              <p className="text-xs font-medium text-green-800 mb-1">
                                Tips for job seekers:
                              </p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Be professional and polite</li>
                                <li>• Respond within 24-48 hours</li>
                                <li>• Prepare your questions in advance</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Welcome message */}
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-500">
                            You're now chatting with{" "}
                            {currentConversation.other_participant?.name ||
                              "Recruiter"}
                            {currentConversation.other_participant?.company &&
                              ` from ${currentConversation.other_participant.company}`}
                          </p>
                        </div>

                        {messages.map((msg) => {
                          const isOwnMessage = msg.sender?.id === user?.id;
                          const isRead = msg.status === "read";

                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${
                                isOwnMessage ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-xl ${
                                  isOwnMessage
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-l-2xl rounded-tr-2xl shadow-sm"
                                    : "bg-white text-gray-900 rounded-r-2xl rounded-tl-2xl border border-gray-200 shadow-sm"
                                }`}
                              >
                                <div className="p-4">
                                  {/* Show sender name for recruiter messages */}
                                  {!isOwnMessage && msg.sender && (
                                    <div className="flex items-center mb-1">
                                      <div className="text-xs font-medium text-gray-700">
                                        {msg.sender.first_name}{" "}
                                        {msg.sender.last_name}
                                      </div>
                                      {currentConversation.other_participant
                                        ?.company && (
                                        <div className="ml-2 text-xs text-gray-500">
                                          •{" "}
                                          {
                                            currentConversation
                                              .other_participant.company
                                          }
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Message content */}
                                  {msg.content && (
                                    <p className="text-sm whitespace-pre-wrap break-words mb-3">
                                      {msg.content}
                                    </p>
                                  )}

                                  {/* Attachments */}
                                  {msg.attachments &&
                                    msg.attachments.length > 0 && (
                                      <div className="space-y-2 mb-3">
                                        {msg.attachments.map((attachment) => (
                                          <ChatAttachment
                                            key={attachment.id}
                                            attachment={attachment}
                                            isOwnMessage={isOwnMessage}
                                            onDownload={(att) => {
                                              // Handle download
                                              if (att.file_url) {
                                                window.open(
                                                  att.file_url,
                                                  "_blank"
                                                );
                                              }
                                            }}
                                          />
                                        ))}
                                      </div>
                                    )}

                                  <div
                                    className={`flex items-center justify-end mt-2 space-x-2 text-xs ${
                                      isOwnMessage
                                        ? "text-blue-200"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    <span>{formatTime(msg.created_at)}</span>
                                    {isOwnMessage && getStatusIcon(msg)}
                                    {/* Show "New" indicator for unread recruiter messages */}
                                    {!isOwnMessage && !isRead && (
                                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                        NEW
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input - Job seeker perspective */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">
                        You're messaging as{" "}
                        <span className="font-medium">
                          {user?.first_name} {user?.last_name}
                        </span>{" "}
                        • Job Seeker
                      </p>
                    </div>

                    {/* File preview section */}
                    {attachments.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-blue-800">
                            Attachments ({attachments.length})
                          </p>
                          <button
                            onClick={() => setAttachments([])}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="space-y-2">
                          {attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white p-2 rounded border"
                            >
                              <div className="flex items-center space-x-2">
                                <FileText size={16} className="text-gray-500" />
                                <div>
                                  <p className="text-sm text-gray-900 truncate max-w-xs">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  setAttachments((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  )
                                }
                                className="text-gray-500 hover:text-red-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        id="file-attachment"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          // Filter files by size (max 10MB each)
                          const validFiles = files.filter(
                            (file) => file.size <= 10 * 1024 * 1024
                          );
                          if (validFiles.length < files.length) {
                            alert(
                              "Some files exceed 10MB limit and were not added."
                            );
                          }
                          setAttachments((prev) => [...prev, ...validFiles]);
                          e.target.value = ""; // Reset input
                        }}
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                      />
                      <label
                        htmlFor="file-attachment"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        title="Attach files"
                      >
                        <Paperclip size={20} />
                      </label>

                      <div className="flex-1 relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={`Ask ${
                            currentConversation.other_participant?.name ||
                            "the recruiter"
                          } about the job opportunity...`}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          rows="1"
                        />
                      </div>

                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() && attachments.length === 0}
                        className={`p-3 rounded-full transition-all ${
                          message.trim() || attachments.length > 0
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Press Enter to send • Shift+Enter for new line
                      </p>
                      <p className="text-xs text-gray-500">
                        Max file size: 10MB • Supports: Images, PDF, Word, ZIP
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-center max-w-2xl">
                    <div className="inline-flex items-center justify-center h-24 w-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-6">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Welcome to Your Recruiter Conversations
                    </h2>
                    <p className="text-gray-600 mb-8">
                      This is your dedicated space to communicate with
                      recruiters and hiring managers. Select a conversation from
                      the left panel to view messages, discuss job
                      opportunities, and manage your application process.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <MessageSquare className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Direct Communication
                        </h3>
                        <p className="text-sm text-gray-600">
                          Chat directly with recruiters about specific job
                          opportunities
                        </p>
                      </div>

                      <div className="text-center p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Briefcase className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Job Applications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Track application progress and receive updates from
                          employers
                        </p>
                      </div>

                      <div className="text-center p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Interview Coordination
                        </h3>
                        <p className="text-sm text-gray-600">
                          Schedule and prepare for interviews with potential
                          employers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerMessages;