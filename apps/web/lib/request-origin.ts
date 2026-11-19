import type { NextRequest } from "next/server";

export function hasSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  // Next.js can normalize the internal request URL to localhost. Host retains
  // the web origin the browser used, including its port in local development.
  const host = request.headers.get("host");
  const scheme = process.env.VERCEL ? "https:" : request.nextUrl.protocol;
  return origin === scheme + "//" + host;
}
