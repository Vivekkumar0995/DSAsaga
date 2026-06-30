import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CompletionItem } from "@/lib/editor/completionsEngine";

interface CompletionsProps {
  isOpen: boolean;
  suggestions: CompletionItem[];
  activeIndex: number;
  coords: { x: number; y: number; height: number };
  onSelectIndex: (index: number) => void;
  onConfirm: () => void;
}

export default function Completions({
  isOpen,
  suggestions,
  activeIndex,
  coords,
  onSelectIndex,
  onConfirm,
}: CompletionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const activeEl = containerRef.current.childNodes[activeIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen]);

  if (!isOpen || suggestions.length === 0 || typeof document === "undefined") return null;

  const kindColors: Record<string, { bg: string; text: string; label: string }> = {
    keyword: { bg: "rgba(86,156,214,0.12)", text: "#569cd6", label: "key" },
    snippet: { bg: "rgba(197,117,233,0.12)", text: "#c575e9", label: "snip" },
    variable: { bg: "rgba(78,201,176,0.12)", text: "#4ec9b0", label: "var" },
    function: { bg: "rgba(220,220,170,0.12)", text: "#dcdcaa", label: "fn" },
  };

  return createPortal(
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: `${coords.x}px`,
        top: `${coords.y + coords.height + 6}px`,
        zIndex: 9999,
        backgroundColor: "#0d1117",
        border: "1px solid #30363d",
        borderRadius: "6px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.65)",
        maxHeight: "180px",
        overflowY: "auto",
        minWidth: "240px",
        padding: "4px",
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: "12px",
      }}
    >
      {suggestions.map((item, i) => {
        const isActive = i === activeIndex;
        const config = kindColors[item.kind] || { bg: "rgba(100,100,100,0.1)", text: "#8b949e", label: "•" };

        return (
          <div
            key={i}
            onMouseDown={(e) => {
              // Crucial: prevent default to avoid editor losing focus!
              e.preventDefault();
              onSelectIndex(i);
              // Trigger selection insertion
              setTimeout(onConfirm, 0);
            }}
            onMouseEnter={() => onSelectIndex(i)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: isActive ? "#21262d" : "transparent",
              color: isActive ? "#ffffff" : "#c9d1d9",
              transition: "background-color 0.1s, color 0.1s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 700,
                  width: "36px",
                  height: "16px",
                  borderRadius: "3px",
                  backgroundColor: config.bg,
                  color: config.text,
                }}
              >
                {config.label}
              </span>
              <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
            </div>
            {item.detail && (
              <span
                style={{
                  fontSize: "10.5px",
                  color: isActive ? "rgba(255, 255, 255, 0.45)" : "#8b949e",
                  paddingLeft: "10px",
                }}
              >
                {item.detail}
              </span>
            )}
          </div>
        );
      })}
    </div>,
    document.body
  );
}
