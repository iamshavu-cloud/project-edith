'use client';
import { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  ListTodo,
  ArrowRight,
  ShieldAlert,
  Coffee,
  Check,
  CalendarPlus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toaster';
import { assessCooked } from '@/lib/cookedMeter';
import { addScheduleItem, addTask } from '@/lib/store';
import type { CookedInput, CookedResult, PlanItem } from '@/types';

export default function CookedPage() {
  const [type, setType] = useState<'exam' | 'assignment' | 'project' | 'deadline'>('exam');
  const [title, setTitle] = useState('Maths Midterm Examination');
  const [prepPercent, setPrepPercent] = useState(25);
  const [hoursAvailable, setHoursAvailable] = useState(6);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 3600000).toISOString().slice(0, 16)
  );
  const [syllabus, setSyllabus] = useState(
    'Double & Triple Integrals\nGreen & Stokes Theorem\nDifferential Equations\nLaplace Transforms'
  );

  const [result, setResult] = useState<CookedResult | null>(() => {
    return assessCooked({
      type: 'exam',
      title: 'Maths Midterm Examination',
      deadline: new Date(Date.now() + 14 * 3600000).toISOString(),
      prep_percent: 25,
      hours_available: 6,
      syllabus: 'Double & Triple Integrals\nGreen & Stokes Theorem\nDifferential Equations\nLaplace Transforms',
    });
  });

  const [planState, setPlanState] = useState<Record<string, boolean>>({});

  const handleAssess = (e: React.FormEvent) => {
    e.preventDefault();
    const input: CookedInput = {
      type,
      title: title.trim() || 'College Assessment',
      deadline,
      prep_percent: Number(prepPercent),
      hours_available: Number(hoursAvailable),
      syllabus: syllabus.trim(),
    };

    const evaluated = assessCooked(input);
    setResult(evaluated);
    setPlanState({});
    toast(`Cooked Meter: ${evaluated.score}% — ${evaluated.label}`, {
      type: evaluated.score >= 60 ? 'error' : 'info',
    });
  };

  const toggleComplete = (item: PlanItem) => {
    setPlanState((prev) => ({
      ...prev,
      [item.id]: !prev[item.id],
    }));
    if (!planState[item.id]) {
      toast(`Completed: ${item.title}`, { type: 'success' });
    }
  };

  const handleSyncToSchedule = () => {
    if (!result) return;
    const todayStr = new Date().toISOString().split('T')[0];
    let startHour = 16;

    result.plan.must_do.forEach((item, idx) => {
      const start = `${(startHour + idx).toString().padStart(2, '0')}:00`;
      const end = `${(startHour + idx + 1).toString().padStart(2, '0')}:00`;
      addScheduleItem({
        title: `[EMERGENCY] ${item.title}`,
        start_time: start,
        end_time: end,
        type: 'study',
        date: todayStr,
        completed: false,
        notes: item.notes,
      });
    });

    toast(`Added ${result.plan.must_do.length} emergency tasks to My Day schedule!`, {
      type: 'success',
      description: 'Check My Day tab to follow your hourly timeline.',
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Signature Emergency Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/80 via-[#1f0a0a] to-bg-card border border-red-500/40 p-6 md:p-8 shadow-2xl shadow-red-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/25 border border-red-500/40 text-red-400 animate-pulse">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  I&apos;M COOKED 🚨
                </h1>
                <p className="text-xs uppercase tracking-widest font-bold text-red-400">
                  College Emergency Recovery System
                </p>
              </div>
            </div>
            <p className="text-sm text-text-secondary max-w-2xl">
              Tell EDITH your situation — exam tomorrow, 0% prep, pending assignments.
              She&apos;ll calculate how serious it is and build a realistic survival plan.
            </p>
          </div>

          {result && (
            <div className="flex items-center gap-4 bg-bg-card/90 border border-red-500/40 rounded-2xl p-4 md:p-5 shrink-0 shadow-lg">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-red-400 mb-0.5">
                  {result.score}%
                </div>
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                  Cooked Meter
                </p>
              </div>
              <div className="h-10 w-px bg-border/80" />
              <div>
                <p className="text-base font-black text-white flex items-center gap-1.5">
                  <span>{result.emoji}</span>
                  <span>{result.label}</span>
                </p>
                <p className="text-xs text-text-secondary mt-0.5 max-w-[220px] leading-tight">
                  {result.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Assessment Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/80">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/70">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h2 className="text-base font-bold text-text-primary">Situation Assessment</h2>
            </div>

            <form onSubmit={handleAssess} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Emergency Type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="exam">Upcoming Exam</option>
                  <option value="assignment">Assignment Deadline</option>
                  <option value="project">Project Submission</option>
                  <option value="deadline">Lab / Viva</option>
                </Select>

                <Input
                  label="Hours Available"
                  type="number"
                  min="1"
                  max="48"
                  value={hoursAvailable}
                  onChange={(e) => setHoursAvailable(Number(e.target.value))}
                />
              </div>

              <Input
                label="Target Title"
                placeholder="e.g. Maths Unit 3 Internal Exam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-secondary uppercase tracking-wider">
                    Current Preparation:
                  </span>
                  <span className="font-bold text-accent-hover">{prepPercent}% Prepared</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={prepPercent}
                  onChange={(e) => setPrepPercent(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer h-2 bg-bg-elevated rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>0% (Clueless)</span>
                  <span>50% (Half-done)</span>
                  <span>100% (Ready)</span>
                </div>
              </div>

              <Input
                label="Deadline Date & Time"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />

              <Textarea
                label="Syllabus Topics or Notes"
                placeholder="Paste topics separated by lines or commas..."
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                hint="EDITH prioritizes high-weightage topics first"
                rows={4}
              />

              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                type="submit"
                icon={<Flame className="w-5 h-5" />}
              >
                Recalculate Survival Plan 🚨
              </Button>
            </form>
          </Card>

          {/* Quick Guidance Card */}
          <div className="p-4 rounded-2xl bg-bg-card border border-border/80 space-y-2 text-xs text-text-secondary">
            <h4 className="font-bold text-text-primary flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>EDITH&apos;s Rule for Surviving All-Nighters</span>
            </h4>
            <p className="leading-relaxed">
              &ldquo;Do NOT read textbooks cover-to-cover when time is low. Focus 80% of your energy on previous year questions (PYQs) and formula derivations. That&apos;s how seniors pass.&rdquo;
            </p>
          </div>
        </div>

        {/* Right Column: Emergency Recovery Plan */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Senior Verdict Header */}
              <div className="p-5 rounded-2xl bg-bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{result.emoji}</span>
                    <h3 className="text-lg font-black text-text-primary">{result.label}</h3>
                    <Badge variant={result.score >= 60 ? 'danger' : 'warning'}>
                      Score: {result.score}/100
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 max-w-lg leading-relaxed">
                    {result.message}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<CalendarPlus className="w-4 h-4 text-accent" />}
                  onClick={handleSyncToSchedule}
                  className="shrink-0"
                >
                  Sync to My Day
                </Button>
              </div>

              {/* Priority 1: 🔥 MUST DO */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-black">🔥 MUST DO</span>
                    <Badge variant="danger" size="sm">Highest Priority</Badge>
                  </div>
                  <span className="text-xs text-text-muted">Start here immediately</span>
                </div>

                <div className="space-y-2.5">
                  {result.plan.must_do.map((item) => {
                    const done = !!planState[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleComplete(item)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          done
                            ? 'bg-status-success-bg/20 border-status-success/30 opacity-60'
                            : 'bg-bg-card border-red-500/30 hover:border-red-500/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                              done
                                ? 'bg-status-success border-status-success text-white'
                                : 'border-border hover:border-text-primary'
                            }`}
                          >
                            {done && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold text-text-primary ${
                                done ? 'line-through text-text-muted' : ''
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-text-secondary mt-0.5">{item.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-red-400 shrink-0 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                          {item.duration_minutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority 2: ⚡ SHOULD DO */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-black">⚡ SHOULD DO</span>
                    <Badge variant="warning" size="sm">If Time Permits</Badge>
                  </div>
                  <span className="text-xs text-text-muted">High-yield revision</span>
                </div>

                <div className="space-y-2.5">
                  {result.plan.should_do.map((item) => {
                    const done = !!planState[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleComplete(item)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          done
                            ? 'bg-status-success-bg/20 border-status-success/30 opacity-60'
                            : 'bg-bg-card border-amber-500/20 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                              done
                                ? 'bg-status-success border-status-success text-white'
                                : 'border-border hover:border-text-primary'
                            }`}
                          >
                            {done && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold text-text-primary ${
                                done ? 'line-through text-text-muted' : ''
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.notes && (
                              <p className="text-[11px] text-text-muted mt-0.5">{item.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-amber-400 shrink-0">
                          {item.duration_minutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority 3: 🧊 CAN SKIP */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted font-bold">🧊 CAN SKIP</span>
                    <Badge variant="muted" size="sm">Low ROI</Badge>
                  </div>
                  <span className="text-xs text-text-muted">Do not waste hours here</span>
                </div>

                <div className="space-y-2">
                  {result.plan.can_skip.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-bg-card/50 border border-border/50 flex items-center justify-between opacity-75"
                    >
                      <div>
                        <p className="text-xs font-medium text-text-secondary">{item.title}</p>
                        {item.notes && (
                          <p className="text-[11px] text-text-muted">{item.notes}</p>
                        )}
                      </div>
                      <span className="text-[11px] text-text-muted">{item.duration_minutes}m</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl">
              <AlertTriangle className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary font-medium">Fill in your situation on the left.</p>
              <p className="text-xs text-text-muted mt-1">
                EDITH will generate your tailored emergency triage.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
