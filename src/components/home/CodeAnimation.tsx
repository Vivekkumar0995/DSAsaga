"use client";
import { useState, useEffect } from "react";

interface CodeAnimationProps {
  user?: {
    name: string;
    score: number;
  };
  rank?: number | string;
}

interface TypewriterTextProps {
  strings: string[];
  typeSpeed?: number;
  linePause?: number;
  resetDelay?: number;
  loop?: boolean;
  className?: string;
}

type Token = {
  text: string;
  className: string;
};

const keywordSet = new Set([
  "function",
  "const",
  "let",
  "var",
  "if",
  "else",
  "for",
  "while",
  "return",
]);

const builtinSet = new Set(["Math"]);

const tokenizeLine = (line: string): Token[] => {
  if (line.length === 0) {
    return [{ text: " ", className: "text-[#9DA5B4]" }];
  }

  const tokenRegex = /(\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|[{}()\[\].,;:+\-*/<>=!&|?])/g;
  const tokens: Token[] = [];
  let lastIndex = 0;
  let prevWord = "";
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    const value = match[0] ?? "";
    const matchStart = match.index;

    if (matchStart > lastIndex) {
      tokens.push({
        text: line.slice(lastIndex, matchStart),
        className: "text-[#D4D4D4]",
      });
    }

    let className = "text-[#D4D4D4]";

    if (value.startsWith("//")) {
      className = "text-[#6A9955]";
    } else if (value.startsWith("\"") || value.startsWith("'")) {
      className = "text-[#CE9178]";
    } else if (/^\d/.test(value)) {
      className = "text-[#B5CEA8]";
    } else if (keywordSet.has(value)) {
      className = "text-[#569CD6]";
    } else if (builtinSet.has(value)) {
      className = "text-[#4FC1FF]";
    } else if (prevWord === "function") {
      className = "text-[#DCDCAA]";
    } else if (/^[A-Za-z_$][\w$]*$/.test(value)) {
      className = "text-[#9CDCFE]";
    }

    tokens.push({ text: value, className });

    if (/^[A-Za-z_$][\w$]*$/.test(value)) {
      prevWord = value;
    }

    lastIndex = tokenRegex.lastIndex;

    if (value.startsWith("//")) {
      break;
    }
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), className: "text-[#D4D4D4]" });
  }

  return tokens;
};

// Fixed, steady per-character delay instead of an oscillating formula.
// The old (typeSpeed + ((typedLength * 7) % 24) - 8) pattern made the
// cadence lurch every few characters, which read as "fuzzy" typing.
const TypewriterText = ({
  strings,
  typeSpeed = 22,
  linePause = 260,
  resetDelay = 1800,
  loop = true,
  className,
}: TypewriterTextProps) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);

  useEffect(() => {
    if (strings.length === 0) return;

    if (currentLineIndex >= strings.length) {
      if (!loop) return;

      const resetTimer = window.setTimeout(() => {
        setCurrentLineIndex(0);
        setTypedLength(0);
      }, resetDelay);

      return () => window.clearTimeout(resetTimer);
    }

    const currentLine = strings[currentLineIndex] ?? "";

    if (typedLength < currentLine.length) {
      const charTimer = window.setTimeout(
        () => setTypedLength((prev) => prev + 1),
        typeSpeed
      );

      return () => window.clearTimeout(charTimer);
    }

    const nextLineTimer = window.setTimeout(() => {
      setCurrentLineIndex((prev) => prev + 1);
      setTypedLength(0);
    }, linePause);

    return () => window.clearTimeout(nextLineTimer);
  }, [currentLineIndex, linePause, loop, resetDelay, strings, typeSpeed, typedLength]);

  const completedLines = strings.slice(0, Math.min(currentLineIndex, strings.length));
  const activeLine =
    currentLineIndex < strings.length
      ? (strings[currentLineIndex] ?? "").slice(0, typedLength)
      : "";

  const visibleLines =
    currentLineIndex < strings.length ? [...completedLines, activeLine] : completedLines;

  return (
    <div className={className}>
      {visibleLines.map((line, index) => {
        const isActive =
          currentLineIndex < strings.length && index === visibleLines.length - 1;
        const tokens = tokenizeLine(line);

        return (
          <div
            key={`${index}-${line.length}`}
            className="code-line group"
          >
            <span className="select-none text-[#5C6370] mr-4 w-6 text-right inline-block">
              {index + 1}
            </span>

            <span className="inline-block min-h-5">
              {tokens.map((token, tokenIndex) => (
                <span key={`${index}-${tokenIndex}-${token.text}`} className={token.className}>
                  {token.text}
                </span>
              ))}

              {isActive && <span className="editor-caret ml-px" />}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const codeSnippets = {
  quickSort: {
    name: "Quick sort",
    code: [
      "function quickSort(arr) {",
      "  if (arr.length <= 1) return arr;",
      "",
      "  const pivot = arr[arr.length - 1];",
      "  const left = [];",
      "  const right = [];",
      "",
      "  for (let i = 0; i < arr.length - 1; i++) {",
      "    if (arr[i] < pivot) {",
      "      left.push(arr[i]);",
      "    } else {",
      "      right.push(arr[i]);",
      "    }",
      "  }",
      "",
      "  return [...quickSort(left), pivot, ...quickSort(right)];",
      "}",
    ],
  },
  binarySearch: {
    name: "Binary search",
    code: [
      "function binarySearch(arr, target) {",
      "  let left = 0, right = arr.length - 1;",
      "",
      "  while (left <= right) {",
      "    const mid = Math.floor((left + right) / 2);",
      "    if (arr[mid] === target) return mid;",
      "    if (arr[mid] < target) {",
      "      left = mid + 1;",
      "    } else {",
      "      right = mid - 1;",
      "    }",
      "  }",
      "  return -1;",
      "}",
    ],
  },
  insertionSort: {
    name: "Insertion sort",
    code: [
      "function insertionSort(arr) {",
      "  for (let i = 1; i < arr.length; i++) {",
      "    const key = arr[i];",
      "    let j = i - 1;",
      "",
      "    while (j >= 0 && arr[j] > key) {",
      "      arr[j + 1] = arr[j];",
      "      j = j - 1;",
      "    }",
      "",
      "    arr[j + 1] = key;",
      "  }",
      "",
      "  return arr;",
      "}",
    ],
  },
};

const CodeAnimation = ({ }: CodeAnimationProps) => {
  const [hovered, setHovered] = useState(false);
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [rerunKey, setRerunKey] = useState(0);

  const snippetKeys = Object.keys(codeSnippets) as Array<keyof typeof codeSnippets>;
  const currentCode = codeSnippets[snippetKeys[currentSnippetIndex]];

  const handleManualClick = (index: number) => {
    setCurrentSnippetIndex(index);
    setRerunKey((prev) => prev + 1);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`editor-shell relative rounded-2xl w-full max-w-3xl transition-all duration-500 ${
        hovered
          ? "shadow-[0_26px_60px_-28px_rgba(79,156,238,0.35)]"
          : "shadow-[0_16px_34px_-28px_rgba(7,18,35,0.62)]"
      } ${hovered ? "is-hovered" : ""}`}
    >
      {/* Animated ring that circles the border. Rendered as a real element
          (not a phantom padding trick) so it can't leave a stray edge. */}
      <div className="editor-ring rounded-2xl" aria-hidden="true" />

      <div className="relative bg-[#1E1E1E] rounded-2xl border border-[#2D2D2D] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(95,185,255,0.10),transparent_30%)]" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-[#2A2A2A] bg-[#252526]/95 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-3 h-3 bg-[#FF5F56] rounded-full"></span>
            <span className="w-3 h-3 bg-[#FFBD2E] rounded-full"></span>
            <span className="w-3 h-3 bg-[#27C93F] rounded-full"></span>
            <span className="ml-2 sm:ml-4 text-xs sm:text-sm text-[#C5C5C5] font-semibold tracking-wide">
              {currentCode.name}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {snippetKeys.map((key, index) => (
              <button
                key={key}
                onClick={() => handleManualClick(index)}
                className={`cursor-pointer text-[11px] sm:text-xs px-3 py-1.5 rounded-md transition-all duration-300 border ${
                  currentSnippetIndex === index
                    ? "bg-[#37373D] border-[#4F9CEE] text-[#E8F3FF] shadow-[0_0_0_1px_rgba(79,156,238,0.35)]"
                    : "bg-[#2D2D30] border-[#3E3E42] text-[#B8C0CC] hover:bg-[#3A3A40]"
                }`}
              >
                {codeSnippets[key].name}
              </button>
            ))}
          </div>
        </div>

        <div className="editor-scrollbar relative h-90 sm:h-100 min-h-90 sm:min-h-100 bg-[#1E1E1E] rounded-b-2xl border-t border-[#121212]/50 px-3 sm:px-4 py-4 sm:py-5 text-xs sm:text-sm font-mono overflow-x-auto overflow-y-auto">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_0%,transparent_12%,transparent_88%,rgba(255,255,255,0.02)_100%)]" />

          <div className="relative flex-1 flex flex-col">
            <TypewriterText
              key={`${currentCode.name}-${rerunKey}`}
              strings={currentCode.code}
              typeSpeed={22}
              linePause={220}
              resetDelay={1650}
              loop={false}
              className="font-mono whitespace-pre wrap-break-word"
            />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @property --editor-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        .editor-shell {
          animation: shellFloat 6s ease-in-out infinite;
        }

        /* Ring lives as its own absolutely-positioned layer that sits
           BEHIND the panel and only shows through a fixed-width band,
           carved out with mask-composite: exclude. This is what gives
           a clean rotating outline instead of a blurry glow or a
           stray sliver of default border color. */
        .editor-ring {
          position: absolute;
          inset: 0;
          padding: 1.5px;
          background: conic-gradient(
            from var(--editor-angle),
            #4f9cee,
            #4ec9b0,
            #c586c0,
            #4fc1ff,
            #4f9cee
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          animation: editorRingSpin 5s linear infinite;
          opacity: 0.75;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .editor-shell.is-hovered .editor-ring {
          opacity: 1;
        }

        @keyframes editorRingSpin {
          to {
            --editor-angle: 360deg;
          }
        }

        .editor-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }

        .editor-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .editor-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
        }

        .editor-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #4f9cee, #356eb8);
          border-radius: 8px;
          border: 2px solid #1f2937;
        }

        .editor-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #6db4ff, #4f9cee);
        }

        .editor-caret {
          display: inline-block;
          width: 2px;
          height: 1.1rem;
          background: linear-gradient(180deg, #9cdcfe, #4fc1ff);
          vertical-align: text-bottom;
          border-radius: 2px;
          animation: caretBlink 1s steps(1) infinite;
        }

        @keyframes caretBlink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }

        .code-line {
          line-height: 1.65;
        }

        @keyframes shellFloat {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .editor-shell {
            animation: none;
          }
          .editor-ring {
            animation: none;
          }
          .editor-caret {
            animation: none;
          }
        }
      `}} />
    </div>
  );
};

export default CodeAnimation;
