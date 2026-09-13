'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  AlertTriangle,
  Users,
  Bot,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  getGreeting,
  getStatusColor,
  getStatusEmoji,
  formatRelative,
  cn,
} from '@/lib/utils';
import {
  getSubjects,
  getTasks,
  getSchedule,
  getProjects,
  loadDemoData,
  getUser,
} from '@/lib/store';
import { overallAttendance } from '@/lib/attendance';
import type { SubjectWithAttendance, Task, ScheduleItem, ProjectWithDetails, User } from '@/types';

const quickCommands = [
  { label: 'Am I cooked?', emoji: '🚨', href: '/cooked', sub: 'Exam emergency mode' },
  { label: 'Check attendance', emoji: '📊', href: '/attendance', sub: 'Bunk budget math' },
  { label: 'Plan my day', emoji: '📅', href: '/my-day', sub: 'Realistic schedule' },
  { label: "What's due?", emoji: '⏰', href: '/cooked', sub: 'Assignments & tasks' },
  { label: 'Project status', emoji: '👥', href: '/projects', sub: "What's team doing?" },
  { label: 'Ask EDITH', emoji: '🤖', href: '/ask', sub: 'Talk to your senior' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState('');
  const [subjects, setSubjects] = useState<SubjectWithAttendance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if store initialized; if not, seed realistic college data
    let existingUser = getUser();
    if (!existingUser) {
      loadDemoData();
      existingUser = getUser();
    }
    setUser(existingUser);
    setGreeting(getGreeting());
    setSubjects(getSubjects());
    setTasks(getTasks());

    const todayStr = new Date().toISOString().split('T')[0];
    setSchedule(getSchedule(todayStr));
    setProjects(getProjects());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Attendance Metrics
  const overall = overallAttendance(subjects);
  const dangerSubjects = subjects.filter((s) => s.status === 'danger');
  const warningSubjects = subjects.filter((s) => s.status === 'warning');
  const totalBunksLeft = subjects.reduce((sum, s) => sum + s.bunks_allowed, 0);

  const bestSubject = subjects.reduce(
    (best, s) => (!best || s.attendance_percent > best.attendance_percent ? s : best),
    null as SubjectWithAttendance | null
  );
  const worstSubject = subjects.reduce(
    (worst, s) => (!worst || s.attendance_percent < worst.attendance_percent ? s : worst),
    null as SubjectWithAttendance | null
  );

  // Today's schedule metrics
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentActivity = schedule.find((s) => s.start_time <= currentTime && s.end_time > currentTime);
  const nextActivity = schedule.find((s) => s.start_time > currentTime && !s.completed);
  const completedCount = schedule.filter((s) => s.completed).length;
  const remainingCount = schedule.length - completedCount;
  const scheduleProgress = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0;

  // Urgent tasks and "Cooked" preview
  const urgentTasks = tasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done');
  const upcomingDeadlines = tasks
    .filter((t) => t.deadline && t.status !== 'done')
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 2);

  // Group projects metrics
  const activeProjects = projects.filter((p) => p.progress < 100);
  const totalProjectTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const pendingProjectTasks = projects.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.status !== 'done').length,
    0
  );

  // Attention Counter
  const attentionItemsCount = dangerSubjects.length + urgentTasks.length + (upcomingDeadlines.length > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-bg-primary p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Hero Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">
              {greeting}
            </h1>
          </div>
          <p className="text-text-secondary text-sm md:text-base">
            {attentionItemsCount > 0 ? (
              <>
                <span className="text-status-warning font-bold underline decoration-status-warning/40 underline-offset-4">
                  {attentionItemsCount} things
                </span>{' '}
                need your attention today, {user?.name || 'gang'}. Let&apos;s handle it.
              </>
            ) : (
              <>Everything is on track. We&apos;re chilling today, {user?.name || 'gang'}. 😎</>
            )}
          </p>
        </div>

        {/* Date and Quick Senior Quote */}
        <div className="text-right shrink-0">
          <div className="text-xs uppercase tracking-wider font-bold text-text-muted">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-accent-hover font-semibold mt-0.5">
            {user?.college ? `${user.college}` : 'College Mode Active'}
          </div>
        </div>
      </div>

      {/* Primary Signature Call to Action: ASK EDITH */}
      <div
        onClick={() => router.push('/ask')}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-bg-card border border-accent/40 p-6 shadow-xl shadow-indigo-950/30 cursor-pointer group hover:border-accent/70 transition-all duration-200"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/25 border border-accent/40 flex items-center justify-center text-accent-hover shadow-lg shadow-accent/25 group-hover:scale-105 transition-transform shrink-0">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">ASK EDITH</h2>
                <Badge variant="accent" size="sm">
                  Active Senior
                </Badge>
              </div>
              <p className="text-sm text-text-secondary mt-0.5 max-w-xl">
                &ldquo;Can I bunk Physics?&rdquo; • &ldquo;Am I cooked for Maths?&rdquo; • &ldquo;What is Rohan doing in our project?&rdquo; • &ldquo;Plan my evening&rdquo;
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <Button variant="primary" size="md" icon={<Sparkles className="w-4 h-4" />}>
              Open Chat
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Core Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CARD 1: 📊 Attendance */}
        <Card onClick={() => router.push('/attendance')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <CardTitle>Attendance</CardTitle>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary" />
          </CardHeader>

          <div className="flex items-baseline justify-between mb-2">
            <CardValue className={overall >= 75 ? 'text-status-success' : 'text-status-danger'}>
              {overall}%
            </CardValue>
            <span className="text-xs text-text-muted">Required: 75%</span>
          </div>

          <Progress value={overall} size="sm" color="auto" className="mb-4" />

          {/* Contextual Slang & Real Calculations */}
          <div className="p-3 rounded-xl bg-bg-elevated/70 border border-border/70 space-y-2 text-xs">
            {dangerSubjects.length > 0 ? (
              <div className="flex items-center justify-between text-status-danger font-medium">
                <span>🔴 {dangerSubjects[0].name} is looking kinda rough 💀</span>
                <span className="font-bold">{dangerSubjects[0].attendance_percent}%</span>
              </div>
            ) : (
              <div className="text-status-success font-medium flex items-center gap-1.5">
                <span>🟢 All subjects above threshold. We&apos;re chilling.</span>
              </div>
            )}

            <div className="flex items-center justify-between text-text-secondary pt-1 border-t border-border/40">
              <span>Total available bunk budget:</span>
              <span className="text-text-primary font-bold">{totalBunksLeft} lecture{totalBunksLeft !== 1 ? 's' : ''}</span>
            </div>

            {worstSubject && worstSubject.status === 'danger' && (
              <p className="text-[11px] text-text-muted italic">
                Need {worstSubject.lectures_needed} consecutive lectures in {worstSubject.name} to hit 75%.
              </p>
            )}
          </div>
        </Card>

        {/* CARD 2: 📅 Today's Plan */}
        <Card onClick={() => router.push('/my-day')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <CardTitle>Today&apos;s Plan</CardTitle>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </CardHeader>

          {currentActivity ? (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>NOW IN PROGRESS</span>
              </div>
              <p className="text-lg font-bold text-text-primary truncate">{currentActivity.title}</p>
              <p className="text-xs text-text-muted">{currentActivity.start_time} – {currentActivity.end_time}</p>
            </div>
          ) : (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs text-text-muted font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>CURRENTLY</span>
              </div>
              <p className="text-lg font-bold text-text-primary">Free Window / Buffer ☕</p>
              <p className="text-xs text-text-muted">No scheduled classes right this moment</p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-bg-elevated/70 border border-border/70 text-xs space-y-1.5">
            {nextActivity ? (
              <div className="flex items-center justify-between text-text-secondary">
                <span>Next up:</span>
                <span className="font-semibold text-text-primary">
                  {nextActivity.title} ({nextActivity.start_time})
                </span>
              </div>
            ) : (
              <p className="text-text-muted">All scheduled events completed for today!</p>
            )}

            <div className="pt-2">
              <div className="flex justify-between items-center text-[11px] text-text-muted mb-1">
                <span>Daily completion</span>
                <span>{completedCount}/{schedule.length} done ({remainingCount} left)</span>
              </div>
              <Progress value={scheduleProgress} size="xs" color="accent" />
            </div>
          </div>
        </Card>

        {/* CARD 3: 🚨 I'm Cooked */}
        <Card onClick={() => router.push('/cooked')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <CardTitle>I&apos;m Cooked 🚨</CardTitle>
            </div>
            <Badge variant="danger" size="sm">Emergency SOS</Badge>
          </CardHeader>

          {urgentTasks.length > 0 ? (
            <div className="space-y-3">
              <div>
                <CardValue className="text-red-400 text-2xl">
                  {urgentTasks.length} High-Risk Item{urgentTasks.length !== 1 ? 's' : ''}
                </CardValue>
                <p className="text-xs text-text-muted mt-0.5">Calculated prep percentage is low</p>
              </div>

              <div className="p-3 rounded-xl bg-status-danger-bg/60 border border-status-danger/30 space-y-1.5 text-xs">
                {urgentTasks.slice(0, 2).map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-text-primary font-medium truncate">{t.title}</span>
                    {t.deadline && (
                      <span className="text-red-400 font-semibold shrink-0 ml-2">
                        {formatRelative(t.deadline)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Cooked Meter: <strong className="text-status-danger">68% (Getting Cooked 💀)</strong></span>
                <span className="text-accent-hover font-medium underline">Recovery Plan →</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-1">
              <p className="text-2xl">😎</p>
              <p className="text-sm font-bold text-text-primary">Cooked Meter: 12%</p>
              <p className="text-xs text-text-muted">You&apos;re chilling. No immediate emergencies.</p>
            </div>
          )}
        </Card>

        {/* CARD 4: 👥 Group Projects */}
        <Card onClick={() => router.push('/projects')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
              <CardTitle>Group Projects</CardTitle>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </CardHeader>

          {activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.slice(0, 1).map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-base font-bold text-text-primary truncate">{p.name}</span>
                    <span className="text-sm font-extrabold text-accent-hover">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} size="sm" color="accent" className="mb-3" />

                  <div className="p-3 rounded-xl bg-bg-elevated/70 border border-border/70 space-y-1 text-xs">
                    <div className="flex justify-between text-text-secondary">
                      <span>Team size:</span>
                      <span className="font-semibold text-text-primary">{p.members.length} members</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Pending project tasks:</span>
                      <span className="font-semibold text-status-warning">
                        {p.tasks.filter((t) => t.status !== 'done').length} tasks
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted pt-1 border-t border-border/40">
                      EDITH update: &ldquo;We&apos;re at {p.progress}%, gang. Rohan&apos;s backend task hasn&apos;t been updated yet.&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center space-y-1">
              <p className="text-2xl">👥</p>
              <p className="text-sm font-bold text-text-primary">No Active Group Projects</p>
              <p className="text-xs text-text-muted">Create a project to track who is slacking</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Commands Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Quick Senior Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickCommands.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => router.push(cmd.href)}
              className="flex flex-col items-start p-3.5 rounded-xl bg-bg-card border border-border/80 hover:border-accent/50 hover:bg-bg-elevated transition-all text-left group"
            >
              <span className="text-xl mb-1.5 group-hover:scale-110 transition-transform">{cmd.emoji}</span>
              <span className="text-xs font-bold text-text-primary group-hover:text-accent-hover transition-colors">
                {cmd.label}
              </span>
              <span className="text-[10px] text-text-muted truncate w-full">{cmd.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
