import { NextRequest ,NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import sendOTP from "@/lib/sendOTP";
import UserModel from "@/models/user_model";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/jose_auth";

export async function POST(req :NextRequest){
  try{
    await dbconnect();
    const {email, password}  = await req.json();

    if(!email || !password){
      return NextResponse.json({message:"Email and Password required"},{status:400})
    }

    const user  = await UserModel.findOne({email})
    if(!user){
      return NextResponse.json({message:"Invalid Credentials"},{status:400})
    }

    if(!user.isAccountVerified){
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

    user.lastLoginAt = new Date();
    await user.save();

    const userId = user._id.toString();

    const token = await encrypt(
      {userId},
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
