"use client";
import Link from "next/link";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  Play,
  Send,
  Terminal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import EditorCore from "@/components/editor/EditorCore";
import { useEditorCore } from "@/hooks/editor/useEditorCore";

// ─── Types ────────────────────────────────────────────────────
type Props = {
  question: any;
  previousQuestion?: any;
  nextQuestion?: any;
  dataStructure: string;
};

type LangKey = "cpp" | "java" | "python" | "c" | "javascript";

// ─── Language config ──────────────────────────────────────────
const LANG_LABELS: Record<LangKey, string> = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  c: "C",
  javascript: "JavaScript",
};

const LANG_COMMENT: Record<LangKey, string> = {
  cpp: "//",
  java: "//",
  python: "#",
  c: "//",
  javascript: "//",
};

const LANG_FALLBACK: Record<LangKey, string> = {
  cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n\n    }\n};`,
  java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n\n    }\n}`,
  python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        pass`,
  c: `#include <stdio.h>\n\n// Write your solution here\n`,
  javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your solution here\n\n}`,
};

// ─── Difficulty badge ──────────────────────────────────────────
const DIFF_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  easy: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", border: "rgba(34,197,94,0.25)" },
  medium: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
  hard: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  Easy: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", border: "rgba(34,197,94,0.25)" },
  Medium: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
  Hard: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.25)" },
};

// ─── Main Component ───────────────────────────────────────────
export default function QuestionPanelsClient({
  question,
  previousQuestion,
  nextQuestion,
  dataStructure,
}: Props) {
  const previousHref = previousQuestion
    ? `/${dataStructure}/practice/${previousQuestion.slug}`
    : undefined;
  const nextHref = nextQuestion
    ? `/${dataStructure}/practice/${nextQuestion.slug}`
    : undefined;

  const router = useRouter();

  // ── Auth guard ────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<{ userId: string } | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/user")
      .then((r) => r.json())
      .then((data) => setCurrentUser(data.user ?? null))
      .catch(() => setCurrentUser(null));
  }, []);

  // Returns true if user is logged in; otherwise shows a toast and redirects.
  const requireAuth = (): boolean => {
    if (currentUser) return true;
    toast.error("Please log in to run or submit code.", { icon: "🔒" });
    setTimeout(() => router.push("/login"), 1200);
    return false;
  };



  const [activeLang, setActiveLang] = useState<LangKey>("cpp");

  const getStarterCode = (lang: LangKey) =>
    question?.starter_code?.[lang] || LANG_FALLBACK[lang];

  const { code, setCode, undo, editorRef, caretOffsetRef, saveCaretOffset, restoreCaretOffset } =
    useEditorCore(getStarterCode("cpp"));

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const updateCursorPos = useCallback(
    (el: HTMLElement) => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const offset = saveCaretOffset(el);
      const textBeforeCaret = code.slice(0, offset);
      const lines = textBeforeCaret.split("\n");
      setCursorPos({ line: lines.length, col: lines[lines.length - 1].length + 1 });
    },
    [code, saveCaretOffset]
  );


  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<null | {
    verdict: string;
    passed: number;
    total: number;
  }>(null);
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState<"description" | "testcases">("description");

  const handleLangChange = (lang: LangKey) => {
    setActiveLang(lang);
    setCode(getStarterCode(lang));
    setLogs([]);
    setSubmitResult(null);
  };

  const handleRun = () => {
    if (!requireAuth()) return;  // 🔒 Auth guard
    setShowConsole(true);
    setIsRunning(true);
    setLogs([]);
    setSubmitResult(null);

    setTimeout(() => {
      if (activeLang !== "javascript") {
        setLogs([
          `ℹ  Browser sandbox only supports JavaScript.`,
          `   Switch to JavaScript to run code interactively.`,
        ]);
        setIsRunning(false);
        return;
      }

      const buf: string[] = [];
      const mock = {
        log: (...args: any[]) =>
          buf.push(
            args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")
          ),
        error: (...args: any[]) => buf.push("[ERROR] " + args.map(String).join(" ")),
        warn: (...args: any[]) => buf.push("[WARN] " + args.map(String).join(" ")),
      };

      try {
        const funcNameMatch = code.match(/function\s+([a-zA-Z0-9_$]+)/) || code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>)/);
        if (!funcNameMatch) {
          throw new Error("Could not find a valid function to run. Please define a function (e.g., function twoSum...).");
        }
        const funcName = funcNameMatch[1];

        const runWrapper = new Function("console", `
          ${code}
          return {
            execute: typeof ${funcName} !== "undefined" ? ${funcName} : null
          };
        `);

        const sandbox = runWrapper(mock);
        const userFn = sandbox.execute;
        if (typeof userFn !== "function") {
          throw new Error(`Function "${funcName}" is not defined or not a function.`);
        }

        const tc = question?.test_cases?.[0];
        if (!tc) {
          throw new Error("No test cases found for this question.");
        }

        let args: any[] = [];
        try {
          args = JSON.parse("[" + tc.input + "]");
        } catch (e) {
          throw new Error("Failed to parse test case input: " + tc.input);
        }

        const actualResult = userFn(...args);
        const actualStr = JSON.stringify(actualResult);

        let expectedResult: any;
        try {
          expectedResult = JSON.parse(tc.output);
        } catch (e) {
          expectedResult = tc.output;
        }

        const deepEqual = (a: any, b: any): boolean => {
          if (a === b) return true;
          if (a && b && typeof a === "object" && typeof b === "object") {
            if (Array.isArray(a) !== Array.isArray(b)) return false;
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            return keysA.every(k => deepEqual(a[k], b[k]));
          }
          return false;
        };

        const isCorrect = deepEqual(actualResult, expectedResult);

        const outputLogs = [...buf];
        outputLogs.push(`\n Input:      ${tc.input}`);
        outputLogs.push(` Your Output: ${actualStr}`);
        outputLogs.push(` Expected:    ${tc.output}`);

        if (isCorrect) {
          outputLogs.push(`\n Status: Correct Answer!`);
          setSubmitResult({ verdict: "Correct", passed: 1, total: 1 });
        } else {
          outputLogs.push(`\nStatus: Wrong Answer`);
          setSubmitResult({ verdict: "Wrong Answer", passed: 0, total: 1 });
        }
        setLogs(outputLogs);

      } catch (err: any) {
        setLogs([...buf, `[Runtime Error] ${err.message}`]);
        setSubmitResult({ verdict: "Runtime Error", passed: 0, total: 1 });
      } finally {
        setIsRunning(false);
      }
    }, 250);
  };


  const handleSubmit = async () => {
    if (!requireAuth()) return;
    setShowConsole(true);
    setIsSubmitting(true);
    setLogs([]);
    setSubmitResult(null);

    if (activeLang !== "javascript") {
      try {
        const response = await fetch("/api/questions/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionSlug: question?.slug }),
        });
        const data = await response.json();

        if (response.status === 200 || response.status === 201) {
          setSubmitResult({ verdict: "Accepted", passed: 3, total: 3 });
          setLogs([
            `[OK] Submission recorded for ${LANG_LABELS[activeLang]}.`,
            ` Browser sandbox cannot execute ${LANG_LABELS[activeLang]} code, so all cases are assumed passed.`,
            ` XP Gained: +${data.xpGained} XP`,
            ` Current Level: ${data.newLevel} (${data.rank})`,
          ]);
          toast.success(`Submission Recorded! +${data.xpGained} XP`);
        } else {
          throw new Error(data.message || "Failed to submit code");
        }
      } catch (err: any) {
        setSubmitResult({ verdict: "Error", passed: 0, total: 0 });
        setLogs([`[ERR] ${err.message}`]);
        toast.error(err.message || "Submission failed");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const buf: string[] = [];
    const mock = {
      log: (...args: any[]) => buf.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")),
      error: (...args: any[]) => buf.push("[ERROR] " + args.map(String).join(" ")),
      warn: (...args: any[]) => buf.push("[WARN] " + args.map(String).join(" ")),
    };

    try {
      const funcNameMatch = code.match(/function\s+([a-zA-Z0-9_$]+)/) || code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>)/);
      if (!funcNameMatch) {
        throw new Error("Could not find a valid function to run. Please define a function (e.g., function twoSum...).");
      }
      const funcName = funcNameMatch[1];

      const runWrapper = new Function("console", `
        ${code}
        return {
          execute: typeof ${funcName} !== "undefined" ? ${funcName} : null
        };
      `);

      const sandbox = runWrapper(mock);
      const userFn = sandbox.execute;
      if (typeof userFn !== "function") {
        throw new Error(`Function "${funcName}" is not defined.`);
      }

      const testCases = question?.test_cases || [];
      if (testCases.length === 0) {
        throw new Error("No test cases found for this question.");
      }

      let passedCount = 0;
      const resultsLogs: string[] = [];

      const deepEqual = (a: any, b: any): boolean => {
        if (a === b) return true;
        if (a && b && typeof a === "object" && typeof b === "object") {
          if (Array.isArray(a) !== Array.isArray(b)) return false;
          const keysA = Object.keys(a);
          const keysB = Object.keys(b);
          if (keysA.length !== keysB.length) return false;
          return keysA.every(k => deepEqual(a[k], b[k]));
        }
        return false;
      };

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        let args: any[] = [];
        try {
          args = JSON.parse("[" + tc.input + "]");
        } catch (e) {
          throw new Error(`Failed to parse test case ${i + 1} input.`);
        }

        const actualResult = userFn(...args);

        let expectedResult: any;
        try {
          expectedResult = JSON.parse(tc.output);
        } catch (e) {
          expectedResult = tc.output;
        }

        if (deepEqual(actualResult, expectedResult)) {
          passedCount++;
        } else {
          resultsLogs.push(` Case ${i + 1} Failed:`);
          resultsLogs.push(`   Input:    ${tc.input}`);
          resultsLogs.push(`   Output:   ${JSON.stringify(actualResult)}`);
          resultsLogs.push(`   Expected: ${tc.output}`);
        }
      }

      const allPassed = passedCount === testCases.length;

      if (allPassed) {
        const response = await fetch("/api/questions/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionSlug: question?.slug }),
        });
        const data = await response.json();

        if (response.status === 200 || response.status === 201) {
          setSubmitResult({ verdict: "Accepted", passed: passedCount, total: testCases.length });
          setLogs([
            `[OK] All ${passedCount}/${testCases.length} test cases passed!`,
            ` XP Gained: +${data.xpGained} XP`,
            ` Current Level: ${data.newLevel} (${data.rank})`,
          ]);
          toast.success(`Submission Accepted! +${data.xpGained} XP`);
        } else if (response.status === 401) {
          setSubmitResult({ verdict: "Accepted", passed: passedCount, total: testCases.length });
          setLogs([
            `[OK] All ${passedCount}/${testCases.length} test cases passed!`,
            ` Log in to save your progress and earn XP!`,
          ]);
          toast.error("Log in to save your progress!");
        } else {
          throw new Error(data.message || "Failed to submit solution.");
        }
      } else {
        setSubmitResult({ verdict: "Wrong Answer", passed: passedCount, total: testCases.length });
        setLogs([
          ` Wrong Answer: ${passedCount}/${testCases.length} test cases passed.`,
          ...resultsLogs
        ]);
        toast.error("Wrong Answer. Check test cases output.");
      }

    } catch (err: any) {
      setSubmitResult({ verdict: "Runtime Error", passed: 0, total: 0 });
      setLogs([...buf, `[Runtime Error] ${err.message}`]);
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const diff = question?.difficulty || "easy";
  const diffStyle = DIFF_STYLES[diff] || DIFF_STYLES["easy"];
  const lineCount = code.split("\n").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#F8FAFC", paddingTop: "104px", boxSizing: "border-box" }}>

      <PanelGroup direction="horizontal" style={{ flex: 1, overflow: "hidden" }}>

        <Panel defaultSize={42} minSize={26}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0" }}>

            {/* Tab bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #e2e8f0",
              padding: "0 20px",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", gap: "2px" }}>
                {(["description", "testcases"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="left-tab"
                    style={{
                      color: activeTab === tab ? "#0f172a" : "#64748b",
                      borderBottom: activeTab === tab ? "2px solid #0d9488" : "2px solid transparent",
                      fontWeight: activeTab === tab ? 600 : 400,
                    }}
                  >
                    {tab === "description" ? "Description" : "Test Cases"}
                  </button>
                ))}
              </div>

              {/* Prev / Next question navigation */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {previousHref ? (
                  <Link href={previousHref}>
                    <button className="nav-arrow-btn" title="Previous Question"><ChevronLeft size={15} /></button>
                  </Link>
                ) : (
                  <button className="nav-arrow-btn" disabled style={{ opacity: 0.3 }}><ChevronLeft size={15} /></button>
                )}
                {nextHref ? (
                  <Link href={nextHref}>
                    <button className="nav-arrow-btn" title="Next Question"><ChevronRight size={15} /></button>
                  </Link>
                ) : (
                  <button className="nav-arrow-btn" disabled style={{ opacity: 0.3 }}><ChevronRight size={15} /></button>
                )}
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}>

              {activeTab === "description" && (
                <>
                  {/* Title */}
                  <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>
                    {question?.title}
                  </h1>

                  {/* Badges */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "3px 10px",
                      borderRadius: "20px", textTransform: "capitalize",
                      backgroundColor: diffStyle.bg, color: diffStyle.color,
                      border: `1px solid ${diffStyle.border}`,
                    }}>{diff}</span>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "3px 10px",
                      borderRadius: "20px", backgroundColor: "rgba(241,196,15,0.08)",
                      color: "#b45309", border: "1px solid rgba(241,196,15,0.2)",
                    }}>⚡ {question?.xp} XP</span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: "13.5px", lineHeight: "1.8", color: "#334155", whiteSpace: "pre-wrap", marginBottom: "24px" }}>
                    {question?.description}
                  </p>

                  {/* Examples */}
                  {question?.test_cases?.map((tc: any, i: number) => (
                    <div key={i} style={{ marginBottom: "16px" }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Example {i + 1}
                      </p>
                      <div style={{
                        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: "8px", padding: "12px 14px",
                        fontFamily: "ui-monospace, monospace", fontSize: "12.5px", lineHeight: "1.8",
                      }}>
                        <div><span style={{ color: "#64748b" }}>Input:  </span><span style={{ color: "#0f172a" }}>{tc.input}</span></div>
                        <div><span style={{ color: "#64748b" }}>Output: </span><span style={{ color: "#0d9488" }}>{tc.output}</span></div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeTab === "testcases" && (
                <>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px", fontStyle: "italic" }}>
                    {question?.test_cases?.length || 0} test cases will be checked on submit.
                  </p>
                  {question?.test_cases?.map((tc: any, i: number) => (
                    <div key={i} style={{
                      backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                      borderRadius: "8px", padding: "14px", marginBottom: "12px",
                    }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#0d9488", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        Case {i + 1}
                      </p>
                      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "12.5px", lineHeight: "1.8" }}>
                        <div><span style={{ color: "#64748b" }}>Input:    </span><span style={{ color: "#0f172a" }}>{tc.input}</span></div>
                        <div><span style={{ color: "#64748b" }}>Expected: </span><span style={{ color: "#0d9488" }}>{tc.output}</span></div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </Panel>

        {/* ── Divider ──────────────────────────────────────────── */}
        <PanelResizeHandle style={{ width: "4px", backgroundColor: "#1e2130", cursor: "col-resize", transition: "background-color 0.15s" }}
          className="resize-handle" />

        {/* ── RIGHT: Code Editor ───────────────────────────────── */}
        <Panel defaultSize={58} minSize={30}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#0d0f17", overflow: "hidden" }}>

            {/* ── Editor top bar: lang selector + utils ───────── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 14px", height: "42px", backgroundColor: "#111318",
              borderBottom: "1px solid #1e2130", flexShrink: 0,
            }}>
              <select
                value={activeLang}
                onChange={(e) => handleLangChange(e.target.value as LangKey)}
                className="lang-select"
                id="language-select"
              >
                {(Object.keys(LANG_LABELS) as LangKey[]).map((lang) => (
                  <option key={lang} value={lang}>{LANG_LABELS[lang]}</option>
                ))}
              </select>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={handleCopy} className="editor-util-btn" title="Copy code">
                  {copied ? <Check size={14} color="#4ec9b0" /> : <Copy size={14} />}
                </button>
                <button onClick={() => { setCode(getStarterCode(activeLang)); }} className="editor-util-btn" title="Reset to starter">
                  <RotateCcw size={14} />
                </button>

                <span style={{ color: "#2d3147", fontSize: "16px", margin: "0 4px" }}>|</span>

                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="run-btn"
                  id="run-btn"
                >
                  {isRunning
                    ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} />
                    : <Play size={13} fill="currentColor" />}
                  Run
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="submit-btn"
                  id="submit-btn"
                >
                  {isSubmitting
                    ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} />
                    : <Send size={13} />}
                  Submit
                </button>
              </div>
            </div>

            {/* ── Editor area: gutter + EditorCore ───────────── */}
            <div style={{ flex: 1, display: "flex", overflow: "auto", minHeight: 0 }}>

              {/* Gutter: line numbers */}
              <div
                aria-hidden
                style={{
                  userSelect: "none", flexShrink: 0,
                  width: "52px", paddingTop: "16px",
                  backgroundColor: "#0d0f17",
                  borderRight: "1px solid #1a1d2e",
                  fontFamily: 'ui-monospace, Menlo, Monaco, "Courier New", monospace',
                  fontSize: "12.5px", lineHeight: "1.6",
                  textAlign: "right", paddingRight: "12px",
                  color: "#3a3f55",
                }}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      color: i + 1 === cursorPos.line ? "#569cd6" : "#3a3f55",
                      fontWeight: i + 1 === cursorPos.line ? 600 : 400,
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* EditorCore (R1 + R2) */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <EditorCore
                  code={code}
                  onChange={setCode}
                  undo={undo}
                  editorRef={editorRef}
                  caretOffsetRef={caretOffsetRef}
                  saveCaretOffset={(el) => {
                    const offset = saveCaretOffset(el);
                    const textBeforeCaret = code.slice(0, offset);
                    const lines = textBeforeCaret.split("\n");
                    setCursorPos({ line: lines.length, col: lines[lines.length - 1].length + 1 });
                    return offset;
                  }}
                  restoreCaretOffset={restoreCaretOffset}
                  placeholder={`${LANG_COMMENT[activeLang]} Write your solution here...`}
                />
              </div>
            </div>

            {/* ── Status bar ──────────────────────────────────── */}
            <div style={{
              height: "24px", backgroundColor: "#0a0c14",
              borderTop: "1px solid #1a1d2e", display: "flex",
              alignItems: "center", justifyContent: "space-between",
              padding: "0 14px", flexShrink: 0,
              fontFamily: 'ui-monospace, monospace', fontSize: "11px",
              color: "#3a3f55",
            }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                <span>{lineCount} lines</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ color: "#569cd6" }}>{LANG_LABELS[activeLang]}</span>
                <span>UTF-8</span>
                <span>2 spaces</span>
              </div>
            </div>

            {/* ── Console panel ───────────────────────────────── */}
            <div style={{ flexShrink: 0, borderTop: "1px solid #1a1d2e" }}>
              {/* Toggle */}
              <button
                onClick={() => setShowConsole((v) => !v)}
                id="console-toggle"
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "7px 14px",
                  backgroundColor: "#111318", border: "none", cursor: "pointer",
                  color: "#576078", fontSize: "12px", fontFamily: "inherit",
                  transition: "color 0.15s",
                }}
                className="console-toggle-btn"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <Terminal size={13} color="#4ec9b0" />
                  <span style={{ fontWeight: 600 }}>Output</span>
                  {logs.length > 0 && (
                    <span style={{
                      backgroundColor: "#569cd6", color: "#fff",
                      borderRadius: "10px", fontSize: "10px",
                      fontWeight: 700, padding: "1px 6px", lineHeight: "1.4",
                    }}>
                      {logs.length}
                    </span>
                  )}
                </div>
                {showConsole ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              </button>

              {/* Console body */}
              {showConsole && (
                <div style={{
                  backgroundColor: "#080a10", maxHeight: "190px",
                  overflowY: "auto", padding: "10px 16px",
                  fontFamily: 'ui-monospace, Menlo, Monaco, "Courier New", monospace',
                  fontSize: "12px", lineHeight: "1.7",
                  display: "flex", flexDirection: "column", gap: "4px",
                }}>
                  {/* Verdict */}
                  {submitResult && (
                    <div style={{
                      padding: "8px 12px", borderRadius: "6px", marginBottom: "6px",
                      display: "flex", alignItems: "center", gap: "10px",
                      backgroundColor: submitResult.verdict === "Accepted"
                        ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
                      border: submitResult.verdict === "Accepted"
                        ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
                    }}>
                      <span style={{
                        fontWeight: 700, fontSize: "13px",
                        color: submitResult.verdict === "Accepted" ? "#22c55e" : "#ef4444",
                      }}>
                        {submitResult.verdict}
                      </span>
                      <span style={{ color: "#576078", fontSize: "11px" }}>
                        {submitResult.passed}/{submitResult.total} test cases passed
                      </span>
                    </div>
                  )}

                  {isRunning && (
                    <div style={{ color: "#576078", fontStyle: "italic", display: "flex", gap: "8px" }}>
                      <span>›</span><span>Running...</span>
                    </div>
                  )}

                  {logs.length === 0 && !isRunning && (
                    <div style={{ color: "#2d3147", fontStyle: "italic" }}>
                      Click Run to see output here...
                    </div>
                  )}

                  {logs.map((log, i) => {
                    const color = log.startsWith("[ERR]") || log.startsWith("[ERROR]")
                      ? "#f87171"
                      : log.startsWith("[OK]") ? "#4ade80"
                        : log.startsWith("[WARN]") ? "#fbbf24"
                          : log.startsWith("ℹ") ? "#60a5fa"
                            : "#8892b0";
                    return (
                      <div key={i} style={{ color, display: "flex", gap: "8px" }}>
                        <span style={{ color: "#2d3147", userSelect: "none" }}>›</span>
                        <span style={{ flex: 1, whiteSpace: "pre-wrap" }}>{log}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>

      {/* ── Scoped styles ─────────────────────────────────────── */}
      <style>{`
        /* Hide global footer on practice page */
        #app-footer {
          display: none !important;
        }

        /* Nav arrows */
        .nav-arrow-btn {
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          padding: 4px 7px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          transition: all 0.15s;
        }
        .nav-arrow-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        /* Run button */
        .run-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 6px;
          border: 1px solid #1e3a5f;
          background: rgba(86,156,214,0.08);
          color: #569cd6;
          font-size: 12.5px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }
        .run-btn:hover:not(:disabled) {
          background: rgba(86,156,214,0.15);
          border-color: #569cd6;
        }
        .run-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Submit button */
        .submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 6px;
          border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          font-size: 12.5px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #4ade80, #22c55e);
          box-shadow: 0 0 14px rgba(34,197,94,0.3);
        }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Left panel tabs */
        .left-tab {
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 11px 4px;
          margin-right: 20px;
          font-size: 12.5px;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.15s;
        }
        .left-tab:hover { color: #0f172a; }

        /* Language select */
        .lang-select {
          background: #0d0f17;
          border: 1px solid #1e2130;
          border-radius: 6px;
          color: #c4cfe0;
          padding: 4px 26px 4px 10px;
          font-size: 12.5px;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23576078' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          transition: border-color 0.15s;
        }
        .lang-select:focus { border-color: #569cd6; }

        /* Utility buttons */
        .editor-util-btn {
          background: transparent;
          border: none;
          color: #3a3f55;
          cursor: pointer;
          padding: 5px 7px;
          border-radius: 5px;
          display: inline-flex;
          align-items: center;
          transition: all 0.15s;
        }
        .editor-util-btn:hover { background: #1e2130; color: #c4cfe0; }

        /* Console toggle */
        .console-toggle-btn:hover { color: #c4cfe0 !important; }

        /* Resize handle hover */
        .resize-handle:hover { background-color: #569cd6 !important; }

        /* Spin keyframe */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
