'use client';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  AlertCircle,
  Coffee,
  Dumbbell,
  BookOpen,
  GraduationCap,
  ArrowRight,
  RefreshCw,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toaster';
import {
  getSchedule,
  addScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  loadDemoData,
  getUser,
} from '@/lib/store';
import { formatTime } from '@/lib/utils';
import type { ScheduleItem, ScheduleItemType } from '@/types';

export default function MyDayPage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState<ScheduleItem | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('15:00');
  const [newType, setNewType] = useState<ScheduleItemType>('study');

  const todayStr = new Date().toISOString().split('T')[0];

  const reload = () => {
    if (!getUser()) loadDemoData();
    const items = getSchedule(todayStr).sort((a, b) => a.start_time.localeCompare(b.start_time));
    setSchedule(items);
  };

  useEffect(() => {
    reload();
  }, []);

  const completed = schedule.filter((s) => s.completed).length;
  const progress = schedule.length > 0 ? Math.round((completed / schedule.length) * 100) : 0;

  const toggleTask = (item: ScheduleItem) => {
    updateScheduleItem(item.id, { completed: !item.completed });
    if (!item.completed) {
      toast(`Completed: ${item.title}`, { type: 'success' });
    }
    reload();
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addScheduleItem({
      title: newTitle.trim(),
      start_time: newStartTime,
      end_time: newEndTime,
      type: newType,
      date: todayStr,
      completed: false,
    });

    toast(`Added to schedule: ${newTitle}`, { type: 'success' });
    setNewTitle('');
    setAddModal(false);
    reload();
  };

  const handleDeleteItem = (id: string) => {
    deleteScheduleItem(id);
    toast('Event removed from schedule', { type: 'info' });
    reload();
  };

  const handleApplyReschedule = (item: ScheduleItem) => {
    // EDITH intelligent dynamic reschedule proposal
    updateScheduleItem(item.id, {
      start_time: '21:00',
      end_time: '22:15',
      completed: false,
      notes: 'Rescheduled by EDITH to evening buffer window',
    });
    toast(`Rescheduled ${item.title} to 21:00!`, {
      type: 'success',
      description: "Shifted lower-priority evening chill buffer. You're locked in.",
    });
    setRescheduleModal(null);
    reload();
  };

  const getTypeIcon = (type: ScheduleItemType) => {
    switch (type) {
      case 'class':
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case 'study':
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'gym':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'meal':
      case 'break':
      case 'buffer':
        return <Coffee className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-7 h-7 text-accent" />
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Plan My Day</h1>
          </div>
          <p className="text-sm text-text-secondary">
            Realistic time-blocking. Class + study + gym + food. No robotic burnout.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setAddModal(true)}>
          Add Block
        </Button>
      </div>

      {/* Senior Schedule Wisdom Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/15 via-bg-card to-bg-card border border-accent/30 flex items-start gap-3.5 shadow-md">
        <Sparkles className="w-5 h-5 text-accent-hover shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-text-primary">EDITH&apos;s Anti-Burnout Rule</p>
          <p className="text-text-secondary leading-relaxed">
            &ldquo;I&apos;ve deliberately built in buffers and meal gaps because you are a college student, not a factory robot.
            If you fall behind on a task, hit &lsquo;Didn&apos;t Finish&rsquo; and I&apos;ll auto-rebalance your night.&rdquo; 😭
          </p>
        </div>
      </div>

      {/* Daily Progress Tracker */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Today&apos;s Schedule Completion</h3>
            <p className="text-xs text-text-muted">
              {completed} of {schedule.length} time blocks checked off
            </p>
          </div>
          <span className="text-2xl font-black text-accent-hover">{progress}%</span>
        </div>
        <Progress value={progress} size="md" color="accent" />
      </Card>

      {/* Interactive Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Daily Timeline ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
          </h2>
          <span className="text-xs text-text-muted">Tap checkmark to complete or reschedule</span>
        </div>

        <div className="space-y-2.5">
          {schedule.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                item.completed
                  ? 'bg-bg-card/40 border-border/50 opacity-60'
                  : 'bg-bg-card border-border hover:border-accent/40 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={() => toggleTask(item)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                    item.completed
                      ? 'bg-status-success border-status-success text-white'
                      : 'border-border hover:border-text-primary'
                  }`}
                >
                  {item.completed && <Check className="w-4 h-4" />}
                </button>

                <div className="shrink-0">{getTypeIcon(item.type)}</div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold text-text-primary truncate ${
                      item.completed ? 'line-through text-text-muted' : ''
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatTime(item.start_time)} – {formatTime(item.end_time)}
                    {item.notes && <span className="text-accent-hover ml-2">• {item.notes}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!item.completed && (
                  <button
                    onClick={() => setRescheduleModal(item)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="hidden sm:inline">Didn&apos;t finish?</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-text-muted hover:text-red-400 p-1 rounded"
                  title="Delete time block"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {schedule.length === 0 && (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl">
              <Calendar className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm font-medium text-text-secondary">No schedule items for today.</p>
              <p className="text-xs text-text-muted mt-1">Click &ldquo;Add Block&rdquo; to plan your hours.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Reschedule Proposal Modal */}
      {rescheduleModal && (
        <Modal
          open={!!rescheduleModal}
          onClose={() => setRescheduleModal(null)}
          title="Dynamic Reschedule"
          description={`Rebalancing your schedule for: ${rescheduleModal.title}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-bg-card border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-accent-hover">
                <Sparkles className="w-4 h-4" />
                <span>EDITH&apos;s Proposal:</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                &ldquo;No stress broski. We&apos;ve got a 2-hour window tonight after 9:00 PM. I&apos;ll move{' '}
                <strong className="text-text-primary">{rescheduleModal.title}</strong> to 21:00–22:15 and shift the lower-priority stuff. You still hit gym and dinner.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-bg-elevated border border-border">
                <p className="text-text-muted">Original Time</p>
                <p className="font-bold text-red-400">
                  {formatTime(rescheduleModal.start_time)} – {formatTime(rescheduleModal.end_time)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-bg-elevated border border-border">
                <p className="text-text-muted">Proposed New Slot</p>
                <p className="font-bold text-emerald-400">21:00 PM – 22:15 PM</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setRescheduleModal(null)}>
                Reject (Leave as is)
              </Button>
              <Button variant="primary" onClick={() => handleApplyReschedule(rescheduleModal)}>
                Accept & Shift Schedule
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Block Modal */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Add Schedule Block"
        description="Block out time for classes, study sessions, gym or food"
        size="md"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <Input
            label="Activity Title"
            placeholder="e.g. Python LeetCode Practice"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time (24h)"
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time (24h)"
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              required
            />
          </div>

          <Select
            label="Activity Type"
            value={newType}
            onChange={(e) => setNewType(e.target.value as ScheduleItemType)}
          >
            <option value="class">College Class / Lecture</option>
            <option value="study">Deep Study / Revision</option>
            <option value="assignment">Assignment Work</option>
            <option value="gym">Gym / Sports / Fitness</option>
            <option value="meal">Breakfast / Lunch / Dinner</option>
            <option value="break">Rest / Buffer Time</option>
            <option value="personal">Personal / Life</option>
          </Select>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Block
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
