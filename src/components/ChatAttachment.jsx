// src/components/ChatAttachment.jsx
import React, { useState } from 'react';
import { 
  FileText, Image, File, Download, X, FileArchive,
  FileTerminal
} from 'lucide-react';

const ChatAttachment = ({ attachment, isOwnMessage, onDownload, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getFileIcon = () => {
    const ext = attachment.file_name?.split('.').pop()?.toLowerCase();
    
    if (attachment.is_image) {
      return <Image className="h-5 w-5" />;
    }
    
    switch (ext) {
      case 'pdf':
        return <FileTerminal className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileArchive className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleDownload = (e) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(attachment);
    } else if (attachment.file_url) {
      window.open(attachment.file_url, '_blank');
    }
  };
  
  return (
    <div 
      className={`relative rounded-lg border p-3 ${
        isOwnMessage 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-gray-50 border-gray-200'
      } hover:bg-opacity-80 transition-colors`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.file_name}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500">
              {formatFileSize(attachment.file_size)}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {attachment.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleDownload}
            className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
            title="Download"
          >
            <Download size={16} />
          </button>
          
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(attachment);
              }}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
              title="Remove"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Image preview for images */}
      {attachment.is_image && attachment.thumbnail_url && (
        <div className="mt-3">
          <img
            src={attachment.thumbnail_url}
            alt={attachment.file_name}
            className="w-full h-auto max-h-48 object-cover rounded-md"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default ChatAttachment;