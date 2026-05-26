import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

interface RateLimitOptions {
  key: string;        // unique redis key (e.g. "rl:send-otp:email@x.com")
  limit: number;      // max requests allowed in the window
  windowSeconds: number; // rolling window in seconds
}

/**
 * Returns a 429 NextResponse when the limit is exceeded, otherwise null.
 * Usage: const limited = await rateLimit({...}); if (limited) return limited;
 */
export async function rateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<NextResponse | null> {
  const count = await redis.incr(key);
  if (count === 1) {
    // First hit — start the expiry window
    await redis.expire(key, windowSeconds);
  }

  if (count > limit) {
    return NextResponse.json(
      {
        message: `Too many requests. Please wait ${Math.ceil(windowSeconds / 60)} minute(s) and try again.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(windowSeconds) },
      }
    );
  }

  return null; // not limited
}

/**
 * Extracts the best-guess client IP from a Next.js request.
 */
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
