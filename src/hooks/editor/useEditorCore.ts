import { useState, useRef, useCallback, useEffect } from "react";

export interface HistoryFrame {
  code: string;
  caretOffset: number;
}

interface LanguageHistory {
  frames: HistoryFrame[];
  index: number;
}

export function useEditorCore(initialCode: string = "", activeLang: string = "default") {
  const [code, setCodeRaw] = useState(initialCode);
  const editorRef = useRef<HTMLDivElement>(null);
  const caretOffsetRef = useRef<number>(0);
  const activeLangRef = useRef<string>(activeLang);

  // Store history frames separately per language key
  const historiesRef = useRef<Record<string, LanguageHistory>>({});

  const activeLangKey = activeLang || "default";

  // Helper to check if history exists for a language
  const hasLanguageHistory = useCallback((lang: string): boolean => {
    return !!historiesRef.current[lang];
  }, []);

  // Helper to get or initialize history for a language
  const getLangHistory = useCallback((lang: string, defaultCode: string, defaultOffset: number = 0): LanguageHistory => {
    if (!historiesRef.current[lang]) {
      historiesRef.current[lang] = {
        frames: [{ code: defaultCode, caretOffset: defaultOffset }],
        index: 0,
      };
    }
    return historiesRef.current[lang];
  }, []);

  // Synchronize active language and switch editor text when activeLang changes
  useEffect(() => {
    activeLangRef.current = activeLangKey;
    const langHist = getLangHistory(activeLangKey, initialCode, 0);
    const currentFrame = langHist.frames[langHist.index];

    setCodeRaw(currentFrame.code);
    caretOffsetRef.current = currentFrame.caretOffset;
  }, [activeLangKey, initialCode, getLangHistory]);

  // Method to set/load initial code for a language without creating unwanted undo history entries
  const initLanguageCode = useCallback((lang: string, codeToSet: string, offset: number = 0) => {
    historiesRef.current[lang] = {
      frames: [{ code: codeToSet, caretOffset: offset }],
      index: 0,
    };
    if (activeLangRef.current === lang) {
      setCodeRaw(codeToSet);
      caretOffsetRef.current = offset;
    }
  }, []);

  // Method to clear history across all languages (e.g. when changing questions)
  const resetAllHistory = useCallback(() => {
    historiesRef.current = {};
  }, []);

  // setCode updates code state and pushes new record to active language's Undo/Redo stack
  const setCode = useCallback((newCode: string, newCaretOffset?: number) => {
    const lang = activeLangRef.current;
    const resolvedOffset = newCaretOffset !== undefined ? newCaretOffset : caretOffsetRef.current;

    setCodeRaw(newCode);

    const langHist = getLangHistory(lang, newCode, resolvedOffset);
    const history = langHist.frames;
    const idx = langHist.index;

    // Prune forward (Redo) history on new typing action
    const trimmed = history.slice(0, idx + 1);

    // If typing hasn't changed the actual code text, just update caret in current frame
    if (trimmed.length > 0 && trimmed[trimmed.length - 1].code === newCode) {
      trimmed[trimmed.length - 1].caretOffset = resolvedOffset;
      langHist.frames = trimmed;
      return;
    }

    trimmed.push({ code: newCode, caretOffset: resolvedOffset });

    // Restrict history stack size to 200 elements per language
    if (trimmed.length > 200) {
      trimmed.shift();
    }

    langHist.frames = trimmed;
    langHist.index = trimmed.length - 1;
  }, [getLangHistory]);

  const undo = useCallback((): number | null => {
    const lang = activeLangRef.current;
    const langHist = historiesRef.current[lang];
    if (!langHist || langHist.index <= 0) return null;

    langHist.index -= 1;
    const frame = langHist.frames[langHist.index];
    setCodeRaw(frame.code);
    caretOffsetRef.current = frame.caretOffset;
    return frame.caretOffset;
  }, []);

  const redo = useCallback((): number | null => {
    const lang = activeLangRef.current;
    const langHist = historiesRef.current[lang];
    if (!langHist || langHist.index >= langHist.frames.length - 1) return null;

    langHist.index += 1;
    const frame = langHist.frames[langHist.index];
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
    initLanguageCode,
    hasLanguageHistory,
    resetAllHistory,
  };
}
