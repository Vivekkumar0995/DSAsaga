"use client";

import React, { useState, useEffect } from "react";

export type TopLeaderboardUser = {
  rank: 1 | 2 | 3;
  score: number;
  userId?: {
    name: string;
    profileImage?: string;
  };
  handle?: string;
  lang?: string;
  diff?: number;
};

interface Top3LeaderboardProps {
  topUsers: TopLeaderboardUser[];
}

const CountUp = ({ value, duration = 900 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const Top3Leaderboard: React.FC<Top3LeaderboardProps> = ({ topUsers }) => {
  const ranks: (1 | 2 | 3)[] = [1, 2, 3];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-[34px] items-end" id="podium">
      {ranks.map((rank) => {
        const user = topUsers.find((u) => u.rank === rank);
        if (!user) return null;

        const diff = user.diff ?? 0;
        const diffClass =
          diff > 0
            ? "bg-[#10B981]/10 dark:bg-[#7EE787]/10 text-[#10B981] dark:text-[#7EE787]"
            : diff < 0
            ? "bg-red-500/10 dark:bg-[#FF7B72]/10 text-red-500 dark:text-[#FF7B72]"
            : "bg-slate-400/10 dark:bg-[#7D8497]/10 text-slate-500 dark:text-[#7D8497]";
            
        const diffText = diff > 0 ? `▲ ${diff}` : diff < 0 ? `▼ ${Math.abs(diff)}` : "— flat";
        const crown = rank === 1 ? "#1 · TOP OF THE STACK" : rank === 2 ? "#2" : "#3";
        const initials = getInitials(user.userId?.name || "Anonymous");

        const cardStyle =
          rank === 1
            ? "order-2 min-h-[215px] sm:min-h-[280px] pt-5 sm:pt-8 text-[#F59E0B] dark:text-[#F2B866] border border-[#F59E0B]/40 dark:border-[#F2B866]/40 bg-gradient-to-br from-[#F59E0B]/10 to-white dark:to-[#10141C] shadow-[0_10px_30px_-10px_rgba(245,158,11,0.25)] dark:shadow-[0_15px_35px_-10px_rgba(242,184,102,0.18)] hover:shadow-[0_15px_35px_-5px_rgba(245,158,11,0.35)] dark:hover:shadow-[0_20px_40px_-5px_rgba(242,184,102,0.25)]"
            : rank === 2
            ? "order-1 min-h-[185px] sm:min-h-[240px] text-slate-500 dark:text-[#C8CCD6] border border-slate-400/30 dark:border-[#C8CCD6]/30 bg-gradient-to-br from-slate-400/10 to-white dark:to-[#10141C] shadow-[0_8px_25px_-10px_rgba(148,163,184,0.12)] hover:shadow-[0_12px_30px_-5px_rgba(148,163,184,0.2)]"
            : "order-3 min-h-[170px] sm:min-h-[220px] text-[#B45309] dark:text-[#D99A6C] border border-[#B45309]/30 dark:border-[#D99A6C]/30 bg-gradient-to-br from-[#B45309]/10 to-white dark:to-[#10141C] shadow-[0_8px_25px_-10px_rgba(180,83,9,0.12)] hover:shadow-[0_12px_30px_-5px_rgba(180,83,9,0.2)]";

        const avatarStyle =
          rank === 1
            ? "w-[50px] h-[50px] sm:w-[66px] sm:h-[66px] text-base sm:text-xl rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center font-mono font-bold bg-slate-100 dark:bg-[#161B26] border-[1.5px] border-current text-slate-900 dark:text-[#E3E6EC]"
            : "w-11 h-11 sm:w-14 sm:h-14 text-sm sm:text-lg rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center font-mono font-bold bg-slate-100 dark:bg-[#161B26] border-[1.5px] border-current text-slate-900 dark:text-[#E3E6EC]";

        const delay = rank === 1 ? "0.15s" : rank === 2 ? "0.05s" : "0.25s";

        return (
          <div
            key={rank}
            className={`rounded-xl sm:rounded-2xl p-2 sm:p-4 px-2 sm:px-4 pb-3 sm:pb-5 relative opacity-0 translate-y-4 animate-riseIn text-center overflow-hidden transition-all duration-200 hover:-translate-y-1 ${cardStyle}`}
            style={{ animationDelay: delay }}
          >
            {/* Overlay repeating stripes */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[repeating-linear-gradient(135deg,currentColor_0_1px,transparent_1px_8px)]" />

            <div className="font-mono text-[8px] sm:text-[11px] tracking-widest text-current opacity-85 mb-1.5 sm:mb-3 font-bold">{crown}</div>
            {user.userId?.profileImage ? (
              <img
                src={user.userId.profileImage}
                alt={user.userId.name}
                className={`${avatarStyle} object-cover`}
              />
            ) : (
              <div className={avatarStyle}>{initials}</div>
            )}
            <div className="font-semibold text-xs sm:text-[14.5px] text-slate-900 dark:text-[#E3E6EC] truncate">{user.userId?.name || "Anonymous"}</div>
            <div className="font-mono text-[10px] sm:text-[11.5px] text-slate-400 dark:text-[#4D5468] mt-0.5 truncate">{user.handle || "@anonymous"}</div>
            <div className="font-mono font-extrabold text-lg sm:text-2xl text-current mt-1.5 sm:mt-3">
              <CountUp value={user.score} />
            </div>
            <div className="text-[8px] sm:text-[10px] text-slate-400 dark:text-[#4D5468] uppercase tracking-wider mt-0.5">points</div>
            <div className={`inline-flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2.5 font-mono text-[9px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${diffClass}`}>{diffText}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Top3Leaderboard;
