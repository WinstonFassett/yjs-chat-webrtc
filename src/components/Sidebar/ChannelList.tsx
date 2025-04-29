import React from 'react';
import { cn } from '../../utils/cn';
import { Hash, Archive } from 'lucide-react';
import type { Channel } from '../../types';

interface ChannelListProps {
  channels: Record<string, Channel>;
  currentChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export default function ChannelList({
  channels,
  currentChannelId,
  onSelectChannel,
}: ChannelListProps) {
  // Sort channels: active first, then archived, both sorted by name
  const sortedChannels = Object.values(channels).sort((a, b) => {
    if (a.archived !== b.archived) {
      return a.archived ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="px-2 pb-2">
      {sortedChannels.map((channel) => (
        <button
          key={channel.id}
          className={cn(
            "w-full text-left px-2 py-1.5 rounded-md mb-1 flex items-center justify-between",
            "hover:bg-secondary-200 dark:hover:bg-dark-600 transition-colors duration-150",
            currentChannelId === channel.id
              ? "bg-secondary-200 dark:bg-dark-600"
              : "text-secondary-800 dark:text-secondary-200",
            channel.archived && "opacity-75"
          )}
          onClick={() => onSelectChannel(channel.id)}
        >
          <div className="flex items-center min-w-0">
            <span className="mr-2 text-secondary-600 dark:text-secondary-400">
              <Hash size={18} />
            </span>
            <span className="truncate font-medium">
              {channel.name}
            </span>
          </div>
          {channel.archived && (
            <span className="text-secondary-500 dark:text-secondary-400">
              <Archive size={16} />
            </span>
          )}
        </button>
      ))}
      
      {sortedChannels.length === 0 && (
        <div className="text-sm text-secondary-500 dark:text-secondary-400 py-2 px-3 text-center">
          No channels found
        </div>
      )}
    </div>
  );
}