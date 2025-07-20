import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function linkify(text: string) {
  if (!text) return text;
  
  const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;
  const matches = [...text.matchAll(urlRegex)];

  if (matches.length === 0) {
    return text;
  }

  const result: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    const url = match[0];
    const index = match.index!;

    // Add text before the link
    if (index > lastIndex) {
      result.push(text.substring(lastIndex, index));
    }
    
    // Add the link
    const href = url.startsWith('www.') ? `http://${url}` : url;
    result.push(
      <a
        key={`link-${i}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );

    lastIndex = index + url.length;
  });

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
}

export function formatTimestamp(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'now';
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    
    // Format as date for anything older than a week
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
