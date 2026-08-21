// "use client"

// import { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { Swords, Trophy, Clock, Target, Play, Flame } from "lucide-react"
// import { getSafeIconName, spacedToSnakeCase } from "@/lib/utils"
// import { Data_Structure_Props } from "@/types/data_structure"
// import { DynamicIcon } from "lucide-react/dynamic"


// export default function BattleClient({ ds_param, battle_stats, battle_modes, recent_matches }: Data_Structure_Props) {
//   const [selectedMode, setSelectedMode] = useState<string | null>(null);
//   const [isSearching, setIsSearching] = useState(false);

//   const handleStartBattle = (modeId: string) => {
//     setSelectedMode(modeId);
//     setIsSearching(true);

//     // Simulate matchmaking
//     setTimeout(() => {
//       setIsSearching(false);
//     }, 3000)
//   }

//   return (
//     <div className="array-battle-theme min-h-screen bg-white text-black">
//       <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-6xl mx-auto">
//           {/* Header */}
//           <div className="mb-12">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//               <h1 className="text-4xl sm:text-5xl font-bold mb-4">
//                 Battle <span className="text-[#14b8a6]">Arena</span>
//               </h1>
//               <p className="text-gray-400 text-lg">
//                 Choose your battle mode and face opponents in real-time coding duels
//               </p>
//             </motion.div>
//           </div>

//           {/* Stats Bar */}
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ab-glass rounded-2xl p-6 mb-8">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//               <div className="text-center">
//                 <div className="text-3xl font-bold ">{battle_stats?.rating}</div>
//                 <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
//                   <Trophy className="w-4 h-4 text-yellow-500" /> Rating
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-green-400">{battle_stats?.win_rate}%</div>
//                 <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
//                   <Target className="w-4 h-4" /> Win Rate
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl font-bold ">{battle_stats?.battles}</div>
//                 <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
//                   <Swords className="w-4 h-4 text-teal-400" /> Battles
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-orange-400">{battle_stats?.win_streak}</div>
//                 <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
//                   <Flame className="w-4 h-4" /> Win Streak
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Battle Modes */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
//             {battle_modes?.map((mode, i) => {
//               const safe_icon_name = getSafeIconName(mode.icon);
//               const mode_id = spacedToSnakeCase(mode.title);

//               return (
//               <motion.div key={mode_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
//                 <div
//                   className={`ab-glass ab-glass-hover rounded-2xl p-6 cursor-pointer transition-all ${selectedMode === mode_id ? "ring-2 ring-teal-500" : ""}`}
//                   onClick={() => setSelectedMode(mode_id)}
//                 >
//                   <div className="flex items-start justify-between mb-4">
//                     <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${mode.color} flex items-center justify-center`}>
//                       <DynamicIcon name={safe_icon_name} className="w-6 h-6 text-white" />
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-400">
//                       <Clock className="w-4 h-4" /> {mode.time}
//                     </div>
//                   </div>
//                   <h3 className="text-xl font-bold mb-2">{mode.title}</h3>
//                   <p className="text-gray-400 text-sm mb-4">{mode.description}</p>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       handleStartBattle(mode_id)
//                     }}
//                     className={`hover:cursor-pointer w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
//                       selectedMode === mode_id ? "bg-linear-to-r from-teal-500 to-green-500 text-black" : "bg-gray-100 hover:bg-gray-200"
//                     }`}
//                   >
//                     <Play className="w-5 h-5" />
//                     {isSearching && selectedMode === mode_id ? "Finding Opponent..." : "Start Battle"}
//                   </button>
//                 </div>
//               </motion.div>
//             )
//             })}
//           </div>

//           {/* Matchmaking Modal */}
//           <AnimatePresence>
//             {isSearching && (
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
//                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="ab-glass rounded-2xl p-8 max-w-md w-full mx-4 text-center">
//                   <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-teal-500 to-green-500 flex items-center justify-center animate-pulse">
//                     <Swords className="w-10 h-10 text-black" />
//                   </div>
//                   <h3 className="text-2xl font-bold mb-2">Finding Opponent</h3>
//                   <p className="text-gray-400 mb-6">Matching you with a worthy challenger...</p>
//                   <div className="flex items-center justify-center gap-2 text-teal-400">
//                     <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animationDelay:0ms]" />
//                     <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animationDelay:150ms]" />
//                     <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animationDelay:300ms]" />
//                   </div>
//                   <button onClick={() => setIsSearching(false)} className="mt-6 px-6 py-2 text-gray-400 hover:text-white transition-colors">
//                     Cancel
//                   </button>
//                 </motion.div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Recent Matches */}
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
//             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//               <Clock className="w-6 h-6 text-teal-400" /> Recent Matches
//             </h2>
//             <div className="ab-glass rounded-2xl overflow-hidden">
//               {recent_matches?.map((match, i) => (
//                 <div key={i} className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0 hover:bg-gray-100 transition-colors">
//                   <div className="flex items-center gap-4">
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${match.result === "win" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
//                       {match.result === "win" ? "W" : "L"}
//                     </div>
//                     <div>
//                       <div className="font-semibold ">vs {match.opponent_user_name}</div>
//                       <div className="text-sm text-gray-500">{match.problem}</div>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className={`font-semibold ${match.result === "win" ? "text-green-400" : "text-red-400"}`}>
//                       {match.rating_change}
//                     </div>
//                     <div className="text-sm text-gray-500">{match.time}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </main>
//     </div>
//   )
// }

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
  const [username] = useState(() => "Player_" + Math.floor(Math.random() * 1000));

  // Connect socket and register listeners
  useEffect(() => {
    // 1. CRITICAL FIX: Attach auth credentials before connecting
    // This satisfies your server.js io.use() middleware requirements
    socket.auth = {
      username,
    };

    // 2. Initialize connection
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
  }, [ds_param, router, searchParams, username]);

  // Handle 1v1 Random Queue
  const handleRandomMatch = () => {
    setIsSearching(true);
    setErrorMessage("");
    socket.emit("joinQueue", {
      userId: "user_" + Math.random().toString(36).substring(2, 6), // Replace with your auth user ID later
      username: username || "Player", // Use the auth name
      topic: ds_param,
    });
  };

  const handleCancelMatch = () => {
    setIsSearching(false);
    socket.emit("leaveQueue", { topic: ds_param });
  };

  // Handle Custom Room Invite
  const handleCreateCustom = () => {
    setErrorMessage("");
    socket.emit("createCustomRoom", {
      username: username || "Player",
      topic: ds_param,
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
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Stats Header */}
      <div className="max-w-4xl mx-auto mb-8 grid grid-cols-4 gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800 text-center">
        <div>
          <p className="text-gray-400 text-xs">Rating</p>
          <p className="text-xl font-bold">{battle_stats.rating}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Win Rate</p>
          <p className="text-xl font-bold">{battle_stats.win_rate}%</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Total Battles</p>
          <p className="text-xl font-bold">{battle_stats.battles}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Win Streak</p>
          <p className="text-xl font-bold">{battle_stats.win_streak}</p>
        </div>
      </div>

      {/* Main Lobby Actions */}
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-center capitalize">
          {ds_param} 1v1 Arena
        </h1>

        {errorMessage && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Random 1v1 Matchmaking Card */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
          <h2 className="text-xl font-bold">1v1 Random Match</h2>
          <p className="text-gray-400 text-sm">Find an online opponent in {ds_param}.</p>

          {isSearching ? (
            <button
              onClick={handleCancelMatch}
              className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-bold transition animate-pulse"
            >
              Searching... (Click to Cancel)
            </button>
          ) : (
            <button
              onClick={handleRandomMatch}
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition"
            >
              Find Match
            </button>
          )}
        </div>

        {/* Private Custom Friend Invite Card */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
          <h2 className="text-xl font-bold">Custom Battle with Friend</h2>

          <button
            onClick={handleCreateCustom}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold transition"
          >
            Create Invite Room
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">Or Join with Code</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Code (e.g. DSA-7K9)"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleJoinCustom}
              className="bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-lg font-bold text-sm transition"
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