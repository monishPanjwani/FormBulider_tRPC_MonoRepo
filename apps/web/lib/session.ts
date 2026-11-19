import { cache } from "react";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, verifyAccessToken } from "@repo/trpc/server/access-token";
import { env } from "~/env.js";

export const getSessionUserId = cache(async () => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  return verifyAccessToken(token, env.JWT_SECRET)?.userId ?? null;
});
