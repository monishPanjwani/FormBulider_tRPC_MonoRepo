import { readSession } from "./session";
import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

const isAuthed = tRPCContext.middleware(({ next, ctx }) => {
  const session = readSession(ctx);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: { id: session.userId } } });
});

export const protectedProcedure = tRPCContext.procedure.use(isAuthed);
