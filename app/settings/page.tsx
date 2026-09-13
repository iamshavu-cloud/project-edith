'use client';
import { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toaster';
import { getUser, setUser, loadDemoData, clearUser } from '@/lib/store';
import type { User as UserType } from '@/types';

export default function SettingsPage() {
  const [name, setName] = useState('Shaurya');
  const [college, setCollege] = useState('MIT College of Engineering');
  const [year, setYear] = useState(2);
  const [semester, setSemester] = useState(3);
  const [targetAttendance, setTargetAttendance] = useState(75);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setName(u.name);
      setCollege(u.college);
      setYear(u.year);
      setSemester(u.semester);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      name: name.trim() || 'Student',
      college: college.trim() || 'College',
      year: Number(year),
      semester: Number(semester),
    });
    toast('Profile updated successfully!', { type: 'success' });
  };

  const handleResetDemo = () => {
    if (confirm('Reset to hackathon demo dataset (Shaurya, MIT, Maths, Physics, DSA)?')) {
      loadDemoData();
      const u = getUser();
      if (u) {
        setName(u.name);
        setCollege(u.college);
        setYear(u.year);
        setSemester(u.semester);
      }
      toast('Demo data reset! Ready for presentation.', { type: 'success' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Settings & Profile
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Configure your student identity, college credentials, and attendance targets.
        </p>
      </div>

      {/* Profile Form */}
      <Card className="p-6">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-border/70">
          <User className="w-5 h-5 text-accent" />
          <h2 className="text-base font-bold text-text-primary">Student Identity</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Your Name"
            placeholder="Shaurya"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="College / University Name"
            placeholder="MIT College of Engineering"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Academic Year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              <option value="1">1st Year (Freshman)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Junior)</option>
              <option value="4">4th Year (Senior)</option>
            </Select>

            <Select
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit" icon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Demo Controls for Hackathon Judges */}
      <Card className="p-6 border-accent/30 bg-gradient-to-r from-accent/10 via-bg-card to-bg-card">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-hover" />
              <h3 className="text-base font-bold text-text-primary">Hackathon Demo Controls</h3>
            </div>
            <p className="text-xs text-text-secondary max-w-lg">
              Instantly reload the verified college presentation dataset (Maths 78.4%, Physics in danger at 71.4%, Group project at 72%, Emergency tasks).
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={handleResetDemo}
            icon={<RefreshCw className="w-4 h-4 text-accent" />}
          >
            Reset Demo Data
          </Button>
        </div>
      </Card>
    </div>
  );
}
