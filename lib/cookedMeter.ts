import { CookedInput, CookedResult, RecoveryPlan, PlanItem } from '@/types';

export function calculateCookedScore(input: CookedInput): number {
  const { prep_percent, hours_available, deadline } = input;

  // Hours until deadline
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const hoursUntil = Math.max(0.5, diffMs / (1000 * 60 * 60));

  // Prep deficit (0 prep = 100 deficit, 100 prep = 0 deficit)
  const prepDeficit = 100 - Math.min(100, Math.max(0, prep_percent));

  // Time pressure: < 6 hours is extreme (100), > 48 hours is chill (0)
  const timePressure = Math.max(0, Math.min(100, 100 - (hoursUntil / 48) * 100));

  // Study deficit: comparing hours_available to hours needed (assuming ~10h needed for 0% prep)
  const estimatedHoursNeeded = (prepDeficit / 100) * 8;
  const ratio = hours_available >= estimatedHoursNeeded ? 0 : ((estimatedHoursNeeded - hours_available) / estimatedHoursNeeded) * 30;

  // Combined score (0-100)
  const rawScore = prepDeficit * 0.5 + timePressure * 0.35 + ratio;
  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

export function getCookedLevel(score: number): CookedResult['level'] {
  if (score <= 20) return 'chilling';
  if (score <= 40) return 'have_time';
  if (score <= 60) return 'lock_in';
  if (score <= 80) return 'cooked';
  return 'bro_lock_in';
}

export function getCookedLabel(level: CookedResult['level']): { label: string; emoji: string; message: string } {
  const map: Record<CookedResult['level'], { label: string; emoji: string; message: string }> = {
    chilling: {
      label: "You're chilling 😎",
      emoji: '😎',
      message: "Honestly gang, you're in a solid spot. Don't fumble it by procrastinating.",
    },
    have_time: {
      label: 'We have time.',
      emoji: '⏱️',
      message: "We've got decent runway. Stick to the plan and don't panic.",
    },
    lock_in: {
      label: 'Okay... lock in.',
      emoji: '⚡',
      message: "Time to put the phone in another room. Lock in for a few hours and we're good.",
    },
    cooked: {
      label: "You're getting cooked. 💀",
      emoji: '🔥',
      message: "Bro... it's looking rough ngl. But we're not finished yet. Emergency protocol engaged.",
    },
    bro_lock_in: {
      label: 'BRO. LOCK IN.',
      emoji: '🚨',
      message: "Ain't no way 💀 Bro is on maximum heat. Academic comeback arc starts RIGHT NOW.",
    },
  };
  return map[level];
}

export function generateRecoveryPlan(input: CookedInput): RecoveryPlan {
  const { syllabus, hours_available, type } = input;
  const totalMinutes = Math.max(60, Math.min(hours_available * 60, 720)); // cap at 12 hours

  // Check if syllabus was provided
  const rawLines = (syllabus || '')
    .split(/[\n,;]+/)
    .map(line => line.trim())
    .filter(Boolean);

  const mustDo: PlanItem[] = [];
  const shouldDo: PlanItem[] = [];
  const canSkip: PlanItem[] = [];

  if (rawLines.length >= 2) {
    const chunkTime = Math.max(25, Math.floor((totalMinutes * 0.7) / rawLines.length));
    rawLines.forEach((item, idx) => {
      const planItem: PlanItem = {
        id: `topic-${idx + 1}`,
        title: item,
        duration_minutes: chunkTime,
        priority: idx === 0 ? 'critical' : idx < Math.ceil(rawLines.length / 2) ? 'high' : 'medium',
        notes: idx === 0 ? 'Highest weightage / foundational concept' : undefined,
        completed: false,
      };

      if (idx < Math.ceil(rawLines.length * 0.4)) {
        mustDo.push(planItem);
      } else if (idx < Math.ceil(rawLines.length * 0.75)) {
        shouldDo.push(planItem);
      } else {
        canSkip.push(planItem);
      }
    });

    // Add revision and formula sweep
    mustDo.push({
      id: 'core-pyqs',
      title: 'Previous Year Questions (Top 3 Repeated)',
      duration_minutes: 45,
      priority: 'critical',
      notes: 'Focus on high-frequency questions only',
      completed: false,
    });

    shouldDo.push({
      id: 'quick-revision',
      title: 'Quick Revision & Formula Sheet',
      duration_minutes: 30,
      priority: 'high',
      completed: false,
    });
  } else {
    // Default tailored template by type
    if (type === 'exam') {
      mustDo.push(
        { id: 'm1', title: 'High-Weightage Unit 1 & 2 Core Theory', duration_minutes: 80, priority: 'critical', notes: 'Guaranteed 40% of paper weightage', completed: false },
        { id: 'm2', title: 'Last 3 Years Solved Question Papers (PYQs)', duration_minutes: 60, priority: 'critical', notes: 'Pattern matching & frequent derivations', completed: false }
      );
      shouldDo.push(
        { id: 's1', title: 'Formula & Definition Flash Revision', duration_minutes: 30, priority: 'high', completed: false },
        { id: 's2', title: 'Unit 3 Medium-Priority Numerical Problems', duration_minutes: 45, priority: 'medium', completed: false }
      );
      canSkip.push(
        { id: 'k1', title: 'Obscure edge-case derivations in Unit 4 & 5', duration_minutes: 40, priority: 'low', notes: 'Low return on investment for remaining time', completed: false },
        { id: 'k2', title: 'Reading full textbook paragraphs', duration_minutes: 30, priority: 'low', completed: false }
      );
    } else if (type === 'assignment') {
      mustDo.push(
        { id: 'm1', title: 'Solve Core Mandatory Questions (Part A & B)', duration_minutes: 75, priority: 'critical', notes: 'Covers 80% marks criteria', completed: false },
        { id: 'm2', title: 'Format diagrams, equations & code snippets', duration_minutes: 30, priority: 'high', completed: false }
      );
      shouldDo.push(
        { id: 's1', title: 'Answer Bonus / Optional questions if time permits', duration_minutes: 30, priority: 'medium', completed: false }
      );
      canSkip.push(
        { id: 'k1', title: 'Decorative cover styling & manual handwriting re-work', duration_minutes: 25, priority: 'low', completed: false }
      );
    } else {
      mustDo.push(
        { id: 'm1', title: 'Finish MVP Core Feature & Working Demo', duration_minutes: 90, priority: 'critical', notes: 'Must compile and execute with zero runtime crash', completed: false },
        { id: 'm2', title: 'Verify Demo Video / Run-through steps', duration_minutes: 30, priority: 'critical', completed: false }
      );
      shouldDo.push(
        { id: 's1', title: 'README documentation and setup script', duration_minutes: 30, priority: 'high', completed: false }
      );
      canSkip.push(
        { id: 'k1', title: 'Edge-case unit tests and micro CSS adjustments', duration_minutes: 45, priority: 'low', completed: false }
      );
    }
  }

  // Mandatory sanity break
  shouldDo.push({
    id: 'sanity-break',
    title: '15-min Water, Walk & Brain Reset Break',
    duration_minutes: 15,
    priority: 'medium',
    notes: "I'm not trying to turn you into a productivity robot. Hydrate, gang.",
    completed: false,
  });

  return { must_do: mustDo, should_do: shouldDo, can_skip: canSkip };
}

export function assessCooked(input: CookedInput): CookedResult {
  const score = calculateCookedScore(input);
  const level = getCookedLevel(score);
  const { label, emoji, message } = getCookedLabel(level);
  const plan = generateRecoveryPlan(input);

  return {
    score,
    level,
    label,
    emoji,
    message,
    plan,
  };
}
