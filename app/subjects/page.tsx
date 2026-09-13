'use client';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  BarChart3,
  Trash2,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toaster';
import {
  getSubjects,
  addSubject,
  deleteSubject,
  getTasks,
  loadDemoData,
  getUser,
} from '@/lib/store';
import { getStatusColor, getStatusEmoji } from '@/lib/utils';
import type { SubjectWithAttendance, Task } from '@/types';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectWithAttendance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'safe' | 'warning' | 'danger'>('all');
  const [addModal, setAddModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(4);
  const [required, setRequired] = useState(75);
  const [lecturesPerWeek, setLecturesPerWeek] = useState(4);

  const reload = () => {
    if (!getUser()) loadDemoData();
    setSubjects(getSubjects());
    setTasks(getTasks());
  };

  useEffect(() => {
    reload();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSubject({
      name: name.trim(),
      faculty: faculty.trim() || 'Prof. Unknown',
      code: code.trim() || 'ACAD101',
      credits: Number(credits) || 3,
      required_attendance: Number(required) || 75,
      lectures_per_week: Number(lecturesPerWeek) || 4,
      color: '#6366f1',
    });

    toast(`Created subject profile: ${name}`, { type: 'success' });
    setName('');
    setFaculty('');
    setCode('');
    setAddModal(false);
    reload();
  };

  const handleDelete = (id: string, subName: string) => {
    if (confirm(`Delete ${subName}? All attendance history will be removed.`)) {
      deleteSubject(id);
      toast(`Deleted ${subName}`, { type: 'info' });
      reload();
    }
  };

  const filtered = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.faculty.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-bg-primary p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-7 h-7 text-accent" />
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              Subject Profiles 📚
            </h1>
          </div>
          <p className="text-sm text-text-secondary">
            Manage course credits, faculties, linked assignments and syllabus requirements.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setAddModal(true)}>
          Add Subject
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['all', 'safe', 'warning', 'danger'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === cat
                  ? 'bg-accent text-white shadow-sm shadow-accent/30'
                  : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search subjects or faculties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((s) => {
          const subjectTasks = tasks.filter((t) => t.subject_id === s.id && t.status !== 'done');
          return (
            <div
              key={s.id}
              className="bg-bg-card border border-border/80 rounded-2xl p-5 hover:border-accent/40 transition-all shadow-md space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStatusEmoji(s.status)}</span>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{s.name}</h3>
                    <p className="text-xs text-text-muted">
                      {s.code} • {s.faculty}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="text-text-muted hover:text-red-400 p-1.5 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Attendance Bar */}
              <div className="p-3 rounded-xl bg-bg-elevated/70 border border-border/60 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text-secondary">
                    {s.attendance.attended} / {s.attendance.conducted} lectures attended
                  </span>
                  <span className={getStatusColor(s.status)}>{s.attendance_percent}%</span>
                </div>
                <Progress value={s.attendance_percent} size="xs" color="auto" />
              </div>

              {/* Meta pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-bg-elevated border border-border">
                  <p className="text-text-muted text-[10px]">Credits</p>
                  <p className="font-bold text-text-primary">{s.credits}</p>
                </div>
                <div className="p-2 rounded-lg bg-bg-elevated border border-border">
                  <p className="text-text-muted text-[10px]">Lec / Wk</p>
                  <p className="font-bold text-text-primary">{s.lectures_per_week}</p>
                </div>
                <div className="p-2 rounded-lg bg-bg-elevated border border-border">
                  <p className="text-text-muted text-[10px]">Required</p>
                  <p className="font-bold text-accent-hover">{s.required_attendance}%</p>
                </div>
              </div>

              {/* Linked pending assignments */}
              <div className="pt-2 border-t border-border/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Pending Deliverables ({subjectTasks.length})
                </p>
                {subjectTasks.length > 0 ? (
                  <div className="space-y-1">
                    {subjectTasks.map((t) => (
                      <div key={t.id} className="text-xs text-text-secondary flex items-center justify-between">
                        <span className="truncate">{t.title}</span>
                        <Badge variant="danger" size="sm">Urgent</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">No pending tasks for this subject. All caught up.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-16 text-center border border-dashed border-border rounded-2xl">
          <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-2" />
          <p className="text-sm font-bold text-text-primary">No subjects found</p>
          <p className="text-xs text-text-muted mt-1">Try changing search filter or add a subject.</p>
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Add Subject Profile"
        description="Add a course to your semester roster"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Computer Networks"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course Code"
              placeholder="CS401"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Input
              label="Faculty In-Charge"
              placeholder="Prof. Deshmukh"
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
              label="Lec / Wk"
              type="number"
              min="1"
              max="8"
              value={lecturesPerWeek}
              onChange={(e) => setLecturesPerWeek(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
