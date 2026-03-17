import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req:NextRequest){
  try{
    await dbconnect();
    const {email, otp} = await req.json();
    const user = await UserModel.findOne({email});
    if(!user) return NextResponse.json({message:"User not found"}, {status:400});
    if(user.verifyOtp!==otp) return NextResponse.json({message:"Invalid OTP"}, {status:400});
    if(user.verifyOtpExpireAt < Date.now()) return NextResponse.json({message:"OTP expired"}, {status:400});

    user.isAccountVerified = true;
    user.verifyOtp="";
    user.verifyOtpExpireAt=0;
    await user.save();

    const token = jwt.sign( 
      {userId:user._id},process.env.SECRET!,
      {expiresIn:'7d'}
    );

    const response = NextResponse.json(
      {message:"Account verified. Successfully signed up", name:user.name},{status:201})

      response.cookies.set("token", token, {
        httpOnly :true,
        secure: process.env.NODE_ENV === "production",
        maxAge:7*24*60*60,
        sameSite: "strict",
        path:'/'
    });
    return response;
  } catch(error:unknown){
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
