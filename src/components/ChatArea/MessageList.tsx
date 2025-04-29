import React, { useState } from 'react';
import { useYjsStore } from '../../stores/yjsStore';
import { useUserStore } from '../../stores/userStore';
import { formatMessageTime } from '../../utils/time';
import { getColorFromUsername, getUserInitials } from '../../utils/avatar';
import { Edit2, Trash2, MessageSquare, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  onViewThread?: (message: Message) => void;
  isThreadView?: boolean;
  isArchived?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyStateComponent?: React.ReactNode;
}

export default function MessageList({ messages, onViewThread, isThreadView, isArchived, emptyTitle, emptyDescription, emptyStateComponent }: MessageListProps) {
  const { getUser, updateMessage, deleteMessage, getThreadMessages, isUserOnline } = useYjsStore();
  const { user: currentUser } = useUserStore();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  if (messages.length === 0) {
    if (emptyStateComponent) return <>{emptyStateComponent}</>;
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-secondary-500 dark:text-secondary-400">
        <p className="text-center">{emptyTitle || 'No messages yet'}</p>
        {typeof emptyDescription === 'string' ? (
          <p className="text-sm mt-2">{emptyDescription}</p>
        ) : (
          !emptyTitle && <p className="text-sm mt-2">Be the first to send a message!</p>
        )}
      </div>
    );
  }
  
  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);
  
  const handleEdit = (message: Message) => {
    if (isArchived) return;
    setEditingMessageId(message.id);
    setEditText(message.text);
  };
  
  const handleSaveEdit = (message: Message) => {
    if (isArchived) return;
    if (editText.trim() !== message.text) {
      updateMessage({
        ...message,
        text: editText.trim(),
      });
    }
    setEditingMessageId(null);
    setEditText('');
  };
  
  const handleDelete = (message: Message) => {
    if (isArchived) return;
    deleteMessage(message);
    setShowDeleteConfirm(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, message: Message) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(message);
    } else if (e.key === 'Escape') {
      setEditingMessageId(null);
      setEditText('');
    }
  };
  
  return (
    <div className="space-y-6">
      {Object.entries(messagesByDate).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-secondary-200 dark:bg-dark-600"></div>
            <span className="px-4 text-sm text-secondary-500 dark:text-secondary-400">
              {date}
            </span>
            <div className="flex-1 h-px bg-secondary-200 dark:bg-dark-600"></div>
          </div>
          
          <div className="space-y-4">
            {dateMessages.map((message) => {
              const messageUser = getUser(message.userId);
              const isCurrentUser = currentUser?.id === message.userId;
              const isEditing = editingMessageId === message.id;
              const threadMessages = !isThreadView && !message.parentId ? getThreadMessages(message.id) : [];
              const threadCount = threadMessages.length;
              const isOnline = messageUser ? isUserOnline(messageUser.id) : false;
              
              return (
                <div key={message.id} className="group hover:bg-secondary-50 dark:hover:bg-dark-700/50 -mx-4 px-4 py-1">
                  <div className="flex">
                    <div className="mr-3 mt-0.5 flex-shrink-0 relative">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-center bg-cover"
                        style={{ 
                          backgroundColor: messageUser?.avatar ? 'transparent' : getColorFromUsername(messageUser?.username || 'unknown'),
                          backgroundImage: messageUser?.avatar ? `url(${messageUser.avatar})` : 'none',
                        }}
                      >
                        {!messageUser?.avatar && (
                          <span className="text-xs font-medium text-white">
                            {getUserInitials(messageUser?.username || 'unknown', messageUser?.fullName)}
                          </span>
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-800"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline">
                        <span className="font-medium text-secondary-900 dark:text-white mr-2">
                          {messageUser?.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                          {formatMessageTime(message.createdAt)}
                          {message.updatedAt && ' (edited)'}
                        </span>
                        
                        {!isArchived && isCurrentUser && !isEditing && (
                          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(message)}
                              className="p-1 text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
                              title="Edit message"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(message.id)}
                              className="p-1 text-secondary-500 hover:text-red-600 dark:text-secondary-400 dark:hover:text-red-400"
                              title="Delete message"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                        
                        {onViewThread && !message.parentId && !isArchived && (
                          <button
                            onClick={() => onViewThread(message)}
                            className={cn(
                              "ml-2 flex items-center text-sm",
                              threadCount > 0
                                ? "text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                                : "text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200 opacity-0 group-hover:opacity-100",
                              "transition-opacity"
                            )}
                          >
                            <MessageSquare size={14} className="mr-1" />
                            {threadCount > 0 && (
                              <span>{threadCount} repl{threadCount === 1 ? 'y' : 'ies'}</span>
                            )}
                          </button>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="mt-1">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, message)}
                            className={cn(
                              "w-full px-3 py-2 resize-none",
                              "bg-white dark:bg-dark-600 rounded-md",
                              "border border-secondary-300 dark:border-dark-500",
                              "focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 focus:outline-none",
                              "text-secondary-900 dark:text-white"
                            )}
                            rows={2}
                            autoFocus
                          />
                          <div className="mt-2 flex items-center space-x-2 text-sm">
                            <button
                              onClick={() => handleSaveEdit(message)}
                              disabled={!editText.trim()}
                              className={cn(
                                "px-3 py-1 rounded-md",
                                editText.trim()
                                  ? "bg-primary-500 hover:bg-primary-600 text-white"
                                  : "bg-secondary-300 text-secondary-500 cursor-not-allowed"
                              )}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditText('');
                              }}
                              className="px-3 py-1 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-dark-600 rounded-md"
                            >
                              Cancel
                            </button>
                            <span className="text-secondary-500 dark:text-secondary-400">
                              Press Esc to cancel, Enter to save
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap">
                          {message.text}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete confirmation dialog */}
                  {showDeleteConfirm === message.id && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                      <div className="w-full max-w-md bg-white dark:bg-dark-700 rounded-lg shadow-xl animate-fade-in p-6">
                        <div className="flex items-center mb-4 text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-6 h-6 mr-2" />
                          <h3 className="text-lg font-semibold">Delete Message?</h3>
                        </div>
                        
                        <p className="text-secondary-600 dark:text-secondary-300 mb-6">
                          This will permanently delete this message{threadCount > 0 ? ` and its ${threadCount} ${threadCount === 1 ? 'reply' : 'replies'}` : ''}. This action cannot be undone.
                        </p>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-4 py-2 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-dark-600 rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(message)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                          >
                            Delete Message
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}