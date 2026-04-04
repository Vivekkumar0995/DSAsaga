import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req:NextRequest){
  try{
    await dbconnect();
    const {email, otp, forWhat} = await req.json();
    const user = await UserModel.findOne({email});
    if(!user) return NextResponse.json({message:"User not found"}, {status:400});

    if(forWhat === "verify-and-signup"){
      if(user.verifyOtp!==otp) return NextResponse.json({message:"Invalid OTP"}, {status:400});
      if(user.verifyOtpExpireAt < Date.now()) return NextResponse.json({message:"OTP expired"}, {status:400});

      user.isAccountVerified = true;
      user.verifyOtp="";
      user.verifyOtpExpireAt=0;
      await user.save();

      const token = jwt.sign( 
        {userId:user._id},
        process.env.SECRET!,
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
    }
    else if(forWhat == "reset"){
      if(user.resetOtp!==otp) return NextResponse.json({message:"Invalid OTP"}, {status:400});
      if(user.resetOtpExpireAt < Date.now()) return NextResponse.json({message:"OTP expired"}, {status:400});
      user.resetOtp="";
      user.resetOtpExpireAt=0;
      user.resetOtpVerifiedTill = Date.now() + 5 * 60 * 1000;
      await user.save();

      const reset = jwt.sign( 
        {userId:user._id},
        process.env.SECRET!,
        {expiresIn:'5m'}
      );
      const response = NextResponse.json(
        {message:"Email verified. Input your new password.", name:user.name, next: "/auth/forgot-password"},{status:201})

        response.cookies.set("resetPassword", reset, {
          httpOnly :true,
          secure: process.env.NODE_ENV === "production",
          maxAge:5*60,
          sameSite: "strict",
          path:'/'
      });
      return response;
    }
    else if(forWhat == "verification"){
      if(user.verifyOtp!==otp) return NextResponse.json({message:"Invalid OTP"}, {status:400});
      if(user.verifyOtpExpireAt < Date.now()) return NextResponse.json({message:"OTP expired"}, {status:400});
      user.isAccountVerified = true;
      user.verifyOtp="";
      user.verifyOtpExpireAt=0;
      await user.save();

      return NextResponse.json({message:"Email verified. Now you can login.", name:user.name, next: "/auth/login"},{status:201});
    }
    else return NextResponse.json({message:"No case matched, got " + forWhat, name:user.name},{status:400});
  } catch(error:unknown){
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
