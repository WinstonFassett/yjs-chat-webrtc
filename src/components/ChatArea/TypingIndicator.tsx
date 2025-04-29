import React, { useState, useEffect } from 'react';
import { useYjsStore } from '../../stores/yjsStore';

interface TypingIndicatorProps {
  userIds: string[];
}

export default function TypingIndicator({ userIds }: TypingIndicatorProps) {
  const { getUser } = useYjsStore();
  const [text, setText] = useState<string>('');
  
  useEffect(() => {
    if (userIds.length === 0) {
      setText('');
      return;
    }
    
    const names = userIds
      .map(id => {
        const user = getUser(id);
        return user ? (user.fullName || user.username) : null;
      })
      .filter(Boolean);
    
    if (names.length === 0) {
      setText('');
    } else if (names.length === 1) {
      setText(`${names[0]} is typing...`);
    } else if (names.length === 2) {
      setText(`${names[0]} and ${names[1]} are typing...`);
    } else {
      setText(`${names[0]} and ${names.length - 1} others are typing...`);
    }
  }, [userIds, getUser]);
  
  if (!text) return null;
  
  return (
    <div className="h-6 text-sm text-secondary-600 dark:text-secondary-400 flex items-center">
      <span>{text}</span>
      <span className="flex ml-1">
        <span className="animate-[bounce_1s_infinite_0ms] inline-block w-1 h-1 bg-secondary-500 dark:bg-secondary-400 rounded-full mx-0.5"></span>
        <span className="animate-[bounce_1s_infinite_200ms] inline-block w-1 h-1 bg-secondary-500 dark:bg-secondary-400 rounded-full mx-0.5"></span>
        <span className="animate-[bounce_1s_infinite_400ms] inline-block w-1 h-1 bg-secondary-500 dark:bg-secondary-400 rounded-full mx-0.5"></span>
      </span>
    </div>
  );
}