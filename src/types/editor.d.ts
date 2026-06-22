export type TokenType = "keyword" | "identifier" | "string" | "number" | "comment" | "operator";

export interface Token {
  type: TokenType;
  value: string;
}

export interface CaretPosition {
  offset: number;
}
