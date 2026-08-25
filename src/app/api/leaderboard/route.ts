import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import { redis } from "@/lib/redis";
import UserProgress from "@/models/UserProgress";

export const revalidate = 60;

export async function GET() {
  try {
    await connectDB();

    const redisTopIds = await redis.zrange<string[]>("leaderboard", 0, 99, {
      rev: true,
    });

    let leaderboardData;

    const allUsers = await UserModel.find({}, "name profileImage");

    const progress = await UserProgress.find().populate({
      path: "userId",
      select: "name profileImage",
      model: UserModel,
    });

    leaderboardData = allUsers.map((user) => {
      const userProgress = progress.find(
        (p) => p.userId?._id?.toString() === user._id.toString(),
      );

      return {
        _id: userProgress?._id || user._id,
        xp: userProgress?.xp || 0,
        solvedCount: userProgress?.solvedCount || 0,
        currentRank: userProgress?.currentRank || "Beginner",
        userId: user,
      };
    });

    leaderboardData.sort((a, b) => b.xp - a.xp);

    // update redis
    await redis.del("leaderboard");

    if (leaderboardData.length > 0) {
      const pipeline = redis.pipeline();

      leaderboardData.forEach((entry) => {
        if (entry.userId && entry.userId._id) {
          pipeline.zadd("leaderboard", {
            score: entry.xp,
            member: entry.userId._id.toString(),
          });
        }
      });
      await pipeline.exec();
    }

    // Calculate the most recent update time from user progress
    const latestProgressUpdate = progress.reduce((latest, p) => {
      const current = new Date(p.updatedAt || p.createdAt || 0).getTime();
      return current > latest ? current : latest;
    }, 0);

    const lastUpdated = latestProgressUpdate > 0
      ? new Date(latestProgressUpdate).toISOString()
      : new Date().toISOString();

    const formattedLeaderboard = leaderboardData.map((entry) => ({
      _id: entry._id,
      score: entry.xp,
      problemsSolved: entry.solvedCount,
      rank: entry.currentRank,
      userId: entry.userId,
    }));

    return NextResponse.json(
      {
        message: "Leaderboard fetched successfully",
        leaderboard: formattedLeaderboard,
        lastUpdated,
        type: "global",
        description: "Ranked by total XP earned, problems solved, and level milestones. Top climbers are updated in real time."
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Leaderboard Fetch Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch leaderboard data" },
      { status: 500 },
    );
  }
}
