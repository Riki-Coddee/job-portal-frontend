// src/components/JobSeekerMessageItem.jsx
import React from 'react';
import { Briefcase, Check, CheckCheck, Circle } from 'lucide-react';

const JobSeekerMessageItem = ({ conversation, isSelected, onClick, onArchive, currentUser }) => {
  const recruiterInfo = {
    name: conversation.recruiter?.user?.first_name + ' ' + conversation.recruiter?.user?.last_name,
    company: conversation.recruiter?.company?.name,
  };

  const unread = conversation.unread_count || 0;
  const lastMessage = conversation.last_message;

  const getAvatarColor = (email) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
    const hash = email ? email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    return colors[hash % colors.length];
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = () => {
    if (!lastMessage || lastMessage.sender_id !== currentUser.id) return null;
    
    switch (lastMessage.status) {
      case 'read': return <CheckCheck size={12} className="text-green-500" />;
      case 'delivered': return <Check size={12} className="text-gray-400" />;
      default: return <Circle size={12} className="text-gray-300" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
      } ${unread > 0 ? 'bg-blue-50/30' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <div className={`h-12 w-12 rounded-full ${getAvatarColor(conversation.recruiter?.user?.email)} flex items-center justify-center text-white font-bold`}>
            {recruiterInfo.name?.substring(0, 2)?.toUpperCase() || 'RC'}
          </div>
          {unread > 0 && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {recruiterInfo.name || 'Recruiter'}
              </h3>
              {unread > 0 && (
                <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {conversation.job && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center">
                  <Briefcase size={10} className="mr-1" />
                  Job
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(conversation.id);
                }}
                className="text-gray-400 hover:text-gray-600"
                title={conversation.is_archived ? "Unarchive" : "Archive"}
              >
                {conversation.is_archived ? '📂' : '📁'}
              </button>
            </div>
          </div>
          
          {recruiterInfo.company && (
            <p className="text-xs text-gray-500 truncate mt-1">
              {recruiterInfo.company}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-600 truncate flex-1 flex items-center">
              {lastMessage?.content || 'No messages yet'}
              {getStatusIcon()}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {conversation.last_message_at && formatTime(conversation.last_message_at)}
              </span>
              {unread > 0 && (
                <span className="h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerMessageItem;