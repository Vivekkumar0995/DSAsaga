export type TokenType = "keyword" | "identifier" | "string" | "number" | "comment" | "operator";

export interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "class", "import", "export", "new", "try", "catch", "switch", "case",
  "break", "continue", "typeof", "instanceof", "void", "delete", "in", "of",
  "do", "throw", "finally", "async", "await", "yield", "static", "extends",
  "super", "this", "null", "undefined", "true", "false",
  // C++ / Java / Python keywords
  "int", "float", "double", "char", "bool", "long", "short", "unsigned",
  "signed", "void", "auto", "struct", "enum", "union", "typedef", "public",
  "private", "protected", "virtual", "namespace", "using", "template",
  "include", "define", "def", "pass", "lambda", "with", "as", "from",
  "print", "and", "or", "not", "is", "elif", "except", "raise", "global",
  "nonlocal", "assert", "del",
]);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];

  // Groups:
  // 1 → line comment    //…
  // 2 → block comment   /*…*/
  // 3 → string          "…" | '…' | `…`
  // 4 → number          digits (incl. hex / float)
  // 5 → identifier / keyword
  // 6 → multi-char operators: <<, >>, <=, >=, ==, !=, &&, ||, ++, --, ->, ::, ...
  // 7 → single-char operators (any remaining non-alphanumeric non-space char)
  // 8 → whitespace (spaces, tabs, newlines)
  const regex =
    /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b)|([a-zA-Z_$][a-zA-Z0-9_$]*)|(<<|>>|<=|>=|==|!=|&&|\|\||--|\+\+|->|::|\.\.\.)|([^\w\s])|([ \t\r\n]+)/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(code)) !== null) {
    const value = match[0];

    if (match[1] || match[2]) {
      // Line or block comment
      tokens.push({ type: "comment", value });
    } else if (match[3]) {
      // String / template literal
      tokens.push({ type: "string", value });
    } else if (match[4]) {
      // Number literal
      tokens.push({ type: "number", value });
    } else if (match[5]) {
      // Identifier or keyword
      tokens.push({ type: KEYWORDS.has(value) ? "keyword" : "identifier", value });
    } else if (match[6] || match[7]) {
      // Multi-char or single-char operator / punctuation
      // (catches <, >, [, ], !, %, ^, &, |, :, ., ,, ?, ~, @, #, etc.)
      tokens.push({ type: "operator", value });
    } else if (match[8]) {
      // Whitespace – keep as-is so character offsets stay correct
      tokens.push({ type: "operator", value });
    }
  }

  return tokens;
}
