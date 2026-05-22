import { NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import sendOTP from "@/lib/sendOTP";
import UserModel from "@/models/user_model";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/jose_auth";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const oauthClient = new OAuth2Client(CLIENT_ID);

async function extractCredentialFromRequest(req: Request): Promise<{ credential: string | null; next: string | null }> {
  const url = new URL(req.url);
  const nextParam = url.searchParams.get("next");

  // Try to read body (JSON or form-encoded)
  const text = await req.text();
  if (text) {
    try {
      const json = JSON.parse(text);
      return { credential: (json.credential as string) ?? null, next: json.next ?? nextParam };
    } catch (_e) {
      const params = new URLSearchParams(text);
      return { credential: params.get("credential"), next: params.get("next") ?? nextParam };
    }
  }

  // Finally, check query string
  return { credential: url.searchParams.get("credential"), next: nextParam };
}

export async function POST(req: Request) {
  try {
    const { credential, next } = await extractCredentialFromRequest(req);
    if (!credential) {
      return NextResponse.json({ message: "No credential provided" }, { status: 400 });
    }

    if (!CLIENT_ID) {
      return NextResponse.json({ message: "Server misconfiguration: missing GOOGLE_CLIENT_ID" }, { status: 500 });
    }

    // Verify the ID token with Google's auth library
    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ message: "Invalid ID token payload" }, { status: 400 });
    }

    // Connect DB and find or create user
    await dbconnect();
    const email = payload.email;
    const googleSubID = payload.sub;
    let user = await UserModel.findOne({ googleSubID });
    let emailUser = await UserModel.findOne({ email });
    if (!user && !emailUser) {
      // create a user with a random password (required by schema)
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await UserModel.create({
        name: payload.name || "",
        email,
        googleSubID,
        password: hashed,
        isAccountVerified: !!payload.hd || payload.email.includes("@gmail.com"),
        profileImage: payload.picture || "",
        displayName: payload.name || "",
      } as any);
    }
    if (!user) user = emailUser;
    if (emailUser) {
      if (payload.hd || payload.email.includes("@gmail.com")) user.isAccountVerified = true;
      user.googleSubID = googleSubID;
      if (!user.isAccountVerified){
        const otp = Math.floor(Math.random() * 900000 + 100000).toString();
        const expiry = Date.now() + 5 * 60 * 1000;
        await UserModel.findOneAndUpdate(
          { email },
          { verifyOtp: otp, verifyOtpExpireAt: expiry },
          { new: true }
        );
        const result = await sendOTP(email, otp);
        if(!result.success) throw new Error(result.message);
        const otpForWhat = await encrypt( 
          {userId:user._id, otpForWhat: "verification"},
          '5m'
        );

        const response = NextResponse.json(
          {message:"Verify your email first. " + result.message, next: "/auth/otp"},{status:403})

          response.cookies.set("otpForWhat", otpForWhat, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge:5*60,
            sameSite: "lax",
            path:'/'
        });
        return response;
      }
    }

    user.lastLoginAt = new Date();
    await user.save();

    // Issue server JWT cookie (same as regular login)
    const token = await encrypt({ userId: user._id }, "7d");
    const response = NextResponse.json(
      {message:"Google login successful", name:user.name},{status:201})

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge:7*24*60*60,
        sameSite: "lax",
        path:'/'
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Support GET in case Google redirects with query params
  return POST(req);
}