import crypto from "crypto";
import Session from "@/models/session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days


export async function createSession(
  userId: string,
  type: "credentials" | "google" | "otp" = "credentials"
): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await Session.create({ sessionId, userId, expiresAt, type });

  return sessionId;
}


export async function validateSession(sessionId: string): Promise<boolean> {
  const session = await Session.findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  }).lean();

  return session !== null;
}


export async function deleteSession(sessionId: string): Promise<void> {
  await Session.deleteOne({ sessionId });
}


export async function deleteAllSessions(userId: string): Promise<void> {
  await Session.deleteMany({ userId });
}
