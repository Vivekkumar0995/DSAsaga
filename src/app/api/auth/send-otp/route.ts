import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import { NextRequest, NextResponse } from "next/server";
import {Resend} from "resend"
import React from "react";
import { OTPTemplate } from "@/components/OTPTemplate";

export async function POST(req:NextRequest){
  try{
    await dbconnect();
    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    const {email} = await req.json();

    if(!email) return NextResponse.json({message:"Email is required"}, {status:400})

    const expiry = Date.now() + 5 * 60 * 1000;
    const user = await UserModel.findOneAndUpdate(
      { email },
      { verifyOtp: otp, verifyOtpExpireAt: expiry },
      { new: true }
    );
    if(!user) return NextResponse.json({message:"User Not Found"}, {status:404})
    const resend  = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "DSA Saga <no-reply@dsasaga.in>",
      to: email,
      subject:"OTP for email verification on DSAsaga",
      react: React.createElement(OTPTemplate, { otp: otp })
    });


    return NextResponse.json({ message: "Check your email for verification OTP" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "A Server Error occurred while sending OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }

}
