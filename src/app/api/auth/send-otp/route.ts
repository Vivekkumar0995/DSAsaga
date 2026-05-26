import dbconnect from "@/lib/mongodb";
import sendOTP from "@/lib/sendOTP";
import UserModel from "@/models/user_model";
import { NextRequest, NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/jose_auth";
import { redis } from "@/lib/redis";
import crypto from "crypto";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    await dbconnect();

    // 1. IP Rate Limiting
    const ip = getClientIP(req);
    const ipLimit = await rateLimit({
      key: `rl:send-otp:ip:${ip}`,
      limit: 5,
      windowSeconds: 600, // 5 requests per 10 minutes per IP
    });
    if (ipLimit) return ipLimit;

    // Generate a cryptographically secure 6-digit OTP (Case 3 Fix)
    const otp = crypto.randomInt(100000, 999999).toString();

    const body = await req.json();
    let { email, forWhat } = body;

    // Case 2 Fix: If email not in body, get user from encrypted cookie
    if (!email) {
      const otpCookie = req.cookies.get("otpForWhat")?.value;
      if (otpCookie) {
        const payload = await decrypt(otpCookie);
        if (payload) {
          if (payload.email) {
            email = String(payload.email);
          } else if (payload.userId) {
            const user = await UserModel.findById(payload.userId);
            email = user?.email;
          }
          // Also derive forWhat from cookie if not sent
          if (!forWhat && payload.otpForWhat) {
            forWhat = String(payload.otpForWhat);
          }
        }
      }
    }

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Email Rate Limiting
    const emailLimit = await rateLimit({
      key: `rl:send-otp:email:${normalizedEmail}`,
      limit: 3,
      windowSeconds: 600, // 3 requests per 10 minutes per Email
    });
    if (emailLimit) return emailLimit;

    const validFlows = ["verification", "verify-and-signup", "reset"];
    const resolvedForWhat = validFlows.includes(forWhat) ? forWhat : "verification";

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ message: "User Not Found. Signup first." }, { status: 404 });
    }

    // Case 4 & 7 Fix: Store OTP in Redis with 5-minute TTL instead of MongoDB
    // Key format: otp:{email}:{forWhat}  — isolated per flow, no single-field overwrite
    const redisKey = `otp:${normalizedEmail}:${resolvedForWhat}`;
    await redis.set(redisKey, otp, { ex: 300 }); // Auto-expires in exactly 5 minutes

    const result = await sendOTP(normalizedEmail, otp);
    if (!result.success) throw new Error(result.message);

    const userId = user._id.toString();

    const otpForWhat = await encrypt(
      { userId, email: normalizedEmail, otpForWhat: resolvedForWhat },
      "5m"
    );

    const response = NextResponse.json(
      { message: "Check your email for verification OTP" },
      { status: 200 }
    );

    response.cookies.set("otpForWhat", otpForWhat, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "A Server Error occurred while sending OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

