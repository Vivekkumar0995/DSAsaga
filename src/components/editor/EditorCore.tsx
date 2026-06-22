import React, { useLayoutEffect } from "react";
import { useSyntaxHighlight } from "@/hooks/editor/useSyntaxHighlight";
import { COLORS } from "@/components/editor/SyntaxHighlighter";

interface EditorCoreProps {
  code: string;
  onChange: (code: string) => void;
  undo: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  saveCaretOffset: (element: HTMLElement) => number;
  restoreCaretOffset: (element: HTMLElement, offset: number) => void;
  caretOffsetRef: React.MutableRefObject<number>;
  placeholder?: string;
}

// ─── Build an HTML string from tokens (no React reconciliation) ──
function tokensToHtml(tokens: ReturnType<typeof useSyntaxHighlight>): string {
  return tokens
    .map((token) => {
      const color = COLORS[token.type] || "#d4d4d4";
      // Escape HTML entities so injected content is safe
      const escaped = token.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<span style="color:${color}">${escaped}</span>`;
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
  editorRef,
  saveCaretOffset,
  restoreCaretOffset,
  caretOffsetRef,
  placeholder = "Write your code here...",
}: EditorCoreProps) {
  const tokens = useSyntaxHighlight(code);


  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const nextHtml = tokensToHtml(tokens);

    // Skip DOM write when content hasn't changed (avoids unnecessary caret jumps)
    if (el.innerHTML === nextHtml) return;

    const isFocused = document.activeElement === el;

    // Directly overwrite innerHTML — React never touches children of this div
    el.innerHTML = nextHtml;

    // Restore caret to the saved character offset after we repainted
    if (isFocused) {
      restoreCaretOffset(el, caretOffsetRef.current);
    }
  }, [tokens, editorRef, caretOffsetRef, restoreCaretOffset]);



  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    saveCaretOffset(element);
    const text = element.textContent || "";
    onChange(text);
  };

  // ─── Selection change (arrow keys / mouse click) ────────────────
  const handleSelect = (e: React.SyntheticEvent<HTMLDivElement>) => {
    saveCaretOffset(e.currentTarget);
  };

  // ─── KeyUp: re-save caret after ANY key (esp. arrow keys) ───────
  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    saveCaretOffset(e.currentTarget);
  };

  // ─── Key handling ───────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const element = e.currentTarget;

    // ── Ctrl/Cmd + Z → Undo ──────────────────────────────────────
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      undo();
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
      return;
    }

    // ── Backspace → explicit deletion (fixes forward-selection bug) ─
    if (e.key === "Backspace") {
      e.preventDefault();
      const { start, end } = getSelectionOffsets(element);

      if (start !== end) {
        // Selection exists — delete the entire selected range
        const newCode = code.slice(0, start) + code.slice(end);
        caretOffsetRef.current = start;
        onChange(newCode);
        return;
      }

      // No selection: smart indent — delete 2 spaces on blank indented line
      const textBeforeCaret = code.slice(0, start);
      if (textBeforeCaret.endsWith("  ")) {
        const currentLine = textBeforeCaret.split("\n").pop() || "";
        if (/^\s*$/.test(currentLine)) {
          const newCode = code.slice(0, start - 2) + code.slice(start);
          caretOffsetRef.current = start - 2;
          onChange(newCode);
          return;
        }
      }

      // Regular backspace — delete one character before caret
      if (start > 0) {
        const newCode = code.slice(0, start - 1) + code.slice(start);
        caretOffsetRef.current = start - 1;
        onChange(newCode);
      }
      return;
    }

    // ── Delete → delete forward (or clear selection) ──────────────
    if (e.key === "Delete") {
      e.preventDefault();
      const { start, end } = getSelectionOffsets(element);

      if (start !== end) {
        // Selection exists — delete the entire selected range
        const newCode = code.slice(0, start) + code.slice(end);
        caretOffsetRef.current = start;
        onChange(newCode);
        return;
      }

      // No selection — delete one character forward
      if (start < code.length) {
        const newCode = code.slice(0, start) + code.slice(start + 1);
        caretOffsetRef.current = start;
        onChange(newCode);
      }
      return;
    }
  };

  // ─── Paste: strip HTML, insert plain text at caret ──────────────
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const element = e.currentTarget;
    const { start, end } = getSelectionOffsets(element);
    const newCode = code.slice(0, start) + text + code.slice(end);
    caretOffsetRef.current = start + text.length;
    onChange(newCode);
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
