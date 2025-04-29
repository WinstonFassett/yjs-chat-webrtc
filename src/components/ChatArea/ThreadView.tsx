import React, { useState, useEffect, useRef } from 'react';
import { useYjsStore } from '../../stores/yjsStore';
import { useUserStore } from '../../stores/userStore';
import { X, Archive } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { Message } from '../../types';
import { cn } from '../../utils/cn';

interface ThreadViewProps {
  parentMessage: Message;
  onClose: () => void;
}

export default function ThreadView({ parentMessage, onClose }: ThreadViewProps) {
  const { getThreadMessages, getUser, getChannel } = useYjsStore();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const parentUser = getUser(parentMessage.userId);
  const channel = getChannel(parentMessage.channelId);
  
  // Update messages
  useEffect(() => {
    const updateMessages = () => {
      setMessages(getThreadMessages(parentMessage.id));
    };
    
    updateMessages();
    const interval = setInterval(updateMessages, 500);
    
    return () => clearInterval(interval);
  }, [parentMessage.id, getThreadMessages]);
  
  const handleSendMessage = (text: string) => {
    if (!text.trim() || channel?.archived) return;
    
    const { createMessage } = useYjsStore.getState();
    createMessage(parentMessage.channelId, text, parentMessage.id);
    
    // Scroll to bottom after sending
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="w-96 h-full flex flex-col border-l border-secondary-200 dark:border-dark-600 bg-white dark:bg-dark-800">
      {/* Thread header */}
      <div className="px-4 py-3 border-b border-secondary-200 dark:border-dark-600 flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
              Thread
            </h3>
            {channel?.archived && (
              <span className="ml-2 text-secondary-500 dark:text-secondary-400">
                <Archive size={16} />
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-600 text-secondary-500"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Parent message */}
      <div className="px-4 py-3 bg-secondary-50 dark:bg-dark-700 border-b border-secondary-200 dark:border-dark-600">
        <MessageList messages={[parentMessage]} isThreadView isArchived={channel?.archived} />
      </div>
      
      {/* Thread messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <MessageList
          messages={messages}
          isThreadView
          isArchived={channel?.archived}
          emptyStateComponent={
            <div className="pt-2 pb-4 text-secondary-500 dark:text-secondary-400">
              <p className="text-sm text-center">No replies yet</p>
            </div>
          }
        />
        <div ref={messageEndRef} />
      </div>
      
      {/* Typing indicator */}
      <div className="px-4 h-6">
        <TypingIndicator userIds={typingUsers} />
      </div>
      
      {/* Message input or archived notice */}
      <div className="p-4 border-t border-secondary-200 dark:border-dark-600">
        {channel?.archived ? (
          <div className="text-center text-secondary-600 dark:text-secondary-400">
            <Archive size={20} className="mx-auto mb-2" />
            <p>This channel has been archived and is read-only.</p>
          </div>
        ) : (
          <MessageInput 
            onSendMessage={handleSendMessage}
            onTyping={() => {}}
            placeholder="Reply in thread..."
          />
        )}
      </div>
    </div>
  );
}