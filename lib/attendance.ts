import { Subject, Attendance, SubjectWithAttendance } from '@/types';

/**
 * Calculate attendance percentage: (attended / conducted) * 100
 */
export function attendancePercent(attended: number, conducted: number): number {
  if (conducted === 0) return 0;
  return Math.round((attended / conducted) * 1000) / 10; // 1 decimal place
}

/**
 * Get attendance status based on percentage and required threshold
 */
export function getAttendanceStatus(
  percent: number,
  required: number
): 'safe' | 'warning' | 'danger' {
  if (percent >= required + 5) return 'safe';
  if (percent >= required) return 'warning';
  return 'danger';
}

/**
 * Calculate how many future lectures can be bunked while maintaining >= required%
 * Condition: attended / (conducted + x) >= required / 100
 * => attended * 100 / required >= conducted + x
 * => x <= (attended * 100 / required) - conducted
 */
export function bunksAllowed(
  attended: number,
  conducted: number,
  required: number // e.g. 75
): number {
  const r = required / 100;
  if (r <= 0) return Infinity;
  const maxMisses = Math.floor(attended / r - conducted);
  return Math.max(0, maxMisses);
}

/**
 * How many consecutive lectures must be attended to reach required%
 * Condition: (attended + x) / (conducted + x) >= required / 100 = r
 * => attended + x >= r * (conducted + x)
 * => attended + x >= r * conducted + r * x
 * => x * (1 - r) >= r * conducted - attended
 * => x >= (r * conducted - attended) / (1 - r)
 */
export function lecturesNeeded(
  attended: number,
  conducted: number,
  required: number
): number {
  const r = required / 100;
  if (r >= 1) return Infinity;
  const current = attendancePercent(attended, conducted);
  if (current >= required) return 0;
  const needed = Math.ceil((r * conducted - attended) / (1 - r));
  return Math.max(0, needed);
}

/**
 * Project attendance percentage after N additional bunks
 */
export function projectedAttendance(
  attended: number,
  conducted: number,
  additionalBunks: number
): number {
  return attendancePercent(attended, conducted + Math.max(0, additionalBunks));
}

/**
 * Project attendance percentage after attending N consecutive lectures
 */
export function projectedAfterAttending(
  attended: number,
  conducted: number,
  additionalAttended: number
): number {
  return attendancePercent(
    attended + Math.max(0, additionalAttended),
    conducted + Math.max(0, additionalAttended)
  );
}

/**
 * Overall attendance across all subjects (weighted by credits or simple avg)
 */
export function overallAttendance(subjects: SubjectWithAttendance[]): number {
  if (subjects.length === 0) return 0;
  let totalWeighted = 0;
  let totalCredits = 0;
  for (const s of subjects) {
    const cred = s.credits || 1;
    totalWeighted += s.attendance_percent * cred;
    totalCredits += cred;
  }
  return Math.round((totalWeighted / totalCredits) * 10) / 10;
}

/**
 * Enrich a subject with computed attendance fields
 */
export function enrichSubject(subject: Subject, attendance: Attendance): SubjectWithAttendance {
  const percent = attendancePercent(attendance.attended, attendance.conducted);
  const status = getAttendanceStatus(percent, subject.required_attendance);
  const bunks = bunksAllowed(attendance.attended, attendance.conducted, subject.required_attendance);
  const needed = lecturesNeeded(attendance.attended, attendance.conducted, subject.required_attendance);

  return {
    ...subject,
    attendance,
    attendance_percent: percent,
    status,
    bunks_allowed: bunks,
    lectures_needed: needed,
  };
}
