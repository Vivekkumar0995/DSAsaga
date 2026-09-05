"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { BattleStartPayload } from "@/types/battle";
import FriendInviteModal from "@/components/data_structure/battle/FriendInviteModal";

interface BattleClientProps {
  ds_param: string;
  battle_stats: {
    rating: number;
    win_rate: number;
    battles: number;
    win_streak: number;
  };
  battle_modes: any; // Use your actual type from dsData if available
  recent_matches: any[];
}

export default function BattleClient({
  ds_param,
  battle_stats,
  battle_modes,
  recent_matches,
}: BattleClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSearching, setIsSearching] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userId] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      let storedId = localStorage.getItem("dsasaga_user_id");
      if (!storedId) {
        storedId = "usr_" + Math.floor(Math.random() * 1000000) + "_" + Date.now().toString(36);
        localStorage.setItem("dsasaga_user_id", storedId);
      }
      return storedId;
    }
    return "usr_" + Math.floor(Math.random() * 1000000);
  });
  const [username] = useState(() => "Player_" + Math.floor(Math.random() * 1000));

  // Connect socket and register listeners
  useEffect(() => {
    socket.auth = {
      userId,
      username,
    };

    socket.connect();

    // Auto-fill code if shared via URL (?code=DSA-XXX)
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setJoinCodeInput(codeFromUrl);
    }

    // Socket Event Listeners
    socket.on("customRoomCreated", ({ inviteCode }: { inviteCode: string }) => {
      setInviteCode(inviteCode);
      setShowInviteModal(true);
    });

    socket.on("battleStart", (payload: BattleStartPayload) => {
      setIsSearching(false);
      setShowInviteModal(false);
      // Redirect both players to the dynamic battle arena
      router.push(`/${ds_param}/battle/${payload.roomId}`);
    });

    socket.on("battleError", (msg: string) => {
      setErrorMessage(msg);
      setIsSearching(false);
    });

    // Cleanup on unmount
    return () => {
      socket.off("customRoomCreated");
      socket.off("battleStart");
      socket.off("battleError");
    };
  }, [ds_param, router, searchParams, userId, username]);

  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Handle 1v1 Random Queue
  const handleRandomMatch = () => {
    if (!selectedDifficulty) {
      setErrorMessage("Please select a difficulty before searching for a match.");
      return;
    }
    setIsSearching(true);
    setErrorMessage("");
    socket.emit("joinQueue", {
      topic: ds_param,
      difficulty: selectedDifficulty,
      userId,
    });
  };

  const handleCancelMatch = () => {
    setIsSearching(false);
    socket.emit("leaveQueue", {
      topic: ds_param,
      difficulty: selectedDifficulty,
      userId,
    });
  };

  // Handle Custom Room Invite
  const handleCreateCustom = () => {
    setErrorMessage("");
    socket.emit("createCustomRoom", {
      username: username || "Player",
      topic: ds_param,
      difficulty: selectedDifficulty,
    });
  };

  const handleJoinCustom = () => {
    if (!joinCodeInput.trim()) return;
    setErrorMessage("");
    socket.emit("joinCustomRoom", {
      inviteCode: joinCodeInput.trim().toUpperCase(),
      username: username || "Player",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 pt-28 pb-16 px-4 sm:px-8 font-sans">
      {/* Stats Header */}
      <div className="max-w-4xl mx-auto mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 text-center shadow-xs">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Rating</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{battle_stats.rating}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Win Rate</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{battle_stats.win_rate}%</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Battles</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{battle_stats.battles}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Win Streak</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{battle_stats.win_streak}</p>
        </div>
      </div>

      {/* Main Lobby Actions */}
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-slate-900 capitalize tracking-tight">
          {ds_param} 1v1 Arena
        </h1>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-sm text-center font-medium shadow-xs">
            {errorMessage}
          </div>
        )}

        {/* Random 1v1 Matchmaking Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 space-y-4 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900">1v1 Random Match</h2>
          <p className="text-slate-500 text-sm">Select difficulty and match with an online opponent in real-time {ds_param} duel.</p>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Select Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDifficulty("easy")}
                disabled={isSearching}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer ${selectedDifficulty === "easy"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                🟢 Easy
              </button>
              <button
                type="button"
                onClick={() => setSelectedDifficulty("medium")}
                disabled={isSearching}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer ${selectedDifficulty === "medium"
                    ? "bg-amber-50 text-amber-700 border-amber-500 shadow-xs ring-2 ring-amber-500/20"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                🟡 Medium
              </button>
              <button
                type="button"
                onClick={() => setSelectedDifficulty("hard")}
                disabled={isSearching}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer ${selectedDifficulty === "hard"
                    ? "bg-rose-50 text-rose-700 border-rose-500 shadow-xs ring-2 ring-rose-500/20"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                🔴 Hard
              </button>
            </div>
          </div>

          {isSearching ? (
            <button
              onClick={handleCancelMatch}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold transition-all shadow-sm animate-pulse cursor-pointer capitalize"
            >
              Finding {selectedDifficulty} Opponent... (Click to Cancel)
            </button>
          ) : (
            <button
              onClick={handleRandomMatch}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
            >
              Find Match
            </button>
          )}
        </div>

        {/* Private Custom Friend Invite Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 space-y-4 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900">Custom Battle with Friend</h2>

          <button
            onClick={handleCreateCustom}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
          >
            Create Invite Room
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Or Join with Code</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Code (e.g. DSA-7K9)"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl font-mono text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
            <button
              onClick={handleJoinCustom}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Friend Invite Modal */}
      {showInviteModal && (
        <FriendInviteModal
          inviteCode={inviteCode}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}