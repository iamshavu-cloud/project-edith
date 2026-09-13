'use client';
import { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  UserCheck,
  Check,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toaster';
import {
  getProjects,
  addProject,
  addProjectMember,
  addProjectTask,
  updateProjectTask,
  loadDemoData,
  getUser,
} from '@/lib/store';
import type {
  ProjectWithDetails,
  ProjectTask,
  ProjectTaskStatus,
  ProjectTaskPriority,
} from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [taskModal, setTaskModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [projectModal, setProjectModal] = useState(false);

  // New Project Form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // New Member Form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<ProjectTaskPriority>('high');

  const reload = () => {
    if (!getUser()) loadDemoData();
    const list = getProjects();
    setProjects(list);
    if (!activeProjectId && list.length > 0) {
      setActiveProjectId(list[0].id);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Calculate member-wise progress
  const getMemberProgress = () => {
    if (!activeProject) return [];
    return activeProject.members.map((m) => {
      const memberTasks = activeProject.tasks.filter(
        (t) => t.assigned_to === m.user_id || t.assigned_to_name === m.name
      );
      const doneTasks = memberTasks.filter((t) => t.status === 'done').length;
      const pct = memberTasks.length > 0 ? Math.round((doneTasks / memberTasks.length) * 100) : 0;
      return {
        member: m,
        totalTasks: memberTasks.length,
        doneTasks,
        percent: pct,
        tasks: memberTasks,
      };
    });
  };

  const handleUpdateStatus = (task: ProjectTask, newStatus: ProjectTaskStatus) => {
    updateProjectTask(task.id, { status: newStatus });
    toast(`Updated task status to: ${newStatus.toUpperCase()}`, { type: 'success' });
    reload();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !activeProject) return;

    const assignedMember = activeProject.members.find((m) => m.user_id === taskAssignee);

    addProjectTask({
      project_id: activeProject.id,
      title: taskTitle.trim(),
      status: 'todo',
      priority: taskPriority,
      assigned_to: taskAssignee || undefined,
      assigned_to_name: assignedMember?.name || 'Unassigned',
    });

    toast(`Added task: ${taskTitle}`, { type: 'success' });
    setTaskTitle('');
    setTaskModal(false);
    reload();
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !activeProject) return;

    addProjectMember({
      project_id: activeProject.id,
      user_id: 'usr_' + Math.random().toString(36).substring(2, 7),
      name: newMemberName.trim(),
      role: newMemberRole.trim() || 'Contributor',
    });

    toast(`Added ${newMemberName} to team!`, { type: 'success' });
    setNewMemberName('');
    setNewMemberRole('');
    setMemberModal(false);
    reload();
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const proj = addProject({
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    });

    addProjectMember({
      project_id: proj.id,
      user_id: 'usr_demo',
      name: 'Shaurya (You)',
      role: 'Project Lead',
    });

    toast(`Created project: ${newProjectName}`, { type: 'success' });
    setNewProjectName('');
    setNewProjectDesc('');
    setProjectModal(false);
    setActiveProjectId(proj.id);
    reload();
  };

  const memberStats = getMemberProgress();

  return (
    <div className="min-h-screen bg-bg-primary p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-7 h-7 text-accent" />
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              Group Project Tracker
            </h1>
          </div>
          <p className="text-sm text-text-secondary">
            No more silent group chats. Track who is cooking and who is falling behind.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={() => setProjectModal(true)}>
            New Project
          </Button>
          {activeProject && (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setTaskModal(true)}>
              Add Task
            </Button>
          )}
        </div>
      </div>

      {activeProject ? (
        <div className="space-y-6">
          {/* Project Switcher Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProjectId(p.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  p.id === activeProject.id
                    ? 'bg-accent text-white shadow-md shadow-accent/25'
                    : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {p.name} ({p.progress}%)
              </button>
            ))}
          </div>

          {/* AI Senior Project Brief: "What's Everyone Doing?" */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-bg-card to-bg-card border border-cyan-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  EDITH Senior Briefing: &ldquo;What&apos;s Everyone Doing?&rdquo;
                </h3>
              </div>
              <Badge variant="accent" size="sm">
                Team Progress: {activeProject.progress}%
              </Badge>
            </div>

            <div className="text-xs text-text-secondary space-y-1.5 leading-relaxed">
              <p className="font-semibold text-text-primary">
                &ldquo;We&apos;re at <strong className="text-cyan-400">{activeProject.progress}%</strong>, gang.&rdquo;
              </p>
              {memberStats.map(({ member, percent, totalTasks, doneTasks }) => (
                <p key={member.user_id}>
                  • <strong className="text-text-primary">{member.name}</strong> ({member.role}) is at{' '}
                  <strong className={percent >= 70 ? 'text-status-success' : percent >= 40 ? 'text-accent-hover' : 'text-status-warning'}>
                    {percent}%
                  </strong>{' '}
                  ({doneTasks}/{totalTasks} tasks done).
                </p>
              ))}
              <p className="pt-1 text-text-muted italic">
                &ldquo;Remember: keep the group chat constructive. Presentation is coming up fast. Let&apos;s close the pending tasks.&rdquo; 🚀
              </p>
            </div>
          </div>

          {/* Member Progress Bars (Prompt Section 13) */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Individual Member Contributions</h3>
                <p className="text-xs text-text-muted">Real-time completion percentage based on assigned deliverables</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setMemberModal(true)}>
                + Add Member
              </Button>
            </div>

            <div className="space-y-4">
              {memberStats.map(({ member, percent, doneTasks, totalTasks }) => (
                <div key={member.user_id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">{member.name}</span>
                      <span className="text-text-muted">• {member.role}</span>
                    </div>
                    <span className="font-black text-text-primary">
                      {doneTasks}/{totalTasks} ({percent}%)
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    size="sm"
                    color={percent >= 80 ? 'success' : percent >= 40 ? 'accent' : 'warning'}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Project Task Kanban Columns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Task Board ({activeProject.tasks.length} total)
              </h3>
              <span className="text-xs text-text-secondary">Click status pills to move tasks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: 🔴 To Do */}
              <div className="bg-bg-card border border-border/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <span>🔴</span> TO DO (
                    {activeProject.tasks.filter((t) => t.status === 'todo').length})
                  </span>
                </div>
                <div className="space-y-2.5">
                  {activeProject.tasks
                    .filter((t) => t.status === 'todo')
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-bg-elevated border border-border space-y-2 hover:border-red-500/40 transition-all"
                      >
                        <p className="text-xs font-bold text-text-primary">{task.title}</p>
                        <div className="flex justify-between items-center text-[10px] text-text-muted">
                          <span>{task.assigned_to_name || 'Unassigned'}</span>
                          <button
                            onClick={() => handleUpdateStatus(task, 'in_progress')}
                            className="text-amber-400 hover:underline font-semibold"
                          >
                            Start →
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 2: 🟡 In Progress */}
              <div className="bg-bg-card border border-border/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🟡</span> IN PROGRESS (
                    {activeProject.tasks.filter((t) => t.status === 'in_progress').length})
                  </span>
                </div>
                <div className="space-y-2.5">
                  {activeProject.tasks
                    .filter((t) => t.status === 'in_progress')
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-bg-elevated border border-border space-y-2 hover:border-amber-500/40 transition-all"
                      >
                        <p className="text-xs font-bold text-text-primary">{task.title}</p>
                        <div className="flex justify-between items-center text-[10px] text-text-muted">
                          <span>{task.assigned_to_name || 'Unassigned'}</span>
                          <button
                            onClick={() => handleUpdateStatus(task, 'done')}
                            className="text-emerald-400 hover:underline font-semibold"
                          >
                            Complete ✓
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 3: 🟢 Completed */}
              <div className="bg-bg-card border border-border/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>🟢</span> COMPLETED (
                    {activeProject.tasks.filter((t) => t.status === 'done').length})
                  </span>
                </div>
                <div className="space-y-2.5">
                  {activeProject.tasks
                    .filter((t) => t.status === 'done')
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-bg-elevated/40 border border-border/40 space-y-2 opacity-75"
                      >
                        <p className="text-xs font-bold line-through text-text-muted">{task.title}</p>
                        <div className="flex justify-between items-center text-[10px] text-text-muted">
                          <span>{task.assigned_to_name || 'Unassigned'}</span>
                          <span className="text-emerald-400 font-bold">Done</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center border border-dashed border-border rounded-2xl space-y-3">
          <Users className="w-10 h-10 text-text-muted mx-auto" />
          <p className="text-base font-bold text-text-primary">No Projects Found</p>
          <p className="text-xs text-text-muted">Create your first group project to assign deliverables.</p>
          <Button variant="primary" onClick={() => setProjectModal(true)}>
            Create Project
          </Button>
        </div>
      )}

      {/* Add Task Modal */}
      {activeProject && (
        <Modal
          open={taskModal}
          onClose={() => setTaskModal(false)}
          title="Add Project Task"
          description={`Assigning deliverable to ${activeProject.name}`}
          size="md"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <Input
              label="Task Title"
              placeholder="e.g. Implement OAuth Login Flow"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />

            <Select
              label="Assign To Team Member"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
            >
              <option value="">-- Select Member --</option>
              {activeProject.members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </Select>

            <Select
              label="Priority Level"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as ProjectTaskPriority)}
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </Select>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setTaskModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Member Modal */}
      {activeProject && (
        <Modal
          open={memberModal}
          onClose={() => setMemberModal(false)}
          title="Add Teammate"
          description={`Add a contributor to ${activeProject.name}`}
          size="md"
        >
          <form onSubmit={handleAddMember} className="space-y-4">
            <Input
              label="Member Name"
              placeholder="e.g. Aryan or Rohan"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              required
            />
            <Input
              label="Role / Responsibility"
              placeholder="e.g. Backend Developer or UI Designer"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setMemberModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add to Team
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Project Modal */}
      <Modal
        open={projectModal}
        onClose={() => setProjectModal(false)}
        title="Create Group Project"
        description="Track collaboration, deadlines and accountability"
        size="md"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. AI Senior EDITH Portal"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            required
          />
          <Textarea
            label="Project Description"
            placeholder="Briefly state the goal of this team project..."
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setProjectModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
