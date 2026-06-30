import { useState, useCallback, useRef } from "react";
import { buildTrieForLang, CompletionItem } from "@/lib/editor/completionsEngine";

export function useCompletions() {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CompletionItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [coords, setCoords] = useState<{ x: number; y: number; height: number }>({ x: 0, y: 0, height: 0 });
  const triggerPrefixRef = useRef("");

  const closeCompletions = useCallback(() => {
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(0);
    triggerPrefixRef.current = "";
  }, []);

  const triggerCompletions = useCallback((
    code: string,
    offset: number,
    lang: string,
    getCaretCoords: () => { x: number; y: number; height: number } | null
  ) => {
    const textBeforeCaret = code.slice(0, offset);
    // Grab the alphanumeric suffix before cursor
    const match = textBeforeCaret.match(/([a-zA-Z0-9_$]+)$/);
    if (!match) {
      closeCompletions();
      return;
    }

    const prefix = match[1];
    triggerPrefixRef.current = prefix;

    const trie = buildTrieForLang(lang, code);
    const matches = trie.search(prefix);

    if (matches.length === 0) {
      closeCompletions();
      return;
    }

    const caretCoords = getCaretCoords();
    if (!caretCoords) {
      closeCompletions();
      return;
    }

    setSuggestions(matches);
    setActiveIndex(0);
    setCoords(caretCoords);
    setIsOpen(true);
  }, [closeCompletions]);

  const selectNext = useCallback((): boolean => {
    if (!isOpen || suggestions.length === 0) return false;
    setActiveIndex((prev) => (prev + 1) % suggestions.length);
    return true;
  }, [isOpen, suggestions]);

  const selectPrev = useCallback((): boolean => {
    if (!isOpen || suggestions.length === 0) return false;
    setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    return true;
  }, [isOpen, suggestions]);

  const getAppliedSuggestion = useCallback((
    code: string,
    offset: number,
    item: CompletionItem
  ): { newCode: string; newOffset: number } => {
    const prefix = triggerPrefixRef.current;
    const start = offset - prefix.length;
    const insertText = item.insertText;

    const placeholderIdx = insertText.indexOf("{||}");
    if (placeholderIdx !== -1) {
      const cleanInsert = insertText.replace("{||}", "");
      const newCode = code.slice(0, start) + cleanInsert + code.slice(offset);
      const newOffset = start + placeholderIdx;
      return { newCode, newOffset };
    } else {
      const newCode = code.slice(0, start) + insertText + code.slice(offset);
      const newOffset = start + insertText.length;
      return { newCode, newOffset };
    }
  }, []);

  return {
    isOpen,
    suggestions,
    activeIndex,
    coords,
    triggerPrefix: triggerPrefixRef.current,
    triggerCompletions,
    closeCompletions,
    selectNext,
    selectPrev,
    setActiveIndex,
    getAppliedSuggestion,
  };
}
