import { TRPCError } from "@trpc/server";
import {
  createRefreshSession,
  revokeRefreshSession,
  rotateRefreshSession,
} from "@repo/services/user/refresh-session";
import type { TRPCContext } from "./context";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_LIFETIME_SECONDS,
  issueAccessToken,
  verifyAccessToken,
} from "./access-token";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test",
  sameSite: "lax" as const,
  path: "/",
};

function setTokens(ctx: TRPCContext, session: Awaited<ReturnType<typeof createRefreshSession>>) {
  const remaining = Math.floor(session.expiresAt.getTime() / 1000) - Math.floor(Date.now() / 1000);
  if (remaining <= 0) throw new TRPCError({ code: "UNAUTHORIZED" });
  const lifetime = Math.min(ACCESS_LIFETIME_SECONDS, remaining);
  ctx.setCookie(
    ACCESS_COOKIE,
    issueAccessToken(session.userId, process.env.JWT_SECRET!, lifetime),
    {
      ...cookieOptions,
      maxAge: lifetime * 1000,
    },
  );
  ctx.setCookie(REFRESH_COOKIE, session.token, { ...cookieOptions, expires: session.expiresAt });
}

export async function startSession(ctx: TRPCContext, userId: string) {
  setTokens(ctx, await createRefreshSession(userId));
}

export async function refreshSession(ctx: TRPCContext) {
  const session = await rotateRefreshSession(ctx.getCookie(REFRESH_COOKIE));
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
  setTokens(ctx, session);
}

export async function endSession(ctx: TRPCContext) {
  await revokeRefreshSession(ctx.getCookie(REFRESH_COOKIE));
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE])
    ctx.setCookie(name, "", { ...cookieOptions, maxAge: 0 });
}

export function readSession(ctx: TRPCContext) {
  return verifyAccessToken(ctx.getCookie(ACCESS_COOKIE), process.env.JWT_SECRET!);
}
