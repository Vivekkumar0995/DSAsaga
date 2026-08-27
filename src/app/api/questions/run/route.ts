import { NextRequest, NextResponse } from "next/server";
import { executeCode } from "@/lib/sandbox/SandboxManager";
import { detectLanguageFromCode } from "@/lib/sandbox/languageDetector";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code, language, input, questionMeta, runOnlyReference } = body;

    const refCode = questionMeta?.reference_solution;

    if (runOnlyReference) {
      if (!refCode || !refCode.trim()) {
        return NextResponse.json(
          { success: false, error: "No reference solution available for this question" },
          { status: 400 }
        );
      }
      const refLang = detectLanguageFromCode(refCode).key;
      const referenceResult = await executeCode(refLang, refCode, input || "", questionMeta);
      return NextResponse.json({ success: true, referenceResult });
    }

    if (!code || !language) {
      return NextResponse.json(
        { success: false, error: "Code and language are required" },
        { status: 400 }
      );
    }

    const userResult = await executeCode(language, code, input || "", questionMeta);

    let referenceResult: any = null;
    if (refCode && refCode.trim()) {
      try {
        const refLang = detectLanguageFromCode(refCode).key;
        referenceResult = await executeCode(refLang, refCode, input || "", questionMeta);
      } catch (refErr: any) {
        console.error("Error executing reference solution in /api/questions/run:", refErr);
      }
    }

    return NextResponse.json({
      success: true,
      result: userResult,
      referenceResult,
    });
  } catch (err: any) {
    console.error("Error executing code in /api/questions/run:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal execution error" },
      { status: 500 }
    );
  }
}


