import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatTime(timeStr: string): string {
  try {
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
}

export function formatRelative(dateStr: string): string {
  try {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diffSec = Math.round((target - now) / 1000);

    if (diffSec < 0) {
      const pastHours = Math.abs(Math.round(diffSec / 3600));
      if (pastHours < 24) return `${pastHours}h ago`;
      return `${Math.round(pastHours / 24)}d ago`;
    }

    const futureHours = Math.round(diffSec / 3600);
    if (futureHours < 1) return 'in less than an hour';
    if (futureHours < 24) return `in ${futureHours} hours`;
    const days = Math.round(futureHours / 24);
    return `in ${days} day${days !== 1 ? 's' : ''}`;
  } catch {
    return dateStr;
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  const morningGreetings = [
    "Yo, good morning 👋",
    "Morning gang. Let's get this bread.",
    "Rise and grind, bestie 🌅",
    "Good morning! Hope you slept. We got work today.",
  ];
  const afternoonGreetings = [
    "Afternoon gng 👋",
    "Midday check-in. You locked in?",
    "Hey — hope your morning wasn't too chaotic.",
    "Afternoon fam. Let's finish strong.",
  ];
  const eveningGreetings = [
    "Evening, fam 🌆",
    "Yo, evening. Let's see what's left on the board.",
    "Final stretch of the day, gang.",
    "Evening. How we feeling about today?",
  ];
  const nightGreetings = [
    "It's late, broski. Still going? 🌙",
    "Night owl mode activated 🦉",
    "Bro it's late. Respect the grind, but don't forget to sleep.",
    "Late night session. We locked in.",
  ];

  let pool: string[];
  if (hour >= 5 && hour < 12) pool = morningGreetings;
  else if (hour >= 12 && hour < 17) pool = afternoonGreetings;
  else if (hour >= 17 && hour < 21) pool = eveningGreetings;
  else pool = nightGreetings;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getStatusColor(status: 'safe' | 'warning' | 'danger'): string {
  if (status === 'safe') return 'text-status-success';
  if (status === 'warning') return 'text-status-warning';
  return 'text-status-danger';
}

export function getStatusBg(status: 'safe' | 'warning' | 'danger'): string {
  if (status === 'safe') return 'bg-status-success-bg border-status-success/20';
  if (status === 'warning') return 'bg-status-warning-bg border-status-warning/20';
  return 'bg-status-danger-bg border-status-danger/20';
}

export function getStatusEmoji(status: 'safe' | 'warning' | 'danger'): string {
  if (status === 'safe') return '🟢';
  if (status === 'warning') return '🟡';
  return '🔴';
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    urgent: 'text-status-danger font-semibold',
    critical: 'text-status-danger font-semibold',
    high: 'text-orange-400 font-medium',
    medium: 'text-status-warning',
    low: 'text-text-secondary',
  };
  return map[priority] || 'text-text-secondary';
}

export function minutesToReadable(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}
