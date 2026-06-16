export type TokenType = "keyword" | "identifier" | "string" | "number" | "comment" | "operator";
export interface Token {
  type: TokenType;
  value: string;
}
const KEYWORDS = new Set(["const","let","var","function","return","if","else","for","while","class","import","export","new","try","catch","switch","case","break","continue"]);
export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
const regex =
  /(\/\/.*)|("(?:[^"\\]|\\.)*")|(\b\d+\b)|([a-zA-Z_$][a-zA-Z0-9_$]*)|([=+\-*/{}();])|(\s+)/g;
  let match;
  while ((match = regex.exec(code))) {
    const value = match[0];
    if (match[1]) tokens.push({type: "comment",value});
    else if (match[2]) tokens.push({type: "string",value});
    else if (match[3]) tokens.push({type: "number",value});
    else if (match[4]) tokens.push({type:KEYWORDS.has(value)? "keyword" : "identifier",value});
    else tokens.push({type: "operator",value});
  }
  return tokens;
}
