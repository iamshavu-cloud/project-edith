import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'EDITH — The AI Senior Every College Student Wishes They Had',
  description: 'Enhanced Digital Intelligence & Task Handler. Built for college chaos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-bg-primary text-text-primary">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto relative">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
