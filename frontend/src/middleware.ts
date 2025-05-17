import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Middleware không thể truy cập localStorage vì nó chạy trên server
    // Thay vào đó, chúng ta sẽ sử dụng cookie để lưu token
    
    const token = request.cookies.get('auth_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    const currentPath = request.nextUrl.pathname;
    const isAuthPage = currentPath.startsWith('/sign-in');
    const isHomePage = currentPath === '/';
    
    console.log(`[Middleware] Path: ${currentPath}, Token: ${token ? 'exists' : 'none'}, Role: ${userRole || 'none'}`);

    // Nếu đang ở trang đăng nhập và có token, chuyển hướng đến trang tương ứng với vai trò
    if (token && isAuthPage) {
        console.log(`[Middleware] Redirecting from auth page to role-specific dashboard. Role: ${userRole}`);
        
        if (userRole === 'teacher') {
            return NextResponse.redirect(new URL('/teacher-dashboard', request.url));
        } else if (userRole === 'student') {
            return NextResponse.redirect(new URL('/student-dashboard', request.url));
        } else if (userRole === 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            // Mặc định nếu không xác định được vai trò
            console.log(`[Middleware] Role not recognized: ${userRole}, redirecting to home`);
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Nếu không phải trang đăng nhập và không có token, chuyển hướng đến trang đăng nhập
    // Ngoại trừ trang chủ, cho phép truy cập mà không cần đăng nhập
    if (!token && !isAuthPage && !isHomePage) {
        console.log(`[Middleware] No token, redirecting to sign-in from ${currentPath}`);
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Kiểm tra quyền truy cập vào các trang dành riêng
    if (token) {
        // Trang dành cho giáo viên
        if (currentPath.startsWith('/teacher-dashboard') && userRole !== 'teacher') {
            console.log(`[Middleware] Access denied: ${userRole} trying to access teacher dashboard`);
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        // Trang dành cho học sinh
        if (currentPath.startsWith('/student-dashboard') && userRole !== 'student') {
            console.log(`[Middleware] Access denied: ${userRole} trying to access student dashboard`);
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        // Trang dành cho admin
        if (currentPath.startsWith('/dashboard') && 
            !currentPath.startsWith('/teacher-dashboard') && 
            !currentPath.startsWith('/student-dashboard') && 
            userRole !== 'admin') {
            console.log(`[Middleware] Access denied: ${userRole} trying to access admin dashboard`);
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    console.log(`[Middleware] Access granted to ${currentPath}`);
    return NextResponse.next();
}

// Chỉ áp dụng middleware cho các đường dẫn cụ thể
export const config = {
    matcher: [
        '/',
        '/sign-in',
        '/dashboard/:path*',
        '/teacher-dashboard/:path*',
        '/student-dashboard/:path*',
    ]
}; 