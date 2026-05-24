"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BitwiseMenu } from "@/components/battles/bitwise/BitwiseMenu"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Flame,
  Target,
  Crown,
  Medal,
  Star,
  Zap,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

const timeFilters = ["All Time", "This Season", "This Week", "Today"]

const leaderboardData = [
  {
    rank: 1,
    username: "ByteNinja42",
    avatar: "BN",
    xp: 125840,
    winRate: 87,
    streak: 42,
    problemsSolved: 487,
    rankTitle: "Grandmaster of Bits",
    trend: "same",
  },
  {
    rank: 2,
    username: "AlgoQueen",
    avatar: "AQ",
    xp: 118920,
    winRate: 84,
    streak: 38,
    problemsSolved: 452,
    rankTitle: "Grandmaster of Bits",
    trend: "up",
  },
  {
    rank: 3,
    username: "BinaryWizard",
    avatar: "BW",
    xp: 112450,
    winRate: 82,
    streak: 56,
    problemsSolved: 438,
    rankTitle: "Grandmaster of Bits",
    trend: "down",
  },
  {
    rank: 4,
    username: "XORMaster",
    avatar: "XM",
    xp: 98760,
    winRate: 79,
    streak: 28,
    problemsSolved: 398,
    rankTitle: "Elite Manipulator",
    trend: "up",
  },
  {
    rank: 5,
    username: "CodeNinja",
    avatar: "CN",
    xp: 87340,
    winRate: 76,
    streak: 21,
    problemsSolved: 367,
    rankTitle: "Elite Manipulator",
    trend: "same",
  },
  {
    rank: 6,
    username: "BitHunter",
    avatar: "BH",
    xp: 82150,
    winRate: 74,
    streak: 15,
    problemsSolved: 342,
    rankTitle: "Bitwise Hunter",
    trend: "up",
  },
  {
    rank: 7,
    username: "LogicLord",
    avatar: "LL",
    xp: 76890,
    winRate: 72,
    streak: 19,
    problemsSolved: 328,
    rankTitle: "Bitwise Hunter",
    trend: "down",
  },
  {
    rank: 8,
    username: "ShiftMaster",
    avatar: "SM",
    xp: 71230,
    winRate: 71,
    streak: 12,
    problemsSolved: 305,
    rankTitle: "XOR Warrior",
    trend: "up",
  },
  {
    rank: 9,
    username: "MaskPro",
    avatar: "MP",
    xp: 65780,
    winRate: 69,
    streak: 8,
    problemsSolved: 287,
    rankTitle: "XOR Warrior",
    trend: "same",
  },
  {
    rank: 10,
    username: "BitFlip",
    avatar: "BF",
    xp: 61240,
    winRate: 68,
    streak: 14,
    problemsSolved: 271,
    rankTitle: "XOR Warrior",
    trend: "up",
  },
]

const currentUser = {
  rank: 156,
  username: "You",
  avatar: "YO",
  xp: 8420,
  winRate: 70,
  streak: 7,
  problemsSolved: 42,
  rankTitle: "XOR Warrior",
  trend: "up",
}

const rankColors: Record<number, string> = {
  1: "bg-gradient-to-r from-amber-400 to-yellow-500",
  2: "bg-gradient-to-r from-slate-300 to-slate-400",
  3: "bg-gradient-to-r from-amber-600 to-amber-700",
}

const rankIcons: Record<number, React.ReactNode> = {
  1: <Crown className="h-5 w-5 text-amber-400" />,
  2: <Medal className="h-5 w-5 text-slate-400" />,
  3: <Medal className="h-5 w-5 text-amber-600" />,
}

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState("All Time")

  return (
    <div className="min-h-screen bg-slate-50">
      <BitwiseMenu />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3 border-amber-200 bg-amber-50 text-amber-700">
            Global Rankings
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Leaderboard
          </h1>
          <p className="mt-2 text-slate-600">
            Top bit manipulation coders from around the world
          </p>
        </div>

        {/* Time Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {timeFilters.map((filter) => (
            <Button
              key={filter}
              variant={timeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter(filter)}
              className={
                timeFilter === filter
                  ? "bg-teal-500 text-white hover:bg-teal-600"
                  : "border-slate-200 text-slate-600"
              }
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Top 3 */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {leaderboardData.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className={`relative overflow-hidden rounded-2xl border-slate-200 bg-white p-6 ${
                  user.rank === 1 ? "ring-2 ring-amber-400" : ""
                }`}
              >
                {/* Rank Badge */}
                <div
                  className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${rankColors[user.rank]} opacity-10`}
                />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                        <AvatarImage src="" />
                        <AvatarFallback
                          className={`text-lg font-bold ${
                            user.rank === 1
                              ? "bg-amber-100 text-amber-700"
                              : user.rank === 2
                                ? "bg-slate-100 text-slate-700"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full ${rankColors[user.rank]} text-sm font-bold text-white shadow-lg`}
                      >
                        {user.rank}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {user.username}
                        </h3>
                        {rankIcons[user.rank]}
                      </div>
                      <p className="text-sm text-slate-500">{user.rankTitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <p className="text-lg font-bold text-slate-900">
                        {user.xp.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">XP</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <p className="text-lg font-bold text-slate-900">
                        {user.winRate}%
                      </p>
                      <p className="text-xs text-slate-500">Win Rate</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <p className="text-lg font-bold text-slate-900">
                          {user.streak}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">Streak</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <p className="text-lg font-bold text-slate-900">
                        {user.problemsSolved}
                      </p>
                      <p className="text-xs text-slate-500">Solved</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    User
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                    XP
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                    Win Rate
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                    Streak
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                    Solved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboardData.map((user, index) => (
                  <motion.tr
                    key={user.rank}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            user.rank <= 3
                              ? rankColors[user.rank] + " text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.rank}
                        </span>
                        {user.trend === "up" && (
                          <TrendingUp className="h-4 w-4 text-teal-500" />
                        )}
                        {user.trend === "down" && (
                          <TrendingDown className="h-4 w-4 text-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-teal-50 text-sm font-medium text-teal-700">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.username}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.rankTitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="font-semibold text-slate-900">
                          {user.xp.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-slate-700">
                        {user.winRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-slate-700">
                          {user.streak}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-slate-700">
                        {user.problemsSolved}
                      </span>
                    </td>
                  </motion.tr>
                ))}

                {/* Current User Row */}
                <tr className="border-t-2 border-teal-200 bg-teal-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white">
                        {currentUser.rank}
                      </span>
                      <TrendingUp className="h-4 w-4 text-teal-600" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-teal-400">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-teal-100 text-sm font-medium text-teal-700">
                          {currentUser.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-teal-700">
                          {currentUser.username}
                        </p>
                        <p className="text-xs text-teal-600">
                          {currentUser.rankTitle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-teal-700">
                        {currentUser.xp.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium text-teal-700">
                      {currentUser.winRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-teal-700">
                        {currentUser.streak}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium text-teal-700">
                      {currentUser.problemsSolved}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
