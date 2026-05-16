import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

   
    const token = request.cookies.get('token')?.value;
    const nextAuthToken = request.cookies.get('next-auth.session-token')?.value || request.cookies.get('__Secure-next-auth.session-token')?.value;

    const hasValidSession = !!token || !!nextAuthToken;

    const isAuthRoute = pathname.startsWith('/auth');
    const isProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/dashboard');

    if (isAuthRoute) {
        if (hasValidSession) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    if (isProtectedRoute) {
        if (!hasValidSession) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('next', pathname);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
