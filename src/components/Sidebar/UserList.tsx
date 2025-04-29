import React from 'react';
import { useYjsStore } from '../../stores/yjsStore';
import { getColorFromUsername, getUserInitials } from '../../utils/avatar';

interface UserListProps {
  onlineUsers: string[];
}

export default function UserList({ onlineUsers }: UserListProps) {
  const { getUser } = useYjsStore();

  return (
    <div className="px-3 pb-2 max-h-48 overflow-y-auto">
      {onlineUsers.map((userId) => {
        const user = getUser(userId);
        if (!user) return null;

        return (
          <div
            key={userId}
            className="flex items-center py-1.5 px-2 rounded-md hover:bg-secondary-200 dark:hover:bg-dark-600"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center bg-center bg-cover"
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
            <div className="ml-2 flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-secondary-900 dark:text-white">
                {user.fullName || user.username}
              </p>
            </div>
          </div>
        );
      })}

      {onlineUsers.length === 0 && (
        <div className="text-sm text-secondary-500 dark:text-secondary-400 py-2 px-2 text-center">
          No users online
        </div>
      )}
    </div>
  );
}