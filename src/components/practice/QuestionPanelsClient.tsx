"use client";
import Link from "next/link";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  Play, Send, Terminal, ChevronDown, ChevronUp,
  RotateCcw, Copy, Check, Loader2, ChevronLeft,
  ChevronRight, Search, X, ThumbsUp, Star, Share2,
  BookOpen, FlaskConical, FileText, Lightbulb, Plus, Trash2,
} from "lucide-react";
import EditorCore from "@/components/editor/EditorCore";
import SyntaxHighlighter from "@/components/editor/SyntaxHighlighter";
import { useEditorCore } from "@/hooks/editor/useEditorCore";
import { useCompletions } from "@/hooks/editor/useCompletions";
import Completions from "@/components/editor/Completions";
import { getEditorState, saveEditorState } from "@/lib/editor/indexedDB";

// ─── Types ────────────────────────────────────────────────────
type Props = {
  question: any;
  previousQuestion?: any;
  nextQuestion?: any;
  dataStructure: string;
};
type LangKey = "cpp" | "java" | "python" | "c" | "javascript";
type LeftTabKey  = "description" | "solutions" | "submissions" | "editorial";
type BottomTabKey = "testcases" | "output";

// ─── Language config ──────────────────────────────────────────
const LANG_LABELS: Record<LangKey, string> = {
  cpp: "C++", java: "Java", python: "Python", c: "C", javascript: "JavaScript",
};
const LANG_COMMENT: Record<LangKey, string> = {
  cpp: "//", java: "//", python: "#", c: "//", javascript: "//",
};
// Helper to generate a dynamic starter template if not provided by admin
function generateDynamicStarterCode(lang: LangKey, question: any): string {
  // If admin uploaded explicit starter code, prioritize it
  if (question?.starter_code?.[lang]) {
    return question.starter_code[lang];
  }

  // Parse title to camelCase for class/function naming (e.g., "Two Sum" -> "twoSum")
  const title = question?.title || "solve";
  const camelTitle = title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((word: string, index: number) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");

  const pascalTitle = camelTitle.charAt(0).toUpperCase() + camelTitle.slice(1);

  // Return type metadata
  const returnType = question?.return_type || "int";
  const javaReturnType = question?.return_type_java || (returnType === "vector" ? "List<Integer>" : returnType);
  const cppReturnType = question?.return_type_cpp || (returnType === "vector" ? "vector<int>" : returnType);
  const cReturnType = question?.return_type_c || returnType;

  // Parameters metadata (default to generic if not provided)
  // e.g. [{ name: "nums", type: "vector<int>" }, { name: "target", type: "int" }]
  const params = question?.params || [];
  
  const cppParams = params.map((p: any) => `${p.type || "int"} ${p.name || "param"}`).join(", ") || "vector<int>& nums, int target";
  const javaParams = params.map((p: any) => `${p.type_java || p.type || "int"} ${p.name || "param"}`).join(", ") || "int[] nums, int target";
  const cParams = params.map((p: any) => `${p.type_c || p.type || "int"} ${p.name || "param"}`).join(", ") || "int* nums, int numsSize, int target";
  const jsParams = params.map((p: any) => p.name || "param").join(", ") || "nums, target";
  const pyParams = params.map((p: any) => p.name || "param").join(", ") || "nums, target";

  switch (lang) {
    case "cpp":
      return `class Solution {\npublic:\n    ${cppReturnType} ${camelTitle}(${cppParams}) {\n        // Write your solution here\n        \n    }\n};`;
    case "java":
      return `class Solution {\n    public ${javaReturnType} ${camelTitle}(${javaParams}) {\n        // Write your solution here\n        \n    }\n}`;
    case "python":
      return `class Solution:\n    def ${camelTitle}(self, ${pyParams}):\n        # Write your solution here\n        pass`;
    case "c":
      return `#include <stdio.h>\n#include <stdlib.h>\n\n${cReturnType} ${camelTitle}(${cParams}) {\n    // Write your solution here\n    \n}`;
    case "javascript":
    default:
      return `function ${camelTitle}(${jsParams}) {\n    // Write your solution here\n    \n}`;
  }
}

// ─── Difficulty styles ────────────────────────────────────────
const DIFF_STYLES: Record<string, { bg: string; color: string; bd: string }> = {
  easy:   { bg: "rgba(34,197,94,0.08)",   color: "#16a34a", bd: "rgba(34,197,94,0.25)"   },
  medium: { bg: "rgba(245,158,11,0.08)",  color: "#d97706", bd: "rgba(245,158,11,0.25)"  },
  hard:   { bg: "rgba(239,68,68,0.08)",   color: "#dc2626", bd: "rgba(239,68,68,0.25)"   },
};

// ─── Inline code renderer ─────────────────────────────────────
function parseDescription(text: string) {
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <code key={idx} style={{
        backgroundColor: "#f1f5f9", color: "#0f172a",
        padding: "1px 5px", borderRadius: "4px",
        fontFamily: "ui-monospace, monospace", fontSize: "12.5px",
        fontWeight: 600,
        borderWidth: "1px", borderStyle: "solid", borderColor: "#e2e8f0",
      }}>{part}</code>
    ) : part
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptySection({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "48px 24px", gap: "12px", textAlign: "center",
    }}>
      <Icon size={32} strokeWidth={1.5} color="#cbd5e1" />
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>{title}</div>
      <div style={{ fontSize: "12.5px", color: "#94a3b8", lineHeight: 1.6 }}>{subtitle}</div>
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every(k => deepEqual(a[k], b[k]));
}

function buildRunner(code: string) {
  const m = code.match(/function\s+([a-zA-Z0-9_$]+)/)
    || code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>)/);
  if (!m) throw new Error('No function found. Define one like: function twoSum(nums, target) {...}');
  const fn = new Function("console", `${code}\n return typeof ${m[1]} !== "undefined" ? ${m[1]} : null;`);
  return { fn, name: m[1] };
}

// ─── Main Component ───────────────────────────────────────────
export default function QuestionPanelsClient({
  question, previousQuestion, nextQuestion, dataStructure,
}: Props) {
  const previousHref = previousQuestion ? `/${dataStructure}/practice/${previousQuestion.slug}` : undefined;
  const nextHref     = nextQuestion     ? `/${dataStructure}/practice/${nextQuestion.slug}`     : undefined;
  const router = useRouter();

  // ── Auth guard ────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<{ userId: string } | null | undefined>(undefined);
  useEffect(() => {
    fetch("/api/auth/user")
      .then(r => r.json())
      .then(d => setCurrentUser(d.user ?? null))
      .catch(() => setCurrentUser(null));
  }, []);
  const requireAuth = (): boolean => {
    if (currentUser) return true;
    toast.error("Please log in to run or submit code.", { icon: "🔒" });
    setTimeout(() => router.push("/login"), 1200);
    return false;
  };

  // ── Editor core ───────────────────────────────────────────
  const [activeLang, setActiveLang] = useState<LangKey>("cpp");
  const getStarterCode = (l: LangKey) => generateDynamicStarterCode(l, question);

  const { code, setCode, undo, redo, editorRef, caretOffsetRef, saveCaretOffset, restoreCaretOffset } =
    useEditorCore(getStarterCode(activeLang));

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const lineCount = code.split("\n").length;

  // ── IndexedDB ────────────────────────────────────────────
  useEffect(() => {
    if (!question?.slug || !activeLang) return;
    let alive = true;
    getEditorState(question.slug, activeLang).then(saved => {
      if (!alive) return;
      if (saved) { setCode(saved.code, saved.caretOffset); caretOffsetRef.current = saved.caretOffset; }
      else       { setCode(getStarterCode(activeLang), 0);  caretOffsetRef.current = 0; }
    });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang, question?.slug]);

  useEffect(() => {
    if (!question?.slug || !activeLang) return;
    const t = setTimeout(() => saveEditorState(question.slug, activeLang, code, caretOffsetRef.current), 1000);
    return () => clearTimeout(t);
  }, [code, activeLang, question?.slug]);

  // ── Completions ───────────────────────────────────────────
  const completions = useCompletions();

  // ── Search & Replace ──────────────────────────────────────
  const [showSearch,       setShowSearch]       = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [replaceQuery,     setReplaceQuery]     = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") { e.preventDefault(); setShowSearch(p => !p); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const searchMatches = useMemo(() => {
    if (!searchQuery) return [];
    const res: { start: number; end: number }[] = [];
    const lower = code.toLowerCase(), q = searchQuery.toLowerCase();
    let i = lower.indexOf(q);
    while (i !== -1) { res.push({ start: i, end: i + q.length }); i = lower.indexOf(q, i + q.length); }
    return res;
  }, [code, searchQuery]);

  const selectNextMatch = () => searchMatches.length && setActiveMatchIndex(p => (p + 1) % searchMatches.length);
  const selectPrevMatch = () => searchMatches.length && setActiveMatchIndex(p => (p - 1 + searchMatches.length) % searchMatches.length);

  const handleReplace = () => {
    if (!searchMatches.length) return;
    const m = searchMatches[activeMatchIndex];
    const nc = code.slice(0, m.start) + replaceQuery + code.slice(m.end);
    const off = m.start + replaceQuery.length;
    caretOffsetRef.current = off;
    setCode(nc, off);
    setActiveMatchIndex(p => Math.min(p, Math.max(0, searchMatches.length - 2)));
  };
  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const re = new RegExp(searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi");
    setCode(code.replace(re, replaceQuery));
    setActiveMatchIndex(0);
  };

  // ── Left panel tab ────────────────────────────────────────
  const [leftTab, setLeftTab] = useState<LeftTabKey>("description");

  // ── Bottom panel (terminal) state ─────────────────────────
  const [bottomTab,    setBottomTab]    = useState<BottomTabKey>("testcases");
  const [showBottom,   setShowBottom]   = useState(true);
  const [isRunning,    setIsRunning]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied,       setCopied]       = useState(false);

  // Custom test cases (seeded from DB, user can edit/add/remove)
  type CustomCase = { id: string; input: string };
  const seedCases: CustomCase[] = useMemo(() => {
    const tcs = question?.test_cases || [];
    return tcs.slice(0, 3).map((tc: any, i: number) => ({
      id: String(i),
      input: tc.input ?? "",
    }));
  }, [question?.test_cases]);

  const [customCases, setCustomCases] = useState<CustomCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string>("0");

  // Seed once when question loads
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (seedCases.length) {
      setCustomCases(seedCases);
      setActiveCaseId(seedCases[0].id);
      seededRef.current = true;
    }
  }, [seedCases]);

  // Run results per case id
  type RunResult = {
    input: string;
    output: string;
    expected: string;
    status: "correct" | "wrong" | "error" | "custom";
    runtime: string;
  };
  const [runResults, setRunResults] = useState<Record<string, RunResult>>({});
  const [submitResult, setSubmitResult] = useState<null | { verdict: string; passed: number; total: number }>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  // ── Fetch submissions ──────────────────────────────────────
  useEffect(() => {
    if (leftTab === "submissions" && question?.slug) {
      fetch(`/api/questions/submit?questionSlug=${question.slug}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setSubmissions(data.submissions || []);
          }
        })
        .catch(err => console.error("Error fetching submissions:", err));
    }
  }, [leftTab, question?.slug]);

  // ── Language change ───────────────────────────────────────
  const handleLangChange = (l: LangKey) => {
    setActiveLang(l);
    setRunResults({});
    setSubmitResult(null);
    setConsoleLogs([]);
  };

  // ── Copy code ────────────────────────────────────────────
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Run (custom test cases) ───────────────────────────────
  const handleRun = () => {
    if (!requireAuth()) return;
    setShowBottom(true);
    setBottomTab("output");
    setIsRunning(true);
    setRunResults({});
    setConsoleLogs([]);
    setSubmitResult(null);

    setTimeout(() => {
      if (activeLang !== "javascript") {
        setConsoleLogs([
          "ℹ  Browser sandbox supports JavaScript only.",
          "   Switch to JavaScript to run your code interactively.",
        ]);
        setIsRunning(false);
        return;
      }
      const buf: string[] = [];
      const mock = {
        log:   (...a: any[]) => buf.push(a.map((x: any) => typeof x === "object" ? JSON.stringify(x, null, 2) : String(x)).join(" ")),
        error: (...a: any[]) => buf.push("[ERROR] " + a.map(String).join(" ")),
        warn:  (...a: any[]) => buf.push("[WARN] "  + a.map(String).join(" ")),
      };
      try {
        const { fn: rawFn, name } = buildRunner(code);
        const fn = rawFn(mock);
        if (typeof fn !== "function") throw new Error(`"${name}" is not a function.`);

        const results: Record<string, RunResult> = {};
        const cases = customCases.length ? customCases : seedCases;

        for (const tc of cases) {
          const t0 = performance.now();
          try {
            const args = JSON.parse("[" + tc.input + "]");
            const actual = fn(...args);
            const runtime = (performance.now() - t0).toFixed(1) + " ms";
            // Try to match against DB expected if available
            const dbCase = (question?.test_cases || []).find((d: any) => d.input === tc.input);
            let expectedStr = dbCase?.output ?? null;
            let status: RunResult["status"] = "custom"; // no expected output → neutral

            // Generate expected output from reference solution if not predefined in DB
            if (expectedStr === null && question?.reference_solution) {
              try {
                const { fn: refRawFn } = buildRunner(question.reference_solution);
                const refFn = refRawFn({ log: () => {}, error: () => {}, warn: () => {} });
                const refActual = refFn(...args);
                expectedStr = refActual === undefined ? "undefined" : refActual === null ? "null" : JSON.stringify(refActual);
              } catch (err: any) {
                console.error("Reference solution execution failed:", err);
              }
            }

            let expected: any = null;
            if (expectedStr !== null) {
              try { expected = JSON.parse(expectedStr); } catch { expected = expectedStr; }
              status = deepEqual(actual, expected) ? "correct" : "wrong";
            }
            // Serialize output — handle undefined/null explicitly like LeetCode
            const rawOutput = actual === undefined
              ? "Your function returned undefined (missing return statement?)"
              : actual === null
              ? "null"
              : JSON.stringify(actual) ?? "undefined";
            // If function returned undefined, mark as error regardless of case type
            if (actual === undefined) {
              status = "error";
            }
            results[tc.id] = {
              input: tc.input,
              output: rawOutput,
              expected: expectedStr ?? "(no expected — custom input)",
              status,
              runtime,
            };
          } catch (e: any) {
            results[tc.id] = {
              input: tc.input, output: `Error: ${e.message}`,
              expected: "", status: "error", runtime: "—",
            };
          }
        }
        setRunResults(results);
        setConsoleLogs(buf);
      } catch (e: any) {
        setConsoleLogs([...buf, `[Runtime Error] ${e.message}`]);
      } finally {
        setIsRunning(false);
      }
    }, 180);
  };

  // ── Submit (all DB test cases) ────────────────────────────
  const handleSubmit = async () => {
    if (!requireAuth()) return;
    setShowBottom(true);
    setBottomTab("output");
    setIsSubmitting(true);
    setRunResults({});
    setConsoleLogs([]);
    setSubmitResult(null);

    // Non-JS: server-side verdict
    if (activeLang !== "javascript") {
      try {
        const res = await fetch("/api/questions/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionSlug: question?.slug,
            code,
            language: activeLang,
            verdict: "Accepted",
            passed: 3,
            total: 3,
          }),
        });
        const data = await res.json();
        if (res.status === 200 || res.status === 201) {
          setSubmitResult({ verdict: "Accepted", passed: data.total ?? 3, total: data.total ?? 3 });
          setConsoleLogs([`[OK] Submission recorded.`, ` XP: +${data.xpGained}`, ` Level: ${data.newLevel} (${data.rank})`]);
          toast.success(`Accepted! +${data.xpGained} XP`);
          // Fetch updated submissions
          fetch(`/api/questions/submit?questionSlug=${question.slug}`)
            .then(r => r.json())
            .then(d => { if (d.success) setSubmissions(d.submissions || []); })
            .catch(() => {});
        } else throw new Error(data.message || "Failed");
      } catch (e: any) {
        setSubmitResult({ verdict: "Error", passed: 0, total: 0 });
        setConsoleLogs([`[ERR] ${e.message}`]);
        toast.error(e.message || "Submission failed");
      } finally { setIsSubmitting(false); }
      return;
    }

    // JS: run against all DB test cases
    const buf: string[] = [];
    const mock = {
      log:   (...a: any[]) => buf.push(a.map((x: any) => typeof x === "object" ? JSON.stringify(x) : String(x)).join(" ")),
      error: (...a: any[]) => buf.push("[ERROR] " + a.map(String).join(" ")),
      warn:  (...a: any[]) => buf.push("[WARN] "  + a.map(String).join(" ")),
    };
    try {
      const { fn: rawFn, name } = buildRunner(code);
      const fn = rawFn(mock);
      if (typeof fn !== "function") throw new Error(`"${name}" is not a function.`);

      const tcs = question?.test_cases || [];
      if (!tcs.length) throw new Error("No test cases on this question.");

      let passed = 0;
      const failLines: string[] = [];

      for (let i = 0; i < tcs.length; i++) {
        const tc = tcs[i];
        const args = JSON.parse("[" + tc.input + "]");
        const actual = fn(...args);
        let expected: any;
        try { expected = JSON.parse(tc.output); } catch { expected = tc.output; }
        if (deepEqual(actual, expected)) {
          passed++;
        } else {
          failLines.push(` Case ${i + 1} ❌`);
          failLines.push(`   Input:    ${tc.input}`);
          failLines.push(`   Output:   ${JSON.stringify(actual)}`);
          failLines.push(`   Expected: ${tc.output}`);
        }
      }

      const verdict = passed === tcs.length ? "Accepted" : "Wrong Answer";

      // Always save submission to backend (Accepted or Wrong Answer)
      try {
        const res = await fetch("/api/questions/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionSlug: question?.slug,
            code,
            language: activeLang,
            verdict,
            passed,
            total: tcs.length,
          }),
        });
        const data = await res.json();

        if (verdict === "Accepted") {
          setSubmitResult({ verdict: "Accepted", passed, total: tcs.length });
          if (res.status === 200 || res.status === 201) {
            setConsoleLogs([`[OK] All ${passed}/${tcs.length} test cases passed!`, ` XP: +${data.xpGained}`, ` Level: ${data.newLevel} (${data.rank})`]);
            toast.success(`Accepted! +${data.xpGained} XP`);
          } else if (res.status === 401) {
            setConsoleLogs([`[OK] All ${passed}/${tcs.length} passed! Log in to save progress.`]);
            toast.error("Log in to save your progress!");
          }
        } else {
          setSubmitResult({ verdict: "Wrong Answer", passed, total: tcs.length });
          setConsoleLogs([` ${passed}/${tcs.length} test cases passed.`, ...failLines]);
          toast.error(`Wrong Answer — ${passed}/${tcs.length} passed`);
        }

        // Refresh submissions list
        fetch(`/api/questions/submit?questionSlug=${question?.slug}`)
          .then(r => r.json())
          .then(d => { if (d.success) setSubmissions(d.submissions || []); })
          .catch(() => {});

      } catch (fetchErr: any) {
        // API call failed but we still show local verdict
        if (verdict === "Accepted") {
          setSubmitResult({ verdict: "Accepted", passed, total: tcs.length });
          setConsoleLogs([`[OK] All ${passed}/${tcs.length} passed! (offline)`]);
        } else {
          setSubmitResult({ verdict: "Wrong Answer", passed, total: tcs.length });
          setConsoleLogs([` ${passed}/${tcs.length} test cases passed.`, ...failLines]);
          toast.error(`Wrong Answer — ${passed}/${tcs.length} passed`);
        }
      }
    } catch (e: any) {
      const runtimeVerdict = "Runtime Error";
      setSubmitResult({ verdict: runtimeVerdict, passed: 0, total: 0 });
      setConsoleLogs([...buf, `[Runtime Error] ${e.message}`]);
      toast.error(e.message || "Submission failed");

      // Save runtime error submission
      fetch("/api/questions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionSlug: question?.slug,
          code,
          language: activeLang,
          verdict: runtimeVerdict,
          passed: 0,
          total: 0,
        }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            fetch(`/api/questions/submit?questionSlug=${question?.slug}`)
              .then(r2 => r2.json())
              .then(d2 => { if (d2.success) setSubmissions(d2.submissions || []); })
              .catch(() => {});
          }
        })
        .catch(() => {});
    } finally { setIsSubmitting(false); }
  };

  // ── Derived ───────────────────────────────────────────────
  const diff      = (question?.difficulty || "easy").toLowerCase();
  const diffStyle = DIFF_STYLES[diff] ?? DIFF_STYLES.easy;

  // ── Left tabs config ──────────────────────────────────────
  const LEFT_TABS: { key: LeftTabKey; label: string; icon: any }[] = [
    { key: "description",  label: "Description",  icon: BookOpen    },
    { key: "solutions",    label: "Solutions",    icon: Lightbulb   },
    { key: "submissions",  label: "Submissions",  icon: FlaskConical},
    { key: "editorial",    label: "Editorial",    icon: FileText    },
  ];

  // ── Custom case helpers ───────────────────────────────────
  const addCase = () => {
    const id = String(Date.now());
    setCustomCases(p => [...p, { id, input: "" }]);
    setActiveCaseId(id);
  };
  const removeCase = (id: string) => {
    setCustomCases(p => {
      const next = p.filter(c => c.id !== id);
      if (activeCaseId === id && next.length) setActiveCaseId(next[next.length - 1].id);
      return next;
    });
    setRunResults(p => { const n = { ...p }; delete n[id]; return n; });
  };
  const updateCaseInput = (id: string, val: string) => {
    setCustomCases(p => p.map(c => c.id === id ? { ...c, input: val } : c));
  };

  const activeCase = customCases.find(c => c.id === activeCaseId);
  const activeResult = runResults[activeCaseId];

  // ── Tab button style helper ───────────────────────────────
  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: "5px",
    padding: "0 14px", height: "100%",
    color: active ? "#0d9488" : "#64748b",
    fontWeight: active ? 600 : 400,
    fontSize: "12.5px", background: "none",
    borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0,
    borderBottomWidth: "2px", borderStyle: "solid",
    borderBottomColor: active ? "#0d9488" : "transparent",
    cursor: "pointer", transition: "color 0.15s",
  });

  const darkTabStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: "5px",
    padding: "0 14px", height: "100%",
    color: active ? "#4ec9b0" : "#576078",
    fontWeight: active ? 600 : 400,
    fontSize: "12px", background: "none",
    borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0,
    borderBottomWidth: "2px", borderStyle: "solid",
    borderBottomColor: active ? "#4ec9b0" : "transparent",
    cursor: "pointer", transition: "color 0.15s", fontFamily: "inherit",
  });

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      backgroundColor: "#F1F5F9", paddingTop: "104px", boxSizing: "border-box",
    }}>
      <PanelGroup direction="horizontal" style={{ flex: 1, overflow: "hidden" }}>

        {/* ── LEFT: Question Description ───────────────────── */}
        <Panel defaultSize={42} minSize={26}>
          <div style={{
            height: "100%", display: "flex", flexDirection: "column",
            backgroundColor: "#ffffff",
            borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#e2e8f0",
          }}>

            {/* Tab bar */}
            <div style={{
              display: "flex", alignItems: "stretch", justifyContent: "space-between",
              borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#e2e8f0",
              padding: "0 12px", flexShrink: 0, backgroundColor: "#ffffff", height: "44px",
            }}>
              <div style={{ display: "flex" }}>
                {LEFT_TABS.map(({ key, label }) => (
                  <button key={key} onClick={() => setLeftTab(key)} style={tabStyle(leftTab === key)}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {previousHref ? (
                  <Link href={previousHref}>
                    <button className="nav-arrow-btn" title="Previous"><ChevronLeft size={14} /></button>
                  </Link>
                ) : (
                  <button className="nav-arrow-btn" disabled style={{ opacity: 0.3 }}><ChevronLeft size={14} /></button>
                )}
                {nextHref ? (
                  <Link href={nextHref}>
                    <button className="nav-arrow-btn" title="Next"><ChevronRight size={14} /></button>
                  </Link>
                ) : (
                  <button className="nav-arrow-btn" disabled style={{ opacity: 0.3 }}><ChevronRight size={14} /></button>
                )}
              </div>
            </div>

            {/* Content */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "20px 22px",
              scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent",
            }}>

              {/* DESCRIPTION */}
              {leftTab === "description" && (
                <>
                  {/* Title + actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>
                      {question?.title ?? "—"}
                    </h1>
                    <div style={{ display: "flex", gap: "6px", color: "#94a3b8", flexShrink: 0, marginLeft: "12px" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "4px", display: "flex" }} title="Like"><ThumbsUp size={15} /></button>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "4px", display: "flex" }} title="Star"><Star size={15} /></button>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "4px", display: "flex" }} title="Share"><Share2 size={15} /></button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", gap: "7px", marginBottom: "18px", flexWrap: "wrap" }}>
                    {question?.difficulty && (
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px",
                        textTransform: "capitalize", backgroundColor: diffStyle.bg, color: diffStyle.color,
                        borderWidth: "1px", borderStyle: "solid", borderColor: diffStyle.bd,
                      }}>{diff}</span>
                    )}
                    {question?.xp && (
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px",
                        backgroundColor: "rgba(251,191,36,0.08)", color: "#b45309",
                        borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(251,191,36,0.25)",
                      }}>⚡ {question.xp} XP</span>
                    )}
                    {question?.category && (
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px",
                        backgroundColor: "rgba(99,102,241,0.08)", color: "#4f46e5",
                        borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(99,102,241,0.2)",
                      }}>{question.category}</span>
                    )}
                  </div>

                  {/* Problem header */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    marginBottom: "10px", paddingBottom: "8px",
                    borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#f1f5f9",
                  }}>
                    <Lightbulb size={15} color="#0d9488" />
                    <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>Problem</span>
                  </div>

                  {/* Description text */}
                  {question?.description ? (
                    <div style={{
                      fontSize: "13.5px", lineHeight: "1.85", color: "#334155",
                      marginBottom: "22px", whiteSpace: "pre-wrap",
                    }}>
                      {parseDescription(question.description)}
                    </div>
                  ) : (
                    <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "22px", fontStyle: "italic" }}>
                      No description available.
                    </div>
                  )}

                  {/* Examples (read-only from DB) */}
                  {question?.test_cases?.length > 0 ? (
                    question.test_cases.slice(0, 3).map((tc: any, i: number) => (
                      <div key={i} style={{ marginBottom: "18px" }}>
                        <div style={{
                          fontSize: "11px", fontWeight: 700, color: "#64748b",
                          marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.08em",
                        }}>
                          Example {i + 1}
                        </div>
                        <div style={{
                          backgroundColor: "#0F141C", borderRadius: "8px", overflow: "hidden",
                          borderWidth: "1px", borderStyle: "solid", borderColor: "#1e293b",
                        }}>
                          <div style={{
                            backgroundColor: "#161b22", padding: "6px 13px",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
                          }}>
                            <span style={{ fontSize: "11px", color: "#6e7681", fontWeight: 600 }}>Console</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(`Input: ${tc.input}\nOutput: ${tc.output}`); toast.success("Copied!"); }}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#6e7681", display: "flex" }}
                            ><Copy size={11} /></button>
                          </div>
                          <div style={{
                            padding: "11px 14px",
                            fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
                            fontSize: "12.5px", lineHeight: "1.7",
                          }}>
                            <div style={{ marginBottom: "5px" }}>
                              <div style={{ color: "#4ec9b0", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>Input:</div>
                              <div style={{ color: "#e6edf3", whiteSpace: "pre-wrap" }}>{tc.input}</div>
                            </div>
                            <div>
                              <div style={{ color: "#4ec9b0", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>Output:</div>
                              <div style={{ color: "#4ade80", fontWeight: 600 }}>{tc.output}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptySection icon={FlaskConical} title="No Examples" subtitle="No test cases found for this problem." />
                  )}
                </>
              )}

              {leftTab === "solutions"   && <EmptySection icon={Lightbulb}    title="No Solutions Yet"    subtitle="Community solutions will appear here once available."                               />}
              {leftTab === "submissions" && (
                selectedSubmission ? (
                  /* ── Submission Code Viewer ── */
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#0d9488", fontSize: "12.5px", fontWeight: 600,
                        padding: 0, fontFamily: "inherit",
                      }}
                    >
                      <ChevronLeft size={14} /> Back to submissions
                    </button>

                    {/* Verdict Banner */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: "8px",
                      backgroundColor: selectedSubmission.verdict === "Accepted" ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                      borderWidth: "1px", borderStyle: "solid",
                      borderColor: selectedSubmission.verdict === "Accepted" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.25)",
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: selectedSubmission.verdict === "Accepted" ? "#10b981" : "#ef4444" }}>
                          {selectedSubmission.verdict}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                          {LANG_LABELS[selectedSubmission.language as LangKey] || selectedSubmission.language}
                          {" · "}
                          {new Date(selectedSubmission.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#334155", textAlign: "right" }}>
                        Passed: <strong>{selectedSubmission.passed}/{selectedSubmission.total}</strong>
                      </div>
                    </div>

                    {/* Code Block */}
                    <div style={{
                      backgroundColor: "#0F141C", borderRadius: "8px", overflow: "hidden",
                      borderWidth: "1px", borderStyle: "solid", borderColor: "#1e293b",
                    }}>
                      <div style={{
                        backgroundColor: "#161b22", padding: "8px 14px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
                      }}>
                        <span style={{ fontSize: "12px", color: "#8892b0", fontWeight: 600 }}>
                          {LANG_LABELS[selectedSubmission.language as LangKey] || selectedSubmission.language}
                        </span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(selectedSubmission.code); toast.success("Code copied!"); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#8892b0", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}
                        >
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace", fontSize: "13px", lineHeight: "1.7" }}>
                        <SyntaxHighlighter code={selectedSubmission.code} />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Submissions List ── */
                  submissions.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>
                        Your Submissions ({submissions.length})
                      </div>
                      {submissions.map((sub: any, idx: number) => (
                        <button
                          key={sub._id || idx}
                          onClick={() => setSelectedSubmission(sub)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 14px", borderRadius: "8px", cursor: "pointer",
                            backgroundColor: "#f8fafc", textAlign: "left", width: "100%",
                            borderWidth: "1px", borderStyle: "solid",
                            borderColor: sub.verdict === "Accepted" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)",
                            transition: "background-color 0.15s",
                            fontFamily: "inherit",
                          }}
                          className="submission-row-btn"
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "13px", color: sub.verdict === "Accepted" ? "#10b981" : sub.verdict === "Runtime Error" ? "#f97316" : "#ef4444" }}>
                              {sub.verdict}
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                              {LANG_LABELS[sub.language as LangKey] || sub.language} · {new Date(sub.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div style={{ fontSize: "12px", color: "#475569", textAlign: "right" }}>
                            <div>{sub.passed}/{sub.total} passed</div>
                            <div style={{ color: "#0d9488", fontSize: "11px", marginTop: "2px" }}>View code →</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <EmptySection icon={FlaskConical} title="No Submissions Yet" subtitle="Submit your solution to see your history here." />
                  )
                )
              )}
              {leftTab === "editorial" && (
                question?.reference_solution ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>Reference Solution (JavaScript)</h2>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                        Here is the model solution for this problem. You can use it to verify your approach or debug custom inputs.
                      </p>
                    </div>

                    <div style={{
                      backgroundColor: "#0F141C", borderRadius: "8px", overflow: "hidden",
                      borderWidth: "1px", borderStyle: "solid", borderColor: "#1e293b",
                    }}>
                      <div style={{
                        backgroundColor: "#161b22", padding: "8px 14px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#21262d",
                      }}>
                        <span style={{ fontSize: "12px", color: "#8892b0", fontWeight: 600 }}>JavaScript</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(question.reference_solution);
                            toast.success("Solution copied to clipboard!");
                          }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#8892b0", display: "flex", alignItems: "center", gap: "6px",
                            fontSize: "11px", transition: "color 0.15s"
                          }}
                          className="tc-copy-btn"
                        >
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                      <div style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
                        fontSize: "13px", lineHeight: "1.7",
                      }}>
                        <SyntaxHighlighter code={question.reference_solution} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptySection icon={FileText} title="Editorial Coming Soon" subtitle={`A detailed guide for "${question?.title || "this problem"}" will be available soon.`} />
                )
              )}
            </div>
          </div>
        </Panel>

        {/* ── Divider ─────────────────────────────────────────── */}
        <PanelResizeHandle
          className="resize-handle"
          style={{ width: "4px", backgroundColor: "#e2e8f0", cursor: "col-resize", transition: "background-color 0.15s" }}
        />

        {/* ── RIGHT: Editor + Terminal (vertical split) ─── */}
        <Panel defaultSize={58} minSize={30}>
          <PanelGroup direction="vertical" style={{ height: "100%" }}>

            {/* ── UPPER: Toolbar + Editor + Status bar ─── */}
            <Panel defaultSize={65} minSize={30}>
              <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#0d0f17", overflow: "hidden" }}>

                {/* Editor toolbar */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0 14px", height: "44px", backgroundColor: "#111318",
                  borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#1e2130",
                  flexShrink: 0,
                }}>
                  <select value={activeLang} onChange={e => handleLangChange(e.target.value as LangKey)} className="lang-select" id="language-select">
                    {(Object.keys(LANG_LABELS) as LangKey[]).map(l => <option key={l} value={l}>{LANG_LABELS[l]}</option>)}
                  </select>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <button onClick={handleCopy} className="editor-util-btn" title="Copy code">
                      {copied ? <Check size={14} color="#4ec9b0" /> : <Copy size={14} />}
                    </button>
                    <button onClick={() => setCode(getStarterCode(activeLang), 0)} className="editor-util-btn" title="Reset to starter">
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={() => setShowSearch(p => !p)}
                      className="editor-util-btn" title="Find & Replace (Ctrl+F)"
                      style={{ color: showSearch ? "#569cd6" : undefined }}
                    >
                      <Search size={14} />
                    </button>
                    <span style={{ color: "#2d3147", fontSize: "14px", margin: "0 3px" }}>|</span>
                    <button onClick={handleRun} disabled={isRunning || isSubmitting} className="run-btn" id="run-btn">
                      {isRunning ? <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} /> : <Play size={12} fill="currentColor" />}
                      Run
                    </button>
                    <button onClick={handleSubmit} disabled={isRunning || isSubmitting} className="submit-btn" id="submit-btn">
                      {isSubmitting ? <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} /> : <Send size={12} />}
                      Submit
                    </button>
                  </div>
                </div>

                {/* Editor area: gutter + EditorCore */}
                <div style={{ flex: 1, display: "flex", overflow: "auto", minHeight: 0 }}>
                  {/* Line numbers */}
                  <div
                    aria-hidden
                    style={{
                      userSelect: "none", flexShrink: 0, width: "48px", paddingTop: "16px",
                      backgroundColor: "#0d0f17",
                      borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#1a1d2e",
                      fontFamily: 'ui-monospace, Menlo, Monaco, "Courier New", monospace',
                      fontSize: "12.5px", lineHeight: "1.6", textAlign: "right",
                      paddingRight: "10px", color: "#3a3f55",
                    }}
                  >
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i} style={{ color: i + 1 === cursorPos.line ? "#569cd6" : "#3a3f55", fontWeight: i + 1 === cursorPos.line ? 600 : 400 }}>
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Editor + overlays */}
                  <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                    {/* Find & Replace */}
                    {showSearch && (
                      <div style={{
                        position: "absolute", top: "10px", right: "16px", zIndex: 50,
                        backgroundColor: "#1e1e1e",
                        borderWidth: "1px", borderStyle: "solid", borderColor: "#3c3c3c",
                        borderRadius: "6px", padding: "8px 10px",
                        display: "flex", flexDirection: "column", gap: "6px",
                        width: "280px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        fontFamily: "system-ui, sans-serif",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <input type="text" placeholder="Find…" value={searchQuery} autoFocus
                            onChange={e => { setSearchQuery(e.target.value); setActiveMatchIndex(0); }}
                            style={{ flex: 1, backgroundColor: "#2d2d2d", borderWidth: "1px", borderStyle: "solid", borderColor: "#3c3c3c", borderRadius: "3px", color: "#d4d4d4", fontSize: "12px", padding: "4px 8px", outline: "none" }}
                          />
                          {searchQuery && (
                            <span style={{ fontSize: "11px", color: "#858585", minWidth: "38px", textAlign: "right" }}>
                              {searchMatches.length ? `${activeMatchIndex + 1}/${searchMatches.length}` : "0/0"}
                            </span>
                          )}
                          <button onClick={selectPrevMatch} disabled={!searchMatches.length} style={{ background: "none", border: "none", color: searchMatches.length ? "#ccc" : "#555", cursor: searchMatches.length ? "pointer" : "default", padding: "2px", display: "flex" }}><ChevronLeft size={14} /></button>
                          <button onClick={selectNextMatch} disabled={!searchMatches.length} style={{ background: "none", border: "none", color: searchMatches.length ? "#ccc" : "#555", cursor: searchMatches.length ? "pointer" : "default", padding: "2px", display: "flex" }}><ChevronRight size={14} /></button>
                          <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} style={{ background: "none", border: "none", color: "#858585", cursor: "pointer", padding: "2px", display: "flex" }}><X size={14} /></button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <input type="text" placeholder="Replace with…" value={replaceQuery}
                            onChange={e => setReplaceQuery(e.target.value)}
                            style={{ flex: 1, backgroundColor: "#2d2d2d", borderWidth: "1px", borderStyle: "solid", borderColor: "#3c3c3c", borderRadius: "3px", color: "#d4d4d4", fontSize: "12px", padding: "4px 8px", outline: "none" }}
                          />
                          <button onClick={handleReplace}    disabled={!searchMatches.length} style={{ backgroundColor: "#0e639c", border: "none", borderRadius: "3px", color: "#fff", fontSize: "11px", padding: "4px 7px", cursor: searchMatches.length ? "pointer" : "default", opacity: searchMatches.length ? 1 : 0.5 }}>Replace</button>
                          <button onClick={handleReplaceAll} disabled={!searchMatches.length} style={{ backgroundColor: "#0e639c", border: "none", borderRadius: "3px", color: "#fff", fontSize: "11px", padding: "4px 7px", cursor: searchMatches.length ? "pointer" : "default", opacity: searchMatches.length ? 1 : 0.5 }}>All</button>
                        </div>
                      </div>
                    )}

                    <EditorCore
                      code={code} onChange={setCode} undo={undo} redo={redo}
                      editorRef={editorRef} caretOffsetRef={caretOffsetRef}
                      saveCaretOffset={el => {
                        const off = saveCaretOffset(el);
                        const before = code.slice(0, off).split("\n");
                        setCursorPos({ line: before.length, col: before[before.length - 1].length + 1 });
                        return off;
                      }}
                      restoreCaretOffset={restoreCaretOffset}
                      placeholder={`${LANG_COMMENT[activeLang]} Write your solution here...`}
                      activeLang={activeLang}
                      completionsOpen={completions.isOpen}
                      completionsSelectNext={completions.selectNext}
                      completionsSelectPrev={completions.selectPrev}
                      completionsClose={completions.closeCompletions}
                      completionsConfirm={() => {
                        if (!completions.suggestions.length) return;
                        const item = completions.suggestions[completions.activeIndex];
                        const { newCode, newOffset } = completions.getAppliedSuggestion(code, caretOffsetRef.current, item);
                        caretOffsetRef.current = newOffset;
                        setCode(newCode, newOffset);
                        completions.closeCompletions();
                      }}
                      onTriggerCompletions={(t, o, gc) => completions.triggerCompletions(t, o, activeLang, gc)}
                      searchQuery={searchQuery}
                      searchMatches={searchMatches}
                      activeMatchIndex={activeMatchIndex}
                    />
                    <Completions
                      isOpen={completions.isOpen} suggestions={completions.suggestions}
                      activeIndex={completions.activeIndex} coords={completions.coords}
                      onSelectIndex={completions.setActiveIndex}
                      onConfirm={() => {
                        if (!completions.suggestions.length) return;
                        const item = completions.suggestions[completions.activeIndex];
                        const { newCode, newOffset } = completions.getAppliedSuggestion(code, caretOffsetRef.current, item);
                        caretOffsetRef.current = newOffset;
                        setCode(newCode, newOffset);
                        completions.closeCompletions();
                      }}
                    />
                  </div>
                </div>

                {/* Status bar */}
                <div style={{
                  height: "22px", backgroundColor: "#0a0c14",
                  borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#1a1d2e",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0 14px", flexShrink: 0,
                  fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "#3a3f55",
                }}>
                  <div style={{ display: "flex", gap: "14px" }}>
                    <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                    <span>{lineCount} lines</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <span style={{ color: "#569cd6" }}>{LANG_LABELS[activeLang]}</span>
                    <span>UTF-8</span>
                  </div>
                </div>
              </div>
            </Panel>

            {/* ── Vertical resize handle ────────────────────── */}
            <PanelResizeHandle
              className="resize-handle-v"
              style={{
                height: "4px", backgroundColor: "#1a1d2e",
                cursor: "row-resize", flexShrink: 0,
                transition: "background-color 0.15s",
              }}
            />

            {/* ── LOWER: Terminal panel ─────────────────────── */}
            <Panel defaultSize={35} minSize={10}>
              <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#0d0f17", overflow: "hidden" }}>

                {/* Terminal tab bar */}
                <div style={{
                  display: "flex", alignItems: "stretch", justifyContent: "space-between",
                  backgroundColor: "#111318", height: "36px", flexShrink: 0,
                  borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#1e2130",
                }}>
                  <div style={{ display: "flex" }}>
                    <button onClick={() => setBottomTab("testcases")} style={darkTabStyle(bottomTab === "testcases")}>
                      <FlaskConical size={12} />
                      Test Cases
                    </button>
                    <button onClick={() => setBottomTab("output")} style={darkTabStyle(bottomTab === "output")}>
                      <Terminal size={12} />
                      Output
                      {(consoleLogs.length > 0 || Object.keys(runResults).length > 0) && (
                        <span style={{
                          backgroundColor: submitResult?.verdict === "Accepted" ? "#22c55e" : "#569cd6",
                          color: "#fff", borderRadius: "8px",
                          fontSize: "9px", fontWeight: 700, padding: "1px 5px", lineHeight: "1.4",
                        }}>{consoleLogs.length + Object.keys(runResults).length}</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Terminal content: fills remaining height, scrolls */}
                <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

                  {/* TEST CASES tab */}
                  {bottomTab === "testcases" && (
                    <div style={{ display: "flex", width: "100%", overflow: "hidden", backgroundColor: "#0d0f17" }}>

                      {/* Case selector sidebar */}
                      <div style={{
                        width: "128px", flexShrink: 0,
                        borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#1a1d2e",
                        display: "flex", flexDirection: "column",
                        overflowY: "auto", overflowX: "hidden",
                        padding: "8px 6px",
                        scrollbarWidth: "thin", scrollbarColor: "#1e2130 transparent",
                      }}>
                        {customCases.map((c, idx) => (
                          <div
                            key={c.id}
                            onClick={() => setActiveCaseId(c.id)}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "5px 8px", borderRadius: "5px", cursor: "pointer", marginBottom: "3px",
                              backgroundColor: activeCaseId === c.id ? "#1e2130" : "transparent",
                              color: activeCaseId === c.id ? "#c4cfe0" : "#576078",
                              fontSize: "12px", fontFamily: "inherit",
                              transition: "background-color 0.1s",
                              borderLeftWidth: "2px", borderLeftStyle: "solid",
                              borderLeftColor: activeCaseId === c.id ? "#4ec9b0" : "transparent",
                            }}
                            className="tc-item"
                          >
                            <span style={{ fontSize: "11.5px", fontWeight: activeCaseId === c.id ? 600 : 400 }}>Case {idx + 1}</span>
                            {customCases.length > 1 && (
                              <button
                                onClick={e => { e.stopPropagation(); removeCase(c.id); }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#3a3f55", display: "flex", padding: "1px", flexShrink: 0 }}
                                title="Remove case"
                                className="tc-remove"
                              ><Trash2 size={10} /></button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addCase}
                          style={{
                            display: "flex", alignItems: "center", gap: "5px",
                            padding: "5px 8px", borderRadius: "5px", cursor: "pointer",
                            background: "none", border: "none", color: "#4ec9b0",
                            fontSize: "11px", fontFamily: "inherit", marginTop: "4px",
                            transition: "color 0.15s",
                          }}
                          className="add-case-btn"
                        >
                          <Plus size={11} /> Add Case
                        </button>
                      </div>

                      {/* Case input textarea — scrolls independently */}
                      <div style={{
                        flex: 1, display: "flex", flexDirection: "column",
                        padding: "10px 14px", overflow: "hidden",
                      }}>
                        {activeCase ? (
                          <>
                            <div style={{
                              fontSize: "10px", fontWeight: 700, color: "#4ec9b0",
                              textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.07em",
                            }}>Input:</div>
                            <textarea
                              value={activeCase.input}
                              onChange={e => updateCaseInput(activeCase.id, e.target.value)}
                              spellCheck={false}
                              placeholder="Type your custom input here…"
                              style={{
                                flex: 1,
                                resize: "none",
                                backgroundColor: "#161b22",
                                borderWidth: "1px", borderStyle: "solid", borderColor: "#21262d",
                                borderRadius: "6px",
                                color: "#e6edf3",
                                fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
                                fontSize: "12.5px", lineHeight: "1.7",
                                padding: "8px 10px",
                                outline: "none",
                                overflowY: "auto",
                                transition: "border-color 0.15s, box-shadow 0.15s",
                                scrollbarWidth: "thin", scrollbarColor: "#21262d transparent",
                              }}
                              className="tc-textarea"
                            />
                          </>
                        ) : (
                          <div style={{ color: "#576078", fontSize: "12px", fontStyle: "italic", paddingTop: "8px" }}>No test cases.</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* OUTPUT tab — scrolls independently */}
                  {bottomTab === "output" && (
                    <div style={{
                      flex: 1,
                      overflowY: "auto",
                      overflowX: "hidden",
                      backgroundColor: "#080a10",
                      padding: "10px 16px",
                      fontFamily: 'ui-monospace, Menlo, Monaco, "Courier New", monospace',
                      fontSize: "12px", lineHeight: "1.7",
                      display: "flex", flexDirection: "column", gap: "4px",
                      scrollbarWidth: "thin", scrollbarColor: "#1a1d2e transparent",
                    }}>
                      {/* Verdict banner */}
                      {submitResult && (
                        <div style={{
                          padding: "8px 12px", borderRadius: "6px", marginBottom: "8px",
                          display: "flex", alignItems: "center", gap: "12px",
                          backgroundColor: submitResult.verdict === "Accepted" ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
                          borderWidth: "1px", borderStyle: "solid",
                          borderColor: submitResult.verdict === "Accepted" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                        }}>
                          <span style={{ fontWeight: 700, fontSize: "13px", color: submitResult.verdict === "Accepted" ? "#22c55e" : "#ef4444" }}>
                            {submitResult.verdict}
                          </span>
                          <span style={{ color: "#576078", fontSize: "11px" }}>
                            {submitResult.passed}/{submitResult.total} test cases passed
                          </span>
                        </div>
                      )}

                      {/* Per-case result cards */}
                      {Object.keys(runResults).length > 0 && customCases.map((c, idx) => {
                        const r = runResults[c.id];
                        if (!r) return null;
                        const isCorrect = r.status === "correct";
                        const isError   = r.status === "error";
                        const isCustom  = r.status === "custom";
                        return (
                          <div key={c.id} style={{
                            marginBottom: "8px", padding: "10px 12px", borderRadius: "6px",
                            backgroundColor: isError ? "rgba(239,68,68,0.05)" : isCustom ? "rgba(99,179,237,0.05)" : isCorrect ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
                            borderWidth: "1px", borderStyle: "solid",
                            borderColor: isError ? "rgba(239,68,68,0.2)" : isCustom ? "rgba(99,179,237,0.2)" : isCorrect ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#576078" }}>Case {idx + 1}</span>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: isError ? "#f87171" : isCustom ? "#63b3ed" : isCorrect ? "#4ade80" : "#f87171" }}>
                                {isError ? "❌ Error" : isCustom ? "⚡ Ran" : isCorrect ? "✅ Accepted" : "❌ Wrong Answer"}
                              </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#8892b0", display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div><span style={{ color: "#4ec9b0" }}>Input:    </span>{r.input}</div>
                              <div>
                                <span style={{ color: "#4ec9b0" }}>Output:   </span>
                                <span style={{ color: isError ? "#f87171" : isCustom ? "#e6edf3" : isCorrect ? "#4ade80" : "#f87171" }}>
                                  {r.output || <span style={{ color: "#576078", fontStyle: "italic" }}>— no output —</span>}
                                </span>
                              </div>
                              {r.expected && !isCustom && <div><span style={{ color: "#4ec9b0" }}>Expected: </span><span style={{ color: "#c9d1d9" }}>{r.expected}</span></div>}
                              {isCustom && <div style={{ color: "#576078", fontStyle: "italic", fontSize: "11px" }}>Custom input — no expected output</div>}
                              <div style={{ color: "#3a3f55", marginTop: "2px" }}>Runtime: {r.runtime}</div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Console stdout */}
                      {isRunning && (
                        <div style={{ color: "#576078", fontStyle: "italic", display: "flex", gap: "8px" }}>
                          <span>›</span><span>Running…</span>
                        </div>
                      )}
                      {consoleLogs.length === 0 && !isRunning && Object.keys(runResults).length === 0 && !submitResult && (
                        <div style={{ color: "#2d3147", fontStyle: "italic" }}>Click Run or Submit to see output…</div>
                      )}
                      {consoleLogs.map((log, i) => {
                        const color = log.startsWith("[ERR]") || log.startsWith("[ERROR]") || log.startsWith("[Runtime") ? "#f87171"
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
        </Panel>
      </PanelGroup>


      {/* ── Scoped CSS ────────────────────────────────────────── */}
      <style>{`
        #app-footer { display: none !important; }

        .nav-arrow-btn {
          background: transparent;
          border-width: 1px; border-style: solid; border-color: #e2e8f0;
          border-radius: 6px; color: #64748b; padding: 3px 6px;
          cursor: pointer; display: inline-flex; align-items: center;
          transition: all 0.15s;
        }
        .nav-arrow-btn:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }

        .run-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 6px;
          border-width: 1px; border-style: solid; border-color: #1e3a5f;
          background: rgba(86,156,214,0.08); color: #569cd6;
          font-size: 12.5px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: all 0.15s;
        }
        .run-btn:hover:not(:disabled) { background: rgba(86,156,214,0.15); border-color: #569cd6; }
        .run-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .submit-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 14px; border-radius: 6px; border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff; font-size: 12.5px; font-weight: 700;
          font-family: inherit; cursor: pointer; transition: all 0.15s;
        }
        .submit-btn:hover:not(:disabled) { background: linear-gradient(135deg, #4ade80, #22c55e); box-shadow: 0 0 14px rgba(34,197,94,0.3); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .lang-select {
          background: #0d0f17;
          border-width: 1px; border-style: solid; border-color: #1e2130;
          border-radius: 6px; color: #c4cfe0;
          padding: 4px 26px 4px 10px; font-size: 12.5px;
          font-family: inherit; cursor: pointer; outline: none;
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23576078' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 8px center;
          transition: border-color 0.15s;
        }
        .lang-select:focus { border-color: #569cd6; }

        .editor-util-btn {
          background: transparent; border: none; color: #3a3f55;
          cursor: pointer; padding: 5px 7px; border-radius: 5px;
          display: inline-flex; align-items: center; transition: all 0.15s;
        }
        .editor-util-btn:hover { background: #1e2130; color: #c4cfe0; }

        .resize-handle:hover { background-color: #569cd6 !important; }
        .resize-handle-v:hover { background-color: #4ec9b0 !important; }

        .tc-item:hover { background-color: #161b22 !important; }
        .tc-remove { opacity: 0; transition: opacity 0.15s; }
        .tc-item:hover .tc-remove { opacity: 1; }

        .tc-textarea:focus {
          border-color: #4ec9b0 !important;
          box-shadow: 0 0 0 3px rgba(78,201,176,0.06) !important;
        }

        .add-case-btn:hover { color: #6eddd1 !important; }
        .terminal-toggle:hover { color: #c4cfe0 !important; }

        /* Webkit scrollbars for terminal areas */
        .tc-textarea::-webkit-scrollbar { width: 4px; }
        .tc-textarea::-webkit-scrollbar-track { background: transparent; }
        .tc-textarea::-webkit-scrollbar-thumb { background: #21262d; border-radius: 4px; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
