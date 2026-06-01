"use client"

import { motion } from "framer-motion"
import { BitwiseMenu } from "@/components/battles/bitwise/BitwiseMenu"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Progress } from "@/components/ui/progress"
import {
  Zap,
  Trophy,
  Users,
  Clock,
  Target,
  Flame,
  Crown,
  Medal,
  ArrowRight,
  Swords,
  Timer,
  Star,
} from "lucide-react"

const battleModes = [
  {
    id: 1,
    title: "Quick Match",
    description:
      "Jump into a fast-paced 5-minute battle with random bitwise problems. Perfect for daily practice and warming up your skills.",
    icon: Zap,
    time: "5 min",
    players: "1v1",
    color: "bg-teal-500",
    gradient: "from-teal-500 to-teal-600",
    difficulty: "All Levels",
    rewards: "25-50 XP",
  },
  {
    id: 2,
    title: "Ranked Battle",
    description:
      "Compete in ranked matches to climb the global leaderboard. Face opponents of similar skill level in intense coding duels.",
    icon: Trophy,
    time: "15 min",
    players: "1v1",
    color: "bg-indigo-500",
    gradient: "from-indigo-500 to-indigo-600",
    difficulty: "Matched",
    rewards: "100-300 XP",
  },
  {
    id: 3,
    title: "Friend Challenge",
    description:
      "Challenge your friends to a private battle. Customize the difficulty, topics, and time limit for a personalized experience.",
    icon: Users,
    time: "Custom",
    players: "1v1 or Team",
    color: "bg-slate-700",
    gradient: "from-slate-600 to-slate-700",
    difficulty: "Custom",
    rewards: "50-100 XP",
  },
]

const activeBattles = [
  {
    id: 1,
    player1: "ByteNinja42",
    player2: "CodeMaster99",
    type: "Ranked",
    topic: "XOR Techniques",
    timeLeft: "8:32",
    viewers: 24,
  },
  {
    id: 2,
    player1: "AlgoQueen",
    player2: "BinaryWizard",
    type: "Quick Match",
    topic: "Bit Masking",
    timeLeft: "2:15",
    viewers: 12,
  },
]

const recentResults = [
  {
    id: 1,
    opponent: "XORMaster",
    result: "Won",
    xp: "+150",
    problems: "5/6",
    time: "2h ago",
  },
  {
    id: 2,
    opponent: "BitHunter",
    result: "Won",
    xp: "+120",
    problems: "4/5",
    time: "5h ago",
  },
  {
    id: 3,
    opponent: "CodeNinja",
    result: "Lost",
    xp: "+25",
    problems: "2/5",
    time: "1d ago",
  },
]

const seasonInfo = {
  name: "Season 1: Binary Beginnings",
  daysLeft: 23,
  currentRank: "XOR Warrior",
  rankProgress: 68,
  nextRank: "Bitwise Hunter",
  wins: 42,
  losses: 18,
  winRate: 70,
}

export default function BattlePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <BitwiseMenu />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3 border-indigo-200 bg-indigo-50 text-indigo-700">
            Battle Arena
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Compete & Climb
          </h1>
          <p className="mt-2 text-slate-600">
            Test your bitwise skills against coders from around the world
          </p>
        </div>

        {/* Season Banner */}
        <Card className="mb-8 overflow-hidden rounded-2xl border-slate-200 bg-gradient-to-r from-teal-500 to-indigo-500 p-6 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-300" />
                <span className="text-sm font-medium text-teal-100">
                  {seasonInfo.name}
                </span>
              </div>
              <h2 className="text-2xl font-bold">{seasonInfo.currentRank}</h2>
              <p className="mt-1 text-sm text-teal-100">
                {seasonInfo.daysLeft} days left in season
              </p>
            </div>

            <div className="flex-1 lg:max-w-md">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Progress to {seasonInfo.nextRank}</span>
                <span className="font-medium">{seasonInfo.rankProgress}%</span>
              </div>
              <Progress value={seasonInfo.rankProgress} className="h-3 bg-white/20" />
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold">{seasonInfo.wins}</p>
                <p className="text-sm text-teal-100">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{seasonInfo.losses}</p>
                <p className="text-sm text-teal-100">Losses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{seasonInfo.winRate}%</p>
                <p className="text-sm text-teal-100">Win Rate</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Battle Modes */}
        <div className="mb-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Choose Your Battle
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {battleModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="group h-full cursor-pointer overflow-hidden rounded-2xl border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50">
                  <div className={`h-2 bg-gradient-to-r ${mode.gradient}`} />
                  <div className="p-6">
                    {/* Icon */}
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${mode.color} text-white transition-transform group-hover:scale-105`}
                    >
                      <mode.icon className="h-7 w-7" />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-xl font-semibold text-slate-900">
                      {mode.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-slate-500">
                      {mode.description}
                    </p>

                    {/* Info */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="border-slate-200 text-slate-500"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {mode.time}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-slate-200 text-slate-500"
                      >
                        <Users className="mr-1 h-3 w-3" />
                        {mode.players}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-teal-200 text-teal-600"
                      >
                        <Zap className="mr-1 h-3 w-3" />
                        {mode.rewards}
                      </Badge>
                    </div>

                    {/* CTA */}
                    <Button
                      className={`w-full gap-2 ${mode.color} text-white transition-all hover:opacity-90`}
                    >
                      <Swords className="h-4 w-4" />
                      Start Battle
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Active Battles */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Live Battles
              </h2>
              <div className="flex items-center gap-2 text-sm text-teal-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                {activeBattles.length} active
              </div>
            </div>
            <div className="space-y-3">
              {activeBattles.map((battle) => (
                <Card
                  key={battle.id}
                  className="cursor-pointer rounded-xl border-slate-200 bg-white p-4 transition-all hover:border-teal-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-teal-100 text-xs font-medium text-teal-700">
                          {battle.player1.slice(0, 2)}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-xs font-medium text-indigo-700">
                          {battle.player2.slice(0, 2)}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {battle.player1}{" "}
                          <span className="text-slate-400">vs</span>{" "}
                          {battle.player2}
                        </p>
                        <p className="text-sm text-slate-500">
                          {battle.type} • {battle.topic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-mono text-lg font-semibold text-slate-900">
                        <Timer className="h-4 w-4 text-teal-500" />
                        {battle.timeLeft}
                      </div>
                      <p className="text-xs text-slate-400">
                        {battle.viewers} watching
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Your Recent Battles
            </h2>
            <Card className="rounded-xl border-slate-200 bg-white">
              <div className="divide-y divide-slate-100">
                {recentResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          result.result === "Won"
                            ? "bg-teal-50 text-teal-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {result.result === "Won" ? (
                          <Trophy className="h-5 w-5" />
                        ) : (
                          <Target className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          vs {result.opponent}
                        </p>
                        <p className="text-sm text-slate-500">
                          {result.problems} solved
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          result.result === "Won"
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }
                      >
                        {result.result}
                      </Badge>
                      <p className="mt-1 text-sm text-teal-600">{result.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
