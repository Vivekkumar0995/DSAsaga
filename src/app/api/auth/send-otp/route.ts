import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import { NextRequest, NextResponse } from "next/server";
import {Resend} from "resend"

export async function POST(req:NextRequest){
  try{
    await dbconnect();
    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    const {email} = await req.json();


    const expiry = Date.now() + 5 * 60 * 1000;
    const user = await UserModel.findOneAndUpdate(
      { email },
      { verifyOtp: otp, verifyOtpExpireAt: expiry },
      { new: true }
    );
    if(!user) return NextResponse.json({message:"User Not Found"}, {status:404})
    const resend  = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from:"onboarding@resend.dev",
      to:email,
      subject:"OTP for email verification on DSAsaga",
      html:`<h2>Your OTP is ${otp}</h2>`
    });


    return NextResponse.json({ message: "Check your email for verification OTP" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An Server Error occurred while sending OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }

}
