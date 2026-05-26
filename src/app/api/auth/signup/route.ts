import UserModel from "@/models/user_model";
import LeaderboardModel from "@/models/leaderboard_model";
import { NextRequest, NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { redis } from "@/lib/redis";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export async function POST(req : NextRequest){
  try{
    await dbconnect();

    // IP-based Rate Limiting to prevent signup spam
    const ip = getClientIP(req);
    const ipLimit = await rateLimit({
      key: `rl:signup:ip:${ip}`,
      limit: 5,
      windowSeconds: 900, // 5 signup attempts per 15 minutes per IP
    });
    if (ipLimit) return ipLimit;

    const {name, password, email} = await req.json();
    if (!name || !password || !email){
      return NextResponse.json({message :"Missing field"}, {status:400});
    }
    const normalizedEmail = email.toLowerCase().trim();
    if(await UserModel.findOne({email: normalizedEmail})){
      return NextResponse.json({message:"User already exist"}, {status:400});
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      password: hashPassword,
      isAccountVerified: false,
      lastLoginAt: new Date(),
    });

    // Create a default leaderboard entry for the new user
    await LeaderboardModel.create({
      userId: user._id,
      score: 0,
      problemsSolved: 0,
      rank: "Beginner"
    });

    // Add new user to the redis leaderboard with 0 score
    await redis.zadd("leaderboard", { score: 0, member: user._id.toString() });

  return NextResponse.json({message:"Account created!!" , userId :user._id.toString()},{status:201})
 }
 catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }

}
