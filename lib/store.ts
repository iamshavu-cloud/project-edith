'use client';
import {
  Subject,
  Attendance,
  SubjectWithAttendance,
  Task,
  ScheduleItem,
  Project,
  ProjectWithDetails,
  ChatMessage,
  ProjectTask,
  ProjectMember,
  User,
} from '@/types';
import { enrichSubject } from './attendance';
import { generateId } from './utils';

// ============================================================
// LOCAL STORAGE CLIENT STORE (Zero-setup instant Hackathon demo)
// ============================================================

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(`edith_${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`edith_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Storage quota exceeded or error:', e);
  }
}

// ---- USER ----
export function getUser(): User | null {
  return load<User | null>('user', null);
}

export function setUser(userData: { name: string; college: string; year: number; semester: number }): User {
  const existing = getUser();
  const u: User = {
    id: existing?.id || 'usr_' + generateId(),
    ...userData,
    created_at: existing?.created_at || new Date().toISOString(),
  };
  save('user', u);
  return u;
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('edith_user');
}

// ---- SUBJECTS & ATTENDANCE ----
export function getSubjects(): SubjectWithAttendance[] {
  const subjects = load<Subject[]>('subjects', []);
  const attendances = load<Attendance[]>('attendances', []);

  return subjects.map((s) => {
    const att = attendances.find((a) => a.subject_id === s.id) || {
      id: generateId(),
      subject_id: s.id,
      conducted: 0,
      attended: 0,
      labs_conducted: 0,
      labs_attended: 0,
    };
    return enrichSubject(s, att);
  });
}

export function addSubject(data: Omit<Subject, 'id' | 'user_id'>): SubjectWithAttendance {
  const subjects = load<Subject[]>('subjects', []);
  const attendances = load<Attendance[]>('attendances', []);
  const user = getUser();

  const newSubject: Subject = {
    id: 'sub_' + generateId(),
    user_id: user?.id || 'demo_user',
    ...data,
  };

  const newAttendance: Attendance = {
    id: 'att_' + generateId(),
    subject_id: newSubject.id,
    conducted: 0,
    attended: 0,
    labs_conducted: 0,
    labs_attended: 0,
  };

  save('subjects', [...subjects, newSubject]);
  save('attendances', [...attendances, newAttendance]);
  return enrichSubject(newSubject, newAttendance);
}

export function updateSubject(id: string, data: Partial<Subject>): void {
  const subjects = load<Subject[]>('subjects', []);
  save('subjects', subjects.map((s) => (s.id === id ? { ...s, ...data } : s)));
}

export function deleteSubject(id: string): void {
  const subjects = load<Subject[]>('subjects', []);
  const attendances = load<Attendance[]>('attendances', []);
  save('subjects', subjects.filter((s) => s.id !== id));
  save('attendances', attendances.filter((a) => a.subject_id !== id));
}

export function updateAttendance(
  subject_id: string,
  data: Partial<Omit<Attendance, 'id' | 'subject_id'>>
): void {
  const attendances = load<Attendance[]>('attendances', []);
  const existingIndex = attendances.findIndex((a) => a.subject_id === subject_id);

  if (existingIndex >= 0) {
    const updated = [...attendances];
    updated[existingIndex] = { ...updated[existingIndex], ...data };
    save('attendances', updated);
  } else {
    const newAtt: Attendance = {
      id: 'att_' + generateId(),
      subject_id,
      conducted: 0,
      attended: 0,
      labs_conducted: 0,
      labs_attended: 0,
      ...data,
    };
    save('attendances', [...attendances, newAtt]);
  }
}

// ---- TASKS ----
export function getTasks(): Task[] {
  return load<Task[]>('tasks', []);
}

export function addTask(data: Omit<Task, 'id' | 'user_id' | 'created_at'>): Task {
  const tasks = load<Task[]>('tasks', []);
  const user = getUser();
  const task: Task = {
    id: 'tsk_' + generateId(),
    user_id: user?.id || 'demo_user',
    created_at: new Date().toISOString(),
    ...data,
  };
  save('tasks', [...tasks, task]);
  return task;
}

export function updateTask(id: string, data: Partial<Task>): void {
  const tasks = load<Task[]>('tasks', []);
  save('tasks', tasks.map((t) => (t.id === id ? { ...t, ...data } : t)));
}

export function deleteTask(id: string): void {
  const tasks = load<Task[]>('tasks', []);
  save('tasks', tasks.filter((t) => t.id !== id));
}

// ---- SCHEDULE ----
export function getSchedule(date?: string): ScheduleItem[] {
  const items = load<ScheduleItem[]>('schedule', []);
  if (date) return items.filter((i) => i.date === date);
  return items;
}

export function addScheduleItem(data: Omit<ScheduleItem, 'id' | 'user_id'>): ScheduleItem {
  const items = load<ScheduleItem[]>('schedule', []);
  const user = getUser();
  const item: ScheduleItem = {
    id: 'sch_' + generateId(),
    user_id: user?.id || 'demo_user',
    ...data,
  };
  save('schedule', [...items, item]);
  return item;
}

export function updateScheduleItem(id: string, data: Partial<ScheduleItem>): void {
  const items = load<ScheduleItem[]>('schedule', []);
  save('schedule', items.map((i) => (i.id === id ? { ...i, ...data } : i)));
}

export function deleteScheduleItem(id: string): void {
  const items = load<ScheduleItem[]>('schedule', []);
  save('schedule', items.filter((i) => i.id !== id));
}

// ---- PROJECTS ----
export function getProjects(): ProjectWithDetails[] {
  const projects = load<Project[]>('projects', []);
  const members = load<ProjectMember[]>('project_members', []);
  const tasks = load<ProjectTask[]>('project_tasks', []);

  return projects.map((p) => {
    const pTasks = tasks.filter((t) => t.project_id === p.id);
    const pMembers = members.filter((m) => m.project_id === p.id);
    const done = pTasks.filter((t) => t.status === 'done').length;
    const progress = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
    return { ...p, members: pMembers, tasks: pTasks, progress };
  });
}

export function addProject(data: Omit<Project, 'id' | 'owner_id' | 'created_at'>): Project {
  const projects = load<Project[]>('projects', []);
  const user = getUser();
  const project: Project = {
    id: 'prj_' + generateId(),
    owner_id: user?.id || 'demo_user',
    created_at: new Date().toISOString(),
    ...data,
  };
  save('projects', [...projects, project]);
  return project;
}

export function addProjectMember(data: ProjectMember): void {
  const members = load<ProjectMember[]>('project_members', []);
  save('project_members', [...members, data]);
}

export function addProjectTask(data: Omit<ProjectTask, 'id' | 'created_at'>): ProjectTask {
  const tasks = load<ProjectTask[]>('project_tasks', []);
  const task: ProjectTask = {
    id: 'ptsk_' + generateId(),
    created_at: new Date().toISOString(),
    ...data,
  };
  save('project_tasks', [...tasks, task]);
  return task;
}

export function updateProjectTask(id: string, data: Partial<ProjectTask>): void {
  const tasks = load<ProjectTask[]>('project_tasks', []);
  save('project_tasks', tasks.map((t) => (t.id === id ? { ...t, ...data } : t)));
}

export function deleteProject(id: string): void {
  const projects = load<Project[]>('projects', []);
  const members = load<ProjectMember[]>('project_members', []);
  const tasks = load<ProjectTask[]>('project_tasks', []);
  save('projects', projects.filter((p) => p.id !== id));
  save('project_members', members.filter((m) => m.project_id !== id));
  save('project_tasks', tasks.filter((t) => t.project_id !== id));
}

// ---- CHAT HISTORY ----
export function getChatHistory(): ChatMessage[] {
  return load<ChatMessage[]>('chat', []);
}

export function addChatMessage(msg: ChatMessage): void {
  const history = load<ChatMessage[]>('chat', []);
  save('chat', [...history.slice(-50), msg]);
}

export function clearChatHistory(): void {
  save('chat', []);
}

// ---- DEMO SEED DATA ----
export function loadDemoData(): void {
  // Initialize Default User
  const defaultUser: User = {
    id: 'usr_demo',
    name: 'Shaurya',
    college: 'MIT College of Engineering',
    year: 2,
    semester: 3,
    created_at: new Date().toISOString(),
  };

  // Subjects with real academic numbers matching prompt
  const subjects: Subject[] = [
    { id: 'sub_maths', user_id: 'usr_demo', name: 'Mathematics III', faculty: 'Dr. Sharma', code: 'MA201', credits: 4, required_attendance: 75, lectures_per_week: 4, color: '#6366f1' },
    { id: 'sub_physics', user_id: 'usr_demo', name: 'Applied Physics', faculty: 'Prof. Gupta', code: 'PH201', credits: 3, required_attendance: 75, lectures_per_week: 3, color: '#8b5cf6' },
    { id: 'sub_dsa', user_id: 'usr_demo', name: 'Data Structures & Algorithms', faculty: 'Dr. Singh', code: 'CS201', credits: 4, required_attendance: 75, lectures_per_week: 4, color: '#06b6d4' },
    { id: 'sub_dbms', user_id: 'usr_demo', name: 'Database Management Systems', faculty: 'Prof. Rao', code: 'CS202', credits: 3, required_attendance: 75, lectures_per_week: 3, color: '#10b981' },
  ];

  // Attendance stats: Maths 78.4% (safe with bunks), Physics 71.4% (danger, needs 5 lectures), DSA 86.7% (safe), DBMS 75.0% (warning border)
  const attendances: Attendance[] = [
    { id: 'att_1', subject_id: 'sub_maths', conducted: 37, attended: 29, labs_conducted: 0, labs_attended: 0 }, // 78.4%
    { id: 'att_2', subject_id: 'sub_physics', conducted: 28, attended: 20, labs_conducted: 4, labs_attended: 3 }, // 71.4%
    { id: 'att_3', subject_id: 'sub_dsa', conducted: 30, attended: 26, labs_conducted: 8, labs_attended: 7 }, // 86.7%
    { id: 'att_4', subject_id: 'sub_dbms', conducted: 24, attended: 18, labs_conducted: 0, labs_attended: 0 }, // 75.0%
  ];

  const now = Date.now();
  const tasks: Task[] = [
    { id: 'tsk_1', user_id: 'usr_demo', title: 'Maths Unit 3 Integration Assignment', description: 'Double integrals and Green theorem', deadline: new Date(now + 18 * 3600000).toISOString(), priority: 'urgent', status: 'todo', type: 'assignment', subject_id: 'sub_maths', created_at: new Date().toISOString() },
    { id: 'tsk_2', user_id: 'usr_demo', title: 'Physics Lab Report Submission', description: 'Laser diffraction experiment calculations', deadline: new Date(now + 36 * 3600000).toISOString(), priority: 'high', status: 'in_progress', type: 'assignment', subject_id: 'sub_physics', created_at: new Date().toISOString() },
    { id: 'tsk_3', user_id: 'usr_demo', title: 'DSA Trees & Graphs LeetCode Problems', description: 'Practice 5 medium problems before midterm', deadline: new Date(now + 72 * 3600000).toISOString(), priority: 'medium', status: 'todo', type: 'exam', subject_id: 'sub_dsa', created_at: new Date().toISOString() },
    { id: 'tsk_4', user_id: 'usr_demo', title: 'DBMS ER-Diagram Submission', description: 'E-commerce platform schema', deadline: new Date(now + 96 * 3600000).toISOString(), priority: 'medium', status: 'todo', type: 'project', subject_id: 'sub_dbms', created_at: new Date().toISOString() },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const schedule: ScheduleItem[] = [
    { id: 'sch_1', user_id: 'usr_demo', title: 'Mathematics Lecture', start_time: '09:00', end_time: '10:00', type: 'class', date: todayStr, completed: true },
    { id: 'sch_2', user_id: 'usr_demo', title: 'Applied Physics Lecture', start_time: '10:15', end_time: '11:15', type: 'class', date: todayStr, completed: true },
    { id: 'sch_3', user_id: 'usr_demo', title: 'Lunch & Relax with Friends', start_time: '12:30', end_time: '13:30', type: 'meal', date: todayStr, completed: true },
    { id: 'sch_4', user_id: 'usr_demo', title: 'Maths Assignment Drafting', start_time: '15:00', end_time: '16:30', type: 'assignment', date: todayStr, completed: false },
    { id: 'sch_5', user_id: 'usr_demo', title: 'Python / DSA Practice', start_time: '17:00', end_time: '18:15', type: 'study', date: todayStr, completed: false },
    { id: 'sch_6', user_id: 'usr_demo', title: 'Gym Workout', start_time: '18:30', end_time: '19:45', type: 'gym', date: todayStr, completed: false },
    { id: 'sch_7', user_id: 'usr_demo', title: 'Dinner & Buffer', start_time: '20:00', end_time: '21:00', type: 'meal', date: todayStr, completed: false },
    { id: 'sch_8', user_id: 'usr_demo', title: 'Physics Revision & PYQs', start_time: '21:00', end_time: '22:15', type: 'study', date: todayStr, completed: false },
  ];

  const projects: Project[] = [
    { id: 'prj_web', owner_id: 'usr_demo', name: 'CampusConnect Portal', description: 'Full-stack college platform with Next.js, Auth and Database', deadline: new Date(now + 7 * 86400000).toISOString(), created_at: new Date().toISOString() },
  ];

  const members: ProjectMember[] = [
    { project_id: 'prj_web', user_id: 'usr_demo', name: 'Shaurya (You)', role: 'Lead & Frontend' },
    { project_id: 'prj_web', user_id: 'usr_aryan', name: 'Aryan', role: 'Authentication & API' },
    { project_id: 'prj_web', user_id: 'usr_rohan', name: 'Rohan', role: 'Database & Cloud' },
  ];

  const projectTasks: ProjectTask[] = [
    { id: 'pt_1', project_id: 'prj_web', assigned_to: 'usr_demo', assigned_to_name: 'Shaurya (You)', title: 'Frontend UI layout & routing', status: 'done', priority: 'high', deadline: new Date(now - 86400000).toISOString(), created_at: new Date().toISOString() },
    { id: 'pt_2', project_id: 'prj_web', assigned_to: 'usr_demo', assigned_to_name: 'Shaurya (You)', title: 'Design System & Tailwind Config', status: 'done', priority: 'high', deadline: new Date(now - 86400000).toISOString(), created_at: new Date().toISOString() },
    { id: 'pt_3', project_id: 'prj_web', assigned_to: 'usr_aryan', assigned_to_name: 'Aryan', title: 'User authentication & Session guards', status: 'in_progress', priority: 'high', deadline: new Date(now + 48 * 3600000).toISOString(), created_at: new Date().toISOString() },
    { id: 'pt_4', project_id: 'prj_web', assigned_to: 'usr_aryan', assigned_to_name: 'Aryan', title: 'JWT refresh token route', status: 'done', priority: 'medium', deadline: new Date(now - 3600000).toISOString(), created_at: new Date().toISOString() },
    { id: 'pt_5', project_id: 'prj_web', assigned_to: 'usr_rohan', assigned_to_name: 'Rohan', title: 'PostgreSQL schema migrations & seed data', status: 'in_progress', priority: 'high', deadline: new Date(now + 24 * 3600000).toISOString(), created_at: new Date().toISOString() },
    { id: 'pt_6', project_id: 'prj_web', assigned_to: 'usr_rohan', assigned_to_name: 'Rohan', title: 'Cloud storage bucket & file upload policy', status: 'todo', priority: 'medium', deadline: new Date(now + 72 * 3600000).toISOString(), created_at: new Date().toISOString() },
  ];

  save('user', defaultUser);
  save('subjects', subjects);
  save('attendances', attendances);
  save('tasks', tasks);
  save('schedule', schedule);
  save('projects', projects);
  save('project_members', members);
  save('project_tasks', projectTasks);
}
