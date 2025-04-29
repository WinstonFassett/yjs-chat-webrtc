import React, { useState, useEffect } from 'react';
import { useYjsStore } from '../../stores/yjsStore';
import { useUserStore } from '../../stores/userStore';
import { Hash, Info, Settings, Archive } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ThreadView from './ThreadView';
import ChannelSettingsModal from '../Modals/ChannelSettingsModal';
import { Channel, Message } from '../../types';

export default function ChatArea() {
  const {
    currentChannelId,
    getChannel,
    getMessages,
    getTypingUsers,
    setTyping,
  } = useYjsStore();

  const { user } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Get current channel directly from YJS store
  const channel = currentChannelId ? getChannel(currentChannelId) : null;

  // Update messages
  useEffect(() => {
    if (!currentChannelId) return;

    const updateMessages = () => {
      setMessages(getMessages(currentChannelId));
    };

    updateMessages();
    const interval = setInterval(updateMessages, 500);
    return () => clearInterval(interval);
  }, [currentChannelId, getMessages]);

  // Check for users typing
  useEffect(() => {
    if (!currentChannelId) return;

    const checkTypingUsers = () => {
      const users = getTypingUsers(currentChannelId).filter(id => id !== user?.id);
      setTypingUsers(users);
    };

    checkTypingUsers();
    const interval = setInterval(checkTypingUsers, 1000);
    return () => clearInterval(interval);
  }, [currentChannelId, getTypingUsers, user?.id]);

  const handleSendMessage = (text: string) => {
    if (!currentChannelId || !text.trim() || channel?.archived) return;

    const { createMessage } = useYjsStore.getState();
    createMessage(currentChannelId, text);
    setTyping(currentChannelId, false);
  };

  const handleTyping = (isTyping: boolean) => {
    if (!currentChannelId || channel?.archived) return;
    setTyping(currentChannelId, isTyping);
  };

  if (!channel || !currentChannelId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-dark-800">
        <div className="text-center p-8">
          <Info className="mx-auto h-12 w-12 text-secondary-400 dark:text-secondary-600 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100">
            No channel selected
          </h3>
          <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
            Select a channel from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full">
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-dark-800">
        {/* Channel header */}
        <div className="px-4 py-3 border-b border-secondary-200 dark:border-dark-600 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2 text-secondary-600 dark:text-secondary-400">
              <Hash size={20} />
            </div>
            <div>
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-secondary-900 dark:text-white">
                  {channel.name}
                </h2>
                {channel.archived && (
                  <span className="ml-2 text-secondary-500 dark:text-secondary-400">
                    <Archive size={16} />
                  </span>
                )}
              </div>
              {channel.description && (
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {channel.description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-600 text-secondary-500"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <MessageList
            messages={messages}
            onViewThread={setThreadMessage}
            isArchived={channel.archived}
            emptyStateComponent={
              <div className="flex flex-col items-center justify-center h-full py-12 text-secondary-500 dark:text-secondary-400">
                <p className="text-center">No messages yet</p>
                <p className="text-sm mt-2">Be the first to send a message!</p>
              </div>
            }
          />
        </div>

        {/* Typing indicator */}
        <div className="px-4 h-6">
          <TypingIndicator userIds={typingUsers} />
        </div>

        {/* Message input or archived notice */}
        <div className="p-4 border-t border-secondary-200 dark:border-dark-600">
          {channel.archived ? (
            <div className="text-center text-secondary-600 dark:text-secondary-400">
              <Archive size={20} className="mx-auto mb-2" />
              <p>This channel has been archived and is read-only.</p>
            </div>
          ) : (
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              placeholder={`Message #${channel.name}`}
            />
          )}
        </div>
      </div>

      {/* Thread view */}
      {threadMessage && (
        <ThreadView
          parentMessage={threadMessage}
          onClose={() => setThreadMessage(null)}
        />
      )}

      {/* Channel settings modal */}
      {showSettings && (
        <ChannelSettingsModal
          channel={channel}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}