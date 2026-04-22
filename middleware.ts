import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest\\.webmanifest).*)",
  ],
};

async function hmacHex(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Always allow the sign-in page + its API
  if (pathname === "/signin" || pathname === "/api/signin") {
    return NextResponse.next();
  }

  // 1) cookie-based (preferred)
  const cookie = req.cookies.get("trip-auth")?.value;
  if (cookie) {
    const expected = await hmacHex(pass, user);
    if (cookie === expected) return NextResponse.next();
  }

  // 2) fall back to HTTP Basic Auth for older links
  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const [u, p] = decoded.split(":");
    if (u === user && p === pass) return NextResponse.next();
  }

  // Redirect HTML navigations to /signin; return 401 for API calls.
  const accept = req.headers.get("accept") ?? "";
  if (pathname.startsWith("/api/") || !accept.includes("text/html")) {
    return new NextResponse("Authentication required", { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/signin";
  url.search = "";
  return NextResponse.redirect(url);
}
