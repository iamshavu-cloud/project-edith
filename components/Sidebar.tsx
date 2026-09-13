'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home,
  BarChart3,
  Calendar,
  AlertTriangle,
  Users,
  BookOpen,
  Bot,
  Settings,
  Sparkles,
  Zap,
  Mic,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUser } from '@/lib/store';
import { User } from '@/types';

const navItems = [
  { href: '/', label: 'Home', icon: Home, badge: null },
  { href: '/attendance', label: 'Attendance', icon: BarChart3, badge: null },
  { href: '/my-day', label: 'My Day', icon: Calendar, badge: null },
  { href: '/cooked', label: "I'm Cooked", icon: AlertTriangle, badge: '🚨 SOS' },
  { href: '/scan', label: 'EDITH Scan', icon: Sparkles, badge: '📸' },
  { href: '/projects', label: 'Projects', icon: Users, badge: null },
  { href: '/subjects', label: 'Subjects', icon: BookOpen, badge: null },
  { href: '/ask', label: 'Ask EDITH', icon: Bot, badge: 'AI' },
  { href: '/voice', label: 'Voice EDITH', icon: Mic, badge: '🎙️ ORB' },
  { href: '/settings', label: 'Settings', icon: Settings, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border/80 bg-bg-secondary shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-border/70">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-wider text-text-primary">EDITH</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-accent/20 text-accent-hover border border-accent/30">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-text-muted font-medium">The AI Senior you needed</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Navigation</span>
        </div>
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-accent/15 text-accent-hover font-semibold border border-accent/30 shadow-sm shadow-indigo-950/40'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 shrink-0 transition-colors', active ? 'text-accent-hover' : 'text-text-muted')} />
                <span>{label}</span>
              </div>
              {badge && (
                <span
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                    badge.includes('SOS')
                      ? 'bg-status-danger-bg text-status-danger border-status-danger/30'
                      : 'bg-accent/10 text-accent-hover border-accent/20'
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Senior Status & Quick Tip */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-bg-elevated/70 border border-border/70">
        <div className="flex items-center gap-2 text-xs font-semibold text-accent-hover mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Senior's Wisdom</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          &quot;Never sacrifice attendance below 75% for an all-nighter. The penalty is NOT worth it.&quot;
        </p>
      </div>

      {/* User Profile Footer */}
      <div className="p-3.5 border-t border-border/80 bg-bg-card/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-bold text-accent-hover">
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-primary truncate">{user?.name || 'Shaurya'}</p>
            <p className="text-[11px] text-text-muted truncate">
              {user?.college ? `${user.college}` : 'Year 2 · Sem 3'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
