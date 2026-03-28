import UserModel from "@/models/user_model";
import LeaderboardModel from "@/models/leaderboard_model";
import { NextRequest, NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req : NextRequest){
  try{
   await dbconnect();
    const {name, password, email} = await req.json();
    if (!name || !password || !email){
      return NextResponse.json({message :"Missing field"}, {status:400});
    }
    if(await UserModel.findOne({email})){
      return NextResponse.json({message:"User already exist"}, {status:400});
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email,
      password: hashPassword,
      isAccountVerified: false,
    });

    // Create a default leaderboard entry for the new user
    await LeaderboardModel.create({
      userId: user._id,
      score: 0,
      problemsSolved: 0,
      rank: "Beginner"
    });

  return NextResponse.json({message:"Account created!!" , userId :user._id},{status:201})
 }
 catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }

}
