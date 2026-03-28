import { NextRequest ,NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req :NextRequest){
  try{
    await dbconnect();
    const {email ,password}  = await req.json();

    if(!email || !password){
      return NextResponse.json({message:"email and password Required"},{status:400})
    }

    const user  = await UserModel.findOne({email})
    if(!user){
      return NextResponse.json({message:"Invalid Credentials"},{status:400})
    }

    if(!user.isAccountVerified){
      return NextResponse.json({message:"Please verify your email first"},{status:403})
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
      return NextResponse.json({message:"Wrong password"},{status:400})
    } 

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign( 
      {userId:user._id},
      process.env.SECRET!,
      {expiresIn:'7d'}
    );

    const response = NextResponse.json(
      {message:"Logged in SucessFully", name:user.name},{status:201})

      response.cookies.set("token", token, {
        httpOnly :true,
        secure: process.env.NODE_ENV === "production",
        maxAge:7*24*60*60,
        sameSite: "strict",
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
