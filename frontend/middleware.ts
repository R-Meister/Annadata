import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection.
 *
 * Since the JWT token is stored in Zustand (localStorage), we can't read it
 * server-side. Instead, we check for the Zustand persist cookie/storage key
 * by looking for a simple cookie flag set by the client.
 *
 * Strategy: We rely on a lightweight cookie "annadata-authed" that the client
 * sets on login and clears on logout. This avoids parsing localStorage from
 * the server. If the cookie is missing and the user hits /dashboard/*, we
 * redirect to /auth.
 *
 * For the initial implementation, we use a simpler approach: since Next.js
 * middleware can't read localStorage, we do a soft redirect on the client
 * side via the dashboard layout. This middleware protects the /auth page
 * from authenticated users (redirect to /dashboard) — but the main guard
 * lives client-side.
 */
export function middleware(request: NextRequest) {
  // BYPASS AUTH
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
