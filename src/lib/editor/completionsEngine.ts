export interface CompletionItem {
  label: string;
  kind: "keyword" | "snippet" | "variable" | "function";
  detail?: string;
  insertText: string;
  score?: number; // Higher is better (e.g. variables/functions could rank higher than snippets)
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isWord: boolean = false;
  items: CompletionItem[] = [];
}

export class CompletionsTrie {
  private root: TrieNode = new TrieNode();

  insert(word: string, item: CompletionItem) {
    if (!word) return;
    let node = this.root;
    const lower = word.toLowerCase();
    for (const char of lower) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isWord = true;
    // Avoid duplicates
    if (!node.items.some((i) => i.label === item.label && i.kind === item.kind)) {
      node.items.push(item);
    }
  }

  search(prefix: string): CompletionItem[] {
    if (!prefix) return [];
    let node = this.root;
    const lower = prefix.toLowerCase();
    for (const char of lower) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }

    const results: CompletionItem[] = [];
    this.collectAll(node, results);

    // Sort results by score (descending), then alphabetically by label length
    return results.sort((a, b) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return a.label.localeCompare(b.label);
    });
  }

  private collectAll(node: TrieNode, results: CompletionItem[]) {
    if (node.isWord) {
      results.push(...node.items);
    }
    for (const child of node.children.values()) {
      this.collectAll(child, results);
    }
  }
}

// ─── Language Specific Configurations ─────────────────────────

const KEYWORDS_BY_LANG: Record<string, string[]> = {
  cpp: [
    "int", "float", "double", "char", "bool", "long", "short", "unsigned", "signed",
    "void", "class", "struct", "public", "private", "protected", "virtual", "namespace",
    "using", "template", "return", "if", "else", "for", "while", "do", "switch", "case",
    "break", "continue", "new", "delete", "this", "nullptr", "vector", "string", "unordered_map",
    "unordered_set", "map", "set", "queue", "stack", "priority_queue", "algorithm", "include",
    "define", "std"
  ],
  java: [
    "int", "float", "double", "char", "boolean", "long", "short", "byte", "void", "class",
    "interface", "enum", "public", "private", "protected", "static", "final", "abstract",
    "extends", "implements", "import", "package", "return", "if", "else", "for", "while",
    "do", "switch", "case", "break", "continue", "new", "this", "super", "null", "true",
    "false", "try", "catch", "finally", "throw", "throws", "String", "List", "ArrayList",
    "Map", "HashMap", "Set", "HashSet"
  ],
  python: [
    "def", "class", "return", "if", "elif", "else", "for", "while", "break", "continue",
    "import", "from", "as", "print", "and", "or", "not", "is", "in", "None", "True", "False",
    "try", "except", "finally", "raise", "assert", "self", "lambda", "len", "range", "list",
    "dict", "set", "tuple", "str", "int", "float", "bool", "append", "pop", "insert"
  ],
  javascript: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "do", "switch",
    "case", "break", "continue", "class", "constructor", "this", "super", "import", "export",
    "default", "new", "typeof", "instanceof", "async", "await", "try", "catch", "finally",
    "throw", "null", "undefined", "true", "false", "console", "log", "error", "map", "filter",
    "reduce", "push", "pop", "shift", "unshift", "length"
  ],
  c: [
    "int", "float", "double", "char", "long", "short", "unsigned", "signed", "void",
    "struct", "union", "enum", "typedef", "return", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "sizeof", "include", "define", "NULL", "printf",
    "scanf", "malloc", "free"
  ]
};

interface SnippetConfig {
  label: string;
  detail: string;
  insertText: string;
}

const SNIPPETS_BY_LANG: Record<string, SnippetConfig[]> = {
  cpp: [
    { label: "fori", detail: "for loop", insertText: "for (int i = 0; i < {||}; i++) {\n    \n}" },
    { label: "vector", detail: "std::vector", insertText: "vector<{||}>" },
    { label: "cout", detail: "std::cout", insertText: "std::cout << {||} << std::endl;" },
    { label: "unordered_map", detail: "std::unordered_map", insertText: "unordered_map<{||}, >" },
    { label: "func", detail: "function declaration", insertText: "int {||}() {\n    \n}" }
  ],
  java: [
    { label: "fori", detail: "for loop", insertText: "for (int i = 0; i < {||}; i++) {\n    \n}" },
    { label: "sout", detail: "System.out.println", insertText: "System.out.println({||});" },
    { label: "psvm", detail: "public static void main", insertText: "public static void main(String[] args) {\n    {||}\n}" }
  ],
  python: [
    { label: "fori", detail: "range for loop", insertText: "for i in range({||}):\n    " },
    { label: "defn", detail: "method definition", insertText: "def {||}(self):\n    " },
    { label: "print", detail: "print statement", insertText: "print({||})" }
  ],
  javascript: [
    { label: "fori", detail: "for loop", insertText: "for (let i = 0; i < {||}; i++) {\n  \n}" },
    { label: "clg", detail: "console.log", insertText: "console.log({||});" },
    { label: "arrow", detail: "arrow function", insertText: "const {||} = () => {\n  \n};" },
    { label: "func", detail: "function statement", insertText: "function {||}() {\n  \n}" }
  ],
  c: [
    { label: "fori", detail: "for loop", insertText: "for (int i = 0; i < {||}; i++) {\n    \n}" },
    { label: "printf", detail: "printf statement", insertText: "printf(\"{||}\\n\");" }
  ]
};

// ─── Parsing Helper ───────────────────────────────────────────

export function extractIdentifiers(code: string): { name: string; kind: "variable" | "function" }[] {
  const ids: { name: string; kind: "variable" | "function" }[] = [];
  const seen = new Set<string>();

  // Extract function declarations: e.g. function funcName(...) or const func = (...) =>
  const funcRegex = /\b(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*))|(?:\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>)/g;
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    const name = match[1] || match[2];
    if (name && !seen.has(name)) {
      seen.add(name);
      ids.push({ name, kind: "function" });
    }
  }

  // Extract variable declarations: e.g. const varName, let varName, int varName, etc.
  const varRegex = /\b(?:const|let|var|int|float|double|char|bool|auto|vector<[a-zA-Z_<>]+>)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
  while ((match = varRegex.exec(code)) !== null) {
    const name = match[1];
    if (name && !seen.has(name) && name !== "function") {
      seen.add(name);
      ids.push({ name, kind: "variable" });
    }
  }

  return ids;
}

// ─── Factory Builder ──────────────────────────────────────────

export function buildTrieForLang(lang: string, code: string): CompletionsTrie {
  const trie = new CompletionsTrie();

  // 1. Insert keywords
  const keywords = KEYWORDS_BY_LANG[lang] || [];
  keywords.forEach((kw) => {
    trie.insert(kw, {
      label: kw,
      kind: "keyword",
      detail: "keyword",
      insertText: kw,
      score: 10,
    });
  });

  // 2. Insert snippets
  const snippets = SNIPPETS_BY_LANG[lang] || [];
  snippets.forEach((snip) => {
    trie.insert(snip.label, {
      label: snip.label,
      kind: "snippet",
      detail: snip.detail,
      insertText: snip.insertText,
      score: 20,
    });
  });

  // 3. Insert dynamically parsed user identifiers
  const userIds = extractIdentifiers(code);
  userIds.forEach((item) => {
    trie.insert(item.name, {
      label: item.name,
      kind: item.kind,
      detail: item.kind === "function" ? "local function" : "local variable",
      insertText: item.name,
      score: 30, // User variables get priority rank
    });
  });

  return trie;
}
