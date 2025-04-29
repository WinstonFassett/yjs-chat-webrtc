import React, { useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { MessageSquare } from 'lucide-react';
import { getGravatarUrl } from '../../utils/avatar';
import { cn } from '../../utils/cn';

export default function UserSetupModal() {
  const { setUser } = useUserStore();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate network delay for better UX
    setTimeout(() => {
      setUser(username.trim(), fullName.trim() || undefined);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-secondary-50 dark:bg-dark-800 flex items-center justify-center p-4">
      <div 
        className={cn(
          "w-full max-w-md bg-white dark:bg-dark-700 rounded-lg shadow-xl",
          "p-6 md:p-8 animate-fade-in"
        )}
      >
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary-500 rounded-full p-3">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-secondary-900 dark:text-white">
          Welcome to YJS Chat
        </h1>
        
        <p className="text-center text-secondary-600 dark:text-secondary-300 mb-6">
          Please set up your profile to get started
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="username" 
              className="block mb-1 text-sm font-medium text-secondary-700 dark:text-secondary-200"
            >
              Username (required)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="johndoe"
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
              placeholder="John Doe"
              className={cn(
                "w-full px-3 py-2 bg-white dark:bg-dark-600 border rounded-md",
                "border-secondary-300 dark:border-dark-500",
                "focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-800 focus:outline-none"
              )}
            />
          </div>
          
          {username && (
            <div className="flex items-center mt-4 mb-2">
              <div className="mr-3">
                <img 
                  src={getGravatarUrl(username, 48)} 
                  alt="Avatar preview" 
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  Your Gravatar preview
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  Using your username as Gravatar email
                </p>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className={cn(
              "w-full py-2 px-4 rounded-md font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700",
              isLoading || !username.trim()
                ? "bg-secondary-300 dark:bg-dark-500 cursor-not-allowed text-secondary-500 dark:text-secondary-400"
                : "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up...
              </span>
            ) : (
              "Get Started"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}