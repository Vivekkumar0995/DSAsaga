
import { tokenize } from "@/lib/editor/tokenizer";
import { useMemo } from "react";

export function useSyntaxHighlight(code: string) {
  return useMemo(() => {
    return tokenize(code);
  }, [code]);
}
