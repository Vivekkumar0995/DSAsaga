import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/jose_auth";
import { awardQuestionCompletion } from "@/services/progress.service";
import connectDB from "@/lib/mongodb";
import Question from "@/models/question_model";
import Submission from "@/models/submission_model";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { questionSlug, code, language, verdict, passed, total } = body;

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

    const question = await Question.findOne({ slug: questionSlug });
    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    // Save the submission details
    const submission = await Submission.create({
      userId,
      questionId: question._id,
      code: code || "",
      language: language || "javascript",
      verdict: verdict || "Wrong Answer",
      passed: passed || 0,
      total: total || 0,
    });

    let awardResult = { xpGained: 0, newLevel: 1, rank: "Beginner" };
    if (verdict === "Accepted") {
      // Call service to record question completion and award XP
      const result = await awardQuestionCompletion(String(userId), questionSlug);
      awardResult = {
        xpGained: result.xpGained || 0,
        newLevel: result.newLevel || 1,
        rank: result.rank || "Beginner",
      };
    } else {
      // If attempted, ensure we mark as attempted in SolvedQuestion
      const SolvedQuestion = mongoose.models.solved_question || mongoose.model("solved_question");
      const alreadySolved = await SolvedQuestion.findOne({ userId, questionId: question._id });
      if (!alreadySolved) {
        await SolvedQuestion.create({
          userId,
          questionId: question._id,
          questionSlug: question.slug,
          dataStructureSlug: question.category,
          status: "attempted",
          xpEarned: 0,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Submission saved successfully!",
      submission,
      ...awardResult,
    });

  } catch (error: any) {
    console.error("Error in questions submission route:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const questionSlug = searchParams.get("questionSlug");

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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await decrypt(token);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const question = await Question.findOne({ slug: questionSlug });
    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    const submissions = await Submission.find({ userId, questionId: question._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      submissions,
    });

  } catch (error: any) {
    console.error("Error in fetching submissions:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
