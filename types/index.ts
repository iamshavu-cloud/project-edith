// User & Profile
export interface User {
  id: string;
  name: string;
  college: string;
  year: number;
  semester: number;
  created_at: string;
}

// Subject & Attendance
export interface Subject {
  id: string;
  user_id: string;
  name: string;
  faculty: string;
  code: string;
  credits: number;
  required_attendance: number; // percentage, e.g. 75
  lectures_per_week: number;
  color?: string;
}

export interface Attendance {
  id: string;
  subject_id: string;
  conducted: number;
  attended: number;
  labs_conducted: number;
  labs_attended: number;
}

export interface SubjectWithAttendance extends Subject {
  attendance: Attendance;
  attendance_percent: number;
  status: 'safe' | 'warning' | 'danger';
  bunks_allowed: number;
  lectures_needed: number;
}

// Tasks
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'assignment' | 'exam' | 'project' | 'personal' | 'other';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  subject_id?: string;
  created_at: string;
}

// Schedule & Daily Planner
export type ScheduleItemType = 'class' | 'study' | 'gym' | 'meal' | 'break' | 'assignment' | 'project' | 'personal' | 'buffer';

export interface ScheduleItem {
  id: string;
  user_id: string;
  title: string;
  start_time: string; // HH:MM format (24h)
  end_time: string;   // HH:MM format (24h)
  type: ScheduleItemType;
  date: string;       // YYYY-MM-DD
  completed: boolean;
  notes?: string;
}

// Projects
export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  deadline?: string;
  created_at: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  name: string;
  role: string;
}

export type ProjectTaskStatus = 'todo' | 'in_progress' | 'done';
export type ProjectTaskPriority = 'low' | 'medium' | 'high';

export interface ProjectTask {
  id: string;
  project_id: string;
  assigned_to?: string;
  assigned_to_name?: string;
  title: string;
  description?: string;
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  deadline?: string;
  created_at: string;
}

export interface ProjectWithDetails extends Project {
  members: ProjectMember[];
  tasks: ProjectTask[];
  progress: number; // 0-100
}

// AI / Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
}

// Cooked Feature
export interface CookedInput {
  type: 'exam' | 'assignment' | 'project' | 'deadline';
  title: string;
  deadline: string; // ISO date string or YYYY-MM-DDTHH:MM
  prep_percent: number; // 0-100
  hours_available: number;
  syllabus?: string;
  notes?: string;
}

export interface CookedResult {
  score: number; // 0-100
  level: 'chilling' | 'have_time' | 'lock_in' | 'cooked' | 'bro_lock_in';
  label: string;
  emoji: string;
  message: string;
  plan: RecoveryPlan;
}

export interface RecoveryPlan {
  must_do: PlanItem[];
  should_do: PlanItem[];
  can_skip: PlanItem[];
}

export interface PlanItem {
  id: string;
  title: string;
  duration_minutes: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  notes?: string;
  completed: boolean;
}
