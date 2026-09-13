import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();

    // Contextual extraction simulation based on document type
    if (fileName.includes('notice') || fileName.includes('circular') || fileName.includes('internal')) {
      return NextResponse.json({
        success: true,
        extracted: {
          title: 'Maths Unit 3 Internal Assessment Test',
          date: 'September 18, 2026',
          time: '10:00 AM – 11:30 AM',
          venue: 'Hall 302, Academic Block B',
          syllabus: 'Double Integrals, Green Theorem, Differential Equations (Units 1–3)',
          detectedType: 'exam',
          priority: 'urgent',
          seniorComment: 'Yo, I found something important. Maths Internal on September 18 covering Units 1–3. Do you want me to add this to your schedule and lock in a study block?',
        },
      });
    } else if (fileName.includes('timetable') || fileName.includes('schedule')) {
      return NextResponse.json({
        success: true,
        extracted: {
          title: 'Semester 3 Class Timetable',
          detectedType: 'timetable',
          subjectsDetected: ['Mathematics III', 'Applied Physics', 'DSA', 'DBMS'],
          seniorComment: 'Scanned your college timetable! I found 4 subjects and 16 lectures per week. Should I configure your weekly schedule blocks?',
        },
      });
    } else {
      // General assignment/syllabus upload
      return NextResponse.json({
        success: true,
        extracted: {
          title: `${file.name.replace(/\.[^/.]+$/, '')} Submission`,
          date: 'Friday, 11:59 PM',
          detectedType: 'assignment',
          priority: 'high',
          syllabus: 'Key problem sets and code implementation',
          seniorComment: `Scanned ${file.name}. Found an assignment deadline due this Friday. Want me to add it to your tasks?`,
        },
      });
    }
  } catch (error: any) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 });
  }
}
