import { create } from 'zustand';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Awareness } from 'y-protocols/awareness';
import { Channel, Message, User, TypingIndicator } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from './userStore';

interface YjsState {
  // YJS state
  ydoc: Y.Doc | null;
  provider: WebrtcProvider | null;
  persistence: IndexeddbPersistence | null;
  awareness: Awareness | null;
  isInitialized: boolean;
  
  // YJS methods
  initialize: () => void;
  disconnect: () => void;
  getYDoc: () => Y.Doc;
  
  // Action methods
  isWorkspaceInitialized: () => boolean;
  getUsers: () => Record<string, User>;
  getUser: (userId: string) => User | undefined;
  getChannels: () => Record<string, Channel>;
  getChannel: (channelId: string) => Channel | undefined;
  getMessages: (channelId: string) => Message[];
  getThreadMessages: (messageId: string, channelId?: string) => Message[];
  createMessage: (channelId: string, text: string, parentId?: string) => Message | null;
  updateMessage: (message: Message) => boolean;
  deleteMessage: (message: Message) => boolean;
  createChannel: (name: string, description: string) => Channel | null;
  updateChannel: (channel: Channel) => boolean;
  archiveChannel: (channelId: string) => boolean;
  deleteChannel: (channelId: string) => boolean;
  
  // Presence methods
  isUserOnline: (userId: string) => boolean;
  getOnlineUsers: () => string[];
  getTypingUsers: (channelId: string) => string[];
  setTyping: (channelId: string, isTyping: boolean) => void;
  
  // UI state
  currentChannelId: string | null;
  setCurrentChannelId: (channelId: string | null) => void;
}

const ROOM_NAME = 'yjs-chat-workspace';

// Get signaling servers from .env (comma-separated)
const SIGNALING_SERVERS = (import.meta.env.VITE_SIGNALING_SERVERS || 'ws://localhost:4444')
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean);

export const useYjsStore = create<YjsState>((set, get) => ({
  ydoc: null,
  provider: null,
  persistence: null,
  awareness: null,
  isInitialized: false,
  currentChannelId: null,
  
  initialize: () => {
    if (get().isInitialized || get().ydoc || get().provider) {
      console.debug('YJS already initialized, skipping initialization');
      return;
    }
    
    const { user } = useUserStore.getState();
    if (!user) return;
    
    try {
      const ydoc = new Y.Doc();
      const awareness = new Awareness(ydoc);
      
      awareness.setLocalState({
        user,
        typing: null,
      });
      
      useUserStore.subscribe((state) => {
        if (state.user) {
          awareness.setLocalState({
            user: state.user,
            typing: awareness.getLocalState()?.typing || null,
          });
        }
      });
      
      const provider = new WebrtcProvider(ROOM_NAME, ydoc, {
        signaling: SIGNALING_SERVERS,
        password: undefined, // changed from null to undefined
        awareness,
        maxConns: 20 + Math.floor(Math.random() * 15),
        filterBcConns: false,
      });
      
      const persistence = new IndexeddbPersistence(ROOM_NAME, ydoc);
      
      set({
        ydoc,
        provider,
        persistence,
        awareness,
        isInitialized: true,
        currentChannelId: 'channel-general',
      });
    } catch (error) {
      console.error('Failed to initialize YJS:', error);
      get().disconnect();
    }
  },
  
  disconnect: () => {
    const { provider, persistence, ydoc, awareness } = get();
    
    try {
      if (awareness) {
        awareness.setLocalState(null);
        awareness.destroy();
      }
      if (provider) {
        provider.disconnect();
        provider.destroy();
      }
      if (persistence) {
        persistence.destroy();
      }
      if (ydoc) {
        ydoc.destroy();
      }
    } catch (error) {
      console.error('Error during YJS cleanup:', error);
    }
    
    set({
      ydoc: null,
      provider: null,
      persistence: null,
      awareness: null,
      isInitialized: false,
      currentChannelId: null,
    });
  },
  
  getYDoc: () => {
    const { ydoc } = get();
    if (!ydoc) throw new Error('YDoc not initialized');
    return ydoc;
  },
  
  isWorkspaceInitialized: () => {
    const { ydoc } = get();
    if (!ydoc) return false;
    return ydoc.getMap('channels').size > 0;
  },
  
  getUsers: () => {
    const { ydoc } = get();
    if (!ydoc) return {} as Record<string, User>;
    return Object.fromEntries(ydoc.getMap('users').entries()) as Record<string, User>;
  },
  
  getUser: (userId: string) => {
    const { ydoc } = get();
    if (!ydoc) return undefined;
    return ydoc.getMap('users').get(userId) as User | undefined;
  },
  
  getChannels: () => {
    const { ydoc } = get();
    if (!ydoc) return {} as Record<string, Channel>;
    const channelsMap = ydoc.getMap('channels');
    const result: Record<string, Channel> = {};
    channelsMap.forEach((yChannel, channelId) => {
      if (yChannel instanceof Y.Map) {
        const meta = yChannel.get('meta');
        if (meta && typeof meta === 'object' && !(meta instanceof Y.Map)) result[channelId] = meta as Channel;
      }
    });
    return result;
  },

  getChannel: (channelId: string) => {
    const { ydoc } = get();
    if (!ydoc) return undefined;
    const yChannel = ydoc.getMap('channels').get(channelId);
    if (!(yChannel instanceof Y.Map)) return undefined;
    const meta = yChannel.get('meta');
    return meta && typeof meta === 'object' && !(meta instanceof Y.Map) ? (meta as Channel) : undefined;
  },

  getMessages: (channelId: string) => {
    const { ydoc } = get();
    if (!ydoc) return [];
    const yChannel = ydoc.getMap('channels').get(channelId);
    if (!(yChannel instanceof Y.Map)) return [];
    const yMessages = yChannel.get('messages');
    if (!(yMessages instanceof Y.Map)) return [];
    const messages: Message[] = [];
    yMessages.forEach((yMsg) => {
      if (yMsg instanceof Y.Map) {
        const msg = yMsg.toJSON() as Message;
        if (!msg.deleted && !msg.parentId) messages.push(msg);
      }
    });
    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },

  getThreadMessages: (messageId: string, channelId?: string) => {
    const { ydoc } = get();
    if (!ydoc) return [];
    let yChannel: Y.Map<any> | undefined;
    if (channelId) {
      const ch = ydoc.getMap('channels').get(channelId);
      if (ch instanceof Y.Map) yChannel = ch;
    } else {
      ydoc.getMap('channels').forEach((yc) => {
        if (!yChannel && yc instanceof Y.Map) {
          const yMessages = yc.get('messages');
          if (yMessages instanceof Y.Map && yMessages.has(messageId)) yChannel = yc;
        }
      });
    }
    if (!yChannel) return [];
    const yMessages = yChannel.get('messages');
    if (!(yMessages instanceof Y.Map)) return [];
    const yMsg = yMessages.get(messageId);
    if (!(yMsg instanceof Y.Map)) return [];
    const yThreads = yMsg.get('threads');
    if (!(yThreads instanceof Y.Map)) return [];
    const threadMsgs: Message[] = [];
    yThreads.forEach((yThreadMsg) => {
      if (yThreadMsg instanceof Y.Map) {
        const msg = yThreadMsg.toJSON() as Message;
        if (!msg.deleted) threadMsgs.push(msg);
      }
    });
    return threadMsgs.sort((a, b) => a.createdAt - b.createdAt);
  },

  createChannel: (name: string, description: string) => {
    const { ydoc } = get();
    if (!ydoc) return null;
    const { user } = useUserStore.getState();
    if (!user) return null;
    const channelId = `channel-${uuidv4()}`;
    const yChannel = new Y.Map();
    const meta = {
      id: channelId,
      name,
      description,
      type: 'public',
      createdAt: Date.now(),
      createdBy: user.id,
      archived: false,
    };
    yChannel.set('meta', meta);
    yChannel.set('messages', new Y.Map());
    ydoc.getMap('channels').set(channelId, yChannel);
    return meta as Channel;
  },

  createMessage: (channelId: string, text: string, parentId?: string) => {
    const { ydoc } = get();
    if (!ydoc) return null;
    const { user } = useUserStore.getState();
    if (!user) return null;
    const yChannel = ydoc.getMap('channels').get(channelId);
    if (!(yChannel instanceof Y.Map)) return null;
    const yMessages = yChannel.get('messages');
    if (!(yMessages instanceof Y.Map)) return null;
    const id = `msg-${uuidv4()}`;
    const now = Date.now();
    const yMsg = new Y.Map();
    yMsg.set('id', id);
    yMsg.set('channelId', channelId);
    yMsg.set('userId', user.id);
    yMsg.set('text', text);
    yMsg.set('createdAt', now);
    if (parentId) yMsg.set('parentId', parentId);
    if (parentId) {
      const parentMsg = yMessages.get(parentId);
      if (!(parentMsg instanceof Y.Map)) return null;
      let yThreads = parentMsg.get('threads');
      if (!(yThreads instanceof Y.Map)) {
        yThreads = new Y.Map();
        parentMsg.set('threads', yThreads);
      }
      yThreads.set(id, yMsg);
    } else {
      yMessages.set(id, yMsg);
    }
    return yMsg.toJSON() as Message;
  },

  updateMessage: (message: Message) => {
    const { ydoc } = get();
    if (!ydoc) return false;
    const { user } = useUserStore.getState();
    if (!user) return false;
    const yChannel = ydoc.getMap('channels').get(message.channelId) as Y.Map<any>;
    if (!yChannel) return false;
    const yMessages = yChannel.get('messages') as Y.Map<any>;
    let yMsg = yMessages.get(message.id) as Y.Map<any>;
    // If not found, check if it's a thread message
    if (!yMsg && message.parentId) {
      const parentMsg = yMessages.get(message.parentId) as Y.Map<any>;
      if (!parentMsg) return false;
      const yThreads = parentMsg.get('threads') as Y.Map<any>;
      if (!yThreads) return false;
      yMsg = yThreads.get(message.id) as Y.Map<any>;
    }
    if (!yMsg) return false;
    Object.entries(message).forEach(([k, v]) => {
      if (k !== 'id') yMsg.set(k, v);
    });
    yMsg.set('updatedAt', Date.now());
    return true;
  },

  deleteMessage: (message: Message) => {
    const { ydoc } = get();
    if (!ydoc) return false;
    try {
      const yChannel = ydoc.getMap('channels').get(message.channelId) as Y.Map<any>;
      if (!yChannel) return false;
      const yMessages = yChannel.get('messages') as Y.Map<any>;
      let yMsg = yMessages.get(message.id) as Y.Map<any>;
      // If not found, check if it's a thread message
      if (!yMsg && message.parentId) {
        const parentMsg = yMessages.get(message.parentId) as Y.Map<any>;
        if (!parentMsg) return false;
        const yThreads = parentMsg.get('threads') as Y.Map<any>;
        if (!yThreads) return false;
        yMsg = yThreads.get(message.id) as Y.Map<any>;
      }
      if (!yMsg) return false;
      yMsg.set('deleted', true);
      yMsg.set('updatedAt', Date.now());
      // If this is a parent message, delete all thread messages
      if (!message.parentId) {
        const yThreads = yMsg.get('threads') as Y.Map<any>;
        if (yThreads) {
          yThreads.forEach((yThreadMsg: Y.Map<any>) => {
            yThreadMsg.set('deleted', true);
            yThreadMsg.set('updatedAt', Date.now());
          });
        }
      }
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  },

  updateChannel: (channel: Channel) => {
    const { ydoc } = get();
    if (!ydoc) return false;
    const yChannel = ydoc.getMap('channels').get(channel.id) as Y.Map<any>;
    if (!yChannel) return false;
    const meta = yChannel.get('meta');
    if (!meta || typeof meta !== 'object' || meta instanceof Y.Map) return false;
    // Only update meta transactionally (replace whole object)
    const newMeta = { ...meta, ...channel, updatedAt: Date.now() };
    yChannel.set('meta', newMeta);
    return true;
  },

  archiveChannel: (channelId: string) => {
    const { ydoc } = get();
    if (!ydoc) return false;
    const yChannel = ydoc.getMap('channels').get(channelId) as Y.Map<any>;
    if (!yChannel) return false;
    const meta = yChannel.get('meta');
    if (!meta || typeof meta !== 'object' || meta instanceof Y.Map) return false;
    const newMeta = { ...meta, archived: !meta.archived, updatedAt: Date.now() };
    yChannel.set('meta', newMeta);
    return true;
  },

  deleteChannel: (channelId: string) => {
    const { ydoc } = get();
    if (!ydoc) return false;
    try {
      const channelsMap = ydoc.getMap('channels');
      channelsMap.delete(channelId);
      if (get().currentChannelId === channelId) {
        set({ currentChannelId: null });
      }
      return true;
    } catch (error) {
      console.error('Error deleting channel:', error);
      return false;
    }
  },
  
  isUserOnline: (userId: string) => {
    const { awareness } = get();
    if (!awareness) return false;
    
    const states = Array.from(awareness.getStates().values()) as { user: User }[];
    return states.some(state => state.user && state.user.id === userId);
  },
  
  getOnlineUsers: () => {
    const { awareness } = get();
    if (!awareness) return [];
    
    const states = Array.from(awareness.getStates().values()) as { user: User }[];
    const onlineUserIds = new Set<string>();
    
    states.forEach(state => {
      if (state.user?.id) {
        onlineUserIds.add(state.user.id);
      }
    });
    
    return Array.from(onlineUserIds);
  },
  
  getTypingUsers: (channelId: string) => {
    const { awareness } = get();
    if (!awareness) return [];
    
    const states = Array.from(awareness.getStates().values()) as {
      user: User;
      typing: TypingIndicator;
    }[];
    
    const typingUserIds = new Set<string>();
    
    states.forEach(state => {
      if (
        state.user &&
        state.typing &&
        state.typing.channelId === channelId &&
        Date.now() - state.typing.timestamp < 3000
      ) {
        typingUserIds.add(state.user.id);
      }
    });
    
    return Array.from(typingUserIds);
  },
  
  setTyping: (channelId: string, isTyping: boolean) => {
    const { awareness } = get();
    if (!awareness) return;
    
    const currentState = awareness.getLocalState();
    if (!currentState?.user) return;
    
    awareness.setLocalState({
      ...currentState,
      typing: isTyping
        ? { channelId, userId: currentState.user.id, timestamp: Date.now() }
        : null,
    });
  },
  
  setCurrentChannelId: (channelId: string | null) => {
    set({ currentChannelId: channelId });
  },
}));