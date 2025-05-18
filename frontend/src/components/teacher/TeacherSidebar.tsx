import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  GraduationCap, 
  BookOpen,
  Calendar,
  User,
  LogOut,
  FileBarChart,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TeacherSidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      href: '/teacher-dashboard',
      icon: <Home className="mr-2 h-4 w-4" />,
      title: 'Trang chủ',
    },
    {
      href: '/teacher-dashboard/scores',
      icon: <GraduationCap className="mr-2 h-4 w-4" />,
      title: 'Quản lý điểm',
    },
    {
      href: '/teacher-dashboard/reports',
      icon: <FileBarChart className="mr-2 h-4 w-4" />,
      title: 'Báo cáo & thống kê',
    },
    {
      href: '/teacher-dashboard/students',
      icon: <Users className="mr-2 h-4 w-4" />,
      title: 'Danh sách học sinh',
    },
    {
      href: '/teacher-dashboard/subjects',
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      title: 'Quản lý môn học',
    },
    {
      href: '/teacher-dashboard/schedule',
      icon: <Calendar className="mr-2 h-4 w-4" />,
      title: 'Lịch dạy học',
    },
    {
      href: '/teacher-dashboard/profile',
      icon: <User className="mr-2 h-4 w-4" />,
      title: 'Hồ sơ cá nhân',
    },
  ];

  return (
    <div className={cn('pb-12', className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Quản lý giảng dạy
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                  pathname === route.href ? 'bg-accent text-accent-foreground' : 'transparent'
                )}
              >
                {route.icon}
                {route.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3">
        <Link href="/logout">
          <Button variant="outline" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </Link>
      </div>
    </div>
  );
} 