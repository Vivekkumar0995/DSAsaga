import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/jose_auth";
import { awardQuestionCompletion } from "@/services/progress.service";
import connectDB from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { questionSlug } = body;

    if (!questionSlug) {
      return NextResponse.json(
        { success: false, message: "questionSlug is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to save progress." },
        { status: 401 }
      );
    }

    const payload = await decrypt(token);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to save progress." },
        { status: 401 }
      );
    }

    // Call service to record question completion and award XP
    const result = await awardQuestionCompletion(String(userId), questionSlug);

    return NextResponse.json({
      success: true,
      message: result.message || "Submission recorded successfully!",
      xpGained: result.xpGained || 0,
      newLevel: result.newLevel || 1,
      rank: result.rank || "Beginner",
    });

  } catch (error: any) {
    console.error("Error in questions submission route:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
