// User types
export interface User {
  id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  createdAt: number;
}

// Channel types
export type ChannelType = 'public';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  createdAt: number;
  createdBy: string;
  archived?: boolean;
}

// Message types
export interface Message {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  createdAt: number;
  updatedAt?: number;
  deleted?: boolean;
  // For thread support
  parentId?: string;
  reactions?: Record<string, string[]>; // emoji -> userIds
}

// Typing indicator types
export interface TypingIndicator {
  channelId: string;
  userId: string;
  timestamp: number;
}

// Presence types
export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
}

// YJS Document types - these represent the structure of our YJS data
export interface YjsState {
  channels: Record<string, Channel>;
  messages: Record<string, Message[]>;
  // Used for thread replies
  threads: Record<string, Message[]>;
  users: Record<string, User>;
}

export interface UUID {
  v4: () => string;
}