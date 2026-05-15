import React from "react";
import Image from "next/image";
import { LeaderboardEntry } from "./LeaderboardTable";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index: number;
}

export default function LeaderboardRow({ entry, index }: LeaderboardRowProps) {

  return (
    <tr className="hover:bg-indigo-50/30 transition-colors duration-300 md:cursor-pointer group relative">
      <td className="px-6 py-5 whitespace-nowrap">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg transition-all duration-300 group-hover:shadow-md group-hover:scale-110
          }`}
        >
            {index + 1}
        </div>
      </td>

      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-11 w-11 relative transition-transform duration-300 group-hover:scale-110">
            {entry.userId?.profileImage ? (
              <Image
                className="relative h-11 w-11 rounded-full object-cover border-2 border-white bg-slate-100 shadow-sm"
                src={entry.userId.profileImage}
                alt={entry.userId.name}
                width={44}
                height={44}
              />
            ) : (
              <div className="relative h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                {entry.userId?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="ml-4 transition-transform duration-300 group-hover:translate-x-2">
            <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {entry.userId?.name || "Unknown User"}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-5 whitespace-nowrap">
        <span className="px-3 py-1 inline-flex leading-5 font-semibold text-md   transition-colors duration-300 ">
          {entry.problemsSolved} Solved
        </span>
      </td>

      <td className="px-6 py-5 whitespace-nowrap">
        <span className="inline-block text-lg font-black font-semibold bg-clip-text  transition-transform duration-300 group-hover:scale-110 group-hover:from-indigo-600 group-hover:to-cyan-600 origin-left">
          {entry.score.toLocaleString()} XP
        </span>
      </td>
    </tr>
  );
}
