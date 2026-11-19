import { hasSameOrigin } from "~/lib/request-origin";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, verifyAccessToken } from "@repo/trpc/server/access-token";
import { upstreamProcedure } from "./lib/trpc-upstream";

export async function proxy(request: NextRequest) {
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (
    !refresh ||
    verifyAccessToken(request.cookies.get(ACCESS_COOKIE)?.value, process.env.JWT_SECRET!)
  ) {
    return NextResponse.next();
  }
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/trpc/auth.") && pathname !== "/trpc/auth.me")
    return NextResponse.next();
  if (!hasSameOrigin(request)) return NextResponse.next();

  // Renew before rendering or running the original mutation. A mutation executes only once.
  const renewal = await fetch(upstreamProcedure("auth.refreshSession"), {
    method: "POST",
    body: "{}",
    headers: {
      cookie: REFRESH_COOKIE + "=" + encodeURIComponent(refresh),
      "content-type": "application/json",
    },
    cache: "no-store",
    redirect: "error",
  });
  if (renewal.status === 401) return NextResponse.next();
  if (!renewal.ok)
    return new NextResponse("Session service temporarily unavailable", {
      status: 503,
      headers: { "cache-control": "private, no-store" },
    });

  const headers = new Headers();
  for (const value of renewal.headers.getSetCookie()) headers.append("set-cookie", value);
  const cookies = new NextResponse(null, { headers }).cookies;
  const access = cookies.get(ACCESS_COOKIE);
  const rotated = cookies.get(REFRESH_COOKIE);
  if (!access || !rotated) return new NextResponse(null, { status: 502 });
  request.cookies.set(ACCESS_COOKIE, access.value);
  request.cookies.set(REFRESH_COOKIE, rotated.value);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(access);
  response.cookies.set(rotated);
  response.headers.set("cache-control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/builder", "/f/:path*", "/trpc/:procedure*"],
};
