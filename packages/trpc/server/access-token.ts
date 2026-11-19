import JWT from "jsonwebtoken";

export const ACCESS_COOKIE = "authToken";
export const REFRESH_COOKIE = "refreshToken";
export const ACCESS_LIFETIME_SECONDS = 60 * 60;
const issuer = "formcraft";
const audience = "formcraft-web";

export function issueAccessToken(userId: string, secret: string, lifetime: number) {
  return JWT.sign({}, secret, {
    algorithm: "HS256",
    subject: userId,
    issuer,
    audience,
    expiresIn: lifetime,
  });
}

export function verifyAccessToken(token: string | undefined, secret: string) {
  if (!token) return null;
  try {
    const claims = JWT.verify(token, secret, { algorithms: ["HS256"], issuer, audience });
    if (
      typeof claims === "string" ||
      typeof claims.sub !== "string" ||
      typeof claims.iat !== "number" ||
      typeof claims.exp !== "number"
    )
      return null;
    return { userId: claims.sub, issuedAt: claims.iat };
  } catch {
    return null;
  }
}
