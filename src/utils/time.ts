import { formatDistanceToNow, format } from 'date-fns';

export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If message is from today, show time
  if (date.toDateString() === now.toDateString()) {
    return format(date, 'h:mm a');
  }
  
  // If message is from this week, show day and time
  const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 7) {
    return format(date, 'EEE h:mm a');
  }
  
  // Otherwise show date
  return format(date, 'MMM d, yyyy');
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(timestamp, { addSuffix: true });
}