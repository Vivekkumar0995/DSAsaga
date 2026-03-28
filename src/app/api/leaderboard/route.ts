import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LeaderboardModel from "@/models/leaderboard_model";
import UserModel from "@/models/user_model";
import { redis } from "@/lib/redis";

export const revalidate = 60;

export async function GET() {
  try {
    await connectDB();

    const redisTopIds = await redis.zrange<string[]>("leaderboard", 0, 99, { rev: true });

    let leaderboardData;

    if (redisTopIds && redisTopIds.length > 0) {
      console.log("Fetching Leaderboard from Redis Sorted Set! 🚄");
      const entries = await LeaderboardModel.find({
        userId: { $in: redisTopIds }
      }).populate({
        path: "userId",
        select: "name profileImage",
        model: UserModel
      });

      leaderboardData = redisTopIds
        .map((id: string) => entries.find(e => e.userId?._id?.toString() === id.toString()))
        .filter(Boolean);

    } else {
      console.log("Redis is empty. Fetching from Mongo & Populating Redis... 🐢");
      leaderboardData = await LeaderboardModel.find()
        .sort({ score: -1 })
        .limit(100)
        .populate({
          path: "userId",
          select: "name profileImage",
          model: UserModel
        });

      if (leaderboardData.length > 0) {
        const pipeline = redis.pipeline();
        leaderboardData.forEach(entry => {
          if (entry.userId && entry.userId._id) {
            pipeline.zadd("leaderboard", { score: entry.score, member: entry.userId._id.toString() });
          }
        });
        await pipeline.exec();
      }
    }

    return NextResponse.json(
      {
        message: "Leaderboard fetched successfully",
        leaderboard: leaderboardData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Leaderboard Fetch Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
