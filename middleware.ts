import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const buyerPrefixes = ["/tickets", "/orders", "/buyer"];
const organizerPrefixes = ["/organizer"];
const checkinPrefixes = ["/checkin"];

// Security headers per spec
// - CSP básica, X-Frame-Options DENY, Referrer-Policy strict-origin
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const path = request.nextUrl.pathname;

  const isBuyerArea = buyerPrefixes.some((prefix) => path.startsWith(prefix));
  const isOrganizerArea = organizerPrefixes.some((prefix) => path.startsWith(prefix));
  const isCheckinArea = checkinPrefixes.some((prefix) => path.startsWith(prefix));

  const userRole = token?.role as string | undefined;

  if (isBuyerArea && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isOrganizerArea && !["organizer", "admin"].includes(userRole ?? "")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isCheckinArea && !["operator", "organizer", "admin"].includes(userRole ?? "")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Request-Id", request.headers.get("x-request-id") ?? crypto.randomUUID());

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|api/auth).*)"],
};
