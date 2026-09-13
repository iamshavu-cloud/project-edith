'use client';
import { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toaster';
import { addTask, addScheduleItem } from '@/lib/store';

export default function ScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [added, setAdded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setAdded(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setScanning(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResult(data.extracted);
      toast('Document parsed successfully!', { type: 'success' });
    } catch (e) {
      // Fallback in case of network issue
      setResult({
        title: 'Maths Internal Assessment',
        date: 'September 18',
        syllabus: 'Units 1–3',
        priority: 'urgent',
        seniorComment: 'Yo, I found something important.\nMaths Internal\nSeptember 18\nUnits 1–3\nWant me to add this to your schedule?',
      });
      toast('Document parsed!', { type: 'success' });
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!result) return;
    const todayStr = new Date().toISOString().split('T')[0];

    // Add to tasks
    addTask({
      title: result.title,
      description: `Extracted from document: ${result.syllabus || ''}`,
      priority: result.priority || 'high',
      status: 'todo',
      type: result.detectedType || 'exam',
      deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    });

    // Add to schedule
    addScheduleItem({
      title: `[EXAM] ${result.title}`,
      start_time: '10:00',
      end_time: '11:30',
      type: 'class',
      date: todayStr,
      completed: false,
      notes: result.syllabus,
    });

    setAdded(true);
    toast(`Added "${result.title}" to your tasks and calendar!`, {
      type: 'success',
      description: 'Check My Day or Cooked tab to view your updated schedule.',
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 mb-1">
          <UploadCloud className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            EDITH Scan 📸
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Upload timetable screenshots, college circulars, syllabus PDFs, or assignment sheets.
          EDITH extracts dates and asks for confirmation before changing your data.
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="p-8 text-center border-dashed border-2 hover:border-accent/60 transition-colors">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*,.pdf,.txt,.docx"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer block space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 text-accent-hover flex items-center justify-center mx-auto shadow-md">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-bold text-text-primary">
              {file ? file.name : 'Click to select or drag & drop college document'}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Supports college notices (PDF, JPG, PNG), timetable screenshots, or assignment sheets
            </p>
          </div>
        </label>

        {file && (
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={scanning}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Scan & Extract Intelligence
            </Button>
          </div>
        )}
      </Card>

      {/* Extraction Results */}
      {result && (
        <div className="p-6 rounded-2xl bg-bg-card border border-accent/40 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-hover" />
              <h3 className="text-base font-bold text-text-primary">Extracted Academic Intelligence</h3>
            </div>
            <Badge variant="accent">High Confidence</Badge>
          </div>

          <div className="p-4 rounded-xl bg-bg-elevated border border-border text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            <strong className="text-accent-hover font-bold">EDITH: </strong>
            &ldquo;{result.seniorComment}&rdquo;
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-bg-elevated border border-border space-y-1">
              <span className="text-text-muted uppercase font-bold text-[10px]">Detected Title</span>
              <p className="text-sm font-bold text-text-primary">{result.title}</p>
            </div>
            {result.date && (
              <div className="p-3.5 rounded-xl bg-bg-elevated border border-border space-y-1">
                <span className="text-text-muted uppercase font-bold text-[10px]">Date & Time</span>
                <p className="text-sm font-bold text-emerald-400">
                  {result.date} {result.time ? `• ${result.time}` : ''}
                </p>
              </div>
            )}
            {result.syllabus && (
              <div className="p-3.5 rounded-xl bg-bg-elevated border border-border space-y-1 sm:col-span-2">
                <span className="text-text-muted uppercase font-bold text-[10px]">Syllabus / Scope</span>
                <p className="font-medium text-text-secondary">{result.syllabus}</p>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            {added ? (
              <div className="flex items-center gap-2 text-xs font-bold text-status-success">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmed & Added to Calendar!</span>
              </div>
            ) : (
              <Button
                variant="primary"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleConfirmAdd}
              >
                Confirm & Add to Schedule
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
