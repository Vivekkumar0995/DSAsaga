import { useState, useRef, useCallback } from "react";

export interface HistoryFrame {
  code: string;
  caretOffset: number;
}

export function useEditorCore(initialCode: string = "") {
  const [code, setCodeRaw] = useState(initialCode);
  const editorRef = useRef<HTMLDivElement>(null);
  const caretOffsetRef = useRef<number>(0);

  // Store objects of code and selection positions
  const historyRef = useRef<HistoryFrame[]>([{ code: initialCode, caretOffset: 0 }]);
  const historyIndexRef = useRef<number>(0);

  // setCode updates code state and pushes new record to Undo/Redo stack
  const setCode = useCallback((newCode: string, newCaretOffset?: number) => {
    setCodeRaw(newCode);

    const resolvedOffset = newCaretOffset !== undefined ? newCaretOffset : caretOffsetRef.current;
    const history = historyRef.current;
    const idx = historyIndexRef.current;

    // Prune forward (Redo) history on new typing action
    const trimmed = history.slice(0, idx + 1);

    // If typing hasn't changed the actual code text, just update caret in current frame
    if (trimmed.length > 0 && trimmed[trimmed.length - 1].code === newCode) {
      trimmed[trimmed.length - 1].caretOffset = resolvedOffset;
      historyRef.current = trimmed;
      return;
    }

    trimmed.push({ code: newCode, caretOffset: resolvedOffset });

    // Restrict history stack size to 200 elements
    if (trimmed.length > 200) {
      trimmed.shift();
    }

    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
  }, []);

  const undo = useCallback((): number | null => {
    if (historyIndexRef.current <= 0) return null;
    historyIndexRef.current -= 1;
    const frame = historyRef.current[historyIndexRef.current];
    setCodeRaw(frame.code);
    caretOffsetRef.current = frame.caretOffset;
    return frame.caretOffset;
  }, []);

  const redo = useCallback((): number | null => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return null;
    historyIndexRef.current += 1;
    const frame = historyRef.current[historyIndexRef.current];
    setCodeRaw(frame.code);
    caretOffsetRef.current = frame.caretOffset;
    return frame.caretOffset;
  }, []);

  const saveCaretOffset = useCallback((element: HTMLElement): number => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return caretOffsetRef.current;

    const range = sel.getRangeAt(0);
    let offset = 0;
    let found = false;

    const traverse = (node: Node): void => {
      if (found) return;

      if (node.nodeType === Node.TEXT_NODE) {
        if (node === range.startContainer) {
          offset += range.startOffset;
          found = true;
          return;
        }
        offset += node.textContent?.length ?? 0;
      } else {
        if (node === range.startContainer) {
          for (let i = 0; i < range.startOffset; i++) {
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
    caretOffsetRef.current = offset;
    return offset;
  }, []);

  const restoreCaretOffset = useCallback(
    (element: HTMLElement, offset: number) => {
      const sel = window.getSelection();
      if (!sel) return;

      const range = document.createRange();
      let remaining = offset;
      let targetNode: Node | null = null;
      let targetOffset = 0;
      let found = false;

      const traverse = (node: Node): void => {
        if (found) return;

        if (node.nodeType === Node.TEXT_NODE) {
          const len = node.textContent?.length ?? 0;
          if (remaining <= len) {
            targetNode = node;
            targetOffset = remaining;
            found = true;
            return;
          }
          remaining -= len;
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            traverse(node.childNodes[i]);
            if (found) return;
          }
        }
      };

      traverse(element);

      if (!targetNode) {
        const findLast = (node: Node): Node | null => {
          if (node.nodeType === Node.TEXT_NODE) return node;
          for (let i = node.childNodes.length - 1; i >= 0; i--) {
            const res = findLast(node.childNodes[i]);
            if (res) return res;
          }
          return null;
        };
        const last = findLast(element);
        targetNode = last ?? element;
        targetOffset = last ? (last.textContent?.length ?? 0) : 0;
      }

      try {
        range.setStart(targetNode, targetOffset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {
        console.warn("restoreCaretOffset failed:", e);
      }
    },
    []
  );

  return {
    code,
    setCode,
    undo,
    redo,
    editorRef,
    caretOffsetRef,
    saveCaretOffset,
    restoreCaretOffset,
  };
}
