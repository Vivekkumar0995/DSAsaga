import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jose_auth';


const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/otp'];

const PROTECTED_ROUTES = ['/dashboard', '/main/profile', '/main/leaderboard'];

const ADMIN_ROUTES = ['/admin'];


function isMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

function redirectTo(destination: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(destination, request.url));
}

function redirectToLogin(
  request: NextRequest,
  clearCookie = false,
): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  if (clearCookie) {
    response.cookies.set('token', '', { path: '/', maxAge: 0 });
  }
  return response;
}

function clearTokenAndContinue(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  response.cookies.set('token', '', { path: '/', maxAge: 0 });
  return response;
}


async function getValidPayload(token: string) {
  try {
    const payload = await decrypt(token);
    if (!payload || typeof payload !== 'object') return null;
    return payload;
  } catch {
    return null;
  }
}

async function isSessionValid(
  sessionId: string,
  request: NextRequest
): Promise<boolean> {
  try {
    const url = new URL('/api/auth/session/validate', request.url);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return true;
  }
}


export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (isMatch(pathname, AUTH_ROUTES)) {
    if (!token) return NextResponse.next();

    const payload = await getValidPayload(token);

    if (payload) {
      return redirectTo('/', request);
    } else {
      return clearTokenAndContinue(request);
    }
  }

  if (isMatch(pathname, ADMIN_ROUTES)) {
    if (!token) return redirectToLogin(request);

    const payload = await getValidPayload(token);
    if (!payload) return redirectToLogin(request, true);

    const sessionId = (payload as { sessionId?: string }).sessionId;
    if (sessionId && !(await isSessionValid(sessionId, request))) {
      return redirectToLogin(request, true);
    }

    const isAdmin = (payload as { role?: string }).role === 'admin';
    if (!isAdmin) {
      return redirectTo('/', request);
    }

    return NextResponse.next();
  }

  // ── Protected Routes ───────────────────────────────────────────────────────
  if (isMatch(pathname, PROTECTED_ROUTES)) {
    if (!token) return redirectToLogin(request);

    const payload = await getValidPayload(token);
    if (!payload) return redirectToLogin(request, true);

    const sessionId = (payload as { sessionId?: string }).sessionId;
    if (sessionId && !(await isSessionValid(sessionId, request))) {
      return redirectToLogin(request, true);
    }

    return NextResponse.next();
  }

  // ── Public Routes ──────────────────────────────────────────────────────────
  return NextResponse.next();
}

// ─── Route Matcher Config ─────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico   (browser icon)
     * - /api          (API routes handle their own auth)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
