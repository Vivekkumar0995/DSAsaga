import dbconnect from "@/lib/mongodb";
import sendOTP from "@/lib/sendOTP";
import UserModel from "@/models/user_model";
import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/jose_auth";

export async function POST(req:NextRequest){
  try{
    await dbconnect();
    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    const {email, forWhat } = await req.json();

    if(!email) return NextResponse.json({message:"Email is required"}, {status:400})

    const expiry = Date.now() + 5 * 60 * 1000;
    const updateMap: Record<string, object> = {
      verification: { verifyOtp: otp, verifyOtpExpireAt: expiry },
      "verify-and-signup": { verifyOtp: otp, verifyOtpExpireAt: expiry },
      reset: { resetOtp: otp, resetOtpExpireAt: expiry },
    };
    const user = await UserModel.findOneAndUpdate(
      { email },
      updateMap[forWhat] || updateMap.verification,
      { new: true }
    );
    if(!user) return NextResponse.json({message:"User Not Found. Signup first."}, {status:404})
    
    const result = await sendOTP(email, otp);
    if(!result.success) throw new Error(result.message);

    const userId = user._id.toString();

    const otpForWhat = await encrypt( 
      {userId, otpForWhat: forWhat},
      '5m'
    );

    const response = NextResponse.json(
      { message: "Check your email for verification OTP" },{status:200})

      response.cookies.set("otpForWhat", otpForWhat, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge:5*60,
        sameSite: "lax",
        path:'/'
    });
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "A Server Error occurred while sending OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }

}
