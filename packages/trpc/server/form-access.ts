import { TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { userService } from "./services";
import { readSession } from "./session";

type FormAccess = {
  status: string;
  visibility: string;
  userId: string;
  allowedEmails: unknown;
};

export async function requireRespondentAccess(ctx: Context, form: FormAccess | null) {
  if (!form || form.status !== "published" || form.visibility === "unlisted") {
    throw new TRPCError({ code: "NOT_FOUND", message: "Form unavailable" });
  }
  if (form.visibility === "public") return;

  const session = readSession(ctx);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
  if (form.userId === session.userId) return;
  const user = await userService.getUserById(session.userId);
  if (!user || !Array.isArray(form.allowedEmails) || !form.allowedEmails.includes(user.email)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}
