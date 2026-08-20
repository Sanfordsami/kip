import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/login", "/signup", "/api/telegram/webhook"];

const MANAGER_ROUTES = ["/assignments", "/employees/new", "/tasks/new", "/admin"];

function isManagerRoute(path: string): boolean {
  return MANAGER_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
}

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // This response object carries any refreshed session cookies back to
  // the browser — critical, or sessions silently break over time.
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();

  if (!employee) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isManager = employee.role === "manager";

  if (isManagerRoute(path) && !isManager) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
