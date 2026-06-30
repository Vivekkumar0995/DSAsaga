import React, { useLayoutEffect } from "react";
import { useSyntaxHighlight } from "@/hooks/editor/useSyntaxHighlight";
import { COLORS } from "@/components/editor/SyntaxHighlighter";

export interface MatchRange {
  start: number;
  end: number;
}

interface EditorCoreProps {
  code: string;
  onChange: (code: string) => void;
  undo: () => void;
  redo: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  saveCaretOffset: (element: HTMLElement) => number;
  restoreCaretOffset: (element: HTMLElement, offset: number) => void;
  caretOffsetRef: React.MutableRefObject<number>;
  placeholder?: string;
  activeLang: string;

  // Autocomplete bindings
  completionsOpen: boolean;
  completionsSelectNext: () => boolean;
  completionsSelectPrev: () => boolean;
  completionsClose: () => void;
  completionsConfirm: () => void;
  onTriggerCompletions: (
    code: string,
    offset: number,
    getCoords: () => { x: number; y: number; height: number } | null
  ) => void;

  // Search & Replace highlights
  searchQuery: string;
  searchMatches: MatchRange[];
  activeMatchIndex: number;
}

// ─── Build HTML from tokens overlaying search matches character-by-character ──
function tokensToHtml(
  tokens: ReturnType<typeof useSyntaxHighlight>,
  searchMatches: MatchRange[],
  activeMatchIndex: number
): string {
  let charIndex = 0;
  return tokens
    .map((token) => {
      const color = COLORS[token.type] || "#d4d4d4";
      const val = token.value;
      let html = "";

      for (let i = 0; i < val.length; i++) {
        const absIdx = charIndex + i;

        // Check if current char is in any search match
        let matchIdx = -1;
        for (let m = 0; m < searchMatches.length; m++) {
          if (absIdx >= searchMatches[m].start && absIdx < searchMatches[m].end) {
            matchIdx = m;
            break;
          }
        }

        const char = val[i];
        let escaped = char
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        if (matchIdx !== -1) {
          const isActive = matchIdx === activeMatchIndex;
          const bg = isActive ? "rgba(245, 158, 11, 0.45)" : "rgba(245, 158, 11, 0.2)";
          const border = isActive ? "1px solid #f59e0b" : "1px solid transparent";
          escaped = `<span style="background-color: ${bg}; border: ${border}; border-radius: 2px; box-shadow: 0 0 2px rgba(245, 158, 11, 0.3);">${escaped}</span>`;
        }

        html += escaped;
      }

      charIndex += val.length;
      return `<span style="color:${color}">${html}</span>`;
    })
    .join("");
}

function getSelectionOffsets(element: HTMLElement): { start: number; end: number } {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return { start: 0, end: 0 };

  const range = sel.getRangeAt(0);

  const getOffset = (container: Node, containerOffset: number): number => {
    let offset = 0;
    let found = false;

    const traverse = (node: Node): void => {
      if (found) return;
      if (node.nodeType === Node.TEXT_NODE) {
        if (node === container) {
          offset += containerOffset;
          found = true;
          return;
        }
        offset += node.textContent?.length ?? 0;
      } else {
        if (node === container) {
          for (let i = 0; i < containerOffset; i++) {
            offset += node.childNodes[i]?.textContent?.length ?? 0;
          }
          found = true;
          return;
        }
        for (let i = 0; i < node.childNodes.length; i++) {
          traverse(node.childNodes[i]);
          if (found) return;
        }
      }
    };

    traverse(element);
    return offset;
  };

  const start = getOffset(range.startContainer, range.startOffset);
  const end = range.collapsed ? start : getOffset(range.endContainer, range.endOffset);

  return { start, end };
}

export default function EditorCore({
  code,
  onChange,
  undo,
  redo,
  editorRef,
  saveCaretOffset,
  restoreCaretOffset,
  caretOffsetRef,
  placeholder = "Write your code here...",
  activeLang,

  completionsOpen,
  completionsSelectNext,
  completionsSelectPrev,
  completionsClose,
  completionsConfirm,
  onTriggerCompletions,

  searchQuery,
  searchMatches,
  activeMatchIndex,
}: EditorCoreProps) {
  const tokens = useSyntaxHighlight(code);

  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const nextHtml = tokensToHtml(tokens, searchMatches, activeMatchIndex);

    if (el.innerHTML === nextHtml) return;

    const isFocused = document.activeElement === el;
    el.innerHTML = nextHtml;

    if (isFocused) {
      restoreCaretOffset(el, caretOffsetRef.current);
    }
  }, [tokens, editorRef, caretOffsetRef, restoreCaretOffset, searchMatches, activeMatchIndex]);

  // ─── Caret Coordinates measurement ──────────────────────────────
  const getCaretCoordinates = (): { x: number; y: number; height: number } | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0).cloneRange();

    let rect = range.getBoundingClientRect();

    if (rect.left === 0 && rect.top === 0) {
      const span = document.createElement("span");
      span.appendChild(document.createTextNode("\u200b"));
      range.insertNode(span);
      rect = span.getBoundingClientRect();
      span.parentNode?.removeChild(span);
    }

    return {
      x: rect.left,
      y: rect.top,
      height: rect.height || 18,
    };
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const offset = saveCaretOffset(element);
    const text = element.textContent || "";
    onChange(text);
    onTriggerCompletions(text, offset, getCaretCoordinates);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLDivElement>) => {
    saveCaretOffset(e.currentTarget);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    saveCaretOffset(e.currentTarget);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const element = e.currentTarget;

    // ── Autocomplete intercepts ───────────────────────────────────
    if (completionsOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        completionsSelectNext();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        completionsSelectPrev();
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        completionsConfirm();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        completionsClose();
        return;
      }
    }

    // ── Ctrl/Cmd + Z → Undo ──────────────────────────────────────
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      undo();
      completionsClose();
      return;
    }

    // ── Ctrl/Cmd + Y / Ctrl+Shift+Z → Redo ────────────────────────
    if (
      ((e.ctrlKey || e.metaKey) && e.key === "y") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z")
    ) {
      e.preventDefault();
      redo();
      completionsClose();
      return;
    }

    // ── Ctrl + Space → Trigger Autocomplete manually ──────────────
    if ((e.ctrlKey || e.metaKey) && e.key === " ") {
      e.preventDefault();
      const offset = saveCaretOffset(element);
      onTriggerCompletions(code, offset, getCaretCoordinates);
      return;
    }

    // ── Block browser rich-text shortcuts ─────────────────────────
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "b" || e.key === "i" || e.key === "u")
    ) {
      e.preventDefault();
      return;
    }

    // ── Tab → insert 2 spaces (replace selection if any) ─────────
    if (e.key === "Tab") {
      e.preventDefault();
      const { start, end } = getSelectionOffsets(element);
      const insertText = "  ";
      const newCode = code.slice(0, start) + insertText + code.slice(end);
      caretOffsetRef.current = start + insertText.length;
      onChange(newCode);
      completionsClose();
      return;
    }

    // ── Enter → newline + auto-indent (replace selection if any) ──
    if (e.key === "Enter") {
      e.preventDefault();
      const { start, end } = getSelectionOffsets(element);
      const textBeforeCaret = code.slice(0, start);
      const lines = textBeforeCaret.split("\n");
      const currentLine = lines[lines.length - 1] || "";
      const indentMatch = currentLine.match(/^(\s*)/);
      const indentation = indentMatch ? indentMatch[1] : "";
      const insertText = "\n" + indentation;
      const newCode = code.slice(0, start) + insertText + code.slice(end);
      caretOffsetRef.current = start + insertText.length;
      onChange(newCode);
      completionsClose();
      return;
    }

    // ── Backspace → explicit deletion (fixes forward-selection bug) ─
    if (e.key === "Backspace") {
      e.preventDefault();
      const { start, end } = getSelectionOffsets(element);

      if (start !== end) {
        const newCode = code.slice(0, start) + code.slice(end);
        caretOffsetRef.current = start;
        onChange(newCode);
        onTriggerCompletions(newCode, start, getCaretCoordinates);
        return;
      }

      const textBeforeCaret = code.slice(0, start);
      if (textBeforeCaret.endsWith("  ")) {
        const currentLine = textBeforeCaret.split("\n").pop() || "";
        if (/^\s*$/.test(currentLine)) {
          const newCode = code.slice(0, start - 2) + code.slice(start);
          caretOffsetRef.current = start - 2;
          onChange(newCode);
          onTriggerCompletions(newCode, start - 2, getCaretCoordinates);
          return;
        }
      }

      if (start > 0) {
        const newCode = code.slice(0, start - 1) + code.slice(start);
        caretOffsetRef.current = start - 1;
        onChange(newCode);
        onTriggerCompletions(newCode, start - 1, getCaretCoordinates);
      } else {
        completionsClose();
      }
      return;
    }

    // ── Delete → delete forward (or clear selection) ──────────────
    if (e.key === "Delete") {
      e.preventDefault();
      const { start, end } = getSelectionOffsets(element);

      if (start !== end) {
        const newCode = code.slice(0, start) + code.slice(end);
        caretOffsetRef.current = start;
        onChange(newCode);
        onTriggerCompletions(newCode, start, getCaretCoordinates);
        return;
      }

      if (start < code.length) {
        const newCode = code.slice(0, start) + code.slice(start + 1);
        caretOffsetRef.current = start;
        onChange(newCode);
        onTriggerCompletions(newCode, start, getCaretCoordinates);
      }
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const element = e.currentTarget;
    const { start, end } = getSelectionOffsets(element);
    const newCode = code.slice(0, start) + text + code.slice(end);
    caretOffsetRef.current = start + text.length;
    onChange(newCode);
    completionsClose();
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      onInput={handleInput}
      onSelect={handleSelect}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPaste={handlePaste}
      onMouseDown={() => completionsClose()}
      data-placeholder={placeholder}
      className="editor-core-workspace"
      style={{
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
        fontSize: "13.5px",
        lineHeight: "1.6",
        whiteSpace: "pre",
        overflowWrap: "normal",
        outline: "none",
        padding: "16px 20px",
        backgroundColor: "#0D1117",
        color: "#d4d4d4",
        minHeight: "100%",
        cursor: "text",
      }}
    />
  );
}
