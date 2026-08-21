import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/jose_auth";
import { awardQuestionCompletion } from "@/services/progress.service";
import connectDB from "@/lib/mongodb";
import Question from "@/models/question_model";
import Submission from "@/models/submission_model";
import { executeCode } from "@/lib/sandbox/SandboxManager";
import mongoose from "mongoose";

function normalizeOutput(val: string | null | undefined): string {
  if (val == null) return "";
  const s = String(val).trim();
  if (!s) return "";

  try {
    const parsed = JSON.parse(s);
    return JSON.stringify(parsed);
  } catch {
    return s
      .replace(/\r\n/g, "\n")
      .replace(/\s+/g, " ")
      .replace(/\s*([,\[\]\{\}:])\s*/g, "$1")
      .trim();
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { questionSlug, code, language } = body;

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

    const testCases = question.test_cases || [];
    if (!testCases.length) {
      return NextResponse.json(
        { success: false, message: "No test cases found for this question" },
        { status: 400 }
      );
    }

    let passed = 0;
    const total = testCases.length;
    let computedVerdict = "Accepted";
    const logs: string[] = [];

    // Secure server-side execution of all test cases (public + hidden)
    for (let i = 0; i < total; i++) {
      const tc = testCases[i];
      const execResult = await executeCode(language || "javascript", code || "", tc.input, question);

      if (execResult.errorType) {
        computedVerdict = execResult.errorType;
        if (tc.is_hidden) {
          logs.push(`Testcase ${i + 1}/${total} (Hidden): ${execResult.errorType}`);
        } else {
          logs.push(`Testcase ${i + 1}/${total} (Sample): ${execResult.errorType}`);
          if (execResult.stderr) logs.push(`   ${execResult.stderr}`);
        }
        break;
      }

      const actualOutput = execResult.stdout ? execResult.stdout.trim() : "";
      const expectedOutput = tc.output ? tc.output.trim() : "";

      if (normalizeOutput(actualOutput) === normalizeOutput(expectedOutput)) {
        passed++;
      } else {
        computedVerdict = "Wrong Answer";
        if (tc.is_hidden) {
          logs.push(`❌ Failed on Hidden Testcase ${i + 1}/${total}`);
          logs.push(`   Input & expected output are hidden for security.`);
        } else {
          logs.push(`❌ Failed on Sample Testcase ${i + 1}/${total}`);
          logs.push(`   Input:    ${tc.input}`);
          logs.push(`   Output:   ${actualOutput}`);
          logs.push(`   Expected: ${expectedOutput}`);
        }
        break;
      }
    }

    if (computedVerdict === "Accepted") {
      logs.push(`✅ All ${total}/${total} test cases passed!`);
    }

    // Save submission record
    const submission = await Submission.create({
      userId,
      questionId: question._id,
      code: code || "",
      language: language || "javascript",
      verdict: computedVerdict,
      passed,
      total,
    });

    let awardResult = { xpGained: 0, newLevel: 1, rank: "Beginner" };
    if (computedVerdict === "Accepted") {
      const result = await awardQuestionCompletion(String(userId), questionSlug);
      awardResult = {
        xpGained: result.xpGained || 0,
        newLevel: result.newLevel || 1,
        rank: result.rank || "Beginner",
      };
    } else {
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
      message: computedVerdict === "Accepted" ? "Accepted!" : `Verdict: ${computedVerdict}`,
      submission,
      verdict: computedVerdict,
      passed,
      total,
      logs,
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
