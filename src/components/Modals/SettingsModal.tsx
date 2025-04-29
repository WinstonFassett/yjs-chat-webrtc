import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { getGravatarUrl } from '../../utils/avatar';
import { cn } from '../../utils/cn';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { user, updateUser } = useUserStore();
  
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setFullName(user.fullName || '');
    }
  }, [user]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setIsSuccess(false);
    
    updateUser({
      username: username.trim(),
      fullName: fullName.trim() || undefined,
    });
    
    setIsLoading(false);
    setIsSuccess(true);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div 
        className={cn(
          "w-full max-w-md bg-white dark:bg-dark-700 rounded-lg shadow-xl",
          "animate-fade-in"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-dark-600">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
            Profile Settings
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-600 text-secondary-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-start mb-6">
            <div className="mr-4">
              <img 
                src={username ? getGravatarUrl(username, 64) : ''} 
                alt="Avatar preview" 
                className="w-16 h-16 rounded-full"
              />
            </div>
            <div>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                Your avatar is based on Gravatar
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                Change your avatar by updating your Gravatar
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="username" 
                className="block mb-1 text-sm font-medium text-secondary-700 dark:text-secondary-200"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className={cn(
                  "w-full px-3 py-2 bg-white dark:bg-dark-600 border rounded-md",
                  "focus:ring-2 focus:outline-none",
                  error 
                    ? "border-red-500 focus:ring-red-300 dark:focus:ring-red-800" 
                    : "border-secondary-300 dark:border-dark-500 focus:ring-primary-300 dark:focus:ring-primary-800"
                )}
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="fullName" 
                className="block mb-1 text-sm font-medium text-secondary-700 dark:text-secondary-200"
              >
                Full Name (optional)
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 bg-white dark:bg-dark-600 border rounded-md",
                  "border-secondary-300 dark:border-dark-500",
                  "focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-800 focus:outline-none"
                )}
              />
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "px-4 py-2 border border-secondary-300 dark:border-dark-500 rounded-md",
                "text-secondary-700 dark:text-secondary-200",
                "hover:bg-secondary-100 dark:hover:bg-dark-600",
                "focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-800"
              )}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading || isSuccess || !username.trim()}
              className={cn(
                "px-4 py-2 rounded-md font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-800",
                isSuccess
                  ? "bg-green-500 text-white"
                  : isLoading || !username.trim()
                    ? "bg-secondary-300 dark:bg-dark-500 cursor-not-allowed text-secondary-500 dark:text-secondary-400"
                    : "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white"
              )}
            >
              {isSuccess ? "Saved!" : isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}