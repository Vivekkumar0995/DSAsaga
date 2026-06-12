import React from "react";
import LeaderboardRow from "./LeaderboardRow";

export interface PopulatedUser {
  _id: string;
  name: string;
  profileImage?: string;
}

export interface LeaderboardEntry {
  _id: string;
  score: number;
  problemsSolved: number;
  rank: string;
  userId: PopulatedUser | null;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden mt-8 relative z-10 w-full">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80 backdrop-blur-md">
            <tr>
              <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                Rank
              </th>
              <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                Coder
              </th>
              <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                Problems Solved
              </th>
              <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 bg-white/40">

            {entries.map((entry, index) => (
              <LeaderboardRow
                key={entry._id}
                entry={entry}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="p-16 text-center flex flex-col items-center">
          <div className="bg-slate-50 p-4 rounded-full mb-4 ring-4 ring-slate-100">
            <span className="text-4xl">🏅</span>
          </div>
          <p className="text-xl text-slate-800 font-semibold">No users on the leaderboard yet!</p>
          <p className="text-sm text-slate-500 mt-2">Become the pioneer. Sign up and conquer the first problem!</p>
        </div>
      )}
    </div>
  );
}
