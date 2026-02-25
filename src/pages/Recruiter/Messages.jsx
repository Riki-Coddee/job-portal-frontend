// src/pages/Messages.jsx
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
  Mail,
  FileText,
  X,
  Users,
  Target,
  CheckCircle,
  Download,
  ArchiveRestore,
  FolderArchive,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import ChatAttachment from "../../components/ChatAttachment";
import ChatService from "../../services/chatService";
import { useRecruiter } from "../../context/RecruiterContext";

const Messages = () => {
  const {
    conversations,
    archivedConversations,
    currentConversation,
    messages,
    loading,
    typingUsers,
    unreadCount,
    loadConversations,
    loadConversation,
    loadArchivedConversations,
    sendMessage,
    sendTyping,
    setCurrentConversation,
    archiveConversation,
    restoreConversation,
    getOtherParticipantInfo,
    setMessages,
    setConversations,
    setTypingUsers,
    setUnreadCount,
    markAsRead,
  } = useChat();
  const { profile } = useRecruiter();

  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [lastSeenTimes, setLastSeenTimes] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Use refs to prevent infinite loops
  const onlineStatusIntervalRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Helper function to get avatar initials safely
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "JS";
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

  // Load archived conversations when showing archived tab
  useEffect(() => {
    if (showArchived) {
      loadArchivedConversationsList();
    }
  }, [showArchived]);

  // Auto-scroll to bottom of messages
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

  const loadArchivedConversationsList = async () => {
    setLoadingArchived(true);
    try {
      await loadArchivedConversations();
    } catch (error) {
      console.error("Error loading archived conversations:", error);
    } finally {
      setLoadingArchived(false);
    }
  };

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
    e?.stopPropagation();
    try {
      await archiveConversation(conversationId);
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
      
      if (showArchived) {
        await loadArchivedConversations();
      } else {
        await loadConversations();
      }
    } catch (error) {
      console.error("Failed to archive conversation:", error);
    }
  };

  const handleRestoreConversation = async (conversationId, e) => {
    e?.stopPropagation();
    try {
      await restoreConversation(conversationId);
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
      
      if (showArchived) {
        await loadArchivedConversations();
      } else {
        await loadConversations();
      }
    } catch (error) {
      console.error("Failed to restore conversation:", error);
    }
  };

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

  // Filter conversations
  const filterConversations = useCallback((conversationsList) => {
    return conversationsList.filter((conversation) => {
      if (searchQuery) {
        const otherParticipant = conversation.other_participant;
        const participantName = otherParticipant?.name || "";
        const participantEmail = otherParticipant?.email || "";
        const jobTitle = conversation.job?.title || "";
        
        const searchLower = searchQuery.toLowerCase();
        return (
          participantName.toLowerCase().includes(searchLower) ||
          participantEmail.toLowerCase().includes(searchLower) ||
          jobTitle.toLowerCase().includes(searchLower)
        );
      }
      
      if (!showArchived && filter === "unread") {
        return conversation.unread_count > 0;
      }
      return true;
    });
  }, [searchQuery, showArchived, filter]);

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

  // Memoize display conversations
  const displayConversations = useMemo(() => {
    const sourceConversations = showArchived ? archivedConversations : conversations;
    return filterConversations(sourceConversations);
  }, [conversations, archivedConversations, showArchived, filterConversations]);

  // Filter options for active conversations
  const filterOptions = useMemo(() => [
    { id: "all", label: "All Candidates", count: conversations.length },
    { id: "unread", label: "Unread", count: conversations.filter(c => c.unread_count > 0).length },
  ], [conversations]);

  // Get unique user IDs from conversations
  const getUserIds = useCallback(() => {
    return displayConversations
      .map(conv => conv.other_participant?.user_id)
      .filter(id => id);
  }, [displayConversations]);

  // Batch fetch online status for all conversations
  const fetchOnlineStatuses = useCallback(async () => {
    const userIds = getUserIds();
    
    if (userIds.length === 0 || isFetchingRef.current) return;

    isFetchingRef.current = true;
    
    try {
      const response = await ChatService.getUsersOnlineStatus(userIds);
      
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
    if (displayConversations.length > 0) {
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
  }, [displayConversations.length, fetchOnlineStatuses]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate mb-2">
                Welcome, {profile?.first_name || "Recruiter"}!
              </h1>
              <p className="text-gray-600 text-sm md:text-base truncate">
                Manage your conversations with candidates and applicants
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right min-w-0">
                <p className="text-sm text-gray-500 truncate">Your Role</p>
                <p className="font-medium text-purple-600 truncate">Recruiter</p>
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0">
                <img src={profile?.profile_picture} alt="" className="w-full h-full object-cover "/>
              </div>
            </div>
          </div>

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">Active Candidates</p>
                  <p className="text-xl font-bold text-gray-900 truncate">
                    {conversations.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">Unread Messages</p>
                  <p className="text-xl font-bold text-gray-900 truncate">
                    {unreadCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">Active Jobs</p>
                  <p className="text-xl font-bold text-gray-900 truncate">
                    {[...new Set(conversations.map(c => c.job?.title).filter(Boolean))].length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">Applications</p>
                  <p className="text-xl font-bold text-gray-900 truncate">
                    {conversations.filter(c => c.application).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                  <FolderArchive className="h-6 w-6 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">Archived</p>
                  <p className="text-xl font-bold text-gray-900 truncate">
                    {archivedConversations.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left Sidebar - Conversation List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-[calc(100vh-280px)] lg:h-[calc(100vh-320px)] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-900 text-lg truncate">
                    {showArchived ? "Archived" : "Candidates"}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setShowArchived(!showArchived);
                        setSearchQuery("");
                      }}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        showArchived
                          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      title={showArchived ? "Show Active" : "Show Archived"}
                    >
                      {showArchived ? (
                        <Users size={14} />
                      ) : (
                        <FolderArchive size={14} />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {showArchived 
                    ? "Archived candidate conversations" 
                    : "Active candidate conversations"
                  }
                </p>
              </div>

              {/* Filter Tags - Mobile */}
              {!showArchived && (
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setFilter(option.id)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors truncate ${
                        filter === option.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {option.label} {option.count > 0 && `(${option.count})`}
                    </button>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="search"
                    placeholder={showArchived 
                      ? "Search archived..." 
                      : "Search candidates or jobs..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {loading || (showArchived && loadingArchived) ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      {showArchived ? "Loading archived..." : "Loading candidates..."}
                    </p>
                  </div>
                ) : displayConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    {showArchived ? (
                      <FolderArchive className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    ) : (
                      <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    )}
                    <p className="text-sm text-gray-500 mb-1 truncate">
                      {searchQuery
                        ? "No matching conversations"
                        : showArchived
                        ? "No archived conversations"
                        : filter === "unread"
                        ? "No unread messages"
                        : "No conversations yet"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {displayConversations.map((conversation) => {
                      const otherParticipant = conversation.other_participant;
                      const unread = conversation.unread_count || 0;
                      const isSelected = currentConversation?.id === conversation.id;
                      const isArchived = conversation.is_archived || showArchived;
                      const candidateInfo = conversation.job_seeker;
                      const jobTitle = conversation.job?.title;

                      return (
                        <div
                          key={conversation.id}
                          onClick={() => handleSelectConversation(conversation)}
                          className={`p-3 hover:bg-gray-50 cursor-pointer transition-all group ${
                            isSelected
                              ? isArchived
                                ? "bg-gray-50 border-l-4 border-gray-400"
                                : "bg-purple-50 border-l-4 border-purple-600"
                              : ""
                          } ${isArchived ? "bg-gray-50/50" : ""}`}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div
                                className={`h-10 w-10 rounded-full ${getAvatarColor(
                                  otherParticipant?.email
                                )} flex items-center justify-center text-white font-bold text-sm ${
                                  isArchived ? "opacity-75" : ""
                                }`}
                              >
                                {getInitials(otherParticipant?.name || "C")}
                              </div>
                              {!isArchived && unread > 0 && (
                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></div>
                              )}
                              {isArchived && (
                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                                  <Archive size={8} className="text-white" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* First row: Name and time */}
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                                      {otherParticipant?.name || "Candidate"}
                                    </h3>
                                    {isArchived && (
                                      <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                                        Archived
                                      </span>
                                    )}
                                  </div>
                                  {candidateInfo?.title && (
                                    <p className="text-xs text-gray-600 truncate flex items-center mt-1">
                                      <Briefcase size={10} className="mr-1 flex-shrink-0" />
                                      <span className="truncate">{candidateInfo.title}</span>
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 flex-shrink-0">
                                  {jobTitle && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                                      {jobTitle}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {conversation.last_message_at &&
                                      formatConversationTime(conversation.last_message_at)}
                                  </span>
                                </div>
                              </div>

                              {/* Second row: Last message */}
                              <div className="flex items-center justify-between gap-2 mt-2">
                                <p className="text-xs text-gray-500 truncate flex-1">
                                  {conversation.last_message?.content?.substring(0, 40) ||
                                    "No messages yet"}
                                  {conversation.last_message?.content?.length > 40 && "..."}
                                </p>
                                {!isArchived && unread > 0 && (
                                  <span className="h-5 min-w-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center px-1 flex-shrink-0">
                                    {unread}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[calc(100vh-280px)] lg:h-[calc(100vh-320px)] flex flex-col shadow-sm">
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`h-10 w-10 rounded-full ${getAvatarColor(
                            currentConversation.job_seeker?.user?.email
                          )} flex items-center justify-center text-white font-bold flex-shrink-0`}
                        >
                          {getInitials(
                            currentConversation.other_participant?.name || "C"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-bold text-gray-900 truncate text-sm md:text-base">
                              {currentConversation.other_participant?.name || "Candidate"}
                            </h2>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded whitespace-nowrap">
                              Candidate
                            </span>
                            {currentConversation.is_archived && (
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded whitespace-nowrap">
                                Archived
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {currentConversation.job_seeker?.title && (
                              <p className="text-xs text-gray-600 flex items-center truncate">
                                <Briefcase size={12} className="mr-1 flex-shrink-0" />
                                <span className="truncate">{currentConversation.job_seeker.title}</span>
                              </p>
                            )}
                            {currentConversation.job && (
                              <p className="text-xs text-gray-600 flex items-center truncate">
                                <Target size={12} className="mr-1 flex-shrink-0" />
                                <span className="truncate">{currentConversation.job.title}</span>
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
                              <p className="text-xs text-purple-600 italic truncate">
                                <span className="flex items-center">
                                  <span className="h-1.5 w-1.5 bg-purple-600 rounded-full mr-1 animate-pulse"></span>
                                  typing...
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {currentConversation.other_participant?.email && (
                          <a
                            href={`mailto:${currentConversation.other_participant.email}`}
                            className="text-xs text-gray-600 hover:text-purple-600 flex items-center px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Send Email"
                          >
                            <Mail size={14} className="mr-1" />
                            <span className="hidden sm:inline">Email</span>
                          </a>
                        )}
                        {currentConversation.job_seeker?.resume && (
                          <a
                            href={currentConversation.job_seeker.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-600 hover:text-blue-600 flex items-center px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="View Resume"
                          >
                            <Download size={14} className="mr-1" />
                            <span className="hidden sm:inline">Resume</span>
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            if (currentConversation.is_archived) {
                              handleRestoreConversation(currentConversation.id, e);
                            } else {
                              handleArchiveConversation(currentConversation.id, e);
                            }
                          }}
                          className="text-xs text-gray-600 hover:text-gray-800 flex items-center px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          {currentConversation.is_archived ? (
                            <>
                              <ArchiveRestore size={14} className="mr-1" />
                              <span className="hidden sm:inline">Restore</span>
                            </>
                          ) : (
                            <>
                              <Archive size={14} className="mr-1" />
                              <span className="hidden sm:inline">Archive</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gradient-to-b from-white to-gray-50">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-4">
                        <div className="text-center max-w-md">
                          <div className="inline-flex items-center justify-center h-16 w-16 bg-purple-100 rounded-full mb-4">
                            {currentConversation.is_archived ? (
                              <FolderArchive className="h-8 w-8 text-purple-600" />
                            ) : (
                              <Users className="h-8 w-8 text-purple-600" />
                            )}
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                            {currentConversation.is_archived
                              ? "Archived Conversation"
                              : "Start a conversation"}
                          </h3>
                          <p className="text-gray-600 text-sm mb-6">
                            {currentConversation.is_archived
                              ? "Restore this conversation to send new messages."
                              : "Introduce the position and guide them through the hiring process."}
                          </p>
                          {!currentConversation.is_archived && (
                            <div className="space-y-3">
                              <div className="text-left p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-xs font-medium text-purple-800 mb-1">
                                  Good questions to ask:
                                </p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li className="truncate">• "What interests you about this role?"</li>
                                  <li className="truncate">• "When are you available for an interview?"</li>
                                  <li className="truncate">• "Do you have any questions?"</li>
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-w-4xl mx-auto">
                        {messages.map((msg) => {
                          const isOwnMessage = msg.sender?.id === user?.id;
                          const isRead = msg.status === "read";

                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[85%] md:max-w-[75%] ${
                                  isOwnMessage
                                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl rounded-tr-none"
                                    : "bg-white text-gray-900 rounded-2xl rounded-tl-none border border-gray-200"
                                } shadow-sm`}
                              >
                                <div className="p-3">
                                  {/* Sender info for candidate messages */}
                                  {!isOwnMessage && msg.sender && (
                                    <div className="flex items-center mb-2">
                                      <div className="text-xs font-medium text-gray-700 truncate">
                                        {msg.sender.first_name} {msg.sender.last_name}
                                      </div>
                                      <div className="ml-2 text-xs text-gray-500 truncate">
                                        • Candidate
                                      </div>
                                    </div>
                                  )}

                                  {/* Message content */}
                                  {msg.content && (
                                    <p className="text-sm whitespace-pre-wrap break-words mb-2">
                                      {msg.content}
                                    </p>
                                  )}

                                  {/* Attachments */}
                                  {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="space-y-2 mb-2">
                                      {msg.attachments.map((attachment) => (
                                        <ChatAttachment
                                          key={attachment.id}
                                          attachment={attachment}
                                          isOwnMessage={isOwnMessage}
                                          onDownload={(att) => {
                                            if (att.file_url) {
                                              window.open(att.file_url, "_blank");
                                            }
                                          }}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  {/* Message footer */}
                                  <div className={`flex items-center justify-end space-x-2 text-xs ${
                                    isOwnMessage ? "text-purple-200" : "text-gray-500"
                                  }`}>
                                    <span className="whitespace-nowrap">{formatTime(msg.created_at)}</span>
                                    {isOwnMessage && getStatusIcon(msg)}
                                    {!isOwnMessage && !isRead && (
                                      <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                        NEW
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} className="h-4" />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  {!currentConversation.is_archived && (
                    <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
                      {/* File preview with scroll */}
                      {attachments.length > 0 && (
                        <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-purple-800">
                              Attachments ({attachments.length})
                            </p>
                            <button
                              onClick={() => setAttachments([])}
                              className="text-xs text-purple-600 hover:text-purple-800"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <div className="flex space-x-2 pb-2 min-w-max">
                              {attachments.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-white p-2 rounded-lg border min-w-0 flex-shrink-0"
                                  style={{ maxWidth: "200px" }}
                                >
                                  <div className="flex items-center space-x-2 min-w-0">
                                    <FileText size={14} className="text-gray-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs text-gray-900 truncate">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setAttachments((prev) =>
                                        prev.filter((_, i) => i !== index)
                                      )
                                    }
                                    className="text-gray-500 hover:text-red-600 ml-2 flex-shrink-0"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Input area */}
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mt-1"
                          title="Attach files"
                        >
                          <Paperclip size={20} />
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            const validFiles = files.filter(
                              (file) => file.size <= 10 * 1024 * 1024
                            );
                            if (validFiles.length < files.length) {
                              alert("Some files exceed 10MB limit.");
                            }
                            setAttachments((prev) => [...prev, ...validFiles]);
                            e.target.value = "";
                          }}
                          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
                        />

                        <div className="flex-1 relative">
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Send a message to ${currentConversation.other_participant?.name || "the candidate"}...`}
                            className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm min-h-[44px] max-h-32"
                            rows="1"
                          />
                        </div>

                        <button
                          onClick={handleSendMessage}
                          disabled={!message.trim() && attachments.length === 0}
                          className={`p-2 md:p-3 rounded-full transition-all flex-shrink-0 mt-1 ${
                            message.trim() || attachments.length > 0
                              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-sm"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Send size={18} className="md:w-5 md:h-5" />
                        </button>
                      </div>
                      
                      {/* Footer hints */}
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1">
                        <p className="truncate">Press Enter to send • Shift+Enter for new line</p>
                        <p className="text-right truncate">Max file size: 10MB • Supports images, PDF, Word</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <div className="text-center max-w-2xl">
                    <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                      <Users className="h-10 w-10 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 truncate">
                      Select a Candidate
                    </h2>
                    <p className="text-gray-600 text-sm mb-6">
                      Choose a conversation from the left panel to start messaging with candidates about job opportunities.
                    </p>
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

export default Messages;