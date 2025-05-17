import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Middleware không thể truy cập localStorage vì nó chạy trên server
    // Thay vào đó, chúng ta sẽ sử dụng cookie để lưu token
    
    const token = request.cookies.get('auth_token')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/sign-in');

    // Nếu đang ở trang đăng nhập và có token, chuyển hướng đến dashboard
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Nếu không phải trang đăng nhập và không có token, chuyển hướng đến trang đăng nhập
    if (!token && !isAuthPage && request.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
}; 