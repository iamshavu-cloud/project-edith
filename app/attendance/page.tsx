'use client';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  Plus,
  Minus,
  Calculator,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Info,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toaster';
import {
  getSubjects,
  updateAttendance,
  addSubject,
  deleteSubject,
  loadDemoData,
  getUser,
} from '@/lib/store';
import {
  overallAttendance,
  bunksAllowed,
  lecturesNeeded,
  projectedAttendance,
  projectedAfterAttending,
} from '@/lib/attendance';
import { getStatusColor, getStatusEmoji } from '@/lib/utils';
import type { SubjectWithAttendance } from '@/types';

export default function AttendancePage() {
  const [subjects, setSubjects] = useState<SubjectWithAttendance[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [calcSubject, setCalcSubject] = useState<SubjectWithAttendance | null>(null);
  const [hypotheticalBunks, setHypotheticalBunks] = useState(2);
  const [hypotheticalAttends, setHypotheticalAttends] = useState(3);

  // New Subject Form State
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(3);
  const [required, setRequired] = useState(75);
  const [frequency, setFrequency] = useState(4);

  const refresh = () => {
    if (!getUser()) loadDemoData();
    const list = getSubjects();
    setSubjects(list);
    if (calcSubject) {
      const refreshed = list.find((s) => s.id === calcSubject.id);
      if (refreshed) setCalcSubject(refreshed);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const overall = overallAttendance(subjects);
  const safeCount = subjects.filter((s) => s.status === 'safe').length;
  const warningCount = subjects.filter((s) => s.status === 'warning').length;
  const dangerCount = subjects.filter((s) => s.status === 'danger').length;

  const handleAttended = (s: SubjectWithAttendance) => {
    updateAttendance(s.id, {
      conducted: s.attendance.conducted + 1,
      attended: s.attendance.attended + 1,
    });
    toast(`Attended ${s.name}!`, { type: 'success', description: `Streak maintained. Attended: ${s.attendance.attended + 1}/${s.attendance.conducted + 1}` });
    refresh();
  };

  const handleBunked = (s: SubjectWithAttendance) => {
    updateAttendance(s.id, {
      conducted: s.attendance.conducted + 1,
    });
    toast(`Bunked ${s.name}`, {
      type: s.status === 'danger' ? 'error' : 'warning',
      description: `Conducted: ${s.attendance.conducted + 1}, Attended: ${s.attendance.attended}`,
    });
    refresh();
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSubject({
      name: name.trim(),
      faculty: faculty.trim() || 'Prof. Unknown',
      code: code.trim() || 'SUB101',
      credits: Number(credits) || 3,
      required_attendance: Number(required) || 75,
      lectures_per_week: Number(frequency) || 4,
      color: '#6366f1',
    });

    toast(`Subject added: ${name}`, { type: 'success' });
    setName('');
    setFaculty('');
    setCode('');
    setAddModal(false);
    refresh();
  };

  const handleDelete = (id: string, subName: string) => {
    if (confirm(`Remove ${subName} from attendance tracking?`)) {
      deleteSubject(id);
      toast(`Deleted ${subName}`, { type: 'info' });
      refresh();
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-7 h-7 text-accent" />
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Attendance Manager</h1>
          </div>
          <p className="text-sm text-text-secondary">
            Deterministic mathematics. No hallucinated percentages. Stay above the red zone.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setAddModal(true)}>
          Add Subject
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-xs uppercase tracking-wider font-semibold text-text-muted mb-1">Overall</p>
          <CardValue className={overall >= 75 ? 'text-status-success' : 'text-status-danger'}>
            {overall}%
          </CardValue>
          <Progress value={overall} size="xs" color="auto" className="mt-2" />
        </Card>

        <Card className="text-center">
          <p className="text-xs uppercase tracking-wider font-semibold text-status-success mb-1">🟢 Safe (&gt;80%)</p>
          <CardValue className="text-status-success">{safeCount}</CardValue>
          <p className="text-[11px] text-text-muted mt-1">Bunk budget available</p>
        </Card>

        <Card className="text-center">
          <p className="text-xs uppercase tracking-wider font-semibold text-status-warning mb-1">🟡 Warning (75-80%)</p>
          <CardValue className="text-status-warning">{warningCount}</CardValue>
          <p className="text-[11px] text-text-muted mt-1">Borderline safe</p>
        </Card>

        <Card className="text-center">
          <p className="text-xs uppercase tracking-wider font-semibold text-status-danger mb-1">🔴 Danger (&lt;75%)</p>
          <CardValue className="text-status-danger">{dangerCount}</CardValue>
          <p className="text-[11px] text-text-muted mt-1">Immediate action needed</p>
        </Card>
      </div>

      {/* Subject List Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
            All Subjects ({subjects.length})
          </h2>
          <span className="text-xs text-text-secondary">Formula: (attended / conducted) × 100</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="bg-bg-card border border-border/80 rounded-2xl p-5 hover:border-accent/40 transition-all shadow-md"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Subject Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl">{getStatusEmoji(s.status)}</span>
                    <h3 className="text-lg font-bold text-text-primary truncate">{s.name}</h3>
                    <Badge
                      variant={s.status === 'safe' ? 'success' : s.status === 'warning' ? 'warning' : 'danger'}
                    >
                      {s.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    {s.code} • Faculty: <span className="text-text-secondary">{s.faculty}</span> • {s.credits} Credits • {s.lectures_per_week} lec/week
                  </p>

                  <div className="mt-3.5 space-y-1.5 max-w-xl">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-secondary">
                        Attended: {s.attendance.attended} / {s.attendance.conducted} lectures
                      </span>
                      <span className={getStatusColor(s.status)}>
                        {s.attendance_percent}% (Req: {s.required_attendance}%)
                      </span>
                    </div>
                    <Progress value={s.attendance_percent} size="sm" color="auto" />
                  </div>
                </div>

                {/* Mathematical Intelligence Summary */}
                <div className="bg-bg-elevated/70 border border-border/70 rounded-xl p-3.5 min-w-[240px] text-xs space-y-1.5">
                  <div className="font-semibold text-text-secondary flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-accent" />
                    <span>Deterministic Math</span>
                  </div>

                  {s.status === 'danger' ? (
                    <div className="text-status-danger font-medium space-y-0.5">
                      <p className="font-bold">⚠️ Below requirement ({s.required_attendance}%)</p>
                      <p>
                        Must attend next <strong className="text-white bg-status-danger px-1.5 py-0.5 rounded">{s.lectures_needed} lectures consecutively</strong> to recover.
                      </p>
                    </div>
                  ) : (
                    <div className="text-status-success font-medium space-y-0.5">
                      <p>
                        Bunk budget: <strong className="text-white bg-status-success px-1.5 py-0.5 rounded">{s.bunks_allowed} lecture{s.bunks_allowed !== 1 ? 's' : ''}</strong>
                      </p>
                      <p className="text-[11px] text-text-muted">
                        You can miss {s.bunks_allowed} and stay above {s.required_attendance}%.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setCalcSubject(s)}
                    className="pt-1 text-accent-hover font-medium hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Simulate Bunks & Recoveries →</span>
                  </button>
                </div>

                {/* Direct Attendance Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 lg:flex-none border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => handleAttended(s)}
                  >
                    Attended (+1)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 lg:flex-none border-red-500/30 text-red-400 hover:bg-red-950/40"
                    icon={<Minus className="w-4 h-4" />}
                    onClick={() => handleBunked(s)}
                  >
                    Bunked (+1)
                  </Button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="text-text-muted hover:text-status-danger p-1.5 rounded text-xs self-center lg:self-end"
                    title="Delete subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bunk Simulator Modal */}
      {calcSubject && (
        <Modal
          open={!!calcSubject}
          onClose={() => setCalcSubject(null)}
          title={`Bunk Calculator: ${calcSubject.name}`}
          description={`Formula-based simulation for ${calcSubject.name} (${calcSubject.attendance_percent}% current)`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Status overview */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-bg-card border border-border">
              <div>
                <p className="text-xs text-text-muted">Current Stats</p>
                <p className="text-lg font-bold text-text-primary">
                  {calcSubject.attendance.attended} / {calcSubject.attendance.conducted} ({calcSubject.attendance_percent}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Safe Bunks Remaining</p>
                <p className="text-lg font-bold text-status-success">
                  {calcSubject.bunks_allowed} lecture{calcSubject.bunks_allowed !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Scenario 1: What if I bunk N lectures? */}
            <div className="p-4 rounded-xl bg-bg-card border border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Scenario: Bunk next N lectures</h4>
                  <p className="text-xs text-text-muted">See your projected percentage if you skip classes</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">Lectures:</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={hypotheticalBunks}
                    onChange={(e) => setHypotheticalBunks(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-bg-elevated border border-border rounded-lg px-2 py-1 text-center text-sm font-bold text-text-primary"
                  />
                </div>
              </div>

              {(() => {
                const projected = projectedAttendance(
                  calcSubject.attendance.attended,
                  calcSubject.attendance.conducted,
                  hypotheticalBunks
                );
                const isSafe = projected >= calcSubject.required_attendance;
                return (
                  <div
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      isSafe
                        ? 'bg-status-success-bg/40 border-status-success/30 text-emerald-300'
                        : 'bg-status-danger-bg/50 border-status-danger/30 text-red-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">
                        After {hypotheticalBunks} bunk{hypotheticalBunks !== 1 ? 's' : ''}:
                      </p>
                      <p className="text-[11px] opacity-80">
                        {calcSubject.attendance.attended} attended / {calcSubject.attendance.conducted + hypotheticalBunks} conducted
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black">{projected}%</span>
                      <p className="text-[10px] font-bold uppercase">
                        {isSafe ? '🟢 Still Safe' : '🔴 Danger Alert'}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Scenario 2: Recovery by attending N lectures */}
            <div className="p-4 rounded-xl bg-bg-card border border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Scenario: Academic Comeback</h4>
                  <p className="text-xs text-text-muted">Projected percent if you attend next N lectures without absence</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">Attend:</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={hypotheticalAttends}
                    onChange={(e) => setHypotheticalAttends(Math.max(1, Number(e.target.value)))}
                    className="w-16 bg-bg-elevated border border-border rounded-lg px-2 py-1 text-center text-sm font-bold text-text-primary"
                  />
                </div>
              </div>

              {(() => {
                const projected = projectedAfterAttending(
                  calcSubject.attendance.attended,
                  calcSubject.attendance.conducted,
                  hypotheticalAttends
                );
                return (
                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">
                        After attending {hypotheticalAttends} consecutively:
                      </p>
                      <p className="text-[11px] opacity-80">
                        {calcSubject.attendance.attended + hypotheticalAttends} attended / {calcSubject.attendance.conducted + hypotheticalAttends} conducted
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black">{projected}%</span>
                      <p className="text-[10px] font-bold text-emerald-400">
                        +{Math.round((projected - calcSubject.attendance_percent) * 10) / 10}% Boost
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* EDITH Senior Commentary */}
            <div className="p-3.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-secondary leading-relaxed">
              <span className="font-bold text-accent-hover">EDITH: </span>
              {calcSubject.status === 'danger' ? (
                <span>
                  &ldquo;Bro, you need {calcSubject.lectures_needed} lectures straight. No excuses, no bunking tomorrow morning. Wake up and go.&rdquo; 💀
                </span>
              ) : (
                <span>
                  &ldquo;You have {calcSubject.bunks_allowed} bunks in hand, gang. Save them for exam week or emergencies, don&apos;t blow them on a random Tuesday.&rdquo; 😎
                </span>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Subject Modal */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Add New Subject"
        description="Configure your academic course and attendance requirements"
        size="md"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Operating Systems"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Subject Code"
              placeholder="CS301"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Input
              label="Faculty"
              placeholder="Prof. Rao"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Credits"
              type="number"
              min="1"
              max="6"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
            />
            <Input
              label="Req %"
              type="number"
              min="50"
              max="90"
              value={required}
              onChange={(e) => setRequired(Number(e.target.value))}
            />
            <Input
              label="Lec / Week"
              type="number"
              min="1"
              max="10"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
