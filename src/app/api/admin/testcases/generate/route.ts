import { NextRequest, NextResponse } from "next/server";
import { executeCode } from "@/lib/sandbox/SandboxManager";
import { detectLanguageFromCode } from "@/lib/sandbox/languageDetector";

export function parseInputsFromRaw(rawText: string): string[] {
  const text = (rawText || "").trim();
  if (!text) return [];

  // 1. Try parsing as JSON array
  if (text.startsWith("[") && text.endsWith("]")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) =>
          typeof item === "object" ? JSON.stringify(item) : String(item)
        );
      }
    } catch {
      // Fallback to delimiter parsing
    }
  }

  // 2. Try parsing delimited blocks like ===INPUT=== or ---
  if (text.includes("===INPUT===")) {
    return text
      .split("===INPUT===")
      .map((block) => block.replace(/===OUTPUT===[\s\S]*/, "").trim())
      .filter(Boolean);
  }

  if (text.includes("---")) {
    return text.split("---").map((b) => b.trim()).filter(Boolean);
  }

  // 3. Try parsing double-newline delimited blocks
  if (text.includes("\n\n") || text.includes("\r\n\r\n")) {
    return text.split(/\r?\n\r?\n+/).map((b) => b.trim()).filter(Boolean);
  }

  // 4. Pair line size headers with array lines if present (e.g. line 1: "5", line 2: "4 2 4 4 3")
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const blocks: string[] = [];
  let idx = 0;
  while (idx < lines.length) {
    const currentLine = lines[idx];
    const numMatch = currentLine.match(/^\d+$/);
    if (numMatch && idx + 1 < lines.length) {
      const size = parseInt(currentLine, 10);
      const nextLine = lines[idx + 1];
      const numbersInNextLine = nextLine.split(/\s+/).filter(Boolean).length;
      if (size === numbersInNextLine) {
        blocks.push(`${currentLine}\n${nextLine}`);
        idx += 2;
        continue;
      }
    }
    blocks.push(currentLine);
    idx++;
  }

  return blocks;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      language = "javascript",
      referenceCode,
      inputs,
      rawInputText,
      questionMeta = {},
      sampleCount = 3,
    } = body;

    if (!referenceCode || !referenceCode.trim()) {
      return NextResponse.json(
        { success: false, message: "referenceCode is required to auto-generate test cases" },
        { status: 400 }
      );
    }

    let inputList: string[] = [];
    if (Array.isArray(inputs) && inputs.length > 0) {
      inputList = inputs.map((i) => (typeof i === "object" ? JSON.stringify(i) : String(i).trim()));
    } else if (rawInputText && typeof rawInputText === "string") {
      inputList = parseInputsFromRaw(rawInputText);
    }

    if (!inputList.length) {
      return NextResponse.json(
        { success: false, message: "No input test cases supplied" },
        { status: 400 }
      );
    }

    const generatedTestCases: { input: string; output: string; is_hidden: boolean }[] = [];
    const errors: string[] = [];

    const targetLang = language && language !== "javascript"
      ? language
      : detectLanguageFromCode(referenceCode).key;

    for (let i = 0; i < inputList.length; i++) {
      const inputStr = inputList[i];
      const result = await executeCode(targetLang, referenceCode, inputStr, questionMeta);

      if (result.errorType) {
        errors.push(`Input ${i + 1} ("${inputStr.substring(0, 30)}..."): ${result.errorType} - ${result.stderr}`);
        break;
      }

      let rawOutput = result.stdout ? result.stdout.trim() : "";
      let finalOutput = rawOutput;

      try {
        const parsed = JSON.parse(rawOutput);
        const isMultiOption = body.isMultiOption || questionMeta?.multi_option;
        if (isMultiOption && Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          // Multi-option return e.g. [[0,1], [2,3]] -> "[0,1]||[2,3]"
          finalOutput = parsed.map((opt: any) => JSON.stringify(opt)).join("||");
        }
      } catch {}

      generatedTestCases.push({
        input: inputStr,
        output: finalOutput,
        is_hidden: i >= sampleCount,
      });
    }

    if (errors.length > 0 && generatedTestCases.length === 0) {
      const firstError = errors[0] || "Unknown error";
      return NextResponse.json(
        {
          success: false,
          message: `Reference solution failed: ${firstError}`,
          errors,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated outputs for ${generatedTestCases.length} test cases!`,
      test_cases: generatedTestCases,
      count: generatedTestCases.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in testcase generator API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate test cases" },
      { status: 500 }
    );
  }
}
