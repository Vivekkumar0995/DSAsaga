import { useSyntaxHighlight } from "@/hooks/editor/useSyntaxHighlight";

interface Props {
  code: string;
}
export const COLORS = {
  keyword: "#569CD6",     
  string: "#CE9178",
  number: "#B5CEA8",
  comment: "#6A9955",
  identifier: "#D4D4D4",
  operator: "#D4D4D4",
};

export default function SyntaxHighlighter({ code }: Props) {
  const tokens = useSyntaxHighlight(code);
  return (
    <pre
      style={{
        background: "#282a36",
        padding: "16px",
        borderRadius: "8px",
        overflowX: "auto",
      }}
    >
      {tokens.map((token, index) => (
        <span
          key={index}
          style={{
            color: COLORS[token.type],
          }}
        >
          {token.value}
        </span>
      ))}
    </pre>
  );
}
