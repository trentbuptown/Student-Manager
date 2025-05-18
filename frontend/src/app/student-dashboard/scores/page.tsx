'use client';

import React from 'react';
import { StudentScores } from '@/components/student/StudentScores';
import { Metadata } from 'next';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

export default function StudentScoresPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kết quả học tập</h1>
        <Breadcrumb className="mt-2">
          <BreadcrumbItem>
            <BreadcrumbLink href="/student-dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/student-dashboard/scores">Kết quả học tập</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>

      <StudentScores />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Kết quả học tập',
  description: 'Xem kết quả học tập của học sinh',
}; 