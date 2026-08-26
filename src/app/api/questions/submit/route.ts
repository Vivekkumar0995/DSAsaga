import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/jose_auth";
import { awardQuestionCompletion } from "@/services/progress.service";
import connectDB from "@/lib/mongodb";
import Question from "@/models/question_model";
import Submission from "@/models/submission_model";
import { executeCode } from "@/lib/sandbox/SandboxManager";
import mongoose from "mongoose";

function sortJsonArrays(obj: any): any {
  if (Array.isArray(obj)) {
    const mapped = obj.map(sortJsonArrays);
    return mapped.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  } else if (obj && typeof obj === "object") {
    const res: any = {};
    for (const key of Object.keys(obj).sort()) {
      res[key] = sortJsonArrays(obj[key]);
    }
    return res;
  }
  return obj;
}

function normalizeOutput(val: string | null | undefined, unordered = false): string {
  if (val == null) return "";
  const s = String(val).trim();
  if (!s) return "";

  try {
    let parsed = JSON.parse(s);
    if (unordered) {
      parsed = sortJsonArrays(parsed);
    }
    return JSON.stringify(parsed);
  } catch {
    return s
      .replace(/\r\n/g, "\n")
      .replace(/\s+/g, " ")
      .replace(/\s*([,\[\]\{\}:])\s*/g, "$1")
      .trim();
  }
}

function parseTopLevelInput(inputStr: string): any[] {
  let s = (inputStr || "").trim();
  if (!s) return [];

  s = s.replace(/^[a-zA-Z0-9_$]+\s*=\s*/, "").replace(/,\s*[a-zA-Z0-9_$]+\s*=\s*/g, ",");
  const sClean = s.replace(/\{/g, "[").replace(/\}/g, "]");

  const tokens: string[] = [];
  let current = "";
  let depth = 0;
  for (let i = 0; i < sClean.length; i++) {
    const ch = sClean[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      if (current.trim()) tokens.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) tokens.push(current.trim());

  return tokens.map(tok => {
    try {
      return JSON.parse(tok);
    } catch {
      if (tok.toLowerCase() === "true") return true;
      if (tok.toLowerCase() === "false") return false;
      if (!isNaN(Number(tok))) return Number(tok);
      return tok.replace(/^["']|["']$/g, "");
    }
  });
}

function checkOutputMatch(actual: string, expected: string, unordered = false, inputStr = "", questionMeta?: any): boolean {
  if (!expected && !actual) return true;
  const normalizedActual = normalizeOutput(actual, unordered);

  if (expected) {
    const options = expected.split("||").map((opt) => opt.trim());
    if (options.some((opt) => normalizeOutput(opt, unordered) === normalizedActual)) {
      return true;
    }
  }

  if (questionMeta && inputStr && actual) {
    const slug = (questionMeta.slug || questionMeta.title || "").toLowerCase();
    const title = (questionMeta.title || "").toLowerCase();

    if (slug.includes("two-sum") || title.includes("two sum") || title.includes("twosum")) {
      try {
        const actualArr = JSON.parse(normalizedActual);
        if (Array.isArray(actualArr) && actualArr.length === 2) {
          const i = Number(actualArr[0]);
          const j = Number(actualArr[1]);
          const parsedInput = parseTopLevelInput(inputStr);
          if (parsedInput.length >= 2 && Array.isArray(parsedInput[0])) {
            const nums = parsedInput[0];
            const target = Number(parsedInput[1]);
            if (!isNaN(i) && !isNaN(j) && i !== j && i >= 0 && i < nums.length && j >= 0 && j < nums.length) {
              if (nums[i] + nums[j] === target) {
                return true;
              }
            }
          }
        }
      } catch {}
    }

    if (slug.includes("3sum") || title.includes("3sum") || title.includes("three sum")) {
      try {
        const actualArr = JSON.parse(normalizedActual);
        const parsedInput = parseTopLevelInput(inputStr);
        if (Array.isArray(actualArr) && parsedInput.length >= 1 && Array.isArray(parsedInput[0])) {
          const nums = parsedInput[0];
          const target = parsedInput[1] !== undefined ? Number(parsedInput[1]) : 0;
          if (Array.isArray(actualArr[0])) {
            const isValid = actualArr.every((triplet: any) => {
              if (!Array.isArray(triplet) || triplet.length !== 3) return false;
              return triplet.reduce((a: number, b: number) => a + b, 0) === target;
            });
            if (isValid) return true;
          }
        }
      } catch {}
    }
  }

  if (expected) {
    try {
      const pActual = JSON.parse(normalizedActual);
      const pExpected = JSON.parse(normalizeOutput(expected));
      if (Array.isArray(pActual) && Array.isArray(pExpected) && pActual.length === pExpected.length) {
        const sortCmp = (a: any, b: any) =>
          typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
        const sortedA = [...pActual].sort(sortCmp);
        const sortedE = [...pExpected].sort(sortCmp);
        if (JSON.stringify(sortedA) === JSON.stringify(sortedE)) {
          return true;
        }
      }
    } catch {}
  }

  return false;
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
    let maxTimeMs = 0;

    // Secure server-side execution of all test cases (public + hidden)
    for (let i = 0; i < total; i++) {
      const tc = testCases[i];
      const execResult = await executeCode(language || "javascript", code || "", tc.input, question);

      if (execResult.timeMs > maxTimeMs) {
        maxTimeMs = execResult.timeMs;
      }

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

      if (checkOutputMatch(actualOutput, expectedOutput, Boolean(question.unordered_output), tc.input, question)) {
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

    const score = Math.round((passed / total) * 100);

    if (computedVerdict === "Accepted") {
      logs.push(`✅ All ${total}/${total} test cases passed! (100%)`);
    } else {
      logs.push(`📊 Partial Score: ${passed}/${total} test cases passed (${score}%)`);
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
      score,
      executionTimeMs: maxTimeMs,
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
      message: computedVerdict === "Accepted" ? "Accepted!" : `Verdict: ${computedVerdict} (${passed}/${total} passed)`,
      submission,
      verdict: computedVerdict,
      passed,
      total,
      score,
      executionTimeMs: maxTimeMs,
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
