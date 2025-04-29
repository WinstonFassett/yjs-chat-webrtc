import React, { useState } from 'react';
import { X, Hash } from 'lucide-react';
import { useYjsStore } from '../../stores/yjsStore';
import { cn } from '../../utils/cn';

interface CreateChannelModalProps {
  onClose: () => void;
}

export default function CreateChannelModal({ onClose }: CreateChannelModalProps) {
  const { createChannel } = useYjsStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedName = name.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (!processedName) {
      setError('Channel name is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Create the channel
    const newChannel = createChannel(
      processedName,
      description.trim()
    );
    
    if (newChannel) {
      // Set current channel to the new one
      setIsLoading(false);
      useYjsStore.getState().setCurrentChannelId(newChannel.id);
      onClose();
    } else {
      setIsLoading(false);
      setError('Failed to create channel. Please try again.');
    }
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
            Create Channel
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-600 text-secondary-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="name" 
                className="block mb-1 text-sm font-medium text-secondary-700 dark:text-secondary-200"
              >
                Channel Name
              </label>
              <div className="flex">
                <div className="flex items-center px-3 rounded-l-md border border-r-0 border-secondary-300 dark:border-dark-500 bg-secondary-100 dark:bg-dark-600 text-secondary-500">
                  <Hash size={18} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. announcements"
                  className={cn(
                    "w-full px-3 py-2 bg-white dark:bg-dark-600 border rounded-r-md",
                    "focus:ring-2 focus:outline-none",
                    error 
                      ? "border-red-500 focus:ring-red-300 dark:focus:ring-red-800" 
                      : "border-secondary-300 dark:border-dark-500 focus:ring-primary-300 dark:focus:ring-primary-800"
                  )}
                />
              </div>
              {error ? (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              ) : (
                <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                  Use lowercase letters, numbers and hyphens. Spaces will be converted to hyphens.
                </p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="description" 
                className="block mb-1 text-sm font-medium text-secondary-700 dark:text-secondary-200"
              >
                Description (optional)
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this channel about?"
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
              disabled={isLoading || !name.trim()}
              className={cn(
                "px-4 py-2 rounded-md font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-800",
                isLoading || !name.trim()
                  ? "bg-secondary-300 dark:bg-dark-500 cursor-not-allowed text-secondary-500 dark:text-secondary-400"
                  : "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white"
              )}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Channel"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}