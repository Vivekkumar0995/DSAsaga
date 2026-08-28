"use client";

import { useEffect, useState, useRef } from "react";
import LeaderboardTable, { DecoratedLeaderboardEntry } from "@/components/leaderboard/LeaderboardTable";
import Loading from "@/app/loading";
import Top3Leaderboard, { TopLeaderboardUser } from "@/components/leaderboard/Top3Leaderboard";

interface PopulatedUser {
  _id: string;
  name: string;
  profileImage?: string;
}

interface LeaderboardEntry {
  _id: string;
  score: number;
  problemsSolved: number;
  rank: string;
  userId: PopulatedUser | null;
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

// Deterministic generators to map static mockup fields to dynamic DB results
const getDeterministicLang = (userIdStr?: string) => {
  const id = userIdStr || "anonymous";
  const languages = ["TypeScript", "Python", "C++", "Go", "Rust", "Java"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return languages[Math.abs(hash) % languages.length];
};

const getDeterministicDiff = (userIdStr?: string) => {
  const id = userIdStr || "anonymous";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const diffs = [0, 1, -1, 2, 0, -2, 3, 0, -3, 4, 0, 5];
  return diffs[Math.abs(hash) % diffs.length];
};

const getHandle = (name?: string) => {
  const cleanName = (name || "anonymous").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `@${cleanName}`;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [rankType, setRankType] = useState<string>("weekly");
  const [description, setDescription] = useState<string>("Ranked by problems solved, contest performance, and streak bonus. Top climbers this week are marked with a diff.");
  const [timeAgoText, setTimeAgoText] = useState("LIVE · updated just now");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (res.ok && data.leaderboard) {
          setLeaderboard(data.leaderboard);
          setLastUpdated(data.lastUpdated || null);
          setRankType(data.type || "global");
          setDescription(data.description || "");
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!lastUpdated) {
      setTimeAgoText("LIVE · updated just now");
      return;
    }

    const updateRelativeTime = () => {
      const diffMs = Date.now() - new Date(lastUpdated).getTime();
      const diffSecs = Math.floor(diffMs / 1000);

      if (diffSecs < 10) {
        setTimeAgoText("LIVE · updated just now");
        return;
      }

      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 1) {
        setTimeAgoText(`LIVE · updated ${diffSecs} sec${diffSecs > 1 ? "s" : ""} ago`);
        return;
      }

      if (diffMins < 60) {
        setTimeAgoText(`LIVE · updated ${diffMins} min${diffMins > 1 ? "s" : ""} ago`);
        return;
      }

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        setTimeAgoText(`LIVE · updated ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`);
        return;
      }

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) {
        setTimeAgoText(`LIVE · updated ${diffDays} day${diffDays > 1 ? "s" : ""} ago`);
        return;
      }

      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) {
        setTimeAgoText(`LIVE · updated ${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`);
        return;
      }

      const diffYears = Math.floor(diffDays / 365);
      setTimeAgoText(`LIVE · updated ${diffYears} year${diffYears > 1 ? "s" : ""} ago`);
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (loading) {
    return <Loading />;
  }

  // Map API entries to decorated user details
  const decoratedLeaderboard: DecoratedLeaderboardEntry[] = leaderboard.map((entry, index) => {
    const userIdStr = entry.userId?._id || entry._id;
    const name = entry.userId?.name || "Anonymous";
    return {
      ...entry,
      rank: index + 1,
      handle: getHandle(name),
      lang: getDeterministicLang(userIdStr),
      diff: getDeterministicDiff(userIdStr),
    };
  });

  // Extract top 3 leaders for the podium
  const top3Users: TopLeaderboardUser[] = decoratedLeaderboard.slice(0, 3).map((user) => ({
    rank: user.rank as 1 | 2 | 3,
    score: user.score,
    userId: {
      name: user.userId?.name || "Anonymous",
      profileImage: user.userId?.profileImage,
    },
    handle: user.handle,
    lang: user.lang,
    diff: user.diff,
  }));

  // Filter list rows based on search input (only searches by user name or handle)
  const filteredEntries = decoratedLeaderboard.filter((entry) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (entry.userId?.name || "").toLowerCase().includes(q) ||
      entry.handle.toLowerCase().includes(q)
    );
  });

  // Compute page-wide statistics
  const totalSolved = decoratedLeaderboard.reduce((s, p) => s + (p.problemsSolved || 0), 0);
  const avgScore =
    decoratedLeaderboard.length > 0
      ? Math.round(decoratedLeaderboard.reduce((s, p) => s + p.score, 0) / decoratedLeaderboard.length)
      : 0;

  return (
    <div
      className="bg-[#F8FAFC] dark:bg-[#0A0E14] text-[#0F172A] dark:text-[#E3E6EC] transition-colors duration-300 min-h-screen pt-[clamp(85px,8vw,110px)] px-[clamp(16px,5vw,64px)] pb-20"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 900px 500px at 15% -10%, rgba(180,140,255,0.08), transparent 60%),
          radial-gradient(ellipse 700px 500px at 100% 10%, rgba(126,231,135,0.05), transparent 60%)
        `
      }}
    >
      <div className="max-w-[920px] mx-auto">
        <header className="relative overflow-hidden rounded-[14px] border border-slate-200 dark:border-[#212739] bg-gradient-to-b from-white to-slate-50 dark:from-[#10141C] dark:to-[#10141C]/60 p-6 md:p-8 mb-7">
          {/* Top animated border sheen line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] via-[#10B981] via-[#F59E0B] to-[#8B5CF6] bg-[length:300%_100%] animate-sheen" />

          <div className="flex items-center gap-2 mb-3.5 font-mono text-xs text-[#10B981] dark:text-[#7EE787]">
            <span className="w-[7px] h-[14px] bg-[#10B981] dark:bg-[#7EE787] animate-blink"></span>
            {timeAgoText}
          </div>
          <h1 className="font-mono font-bold text-2xl md:text-[34px] tracking-tight text-slate-900 dark:text-[#E3E6EC] m-0">
            <span className="text-[#8B5CF6] dark:text-[#B48CFF]">rank</span>
            <span className="text-slate-400 dark:text-[#4D5468]">(</span>
            <span className="text-[#10B981] dark:text-[#7EE787]">"{rankType}"</span>
            <span className="text-slate-400 dark:text-[#4D5468]">)</span>
          </h1>
          <p className="mt-2.5 text-[#475569] dark:text-[#7D8497] text-[14.5px] max-w-[56ch]">
            {description}
          </p>
          <div className="flex flex-wrap gap-[clamp(16px,4vw,36px)] mt-5.5 pt-5 border-t border-dashed border-slate-200 dark:border-[#1A2030]/60">
            <div className="font-mono">
              <div className="text-2xl font-bold text-[#8B5CF6] dark:text-[#B48CFF]" id="statUsers">
                <CountUp value={decoratedLeaderboard.length} />
              </div>
              <div className="text-[11px] text-slate-400 dark:text-[#4D5468] uppercase tracking-[0.08em] mt-0.5">Ranked users</div>
            </div>
            <div className="font-mono">
              <div className="text-2xl font-bold text-[#10B981] dark:text-[#7EE787]" id="statSolved">
                <CountUp value={totalSolved} />
              </div>
              <div className="text-[11px] text-slate-400 dark:text-[#4D5468] uppercase tracking-[0.08em] mt-0.5">Problems solved</div>
            </div>
            <div className="font-mono">
              <div className="text-2xl font-bold text-slate-900 dark:text-[#E3E6EC]" id="statAvg">
                <CountUp value={avgScore} />
              </div>
              <div className="text-[11px] text-slate-400 dark:text-[#4D5468] uppercase tracking-[0.08em] mt-0.5">Avg. score</div>
            </div>
          </div>
        </header>

        <div className="flex items-center gap-2.5 font-mono text-sm bg-white dark:bg-[#10141C] border border-slate-200 dark:border-[#212739] rounded-lg p-3 px-4 mb-5 transition-all duration-200 focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/10">
          <span className="text-[#10B981] dark:text-[#7EE787] select-none">&gt;</span>
          <input
            ref={searchInputRef}
            id="searchInput"
            type="text"
            placeholder="Search by name or handle..."
             value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-[#E3E6EC] placeholder-slate-400 dark:placeholder-[#4D5468]"
          />
          <span className="text-slate-400 dark:text-[#4D5468] text-[11px] border border-slate-200 dark:border-[#212739] px-1.5 py-0.5 rounded whitespace-nowrap">/ to focus</span>
        </div>

        {/* Podium for top 3 users */}
        {top3Users.length > 0 && <Top3Leaderboard topUsers={top3Users} />}

        {/* List of all entries */}
        <LeaderboardTable entries={filteredEntries} />

        {/* No results message */}
        <div
          className={`hidden text-center py-10 px-5 text-slate-400 dark:text-[#4D5468] font-mono text-[13px] ${filteredEntries.length === 0 ? "!block" : ""}`}
          id="noResults"
        >
          $ no matches — try a different query_
        </div>

        <footer className="text-center mt-7 font-mono text-[11px] text-slate-400 dark:text-[#4D5468]">
          rendered client-side · press <b>/</b> to search
        </footer>
      </div>
    </div>
  );
}
