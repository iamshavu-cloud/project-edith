import {
  getSubjects,
  getTasks,
  getSchedule,
  getProjects,
  getUser,
} from './store';
import {
  overallAttendance,
  bunksAllowed,
  lecturesNeeded,
  projectedAttendance,
} from './attendance';
import { assessCooked } from './cookedMeter';
import type { ChatMessage, SubjectWithAttendance } from '@/types';

// ============================================================
// EDITH AI ENGINE & TOOL CALLING SYSTEM
// ============================================================

export interface AgentResponse {
  message: string;
  toolUsed?: string;
  toolData?: any;
}

export function processEdithMessage(userInput: string): AgentResponse {
  const query = userInput.toLowerCase();
  const user = getUser();
  const subjects = getSubjects();
  const tasks = getTasks();
  const todayStr = new Date().toISOString().split('T')[0];
  const schedule = getSchedule(todayStr);
  const projects = getProjects();

  // ------------------------------------------------------------
  // TOOL 1: Attendance & Bunk Queries
  // ------------------------------------------------------------
  if (
    query.includes('bunk') ||
    query.includes('attendance') ||
    query.includes('miss class') ||
    query.includes('skip class') ||
    query.includes('percentage')
  ) {
    // Check if specific subject requested
    const targetSub = subjects.find(
      (s) =>
        query.includes(s.name.toLowerCase()) ||
        query.includes(s.code.toLowerCase()) ||
        (query.includes('physics') && s.name.toLowerCase().includes('physic')) ||
        (query.includes('math') && s.name.toLowerCase().includes('math')) ||
        (query.includes('dsa') && s.name.toLowerCase().includes('data structure')) ||
        (query.includes('dbms') && s.name.toLowerCase().includes('database'))
    );

    if (targetSub) {
      const p = targetSub.attendance_percent;
      const req = targetSub.required_attendance;
      const bunks = targetSub.bunks_allowed;
      const needed = targetSub.lectures_needed;

      let msg = '';
      if (targetSub.status === 'danger') {
        msg = `Bro... ${targetSub.name} is looking kinda rough rn. 💀\n\n` +
          `📊 **${targetSub.name} Attendance:** **${p}%**\n` +
          `• Required: ${req}%\n` +
          `• Conducted: ${targetSub.attendance.conducted} | Attended: ${targetSub.attendance.attended}\n` +
          `• 🔴 **Danger Alert:** You are BELOW the mandatory 75%.\n\n` +
          `You need to attend the next **${needed} lectures consecutively** to reach approximately ${req}%.\n\n` +
          `Respectfully... do NOT bunk this class tomorrow. Academic comeback arc starts now. 😭`;
      } else if (targetSub.status === 'warning') {
        msg = `You *can*, gang. Whether you SHOULD is another story. 😭\n\n` +
          `📊 **${targetSub.name} Attendance:** **${p}%**\n` +
          `• Required: ${req}%\n` +
          `• Bunk budget: **${bunks} lecture${bunks !== 1 ? 's' : ''}** remaining.\n\n` +
          `If you miss 1 more, you drop right onto the edge. Save it for when you're actually sick or have an exam, broski.`;
      } else {
        msg = `We're chilling in ${targetSub.name}, gang. 😎\n\n` +
          `📊 **${targetSub.name} Attendance:** **${p}%**\n` +
          `• Required: ${req}%\n` +
          `• Safe bunk budget: **${bunks} lectures**\n\n` +
          `You've got room. If you really need to sleep in or grind for another submission, you're good. Valid move. W.`;
      }

      return {
        message: msg,
        toolUsed: 'attendance_tool',
        toolData: { subject: targetSub },
      };
    } else {
      // Overall attendance overview
      const overall = overallAttendance(subjects);
      const dangerList = subjects.filter((s) => s.status === 'danger');

      let reply = `Here's where your attendance stands right now, gang:\n\n` +
        `📊 **Overall Attendance:** **${overall}%**\n\n`;

      subjects.forEach((s) => {
        const emoji = s.status === 'safe' ? '🟢' : s.status === 'warning' ? '🟡' : '🔴';
        reply += `${emoji} **${s.name}:** ${s.attendance_percent}% (Bunk budget: ${s.bunks_allowed} lec)\n`;
      });

      if (dangerList.length > 0) {
        reply += `\n⚠️ **Warning:** You have ${dangerList.length} subject(s) in the danger zone (${dangerList.map((d) => d.name).join(', ')}). Lock in for those!`;
      } else {
        reply += `\nAll subjects are above 75%. That's a huge W. Keep the buffer alive.`;
      }

      return {
        message: reply,
        toolUsed: 'attendance_tool',
        toolData: { subjects, overall },
      };
    }
  }

  // ------------------------------------------------------------
  // TOOL 2: "I'm Cooked" & Exam Emergency
  // ------------------------------------------------------------
  if (
    query.includes('cooked') ||
    query.includes('exam') ||
    query.includes('tomorrow') ||
    query.includes('panic') ||
    query.includes('studied nothing') ||
    query.includes('haven\'t studied') ||
    query.includes('fail')
  ) {
    const assessment = assessCooked({
      type: 'exam',
      title: 'Upcoming Academic Exam',
      deadline: new Date(Date.now() + 14 * 3600000).toISOString(),
      prep_percent: query.includes('studied nothing') || query.includes('0%') ? 5 : 30,
      hours_available: 7,
      syllabus: 'Core Unit 1 & 2 Concepts\nRepeated Previous Year Questions\nKey Formula Derivations',
    });

    const msg = `Alright broski, take a breath. You're kinda cooked, but not completely finished. 💀\n\n` +
      `🚨 **Cooked Meter:** **${assessment.score}% (${assessment.label})**\n\n` +
      `We have roughly 6–7 hours, so we're not dead yet. Academic comeback arc starts NOW.\n\n` +
      `Here is your emergency triage plan:\n\n` +
      `🔥 **MUST DO (Start right here):**\n` +
      `1. **${assessment.plan.must_do[0].title}** — ${assessment.plan.must_do[0].duration_minutes}m\n` +
      `   *${assessment.plan.must_do[0].notes || 'High weightage. Do not skip.'}*\n` +
      `2. **${assessment.plan.must_do[1]?.title || 'PYQs'}** — ${assessment.plan.must_do[1]?.duration_minutes || 45}m\n\n` +
      `⚡ **SHOULD DO (If you don't sleep off):**\n` +
      `• Formula Sheet & Definition sweep — 30m\n\n` +
      `🧊 **CAN SKIP:**\n` +
      `• Long textbook readings & 2-mark obscure questions. Low return on investment.\n\n` +
      `Head over to the **I'm Cooked** tab to check these off as you finish. Put the phone on DND and lock in, gang.`;

    return {
      message: msg,
      toolUsed: 'cooked_emergency_tool',
      toolData: assessment,
    };
  }

  // ------------------------------------------------------------
  // TOOL 3: Project Status / "What's Everyone Doing?"
  // ------------------------------------------------------------
  if (
    query.includes('project') ||
    query.includes('team') ||
    query.includes('everyone doing') ||
    query.includes('group') ||
    query.includes('aryan') ||
    query.includes('rohan')
  ) {
    if (projects.length === 0) {
      return {
        message: `You don't have any active group projects saved yet, fam. Head to the **Projects** tab to set one up and assign deliverables!`,
      };
    }

    const p = projects[0];
    const pendingTasks = p.tasks.filter((t) => t.status !== 'done');
    const doneTasks = p.tasks.filter((t) => t.status === 'done');

    const msg = `Team update for **${p.name}**:\n\n` +
      `We're sitting at **${p.progress}%**, gang.\n\n` +
      `• **Shaurya (You):** Finished frontend UI & design system (100% complete). W.\n` +
      `• **Aryan:** Working on authentication & session guards (in progress).\n` +
      `• **Rohan:** PostgreSQL schema & cloud storage tasks haven't been updated yet.\n\n` +
      `Presentation is due soon. No need to call anyone out aggressively, but shoot a gentle ping in the group chat asking if Rohan needs a hand with backend. We got this. 🚀`;

    return {
      message: msg,
      toolUsed: 'project_status_tool',
      toolData: { project: p, pendingTasks, doneTasks },
    };
  }

  // ------------------------------------------------------------
  // TOOL 4: Day Planning & Rescheduling
  // ------------------------------------------------------------
  if (
    query.includes('plan') ||
    query.includes('schedule') ||
    query.includes('my day') ||
    query.includes('routine') ||
    query.includes('evening') ||
    query.includes('today')
  ) {
    const msg = `Here's how we're pacing your day today, gang:\n\n` +
      `📅 **Today's Realistic Schedule:**\n` +
      `• **09:00 — Maths Lecture** (Mandatory, don't miss)\n` +
      `• **10:15 — Physics Lecture** (Attended)\n` +
      `• **12:30 — Lunch & Relax with Friends** 🍔\n` +
      `• **15:00 — Maths Assignment Drafting** (High priority)\n` +
      `• **17:00 — Python / DSA Practice** (Locked in)\n` +
      `• **18:30 — Gym Session** (Mental reset)\n` +
      `• **21:00 — Physics Revision & PYQs**\n\n` +
      `I've deliberately left you a 45-minute buffer before dinner because I'm not trying to turn you into a productivity robot. 😭 Check the **My Day** tab if you want to check off blocks!`;

    return {
      message: msg,
      toolUsed: 'planner_tool',
      toolData: { schedule },
    };
  }

  // ------------------------------------------------------------
  // TOOL 5: "What's Due?" / Pending Deadlines
  // ------------------------------------------------------------
  if (
    query.includes('due') ||
    query.includes('deadline') ||
    query.includes('pending') ||
    query.includes('assignment')
  ) {
    const pending = tasks.filter((t) => t.status !== 'done');
    let msg = `Here is what's on your plate right now, broski:\n\n`;

    pending.forEach((t) => {
      const pColor = t.priority === 'urgent' ? '🚨' : t.priority === 'high' ? '⚡' : '📌';
      msg += `${pColor} **${t.title}** (${t.type})\n   Priority: ${t.priority.toUpperCase()}\n`;
    });

    msg += `\nMaths assignment is the most urgent one. Finish that before you touch side projects.`;

    return {
      message: msg,
      toolUsed: 'tasks_tool',
      toolData: { pending },
    };
  }

  // ------------------------------------------------------------
  // Fallback Senior Persona (Adaptive Gen-Z)
  // ------------------------------------------------------------
  const generalResponses = [
    `Yo, I hear you gang. As your senior who barely survived sophomore year: stay on top of attendance first, assignments second, and never study without previous year questions. What do you need help with right now?`,
    `Bro... that's valid. College is pure chaos, but we handle it one block at a time. Ask me to check attendance, simulate bunks, run an emergency plan, or check your project teammates.`,
    `We're chilling, but don't slack too hard. Tell me what's stressing you out and we'll break it down into an actual plan. What are we cooking?`,
  ];

  return {
    message: generalResponses[Math.floor(Math.random() * generalResponses.length)],
  };
}
