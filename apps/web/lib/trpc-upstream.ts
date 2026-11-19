// Server only. The browser always calls /trpc on the web origin.
export function upstreamProcedure(procedure?: string) {
  const configured = process.env.TRPC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const fallback = process.env.VERCEL
    ? "https://formbulider.netlify.app/trpc"
    : "http://localhost:8000/trpc";
  const url = new URL(configured && /^https?:\/\//i.test(configured) ? configured : fallback);
  if (process.env.VERCEL) url.protocol = "https:";
  const path = url.pathname.replace(/\/$/, "") || "/trpc";
  url.pathname = procedure ? path + "/" + procedure : path;
  return url;
}
