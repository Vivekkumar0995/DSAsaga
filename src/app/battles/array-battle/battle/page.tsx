"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Swords, Zap, Trophy, Users, Clock, Target, Play, Flame
} from "lucide-react"

const battleModes = [
  {
    id: "quick",
    icon: Zap,
    title: "Unranked Match",
    description: "Fast 5-minute battles with random opponents",
    time: "5 min",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "ranked",
    icon: Trophy,
    title: "Ranked Battle",
    description: "Competitive matches that affect your rating",
    time: "15 min",
    color: "from-teal-500 to-green-500",
  },
  {
    id: "friend",
    icon: Users,
    title: "Friend Challenge",
    description: "Challenge a friend with a custom room code",
    time: "Custom",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "daily",
    icon: Target,
    title: "Daily Battle",
    description: "One special challenge every day for bonus XP",
    time: "10 min",
    color: "from-red-500 to-orange-500",
  },
]

const recentMatches = [
  { opponent: "CodeMaster", result: "win", rating: "+25", problem: "Two Sum", time: "2h ago" },
  { opponent: "AlgoKing", result: "loss", rating: "-18", problem: "Valid Parentheses", time: "5h ago" },
  { opponent: "ByteNinja", result: "win", rating: "+22", problem: "Merge Intervals", time: "1d ago" },
]

export default function BattlePage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleStartBattle = (modeId: string) => {
    setSelectedMode(modeId)
    setIsSearching(true)
    // Simulate matchmaking
    setTimeout(() => {
      setIsSearching(false)
    }, 3000)
  }

  return (
    <div className="array-battle-theme min-h-screen bg-white text-black">

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold  mb-4">
                Battle <span className="text-[#14b8a6]">Arena</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Choose your battle mode and face opponents in real-time coding duels
              </p>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ab-glass rounded-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold ">1,847</div>
                <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Rating
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">67%</div>
                <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                  <Target className="w-4 h-4" />
                  Win Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold ">142</div>
                <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                  <Swords className="w-4 h-4 text-teal-400" />
                  Battles
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">12</div>
                <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4" />
                  Win Streak
                </div>
              </div>
            </div>
          </motion.div>

          {/* Battle Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {battleModes.map((mode, i) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <div
                  className={`ab-glass ab-glass-hover rounded-2xl p-6 cursor-pointer transition-all ${
                    selectedMode === mode.id ? "ring-2 ring-teal-500" : ""
                  }`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                      <mode.icon className="w-7 h-7 " />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      {mode.time}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold  mb-2">{mode.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{mode.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartBattle(mode.id)
                    }}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      selectedMode === mode.id
                        ? "bg-gradient-to-r from-teal-500 to-green-500 text-black"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <Play className="w-5 h-5" />
                    {isSearching && selectedMode === mode.id ? "Finding Opponent..." : "Start Battle"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Matchmaking Modal */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="ab-glass rounded-2xl p-8 max-w-md w-full mx-4 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center animate-pulse">
                    <Swords className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold  mb-2">Finding Opponent</h3>
                  <p className="text-gray-400 mb-6">Matching you with a worthy challenger...</p>
                  <div className="flex items-center justify-center gap-2 text-teal-400">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animationDelay:0ms]" />
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animationDelay:150ms]" />
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animationDelay:300ms]" />
                  </div>
                  <button
                    onClick={() => setIsSearching(false)}
                    className="mt-6 px-6 py-2 text-gray-400 hover: transition-colors"
                  >
                    Cancel
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold  mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-teal-400" />
              Recent Matches
            </h2>
            <div className="ab-glass rounded-2xl overflow-hidden">
              {recentMatches.map((match, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      match.result === "win" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {match.result === "win" ? "W" : "L"}
                    </div>
                    <div>
                      <div className="font-semibold ">vs {match.opponent}</div>
                      <div className="text-sm text-gray-500">{match.problem}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      match.result === "win" ? "text-green-400" : "text-red-400"
                    }`}>
                      {match.rating}
                    </div>
                    <div className="text-sm text-gray-500">{match.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

    </div>
  )
}
