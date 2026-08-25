import React from "react";

export interface PopulatedUser {
  _id: string;
  name: string;
  profileImage?: string;
}

export interface DecoratedLeaderboardEntry {
  _id: string;
  score: number;
  problemsSolved: number;
  rank: number;
  userId: PopulatedUser | null;
  handle: string;
  lang: string;
  diff: number;
}

interface LeaderboardRowProps {
  entry: DecoratedLeaderboardEntry;
  index: number;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function LeaderboardRow({ entry, index }: LeaderboardRowProps) {
  const initials = getInitials(entry.userId?.name || "Anonymous");

  const rankColor =
    entry.rank === 1
      ? "font-bold text-[#F59E0B] dark:text-[#F2B866]"
      : entry.rank === 2
      ? "font-bold text-slate-500 dark:text-[#C8CCD6]"
      : entry.rank === 3
      ? "font-bold text-[#B45309] dark:text-[#D99A6C]"
      : "font-normal text-slate-400 dark:text-[#4D5468]";

  return (
    <div
      className="grid grid-cols-[36px_1fr_80px_80px] sm:grid-cols-[50px_1fr_120px_110px] gap-2 sm:gap-3 items-center p-3 sm:p-4 px-2 sm:px-4 border-t border-slate-100 dark:border-[#1A2030] first:border-t-0 relative opacity-0 -translate-x-2.5 animate-typeIn transition-all duration-150 hover:bg-slate-50 dark:hover:bg-[#161B26] hover:before:absolute hover:before:left-0 hover:before:top-0 hover:before:bottom-0 hover:before:w-[2px] hover:before:bg-[#8B5CF6] dark:hover:before:bg-[#B48CFF]"
      style={{ animationDelay: `${0.35 + index * 0.035}s` }}
    >
      <div className={`font-mono text-[12.5px] text-right pr-1.5 ${rankColor}`}>
        {entry.rank}
      </div>
      <div className="flex items-center gap-2.5 min-w-0">
        {entry.userId?.profileImage ? (
          <img
            src={entry.userId.profileImage}
            alt={entry.userId.name}
            className="w-[30px] h-[30px] rounded-[8px] flex-shrink-0 object-cover border border-slate-200 dark:border-[#212739]"
          />
        ) : (
          <div className="w-[30px] h-[30px] rounded-lg flex-shrink-0 bg-slate-100 dark:bg-[#161B26] border border-slate-200 dark:border-[#212739] flex items-center justify-center font-mono font-bold text-[11.5px] text-[#8B5CF6] dark:text-[#B48CFF]">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-slate-900 dark:text-[#E3E6EC] truncate">
            {entry.userId?.name || "Anonymous"}
          </div>
          <div className="font-mono text-xs text-slate-400 dark:text-[#4D5468] truncate hidden sm:block">
            {entry.handle}
          </div>
        </div>
      </div>
      <div className="font-mono text-xs sm:text-sm text-slate-600 dark:text-[#7D8497] text-right font-semibold">
        {entry.problemsSolved} <span className="text-[10px] font-normal text-slate-400 dark:text-[#4D5468] ml-0.5 hidden sm:inline">Solved</span>
      </div>
      <div className="font-mono font-bold text-[13px] sm:text-[14px] text-slate-900 dark:text-[#E3E6EC] text-right">
        {entry.score.toLocaleString()} <span className="text-[10px] font-normal text-slate-400 dark:text-[#4D5468] ml-0.5 hidden sm:inline">XP</span>
      </div>
    </div>
  );
}
