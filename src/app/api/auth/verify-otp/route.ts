import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
 try{
   await dbconnect();
  const {email ,Otp} = await req.json();
  const user  = await UserModel.findOne({email});
  if(!user){
    return NextResponse.json({message:"User not found"},{status:400});
  }
  if(user.verifyOtp!==Otp){
    return NextResponse.json({message:"Invalid OTP"},{status:400});
  }
 if(user.verifyOtpExpireAt< Date.now()){
  return NextResponse.json({message:"OTP expire"});
 }

user.isAccountVerified = true
user.verifyOtp=""
user.verifyOtpExpireAt=0
await user.save();

return NextResponse.json({message:"Account verified"},{status:201});
 }catch(error:unknown){
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
 }

}
