import React, { useState, useEffect } from 'react';
import { useYjsStore } from '../../stores/yjsStore';
import { useUserStore } from '../../stores/userStore';
import { useTheme } from '../../components/ThemeProvider';
import { Sun, Moon, Plus, Settings, LogOut } from 'lucide-react';
import { getColorFromUsername, getUserInitials } from '../../utils/avatar';
import { cn } from '../../utils/cn';
import ChannelList from './ChannelList';
import UserList from './UserList';
import SettingsModal from '../Modals/SettingsModal';
import CreateChannelModal from '../Modals/CreateChannelModal';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUserStore();
  const { getOnlineUsers, getChannels, currentChannelId, setCurrentChannelId } = useYjsStore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [channels, setChannels] = useState<Record<string, any>>({});
  
  // Update online users periodically
  useEffect(() => {
    const updateOnlineUsers = () => {
      setOnlineUsers(getOnlineUsers());
    };
    
    updateOnlineUsers();
    const interval = setInterval(updateOnlineUsers, 5000);
    
    return () => clearInterval(interval);
  }, [getOnlineUsers]);
  
  // Update channels list
  useEffect(() => {
    const updateChannels = () => {
      setChannels(getChannels());
    };
    
    updateChannels();
    const interval = setInterval(updateChannels, 2000);
    
    return () => clearInterval(interval);
  }, [getChannels]);
  
  return (
    <>
      <div className="w-64 h-full bg-secondary-100 dark:bg-dark-700 border-r border-secondary-200 dark:border-dark-600 flex flex-col">
        {/* Sidebar header */}
        <div className="p-4 border-b border-secondary-200 dark:border-dark-600">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl text-secondary-900 dark:text-white">YJS Chat</h1>
            <div className="flex space-x-2">
              <button 
                onClick={toggleTheme} 
                className="p-1.5 rounded-md hover:bg-secondary-200 dark:hover:bg-dark-600 text-secondary-700 dark:text-secondary-200"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Channels section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-600 dark:text-secondary-400">
              Channels
            </h2>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="p-1 rounded hover:bg-secondary-200 dark:hover:bg-dark-600 text-secondary-600 dark:text-secondary-400"
              aria-label="Create channel"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <ChannelList
            channels={channels}
            currentChannelId={currentChannelId}
            onSelectChannel={setCurrentChannelId}
          />
        </div>
        
        {/* Online users section */}
        <div className="border-t border-secondary-200 dark:border-dark-600">
          <div className="p-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-600 dark:text-secondary-400">
              Online • {onlineUsers.length}
            </h2>
          </div>
          
          <UserList onlineUsers={onlineUsers} />
        </div>
        
        {/* User section */}
        {user && (
          <div className="p-3 border-t border-secondary-200 dark:border-dark-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-center bg-cover"
                  style={{ 
                    backgroundColor: user.avatar ? 'transparent' : getColorFromUsername(user.username),
                    backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                  }}
                >
                  {!user.avatar && (
                    <span className="text-xs font-medium text-white">
                      {getUserInitials(user.username, user.fullName)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 ml-2">
                  <p className="text-sm font-medium truncate text-secondary-900 dark:text-white">
                    {user.fullName || user.username}
                  </p>
                  {user.fullName && (
                    <p className="text-xs truncate text-secondary-600 dark:text-secondary-400">
                      @{user.username}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setShowSettings(true)}
                  className={cn(
                    "p-1.5 rounded-md hover:bg-secondary-200 dark:hover:bg-dark-600",
                    "text-secondary-700 dark:text-secondary-200 mr-1"
                  )}
                  aria-label="User settings"
                >
                  <Settings size={16} />
                </button>
                <button
                  onClick={logout}
                  className={cn(
                    "p-1.5 rounded-md hover:bg-secondary-200 dark:hover:bg-dark-600",
                    "text-secondary-700 dark:text-secondary-200"
                  )}
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
      
      {showCreateChannel && (
        <CreateChannelModal onClose={() => setShowCreateChannel(false)} />
      )}
    </>
  );
}