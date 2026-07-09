import { NextRequest ,NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import sendOTP from "@/lib/sendOTP";
import UserModel from "@/models/user_model";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/jose_auth";
import { redis } from "@/lib/redis";
import crypto from "crypto";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { createSession } from "@/lib/session";

// Emails that are automatically granted admin access (set in .env.local, with hardcoded fallback)
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export async function POST(req :NextRequest){
  try{
    await dbconnect();

    
    const ip = getClientIP(req);
    const ipLimit = await rateLimit({
      key: `rl:login:ip:${ip}`,
      limit: 10,
      windowSeconds: 900,
    });
    if (ipLimit) return ipLimit;

    const {email, password}  = await req.json();

    if(!email || !password){
      return NextResponse.json({message:"Email and Password required"},{status:400})
    }

    const normalizedEmail = email.toLowerCase().trim();

   
    const emailLimit = await rateLimit({
      key: `rl:login:email:${normalizedEmail}`,
      limit: 5,
      windowSeconds: 900, 
    });
    if (emailLimit) return emailLimit;

    const user  = await UserModel.findOne({email: normalizedEmail})
    if(!user){
      return NextResponse.json({message:"Invalid Credentials"},{status:400})
    }

    const isAdminEmail = ADMIN_EMAILS.has(normalizedEmail);

    if(!user.isAccountVerified && !isAdminEmail){
      const otp = crypto.randomInt(100000, 999999).toString(); // Case 3 Fix
      // Case 4 Fix: Store OTP in Redis instead of MongoDB
      await redis.set(`otp:${normalizedEmail}:verification`, otp, { ex: 300 });
      const result = await sendOTP(normalizedEmail, otp);
      if(!result.success) throw new Error(result.message);
      const otpForWhat = await encrypt(
        {userId:user._id.toString(), email: normalizedEmail, otpForWhat: "verification"},
        '5m'
      );

      const response = NextResponse.json(
        {message:"Verify your email first. " + result.message, next: "/otp"},{status:403})

        response.cookies.set("otpForWhat", otpForWhat, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge:5*60,
          sameSite: "lax",
          path:'/'
      });
      return response;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
      return NextResponse.json({message:"Wrong password"},{status:400})
    }

    const role = ADMIN_EMAILS.has(normalizedEmail) ? 'admin' : (user.role ?? 'user');
    
    user.lastLoginAt = new Date();
    if (user.role !== role) {
      user.role = role;
    }
    await user.save();

    const userId = user._id.toString();

    const sessionId = await createSession(userId, "credentials");

    const token = await encrypt(
      { userId, role, sessionId },
      '7d'
    );

    const response = NextResponse.json(
      {message:"Logged in SuccessFully", name:user.name},{status:201})

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge:7*24*60*60,
        sameSite: "lax",
        path:'/'
    });

    return response;
  }catch(error:unknown){
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
