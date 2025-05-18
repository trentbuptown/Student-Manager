'use client';

import React from 'react';
import { StudentSidebar } from '@/components/student/StudentSidebar';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex md:w-64 md:flex-col border-r">
        <StudentSidebar />
      </aside>
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  );
} 