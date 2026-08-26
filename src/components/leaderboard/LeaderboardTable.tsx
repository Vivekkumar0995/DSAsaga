import React from "react";
import LeaderboardRow, { DecoratedLeaderboardEntry } from "./LeaderboardRow";

interface LeaderboardTableProps {
  entries: DecoratedLeaderboardEntry[];
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-[36px_1fr_80px_80px] sm:grid-cols-[50px_1fr_120px_110px] gap-2 sm:gap-3 px-4 pb-2.5 font-mono text-[10.5px] text-slate-400 dark:text-[#4D5468] uppercase tracking-[0.08em]">
        <span className="text-right pr-1.5">#</span>
        <span>user</span>
        <span className="text-right">solved</span>
        <span className="text-right">score</span>
      </div>
      <div className="bg-white dark:bg-[#10141C] border border-slate-200 dark:border-[#212739] rounded-[14px] overflow-hidden" id="list">
        {entries.map((entry, index) => (
          <LeaderboardRow
            key={entry._id}
            entry={entry}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
export type { DecoratedLeaderboardEntry };
