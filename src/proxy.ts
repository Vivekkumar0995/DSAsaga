import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from "@/lib/jose_auth"

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/otp');
    const isProtectedRoute = pathname.startsWith('/main/profile') || pathname.startsWith('/dashboard');

    if (isAuthRoute) {
        if (token) {
            try {
                await decrypt(token);
                return NextResponse.redirect(new URL('/', request.url));
            } catch {
                const response = NextResponse.next();
                response.cookies.set('token', '', { path: '/', maxAge: 0 });
                return response;
            }
        }
        return NextResponse.next();
    }

    if (isProtectedRoute) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('next', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            await decrypt(token);
            return NextResponse.next();
        } catch (error) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('next', pathname);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.set('token', '', { path: '/', maxAge: 0 });
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
