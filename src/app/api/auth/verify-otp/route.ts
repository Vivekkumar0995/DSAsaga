import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import { NextRequest, NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/jose_auth";
import { redis } from "@/lib/redis";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    await dbconnect();

    // IP Rate Limiting to prevent distributed or session-based brute forcing
    const ip = getClientIP(req);
    const ipLimit = await rateLimit({
      key: `rl:verify-otp:ip:${ip}`,
      limit: 20,
      windowSeconds: 900, // 20 attempts per 15 minutes per IP
    });
    if (ipLimit) return ipLimit;

    const { otp } = await req.json();

    // Case 2 & 8 Fix: Read user identity from encrypted HTTP-only cookie (not client body)
    const otpCookie = req.cookies.get("otpForWhat")?.value;
    if (!otpCookie) {
      return NextResponse.json(
        { message: "Session expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    const payload = await decrypt(otpCookie);
    if (!payload || !payload.userId || !payload.otpForWhat) {
      return NextResponse.json(
        { message: "Invalid session. Please request a new OTP." },
        { status: 400 }
      );
    }

    const forWhat = String(payload.otpForWhat);
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    const email = (payload.email ? String(payload.email) : user.email).toLowerCase().trim();

    // Case 5 Fix: Brute-force rate limiting — max 5 attempts per email per flow
    const attemptKey = `otp-attempts:${email}:${forWhat}`;
    const failedCount = (await redis.get<number>(attemptKey)) || 0;

    if (failedCount >= 5) {
      return NextResponse.json(
        { message: "Too many failed attempts. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    // Case 4 Fix: Read OTP from Redis instead of MongoDB plaintext field
    const redisKey = `otp:${email}:${forWhat}`;
    const storedOtp = await redis.get<string>(redisKey);

    if (!storedOtp) {
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (String(storedOtp).trim() !== String(otp).trim()) {
      // Increment failed attempt counter
      const currentFails = await redis.incr(attemptKey);
      if (currentFails === 1) {
        await redis.expire(attemptKey, 900); // 15-minute lockout window
      }
      const remaining = 5 - currentFails;
      return NextResponse.json(
        { message: `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` },
        { status: 400 }
      );
    }

    // OTP is correct — delete it immediately so it cannot be reused (Case 7 Fix)
    await redis.del(redisKey);
    // Clear the attempt counter on success
    await redis.del(attemptKey);

    // Handle each flow
    if (forWhat === "verify-and-signup") {
      user.isAccountVerified = true;
      await user.save();

      const token = await encrypt({ userId: user._id.toString() }, "7d");
      const response = NextResponse.json(
        { message: "Account verified. Successfully signed up", name: user.name },
        { status: 201 }
      );
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
        path: "/",
      });
      response.cookies.set("otpForWhat", "", { path: "/", maxAge: 0 });
      return response;
    }

    if (forWhat === "reset") {
      // Issue a short-lived resetPassword cookie to authorize the password change page
      const reset = await encrypt({ userId: user._id.toString() }, "5m");
      const response = NextResponse.json(
        { message: "Email verified. Input your new password.", name: user.name, next: "/forgot-password" },
        { status: 201 }
      );
      response.cookies.set("resetPassword", reset, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 5 * 60,
        sameSite: "lax",
        path: "/",
      });
      response.cookies.set("otpForWhat", "", { path: "/", maxAge: 0 });
      return response;
    }

    if (forWhat === "verification") {
      user.isAccountVerified = true;
      await user.save();
      return NextResponse.json(
        { message: "Email verified. Now you can login.", name: user.name, next: "/login" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: "Unknown OTP flow: " + forWhat },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

