'use client';

import React from 'react';
import { ScoreReports } from '@/components/teacher/ScoreReports';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

export default function TeacherReportsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Báo cáo và thống kê</h1>
        <Breadcrumb className="mt-2">
          <BreadcrumbItem>
            <BreadcrumbLink href="/teacher-dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/teacher-dashboard/reports">Báo cáo và thống kê</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      
      <ScoreReports />
    </div>
  );
} 