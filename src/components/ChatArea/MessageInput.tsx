import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  placeholder?: string;
}

export default function MessageInput({
  onSendMessage,
  onTyping,
  placeholder = 'Type a message...'
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleTyping = () => {
    onTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 3000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage('');
    
    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      onTyping(false);
    }
    
    // Focus back on textarea
    textareaRef.current?.focus();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter without shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className={cn(
          "w-full px-4 py-3 pr-12 resize-none max-h-32",
          "bg-secondary-100 dark:bg-dark-600 rounded-lg",
          "border border-secondary-300 dark:border-dark-500",
          "focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 focus:outline-none",
          "placeholder-secondary-500 dark:placeholder-secondary-400",
          "text-secondary-900 dark:text-white"
        )}
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className={cn(
          "absolute right-3 bottom-3 p-1.5 rounded-full transition-colors",
          message.trim()
            ? "bg-primary-500 hover:bg-primary-600 text-white"
            : "bg-secondary-300 dark:bg-dark-500 text-secondary-500 dark:text-secondary-400 cursor-not-allowed"
        )}
      >
        <Send size={18} />
      </button>
    </form>
  );
}