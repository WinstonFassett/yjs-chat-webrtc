import React, { useState } from 'react';
import { X, Hash, AlertTriangle } from 'lucide-react';
import { useYjsStore } from '../../stores/yjsStore';
import { cn } from '../../utils/cn';
import type { Channel } from '../../types';

interface ChannelSettingsModalProps {
  channel: Channel;
  onClose: () => void;
}

export default function ChannelSettingsModal({ channel, onClose }: ChannelSettingsModalProps) {
  const { updateChannel, archiveChannel, deleteChannel } = useYjsStore();
  
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedName = name.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (!processedName) {
      setError('Channel name is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const success = updateChannel({
      ...channel,
      name: processedName,
      description: description.trim(),
    });
    
    if (success) {
      setIsLoading(false);
      onClose();
    } else {
      setIsLoading(false);
      setError('Failed to update channel. Please try again.');
    }
  };
  
  const handleArchive = () => {
    archiveChannel(channel.id);
    setShowArchiveConfirm(false);
  };
  
  const handleDelete = () => {
    if (deleteChannel(channel.id)) {
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white dark:bg-dark-700 rounded-lg shadow-xl animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-dark-600">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
            Channel Settings
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
                  className={cn(
                    "w-full px-3 py-2 bg-white dark:bg-dark-600 border rounded-r-md",
                    "focus:ring-2 focus:outline-none",
                    error 
                      ? "border-red-500 focus:ring-red-300 dark:focus:ring-red-800" 
                      : "border-secondary-300 dark:border-dark-500 focus:ring-primary-300 dark:focus:ring-primary-800"
                  )}
                />
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
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
                className={cn(
                  "w-full px-3 py-2 bg-white dark:bg-dark-600 border rounded-md",
                  "border-secondary-300 dark:border-dark-500",
                  "focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-800 focus:outline-none"
                )}
              />
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(true)}
                className="px-4 py-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md"
              >
                {channel.archived ? 'Unarchive Channel' : 'Archive Channel'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                Delete Channel
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
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
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
        
        {/* Archive confirmation dialog */}
        {showArchiveConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-white dark:bg-dark-700 rounded-lg shadow-xl animate-fade-in p-6">
              <div className="flex items-center mb-4 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">
                  {channel.archived ? 'Unarchive Channel?' : 'Archive Channel?'}
                </h3>
              </div>
              
              <p className="text-secondary-600 dark:text-secondary-300 mb-6">
                {channel.archived
                  ? `This will unarchive #${channel.name} and make it writable again.`
                  : `This will archive #${channel.name} and make it read-only for all users.`}
              </p>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 py-2 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-dark-600 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchive}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md"
                >
                  {channel.archived ? 'Unarchive Channel' : 'Archive Channel'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-white dark:bg-dark-700 rounded-lg shadow-xl animate-fade-in p-6">
              <div className="flex items-center mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Delete Channel?</h3>
              </div>
              
              <p className="text-secondary-600 dark:text-secondary-300 mb-6">
                This will permanently delete #{channel.name} and all its messages. This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-dark-600 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                >
                  Delete Channel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}