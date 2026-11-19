import { hasSameOrigin } from "~/lib/request-origin";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@repo/trpc/server/access-token";
import { upstreamProcedure } from "~/lib/trpc-upstream";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ procedure: string }> };

// Keep the session cookie on the web origin when the API is hosted on Netlify.
async function forward(request: NextRequest, context: RouteContext) {
  const { procedure } = await context.params;
  if (!/^[a-zA-Z0-9_]+(?:[.,][a-zA-Z0-9_]+)*$/.test(procedure)) {
    return new Response(null, { status: 404 });
  }
  if (request.method === "POST" && !hasSameOrigin(request)) {
    return new Response(null, { status: 403 });
  }

  const upstream = upstreamProcedure(procedure);
  upstream.search = request.nextUrl.search;
  const headers = new Headers();
  for (const key of ["accept", "content-type", "trpc-accept"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  const names =
    procedure === "auth.logout" || procedure === "auth.refreshSession"
      ? [ACCESS_COOKIE, REFRESH_COOKIE]
      : [ACCESS_COOKIE];
  const cookies = names.flatMap((name) => {
    const cookie = request.cookies.get(name);
    return cookie ? [name + "=" + encodeURIComponent(cookie.value)] : [];
  });
  if (cookies.length) headers.set("cookie", cookies.join("; "));
  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: request.method === "POST" ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    redirect: "error",
  });
  const outgoing = new Headers({ "Cache-Control": "private, no-store" });
  outgoing.set("content-type", response.headers.get("content-type") ?? "application/json");
  for (const value of response.headers.getSetCookie()) outgoing.append("set-cookie", value);
  return new Response(response.body, { status: response.status, headers: outgoing });
}

export { forward as GET, forward as POST };
