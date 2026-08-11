import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// These routes are public - anyone can access them
const PUBLIC_ROUTES = [
  '/login',
  '/api/telegram/webhook',
];

// These routes require manager role
const MANAGER_ROUTES = [
  '/assignments',
  '/assignments/new',
  '/employees/new',
  '/tasks/new',
  '/admin',
];

// Check if a path matches any manager route (including subpaths)
function isManagerRoute(path: string): boolean {
  return MANAGER_ROUTES.some(route => 
    path === route || path.startsWith(route + '/')
  );
}

// Check if a path is public
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    path === route || path.startsWith(route + '/')
  );
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle root path - redirect to login
  if (path === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // PUBLIC ROUTES - allow access without checks
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
        },
      },
    }
  );

  // Get the user session
  const { data: { user } } = await supabase.auth.getUser();

  // NOT LOGGED IN - redirect to login
  if (!user || !user.email) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Get employee role from database
  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('email', user.email)
    .maybeSingle();

  // If employee not found in database, redirect to login
  if (!employee) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isManager = employee.role === 'manager';

  // Check if this is a manager-only route
  if (isManagerRoute(path)) {
    // NOT A MANAGER - redirect to dashboard
    if (!isManager) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // LOGGED IN AND AUTHORIZED - allow access
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};