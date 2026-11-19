import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { and, db, eq, lt, or } from "@repo/database";
import { refreshSessions } from "@repo/database/models/refresh_session";
import { env } from "../env";

const DAY_MS = 24 * 60 * 60 * 1000;
const CONCURRENT_REFRESH_MS = 60_000;
const digest = (token: string) => createHash("sha256").update(token).digest("hex");
const tokenPattern = /^([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})\.[a-f0-9]{64}$/;

export async function createRefreshSession(userId: string) {
  const id = randomUUID();
  const token = id + "." + randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + DAY_MS);
  await db.transaction(async (tx) => {
    await tx.delete(refreshSessions).where(lt(refreshSessions.expiresAt, new Date(Date.now())));
    await tx.insert(refreshSessions).values({ id, userId, tokenHash: digest(token), expiresAt });
  });
  return { userId, token, expiresAt };
}

export async function rotateRefreshSession(token?: string) {
  const id = token && tokenPattern.exec(token)?.[1];
  if (!id || !token) return null;
  return db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(refreshSessions)
      .where(eq(refreshSessions.id, id))
      .for("update");
    const now = Date.now();
    if (!session || session.expiresAt.getTime() <= now) return null;
    const submitted = digest(token);
    const recent = session.rotatedAt && now - session.rotatedAt.getTime() < CONCURRENT_REFRESH_MS;
    // The same predecessor must produce the same successor for concurrent tabs.
    const successor = () =>
      id +
      "." +
      createHmac("sha256", env.JWT_SECRET)
        .update("formcraft:refresh:" + token)
        .digest("hex");
    let nextToken: string;
    if (recent && submitted === session.previousHash) {
      nextToken = successor();
    } else if (submitted === session.tokenHash) {
      nextToken = recent ? token : successor();
      if (!recent) {
        await tx
          .update(refreshSessions)
          .set({
            tokenHash: digest(nextToken),
            previousHash: submitted,
            rotatedAt: new Date(now),
          })
          .where(eq(refreshSessions.id, id));
      }
    } else return null;
    return { userId: session.userId, token: nextToken, expiresAt: session.expiresAt };
  });
}

export async function revokeRefreshSession(token?: string) {
  const id = token && tokenPattern.exec(token)?.[1];
  if (!id || !token) return;
  const hashed = digest(token);
  await db
    .delete(refreshSessions)
    .where(
      and(
        eq(refreshSessions.id, id),
        or(eq(refreshSessions.tokenHash, hashed), eq(refreshSessions.previousHash, hashed)),
      ),
    );
}
