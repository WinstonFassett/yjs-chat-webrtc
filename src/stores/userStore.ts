import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getGravatarUrl } from '../utils/avatar';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useYjsStore } from './yjsStore';

interface UserState {
  user: User | null;
  setUser: (username: string, fullName?: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      
      setUser: (username: string, fullName?: string) => {
        const userId = `user-${uuidv4()}`;
        const user = {
          id: userId,
          username,
          fullName,
          avatar: getGravatarUrl(username),
          createdAt: Date.now(),
        };
        
        // Update the users map in YDoc
        const { ydoc } = useYjsStore.getState();
        if (ydoc) {
          const usersMap = ydoc.getMap('users');
          usersMap.set(userId, user);
        }
        
        set({ user });
      },
      
      updateUser: (updates: Partial<User>) => {
        set((state) => {
          if (!state.user) return state;
          
          const updatedUser = {
            ...state.user,
            ...updates,
            ...(updates.username && {
              avatar: getGravatarUrl(updates.username),
            }),
          };
          
          // Update the users map in YDoc
          const { ydoc } = useYjsStore.getState();
          if (ydoc) {
            const usersMap = ydoc.getMap('users');
            usersMap.set(updatedUser.id, updatedUser);
          }
          
          return { user: updatedUser };
        });
      },
      
      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: 'yjs-chat-user',
    }
  )
);