import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/sign-in", "/sign-up", "/"];

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    // If user is logged in and trying to access auth pages, redirect
    const userId = request.cookies.get("userId")?.value;

    if (userId && (pathname === "/sign-in" || pathname === "/sign-up")) {
      // Redirect to dashboard (role check happens on client/server)
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Protected routes - check if userId cookie exists
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - public (public files)
     * - images (image assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|public|images).*)",
  ],
};
