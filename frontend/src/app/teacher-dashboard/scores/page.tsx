'use client';

import React from 'react';
import { ScoreManagement } from '@/components/teacher/ScoreManagement';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

export default function TeacherScoresPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý điểm số</h1>
        <Breadcrumb className="mt-2">
          <BreadcrumbItem>
            <BreadcrumbLink href="/teacher-dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/teacher-dashboard/scores">Quản lý điểm số</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      
      <ScoreManagement />
    </div>
  );
} 