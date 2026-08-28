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
  Users, Trophy, Clock, HardDrive, Percent, Zap, Swords, Award, Target, Flame
} from "lucide-react";
import EditorCore from "@/components/editor/EditorCore";
import SyntaxHighlighter from "@/components/editor/SyntaxHighlighter";
import { useEditorCore } from "@/hooks/editor/useEditorCore";
import { useCompletions } from "@/hooks/editor/useCompletions";
import Completions from "@/components/editor/Completions";
import { getEditorState, saveEditorState } from "@/lib/editor/indexedDB";
import { detectLanguageFromCode } from "@/lib/sandbox/languageDetector";

// ─── Types ────────────────────────────────────────────────────
type Props = {
  question?: any;
  questionsList?: any[];
  previousQuestion?: any;
  nextQuestion?: any;
  dataStructure: string;
  // Battle Mode Props
  battleMode?: boolean;
  opponent?: {
    senderId?: string;
    passCount: number;
    totalTests: number;
    questionsSolved?: number;
    totalQuestions?: number;
    isCompleted: boolean;
    name?: string;
  };
  winner?: string | null;
  matchOutcome?: {
    type: 'win' | 'loss';
    reason: string;
    message: string;
  } | null;
  roomId?: string;
  onBattleSubmit?: (passed: number, total: number, questionsSolvedCount?: number) => void;
  onTimeExpired?: () => void;
};

type LangKey = "cpp" | "java" | "python" | "c" | "javascript";
type LeftTabKey = "description" | "solutions" | "submissions" | "editorial";
type BottomTabKey = "testcases" | "output";

const LANG_LABELS: Record<LangKey, string> = {
  cpp: "C++", java: "Java", python: "Python", c: "C", javascript: "JavaScript",
};
const LANG_COMMENT: Record<LangKey, string> = {
  cpp: "//", java: "//", python: "#", c: "//", javascript: "//",
};

// Starter Code Generator
function generateDynamicStarterCode(lang: LangKey, question: any): string {
  if (question?.starter_code?.[lang]) {
    return question.starter_code[lang];
  }

  const title = question?.title || "solve";
  const camelTitle = title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((word: string, index: number) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");

  const returnType = question?.return_type || "int";
  const javaReturnType = question?.return_type_java || (returnType === "vector" ? "List<Integer>" : returnType);
  const cppReturnType = question?.return_type_cpp || (returnType === "vector" ? "vector<int>" : returnType);
  const cReturnType = question?.return_type_c || returnType;

  const params = question?.params || [];
  const cppParams = params.map((p: any) => `${p.type || "int"} ${p.name || "param"}`).join(", ");
  const javaParams = params.map((p: any) => `${p.type_java || p.type || "int"} ${p.name || "param"}`).join(", ");
  const cParams = params.map((p: any) => `${p.type_c || p.type || "int"} ${p.name || "param"}`).join(", ");
  const jsParams = params.map((p: any) => p.name || "param").join(", ");
  const pyParams = params.map((p: any) => p.name || "param").join(", ");

  switch (lang) {
    case "cpp":
      return `class Solution {\npublic:\n    ${cppReturnType} ${camelTitle}(${cppParams}) {\n        // Write solution here\n        \n    }\n};`;
    case "java":
      return `class Solution {\n    public ${javaReturnType} ${camelTitle}(${javaParams}) {\n        // Write solution here\n        \n    }\n}`;
    case "python":
      return `class Solution:\n    def ${camelTitle}(self, ${pyParams}):\n        # Write solution here\n        pass`;
    case "c":
      return `#include <stdio.h>\n#include <stdlib.h>\n\n${cReturnType} ${camelTitle}(${cParams}) {\n    // Write solution here\n    \n}`;
    case "javascript":
    default:
      return `function ${camelTitle}(${jsParams}) {\n    // Write solution here\n    \n}`;
  }
}

const DIFF_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  easy:   { bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" },
  medium: { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
  hard:   { bg: "#FEE2E2", color: "#B91C1C", border: "#FECACA" },
};

function parseDescription(text: string) {
  if (!text) return null;
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <code key={idx} className="bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[13px] font-semibold">
        {part}
      </code>
    ) : part
  );
}

function EmptySection({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      <div className="text-xs text-slate-500 max-w-xs leading-relaxed">{subtitle}</div>
    </div>
  );
}

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

function checkOutputMatch(
  actual: string,
  expected: string | null,
  unordered = false,
  inputStr = "",
  questionMeta?: any
): boolean {
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
              if (nums[i] + nums[j] === target) return true;
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
        if (JSON.stringify(sortedA) === JSON.stringify(sortedE)) return true;
      }
    } catch {}
  }

  return false;
}

// ─── MAIN WORKSPACE COMPONENT ────────────────────────────────
export default function QuestionPanelsClient({
  question,
  questionsList = [],
  previousQuestion,
  nextQuestion,
  dataStructure,
  battleMode = false,
  opponent,
  winner,
  matchOutcome,
  roomId,
  onBattleSubmit,
  onTimeExpired,
}: Props) {
  const router = useRouter();

  // Combine single question & questionsList into a 4-questions array
  const allQuestions = useMemo(() => {
    if (questionsList && questionsList.length > 0) {
      return questionsList;
    }
    if (question) {
      return [question];
    }
    return [];
  }, [question, questionsList]);

  // Active question index state (0, 1, 2, 3)
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const activeQuestion = allQuestions[activeQuestionIdx] || question;

  // Track solved status per question index
  const [solvedQuestionsMap, setSolvedQuestionsMap] = useState<Record<number, boolean>>({});
  const totalSolvedCount = useMemo(() => {
    return Object.values(solvedQuestionsMap).filter(Boolean).length;
  }, [solvedQuestionsMap]);

  const previousHref = previousQuestion ? `/${dataStructure}/practice/${previousQuestion.slug}` : undefined;
  const nextHref     = nextQuestion     ? `/${dataStructure}/practice/${nextQuestion.slug}`     : undefined;

  // 1:30 Hours (90 mins = 5400s) Contest Timer
  const [timeLeft, setTimeLeft] = useState(5400);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeExpired) onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onTimeExpired]);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Auth guard
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

  // Editor Core Hook
  const [activeLang, setActiveLang] = useState<LangKey>("cpp");
  const getStarterCode = (l: LangKey) => generateDynamicStarterCode(l, activeQuestion);

  const {
    code, setCode, undo, redo, editorRef, caretOffsetRef,
    saveCaretOffset, restoreCaretOffset, initLanguageCode,
    hasLanguageHistory, resetAllHistory,
  } = useEditorCore(getStarterCode(activeLang), activeLang);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const lineCount = code.split("\n").length;

  useEffect(() => {
    resetAllHistory();
  }, [activeQuestion?.slug, resetAllHistory]);

  // IndexedDB
  useEffect(() => {
    if (!activeQuestion?.slug || !activeLang) return;
    let alive = true;

    if (!hasLanguageHistory(activeLang)) {
      getEditorState(activeQuestion.slug, activeLang).then(saved => {
        if (!alive) return;
        if (saved) {
          initLanguageCode(activeLang, saved.code, saved.caretOffset);
        } else {
          initLanguageCode(activeLang, getStarterCode(activeLang), 0);
        }
      });
    }
    return () => { alive = false; };
  }, [activeLang, activeQuestion?.slug, hasLanguageHistory, initLanguageCode]);

  useEffect(() => {
    if (!activeQuestion?.slug || !activeLang) return;
    const t = setTimeout(() => saveEditorState(activeQuestion.slug, activeLang, code, caretOffsetRef.current), 1000);
    return () => clearTimeout(t);
  }, [code, activeLang, activeQuestion?.slug]);

  // Completions Hook
  const completions = useCompletions();

  // Search & Replace State
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

  // Left & Bottom Panel Tab State
  const [leftTab, setLeftTab] = useState<LeftTabKey>("description");
  const [bottomTab, setBottomTab] = useState<BottomTabKey>("testcases");

  useEffect(() => {
    if (battleMode) {
      setLeftTab("description");
    }
  }, [battleMode]);

  const [isRunning,    setIsRunning]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied,       setCopied]       = useState(false);

  // Friend Standing Drawer State
  const [showStandingDrawer, setShowStandingDrawer] = useState(false);

  // Custom test cases
  type CustomCase = { id: string; input: string };
  const seedCases: CustomCase[] = useMemo(() => {
    const allTcs = activeQuestion?.test_cases || [];
    const publicTcs = allTcs.filter((tc: any) => !tc.is_hidden);
    const targetCases = publicTcs.length > 0 ? publicTcs : allTcs.slice(0, 3);
    return targetCases.map((tc: any, i: number) => ({
      id: String(i),
      input: tc.input ?? "",
    }));
  }, [activeQuestion?.test_cases]);

  const [customCases, setCustomCases] = useState<CustomCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string>("0");
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);

  useEffect(() => {
    setCustomCases(seedCases);
    if (seedCases.length) {
      setActiveCaseId(seedCases[0].id);
    }
  }, [seedCases]);

  // Run & Submit results
  type RunResult = {
    input: string;
    output: string;
    expected: string;
    status: "correct" | "wrong" | "error" | "custom";
    errorType?: string;
    stderr?: string;
    runtime: string;
  };
  const [runResults, setRunResults] = useState<Record<string, RunResult>>({});
  const [submitResult, setSubmitResult] = useState<null | { verdict: string; passed: number; total: number }>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  // Fetch submissions for active question
  useEffect(() => {
    if (leftTab === "submissions" && activeQuestion?.slug) {
      fetch(`/api/questions/submit?questionSlug=${activeQuestion.slug}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setSubmissions(data.submissions || []);
          }
        })
        .catch(err => console.error("Error fetching submissions:", err));
    }
  }, [leftTab, activeQuestion?.slug]);

  const handleLangChange = (l: LangKey) => {
    setActiveLang(l);
    setRunResults({});
    setSubmitResult(null);
    setConsoleLogs([]);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    if (!requireAuth()) return;
    setBottomTab("output");
    setIsRunning(true);
    setRunResults({});
    setConsoleLogs([]);
    setSubmitResult(null);

    try {
      const cases = customCases.length ? customCases : seedCases;
      const results: Record<string, RunResult> = {};

      for (const tc of cases) {
        setRunningCaseId(tc.id);
        const res = await fetch("/api/questions/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language: activeLang,
            input: tc.input,
            questionMeta: activeQuestion,
          }),
        });
        const data = await res.json().catch(() => ({
          success: false,
          error: `HTTP ${res.status}: Server execution error`,
        }));

        if (!data.success) {
          results[tc.id] = {
            input: tc.input,
            output: data.error || "Server error",
            expected: "",
            status: "error",
            errorType: "Runtime Error",
            stderr: data.error || "Server error",
            runtime: "—",
          };
          continue;
        }

        const r = data.result;
        const actualOutput = r?.stdout ? r.stdout.trim() : "";
        const runtime = (r?.timeMs || 0) + " ms";

        const refR = data.referenceResult;
        const refOutput = (refR && !refR.errorType && refR.stdout !== undefined) ? refR.stdout.trim() : "";

        const dbCase = (activeQuestion?.test_cases || []).find((d: any) => (d.input || "").trim() === tc.input.trim());
        const dbExp = dbCase?.output !== undefined ? dbCase.output.trim() : "";

        const expectedStr = refOutput || dbExp || "";

        if (r?.errorType) {
          results[tc.id] = {
            input: tc.input,
            output: r.stderr || r.stdout || r.errorType,
            expected: expectedStr,
            status: "error",
            errorType: r.errorType,
            stderr: r.stderr || r.stdout || "",
            runtime,
          };
          continue;
        }

        let status: RunResult["status"] = "custom";
        if (expectedStr !== "") {
          const isMatch = checkOutputMatch(
            actualOutput,
            expectedStr,
            Boolean(activeQuestion?.unordered_output),
            tc.input,
            activeQuestion
          );
          status = isMatch ? "correct" : "wrong";
        }

        results[tc.id] = {
          input: tc.input,
          output: actualOutput,
          expected: expectedStr,
          status,
          stderr: r?.stderr || "",
          runtime,
        };
      }

      setRunResults(results);
    } catch (e: any) {
      setConsoleLogs([`[Server Error] ${e.message}`]);
    } finally {
      setIsRunning(false);
      setRunningCaseId(null);
    }
  };

  const handleSubmit = async () => {
    if (!requireAuth()) return;
    setBottomTab("output");
    setIsSubmitting(true);
    setRunResults({});
    setConsoleLogs(["Submitting solution for server evaluation..."]);
    setSubmitResult(null);

    try {
      const submitRes = await fetch("/api/questions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionSlug: activeQuestion?.slug,
          code,
          language: activeLang,
        }),
      });
      const submitData = await submitRes.json();

      if (!submitData.success) {
        throw new Error(submitData.message || "Submission failed");
      }

      const verdict = submitData.verdict || "Wrong Answer";
      const passed = submitData.passed ?? 0;
      const total = submitData.total ?? 0;
      const serverLogs: string[] = submitData.logs || [];

      setSubmitResult({ verdict, passed, total });

      let newSolvedCount = totalSolvedCount;
      if (verdict === "Accepted") {
        setSolvedQuestionsMap(prev => {
          const updated = { ...prev, [activeQuestionIdx]: true };
          newSolvedCount = Object.values(updated).filter(Boolean).length;
          return updated;
        });
      }

      if (battleMode && onBattleSubmit) {
        onBattleSubmit(passed, total, newSolvedCount);
      }

      if (verdict === "Accepted") {
        setConsoleLogs([
          ...serverLogs,
          `⚡ XP: +${submitData.xpGained || 0}`,
          `🏆 Level: ${submitData.newLevel || 1}`,
        ]);
        toast.success(`Accepted! +${submitData.xpGained || 0} XP 🎉`);
      } else {
        setConsoleLogs(serverLogs.length ? serverLogs : [`Verdict: ${verdict} — Passed ${passed}/${total}`]);
        toast.error(`${verdict} — Passed ${passed}/${total}`);
      }

      fetch(`/api/questions/submit?questionSlug=${activeQuestion.slug}`)
        .then(r => r.json())
        .then(d => { if (d.success) setSubmissions(d.submissions || []); })
        .catch(() => {});
    } catch (e: any) {
      setSubmitResult({ verdict: "Error", passed: 0, total: 0 });
      setConsoleLogs([`[ERR] ${e.message}`]);
      toast.error(e.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const diff      = (activeQuestion?.difficulty || "easy").toLowerCase();
  const diffStyle = DIFF_STYLES[diff] ?? DIFF_STYLES.easy;

  const LEFT_TABS: { key: LeftTabKey; label: string; icon: any }[] = useMemo(() => {
    if (battleMode) {
      return [{ key: "description", label: "Description", icon: BookOpen }];
    }
    return [
      { key: "description",  label: "Description",  icon: BookOpen    },
      { key: "solutions",    label: "Solutions",    icon: Lightbulb   },
      { key: "submissions",  label: "Submissions",  icon: FlaskConical},
      { key: "editorial",    label: "Editorial",    icon: FileText    },
    ];
  }, [battleMode]);

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

  const opponentPassed = opponent?.questionsSolved ?? opponent?.passCount ?? 0;
  const opponentTotal  = opponent?.totalQuestions || (allQuestions.length > 0 ? allQuestions.length : 4);
  const opponentProgressPct = opponentTotal > 0 ? (opponentPassed / opponentTotal) * 100 : 0;

  return (
    <div className="flex flex-col h-screen pt-24 bg-[#F8F9FB] font-sans overflow-hidden text-slate-800">
      
      {/* ── SUB-NAVBAR TOOLBAR ── */}
      <div className="bg-white border-b border-slate-200/90 px-5 py-2.5 flex items-center justify-between shadow-2xs flex-shrink-0 z-10">
        
        {/* Left Side: Opponent Standing Pill Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStandingDrawer(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 shadow-2xs hover:shadow-xs font-semibold text-xs transition-all cursor-pointer group"
          >
            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold group-hover:scale-105 transition-transform">
              <Users size={10} />
            </div>
            <span>Opponent Standing</span>
            {battleMode && opponent && (
              <span className="ml-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {opponentPassed}/{opponentTotal}
              </span>
            )}
          </button>

          {battleMode && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Swords className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>1v1 Duel</span>
              {roomId && <span className="font-mono text-[11px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">{roomId}</span>}
            </div>
          )}
        </div>

        {/* Middle: 4 Questions Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          {allQuestions.map((q, idx) => {
            const isSelected = activeQuestionIdx === idx;
            const isSolved = solvedQuestionsMap[idx];
            const qDiff = (q.difficulty || "easy").toLowerCase();
            return (
              <button
                key={q._id || q.slug || idx}
                onClick={() => setActiveQuestionIdx(idx)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                }`}
              >
                <span>Q{idx + 1}</span>
                {isSolved ? (
                  <Check size={12} className="text-emerald-600 font-bold" />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${
                    qDiff === 'easy' ? 'bg-emerald-500' : qDiff === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: 1:30 Hrs Contest Countdown Timer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs font-bold shadow-xs">
          <Clock size={13} className="text-teal-400 animate-pulse" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* ── Main Resizable Workspace Area ── */}
      <div className="flex-1 overflow-hidden p-3 pt-2">
        <PanelGroup direction="horizontal" className="h-full gap-2">

          {/* ── LEFT PANEL: Question Statement ── */}
          <Panel defaultSize={42} minSize={25}>
            <div className="h-full flex flex-col bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
              
              {/* Tab Navigation */}
              <div className="flex items-center justify-between border-b border-gray-200/80 px-4 h-11 bg-white flex-shrink-0">
                <div className="flex items-center gap-1">
                  {LEFT_TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setLeftTab(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        leftTab === key
                          ? "bg-slate-100 text-slate-900 font-semibold"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  {previousHref ? (
                    <Link href={previousHref} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                      <ChevronLeft size={16} />
                    </Link>
                  ) : (
                    <span className="p-1 text-slate-300 cursor-not-allowed"><ChevronLeft size={16} /></span>
                  )}
                  {nextHref ? (
                    <Link href={nextHref} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <span className="p-1 text-slate-300 cursor-not-allowed"><ChevronRight size={16} /></span>
                  )}
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* DESCRIPTION TAB */}
                {leftTab === "description" && (
                  <div>
                    <div className="space-y-3 pb-4 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-4">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                          {activeQuestion?.title || "Problem Statement"}
                        </h1>
                        <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-colors"><ThumbsUp size={15} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-colors"><Star size={15} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-colors"><Share2 size={15} /></button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span
                          className="px-2.5 py-1 rounded-full font-semibold capitalize border"
                          style={{ backgroundColor: diffStyle.bg, color: diffStyle.color, borderColor: diffStyle.border }}
                        >
                          {diff}
                        </span>

                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                          <Clock size={12} className="text-slate-400" />
                          <span>{activeQuestion?.time_limit || "1.0s"}</span>
                        </span>

                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                          <HardDrive size={12} className="text-slate-400" />
                          <span>{activeQuestion?.memory_limit || "256 MB"}</span>
                        </span>

                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                          <Percent size={12} className="text-slate-400" />
                          <span>{activeQuestion?.acceptance_rate || "74.2%"} Acceptance</span>
                        </span>

                        {activeQuestion?.xp && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                            <Zap size={12} className="text-amber-500" />
                            <span>+{activeQuestion.xp} XP</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      {activeQuestion?.description ? (
                        <div className="text-[14px] leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
                          {parseDescription(activeQuestion.description)}
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-sm">No detailed description available.</div>
                      )}
                    </div>

                    <div className="mt-8 space-y-5">
                      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-[12px]">Examples</h3>
                      {activeQuestion?.test_cases?.length > 0 ? (
                        activeQuestion.test_cases.slice(0, 3).map((tc: any, i: number) => (
                          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden shadow-2xs">
                            <div className="px-3.5 py-2 bg-slate-100/80 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-600">
                              <span>Example {i + 1}</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText(`Input: ${tc.input}\nOutput: ${tc.output}`); toast.success("Copied example!"); }}
                                className="text-slate-400 hover:text-slate-700 transition-colors"
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                            <div className="p-3.5 font-mono text-xs space-y-2 text-slate-800">
                              <div>
                                <span className="text-slate-400 font-sans text-[11px] block font-medium uppercase tracking-wide">Input</span>
                                <div className="bg-white p-2 rounded border border-slate-200/80 mt-0.5 whitespace-pre-wrap">{tc.input}</div>
                              </div>
                              <div>
                                <span className="text-slate-400 font-sans text-[11px] block font-medium uppercase tracking-wide">Output</span>
                                <div className="bg-emerald-50/60 text-emerald-800 p-2 rounded border border-emerald-200/60 mt-0.5 font-semibold">{tc.output}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptySection icon={FlaskConical} title="No Examples Available" subtitle="Default test case definitions have not been set for this question." />
                      )}
                    </div>
                  </div>
                )}

                {/* SOLUTIONS TAB */}
                {leftTab === "solutions" && (
                  <EmptySection icon={Lightbulb} title="Community Solutions" subtitle="Solutions shared by top competitive programmers will appear here." />
                )}

                {/* SUBMISSIONS TAB */}
                {leftTab === "submissions" && (
                  selectedSubmission ? (
                    <div className="space-y-4">
                      <button
                        onClick={() => setSelectedSubmission(null)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <ChevronLeft size={14} /> Back to all submissions
                      </button>

                      <div className={`p-4 rounded-xl border ${selectedSubmission.verdict === "Accepted" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"}`}>
                        <div className="font-bold text-base">{selectedSubmission.verdict}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {LANG_LABELS[selectedSubmission.language as LangKey] || selectedSubmission.language} • {new Date(selectedSubmission.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 text-slate-100">
                        <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center text-xs text-slate-400 font-mono">
                          <span>{LANG_LABELS[selectedSubmission.language as LangKey]}</span>
                          <button onClick={() => { navigator.clipboard.writeText(selectedSubmission.code); toast.success("Copied!"); }} className="hover:text-white">
                            <Copy size={13} />
                          </button>
                        </div>
                        <div className="p-4 font-mono text-xs">
                          <SyntaxHighlighter code={selectedSubmission.code} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    submissions.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your History ({submissions.length})</div>
                        {submissions.map((sub: any, idx: number) => (
                          <div
                            key={sub._id || idx}
                            onClick={() => setSelectedSubmission(sub)}
                            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-all shadow-2xs"
                          >
                            <div>
                              <div className={`font-semibold text-sm ${sub.verdict === "Accepted" ? "text-emerald-600" : "text-rose-600"}`}>
                                {sub.verdict}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {LANG_LABELS[sub.language as LangKey]} • {new Date(sub.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 text-right">
                              <span className="font-semibold">{sub.passed}/{sub.total} Passed</span>
                              <div className="text-teal-600 text-[11px] mt-0.5">View code →</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptySection icon={FlaskConical} title="No Submissions Yet" subtitle="Submit your solution using the editor to track history." />
                    )
                  )
                )}

                {/* EDITORIAL TAB */}
                {leftTab === "editorial" && (() => {
                  const refLangInfo = detectLanguageFromCode(activeQuestion?.reference_solution || "");
                  return activeQuestion?.reference_solution ? (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Official Editorial ({refLangInfo.label})</h2>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Reference model implementation provided for algorithm verification.
                        </p>
                      </div>

                      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 text-slate-100">
                        <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center text-xs text-slate-400 font-mono">
                          <span>{refLangInfo.label}</span>
                          <button onClick={() => { navigator.clipboard.writeText(activeQuestion.reference_solution); toast.success("Copied!"); }} className="hover:text-white">
                            <Copy size={13} />
                          </button>
                        </div>
                        <div className="p-4 font-mono text-xs">
                          <SyntaxHighlighter code={activeQuestion.reference_solution} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptySection icon={FileText} title="Editorial Coming Soon" subtitle="An official solution walkthrough will be published soon." />
                  );
                })()}

              </div>
            </div>
          </Panel>

          {/* Resizable Divider */}
          <PanelResizeHandle className="w-1.5 hover:bg-teal-500/40 rounded-full transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-0.5 h-6 bg-slate-300 rounded-full" />
          </PanelResizeHandle>

          {/* ── RIGHT PANEL: Code Editor & Terminal ── */}
          <Panel defaultSize={58} minSize={30}>
            <div className="h-full flex flex-col bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
              <PanelGroup direction="vertical" className="h-full">

                {/* UPPER: Code Editor Canvas */}
                <Panel defaultSize={65} minSize={30}>
                  <div className="h-full flex flex-col bg-[#0D0F17] text-slate-200 overflow-hidden">

                    {/* Editor Toolbar */}
                    <div className="h-11 px-4 bg-[#111318] border-b border-slate-800/80 flex items-center justify-between flex-shrink-0">
                      
                      <select
                        value={activeLang}
                        onChange={e => handleLangChange(e.target.value as LangKey)}
                        className="bg-[#181B24] border border-slate-700/80 text-slate-200 text-xs rounded-lg px-3 py-1.5 font-medium outline-none focus:border-teal-500 cursor-pointer"
                      >
                        {(Object.keys(LANG_LABELS) as LangKey[]).map(l => (
                          <option key={l} value={l}>{LANG_LABELS[l]}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        <button onClick={handleCopy} title="Copy Code" className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                          {copied ? <Check size={14} className="text-teal-400" /> : <Copy size={14} />}
                        </button>
                        <button onClick={() => setCode(getStarterCode(activeLang), 0)} title="Reset Starter Code" className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                          <RotateCcw size={14} />
                        </button>
                        <button onClick={() => setShowSearch(p => !p)} title="Find & Replace (Ctrl+F)" className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${showSearch ? "text-teal-400 bg-slate-800" : "text-slate-400"}`}>
                          <Search size={14} />
                        </button>

                        <div className="w-px h-4 bg-slate-800 mx-1" />

                        <button
                          onClick={handleRun}
                          disabled={isRunning || isSubmitting}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                          Run
                        </button>

                        <button
                          onClick={handleSubmit}
                          disabled={isRunning || isSubmitting}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-sm hover:shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
                          Submit
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex overflow-auto min-h-0 relative">
                      <div
                        aria-hidden
                        className="w-12 pt-4 bg-[#0D0F17] border-r border-slate-800/60 font-mono text-[12px] leading-relaxed text-right pr-3 select-none text-slate-600 flex-shrink-0"
                      >
                        {Array.from({ length: lineCount }, (_, i) => (
                          <div key={i} className={i + 1 === cursorPos.line ? "text-teal-400 font-semibold" : ""}>
                            {i + 1}
                          </div>
                        ))}
                      </div>

                      <div className="flex-1 min-w-0 relative">
                        {showSearch && (
                          <div className="absolute top-3 right-4 z-50 bg-[#1A1D27] border border-slate-700 rounded-lg p-2.5 shadow-xl flex flex-col gap-2 w-72 text-xs font-sans">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Find..."
                                value={searchQuery}
                                autoFocus
                                onChange={e => { setSearchQuery(e.target.value); setActiveMatchIndex(0); }}
                                className="flex-1 bg-[#111318] border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none focus:border-teal-500"
                              />
                              {searchQuery && (
                                <span className="text-[11px] text-slate-400 px-1">
                                  {searchMatches.length ? `${activeMatchIndex + 1}/${searchMatches.length}` : "0/0"}
                                </span>
                              )}
                              <button onClick={selectPrevMatch} disabled={!searchMatches.length} className="text-slate-400 hover:text-white p-1"><ChevronLeft size={14} /></button>
                              <button onClick={selectNextMatch} disabled={!searchMatches.length} className="text-slate-400 hover:text-white p-1"><ChevronRight size={14} /></button>
                              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="text-slate-400 hover:text-white p-1"><X size={14} /></button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Replace with..."
                                value={replaceQuery}
                                onChange={e => setReplaceQuery(e.target.value)}
                                className="flex-1 bg-[#111318] border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none focus:border-teal-500"
                              />
                              <button onClick={handleReplace} disabled={!searchMatches.length} className="bg-teal-600 text-white px-2 py-1 rounded text-[11px] font-semibold hover:bg-teal-500">Replace</button>
                              <button onClick={handleReplaceAll} disabled={!searchMatches.length} className="bg-teal-600 text-white px-2 py-1 rounded text-[11px] font-semibold hover:bg-teal-500">All</button>
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

                    <div className="h-6 bg-[#08090E] border-t border-slate-800/80 px-4 flex items-center justify-between font-mono text-[11px] text-slate-500 flex-shrink-0 select-none">
                      <div className="flex items-center gap-4">
                        <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                        <span>{lineCount} lines</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-teal-400 font-semibold">{LANG_LABELS[activeLang]}</span>
                        <span>UTF-8</span>
                      </div>
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="h-1.5 hover:bg-teal-500/40 transition-colors cursor-row-resize flex items-center justify-center bg-[#111318]">
                  <div className="h-0.5 w-6 bg-slate-700 rounded-full" />
                </PanelResizeHandle>

                {/* LOWER: Integrated Terminal */}
                <Panel defaultSize={35} minSize={15}>
                  <div className="h-full flex flex-col bg-[#080A10] text-slate-200 overflow-hidden font-sans">
                    
                    <div className="h-9 bg-[#0D0F17] border-b border-slate-800 flex items-center justify-between px-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setBottomTab("testcases")}
                          className={`flex items-center gap-1.5 px-3.5 h-9 border-b-2 text-xs font-semibold transition-all ${
                            bottomTab === "testcases"
                              ? "border-teal-400 text-teal-400 bg-slate-900/40"
                              : "border-transparent text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <FlaskConical size={13} />
                          Test Cases
                        </button>

                        <button
                          onClick={() => setBottomTab("output")}
                          className={`flex items-center gap-1.5 px-3.5 h-9 border-b-2 text-xs font-semibold transition-all ${
                            bottomTab === "output"
                              ? "border-teal-400 text-teal-400 bg-slate-900/40"
                              : "border-transparent text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Terminal size={13} />
                          Output & Verdict
                          {(consoleLogs.length > 0 || Object.keys(runResults).length > 0) && (
                            <span className="bg-teal-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                              {consoleLogs.length + Object.keys(runResults).length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex">
                      {bottomTab === "testcases" && (
                        <div className="flex w-full h-full overflow-hidden">
                          <div className="w-36 border-r border-slate-800 p-2 space-y-1 overflow-y-auto flex-shrink-0 bg-[#0B0D14]">
                            {customCases.map((c, idx) => (
                              <div
                                key={c.id}
                                onClick={() => setActiveCaseId(c.id)}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                                  activeCaseId === c.id
                                    ? "bg-slate-800 text-teal-300 font-semibold border-l-2 border-teal-400"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                }`}
                              >
                                <span>Case {idx + 1}</span>
                                {customCases.length > 1 && (
                                  <button
                                    onClick={e => { e.stopPropagation(); removeCase(c.id); }}
                                    className="text-slate-500 hover:text-rose-400"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={addCase}
                              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
                            >
                              <Plus size={12} /> Add Case
                            </button>
                          </div>

                          <div className="flex-1 p-3.5 overflow-y-auto flex flex-col">
                            {activeCase ? (
                              <div className="flex flex-col h-full space-y-2">
                                <label className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Input Parameter</label>
                                <textarea
                                  value={activeCase.input}
                                  onChange={e => updateCaseInput(activeCase.id, e.target.value)}
                                  placeholder="Type input parameter..."
                                  spellCheck={false}
                                  className="flex-1 w-full bg-[#111318] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 outline-none focus:border-teal-500 resize-none"
                                />
                              </div>
                            ) : (
                              <div className="text-slate-500 text-xs italic">No case selected.</div>
                            )}
                          </div>
                        </div>
                      )}

                      {bottomTab === "output" && (
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3">
                          {submitResult && (
                            <div className={`p-3 rounded-xl border flex items-center justify-between ${
                              submitResult.verdict === "Accepted"
                                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                                : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                            }`}>
                              <span className="font-bold text-sm">{submitResult.verdict}</span>
                              <span className="text-xs opacity-80">{submitResult.passed} / {submitResult.total} Test Cases Passed</span>
                            </div>
                          )}

                          {Object.keys(runResults).length > 0 && customCases.map((c, idx) => {
                            const r = runResults[c.id];
                            if (!r) return null;
                            const isCorrect = r.status === "correct";
                            const isError   = r.status === "error";

                            return (
                              <div key={c.id} className={`p-3 rounded-xl border space-y-2 ${
                                isError
                                  ? "bg-rose-950/20 border-rose-800/40 text-rose-300"
                                  : isCorrect
                                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                                  : "bg-slate-900 border-slate-800 text-slate-300"
                              }`}>
                                <div className="flex justify-between items-center font-bold text-[11px] uppercase tracking-wide">
                                  <span>Case {idx + 1}</span>
                                  <span>{isError ? `❌ ${r.errorType || "Error"}` : isCorrect ? "✅ Passed" : "❌ Wrong Output"}</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div><span className="text-teal-400 font-medium">Input: </span>{r.input}</div>
                                  <div><span className="text-teal-400 font-medium">Output: </span>{r.output || "—"}</div>
                                  {r.expected && <div><span className="text-teal-400 font-medium">Expected: </span>{r.expected}</div>}
                                </div>
                              </div>
                            );
                          })}

                          {consoleLogs.map((log, idx) => (
                            <div key={idx} className="text-slate-300 flex items-start gap-2">
                              <span className="text-teal-500 select-none">›</span>
                              <span className="whitespace-pre-wrap">{log}</span>
                            </div>
                          ))}

                          {!isRunning && consoleLogs.length === 0 && Object.keys(runResults).length === 0 && !submitResult && (
                            <div className="text-slate-600 font-sans italic text-xs">Click Run or Submit to see execution logs...</div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </Panel>

              </PanelGroup>
            </div>
          </Panel>

        </PanelGroup>
      </div>

      {/* ── OPPONENT / FRIEND STANDING MODAL / DRAWER ── */}
      {showStandingDrawer && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Opponent & Friend Standing</h3>
                  <p className="text-xs text-slate-500">Live contest scores and progress tracking</p>
                </div>
              </div>
              <button
                onClick={() => setShowStandingDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {battleMode && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-100">
                    <span className="flex items-center gap-1.5"><Swords size={14} /> Live Opponent Status</span>
                    <span>{roomId || "1v1 Room"}</span>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-xs space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span>Opponent: {opponent?.name || "Opponent"}</span>
                      <span className="font-mono text-xs">{opponentPassed} / {opponentTotal} Passed</span>
                    </div>

                    <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${opponentProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {winner && (
                    <div className="p-2.5 rounded-lg bg-emerald-500 text-white font-bold text-center text-sm shadow-xs">
                      🏆 Winner: {winner}!
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contest Questions ({allQuestions.length})</h4>
                {allQuestions.map((q, idx) => (
                  <div
                    key={q._id || idx}
                    onClick={() => { setActiveQuestionIdx(idx); setShowStandingDrawer(false); }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      activeQuestionIdx === idx
                        ? "bg-teal-50 border-teal-200 text-teal-900 font-semibold"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">Q{idx + 1}</span>
                      <span className="text-sm truncate max-w-[200px]">{q.title}</span>
                    </div>
                    <span className="text-xs capitalize font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {q.difficulty || "medium"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BATTLE WIN / LOSS VICTORY & DEFEAT OVERLAY MODAL ── */}
      {matchOutcome && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg bg-white border rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200 ${
            matchOutcome.type === 'win' ? 'border-emerald-200' : 'border-rose-200'
          }`}>
            {/* Header Icon Banner */}
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
              matchOutcome.type === 'win'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white'
                : 'bg-gradient-to-tr from-rose-500 to-red-600 text-white'
            }`}>
              {matchOutcome.type === 'win' ? <Trophy size={40} /> : <X size={40} />}
            </div>

            <div>
              <h2 className={`text-3xl font-extrabold tracking-tight ${
                matchOutcome.type === 'win' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {matchOutcome.type === 'win' ? 'VICTORY!' : 'DEFEAT'}
              </h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed max-w-sm mx-auto font-medium">
                {matchOutcome.message}
              </p>
            </div>

            {/* Match Stats Summary Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 grid grid-cols-2 gap-4 text-center font-sans">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Questions Solved</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{totalSolvedCount} / {allQuestions.length}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Opponent Progress</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{opponentPassed} / {opponentTotal}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href={`/${dataStructure}/battle`}
                className={`flex-1 py-3 rounded-xl font-bold text-white text-sm shadow-md transition-all ${
                  matchOutcome.type === 'win'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                Return to Battle Lobby
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
