import { v4 as uuidv4 } from 'uuid';
import { useYjsStore } from '../stores/yjsStore';
import { useUserStore } from '../stores/userStore';
import type { Channel, Message, User } from '../types';

// Sample data to bootstrap the workspace
const sampleUsers: User[] = [
  {
    id: 'system-0',
    username: 'system',
    fullName: 'System Bot',
    createdAt: Date.now()
  },  
];

const sampleChannels: Channel[] = [
  {
    id: 'channel-general',
    name: 'general',
    description: 'General discussion channel',
    type: 'public',
    createdAt: Date.now(),
    createdBy: 'system-0',
    members: [],
  },
  {
    id: 'channel-random',
    name: 'random',
    description: 'Random topics and fun stuff',
    type: 'public',
    createdAt: Date.now(),
    createdBy: 'system-0',
    members: [],
  },
  {
    id: 'channel-help',
    name: 'help',
    description: 'Get help with anything',
    type: 'public',
    createdAt: Date.now(),
    createdBy: 'system-0',
    members: [],
  },
];

const sampleMessages: Record<string, Message[]> = {
  'channel-general': [
    {
      id: 'msg-1',
      channelId: 'channel-general',
      userId: 'system-0',
      text: 'Hello everyone! Welcome to our new chat app!',
      createdAt: Date.now()
    }    
  ],
  'channel-random': [
    {
      id: 'msg-4',
      channelId: 'channel-random',
      userId: 'system-0',
      text: 'This app came from github.com/WinstonFassett/yjs-chat',
      createdAt: Date.now()
    },    
  ],
  'channel-help': [
    {
      id: 'msg-6',
      channelId: 'channel-help',
      userId: 'system-0',
      text: 'If anyone needs help with the app, feel free to ask here!',
      createdAt: Date.now()
    },
  ],
};

export function initializeDefaultWorkspace() {
  const { getYDoc, getChannels, getMessages, isWorkspaceInitialized } = useYjsStore.getState();
  const { user: currentUser } = useUserStore.getState();
  
  if (!currentUser) return;
  
  // Only initialize if the workspace is empty
  if (isWorkspaceInitialized()) return;
  
  const ydoc = getYDoc();
  
  // Set up users
  const usersMap = ydoc.getMap('users');
  
  // Add the current user
  usersMap.set(currentUser.id, currentUser);
  
  // Add sample users
  sampleUsers.forEach(user => {
    usersMap.set(user.id, user);
  });
  
  // Set up channels
  const channelsMap = ydoc.getMap('channels');
  
  // Add sample channels
  sampleChannels.forEach(channel => {
    channelsMap.set(channel.id, channel);
  });
  
  // Set up messages
  const messagesMap = ydoc.getMap('messages');
  
  // Add sample messages
  Object.entries(sampleMessages).forEach(([channelId, messages]) => {
    const messagesArray = messagesMap.get(channelId) || [];
    messagesMap.set(channelId, [...messagesArray, ...messages]);
  });
  
  console.log('Default workspace initialized');
}

export function createChannel(name: string, description: string, type: 'public' | 'private' = 'public') {
  const { getYDoc } = useYjsStore.getState();
  const { user } = useUserStore.getState();
  
  if (!user) return null;
  
  const ydoc = getYDoc();
  const channelsMap = ydoc.getMap('channels');
  
  const newChannel: Channel = {
    id: `channel-${uuidv4()}`,
    name,
    description,
    type,
    createdAt: Date.now(),
    createdBy: user.id,
    members: type === 'private' ? [user.id] : [],
  };
  
  channelsMap.set(newChannel.id, newChannel);
  
  return newChannel;
}

export function createMessage(channelId: string, text: string, parentId?: string) {
  const { getYDoc } = useYjsStore.getState();
  const { user } = useUserStore.getState();
  
  if (!user) return null;
  
  const ydoc = getYDoc();
  const messagesMap = ydoc.getMap(parentId ? 'threads' : 'messages');
  
  const newMessage: Message = {
    id: `msg-${uuidv4()}`,
    channelId,
    userId: user.id,
    text,
    createdAt: Date.now(),
    ...(parentId && { parentId }),
  };
  
  const targetId = parentId || channelId;
  const messagesArray = messagesMap.get(targetId) || [];
  messagesMap.set(targetId, [...messagesArray, newMessage]);
  
  return newMessage;
}