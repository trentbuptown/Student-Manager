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
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function StudentSidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      href: '/student-dashboard',
      icon: <Home className="mr-2 h-4 w-4" />,
      title: 'Trang chủ',
    },
    {
      href: '/student-dashboard/scores',
      icon: <GraduationCap className="mr-2 h-4 w-4" />,
      title: 'Kết quả học tập',
    },
    {
      href: '/student-dashboard/subjects',
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      title: 'Môn học',
    },
    {
      href: '/student-dashboard/schedule',
      icon: <Calendar className="mr-2 h-4 w-4" />,
      title: 'Lịch học',
    },
    {
      href: '/student-dashboard/profile',
      icon: <User className="mr-2 h-4 w-4" />,
      title: 'Hồ sơ cá nhân',
    },
  ];

  return (
    <div className={cn('pb-12', className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Quản lý học tập
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