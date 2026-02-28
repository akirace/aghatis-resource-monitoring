import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const payload = await verifyToken(token);
        if (!payload) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth-token');
            return response;
        }
    }

    // Redirect authenticated users away from login
    if (pathname === '/login') {
        const token = request.cookies.get('auth-token')?.value;
        if (token) {
            const payload = await verifyToken(token);
            if (payload) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    // Redirect root to dashboard
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/login'],
};
