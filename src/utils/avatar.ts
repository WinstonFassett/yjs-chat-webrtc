import md5 from 'md5';

export function getGravatarUrl(email: string, size = 80): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

export function getUserInitials(username: string, fullName?: string): string {
  if (fullName && fullName.trim()) {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  
  return username.substring(0, 2).toUpperCase();
}

export function getColorFromUsername(username: string): string {
  // A simple hash function to generate a consistent color for a username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to a hex color
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 45%)`;
}