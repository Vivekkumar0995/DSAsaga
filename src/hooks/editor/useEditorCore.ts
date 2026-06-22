import { useState, useRef, useCallback } from "react";

export function useEditorCore(initialCode: string = "") {
  const [code, setCodeRaw] = useState(initialCode);
  const editorRef = useRef<HTMLDivElement>(null);
  const caretOffsetRef = useRef<number>(0);


  const historyRef = useRef<string[]>([initialCode]);
  const historyIndexRef = useRef<number>(0);



  const setCode = useCallback((newCode: string) => {
    setCodeRaw(newCode);

    const history = historyRef.current;
    const idx = historyIndexRef.current;


    const trimmed = history.slice(0, idx + 1);


    if (trimmed[trimmed.length - 1] === newCode) return;

    trimmed.push(newCode);


    if (trimmed.length > 200) trimmed.shift();

    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
  }, []);




  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const restored = historyRef.current[historyIndexRef.current];
    setCodeRaw(restored); // setCodeRaw to avoid pushing to history again
    // Move caret to end of restored code (safe fallback)
    caretOffsetRef.current = Math.min(caretOffsetRef.current, restored.length);
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
        // If the caret is inside this text node
        if (node === range.startContainer) {
          offset += range.startOffset;
          found = true;
          return;
        }
        offset += node.textContent?.length ?? 0;
      } else {
        // If the caret is on an element node (e.g. at the very start/end)
        if (node === range.startContainer) {
          // range.startOffset is a child index, not a character index.
          // Count chars of children up to that index.
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

  /**
   * Walk the DOM tree of `element` and position the caret at the character
   * offset `offset` from the start of the element's text content.
   */
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
            // Caret sits inside this text node
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

      // Fallback: place caret at end of last text node
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
        console.warn("restoreCaretOffset: failed to place caret:", e);
      }
    },
    []
  );

  return {
    code,
    setCode,
    undo,
    editorRef,
    caretOffsetRef,
    saveCaretOffset,
    restoreCaretOffset,
  };
}
