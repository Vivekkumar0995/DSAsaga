"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap,
  Swords,
  Users,
  Clock,
  Trophy,
  ArrowRight,
  Play,
  Copy,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/motion"

export default function BattlePage() {
  const [roomCode, setRoomCode] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText("SEARCH-2024")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const battleModes = [
    {
      id: "quick",
      name: "Quick Match",
      description:
        "Jump into a fast-paced challenge against a random opponent",
      time: "5 min",
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      players: "1v1",
      difficulty: "Mixed",
    },
    {
      id: "ranked",
      name: "Ranked Battle",
      description: "Compete for global rankings and earn exclusive rewards",
      time: "15 min",
      icon: Swords,
      color: "text-primary",
      bgColor: "bg-primary/10",
      players: "1v1",
      difficulty: "Skill-based",
    },
    {
      id: "tournament",
      name: "Tournament",
      description: "Join weekly tournaments with multiple rounds",
      time: "45 min",
      icon: Trophy,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      players: "8-32",
      difficulty: "Advanced",
    },
  ]

  const recentMatches = [
    {
      opponent: "AlgoMaster",
      result: "Win",
      xp: "+75",
      time: "2 min ago",
    },
    {
      opponent: "BinaryQueen",
      result: "Loss",
      xp: "+25",
      time: "15 min ago",
    },
    {
      opponent: "SearchNinja",
      result: "Win",
      xp: "+80",
      time: "1 hour ago",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mb-10"
          >
            <motion.h1
              variants={fadeInUp}
              transition={smoothTransition}
              className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Battle Arena
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              transition={{ ...smoothTransition, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Challenge opponents and climb the global rankings
            </motion.p>
          </motion.div>

          <Tabs defaultValue="modes" className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TabsList className="mb-6 rounded-xl">
                <TabsTrigger value="modes" className="rounded-lg">
                  Battle Modes
                </TabsTrigger>
                <TabsTrigger value="private" className="rounded-lg">
                  Private Room
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg">
                  Match History
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="modes">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid gap-6 md:grid-cols-3"
              >
                {battleModes.map((mode, index) => {
                  const Icon = mode.icon
                  return (
                    <motion.div
                      key={mode.id}
                      variants={fadeInUp}
                      transition={{ ...smoothTransition, delay: index * 0.1 }}
                    >
                      <motion.div
                        whileHover={{ y: -6, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="group relative h-full overflow-hidden border-border/50 bg-card shadow-sm transition-shadow hover:shadow-lg">
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary/5 to-transparent"
                          />
                          <CardHeader className="pb-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${mode.bgColor} ${mode.color}`}
                            >
                              <Icon className="h-7 w-7" />
                            </motion.div>
                            <h3 className="mt-4 text-xl font-semibold text-foreground">
                              {mode.name}
                            </h3>
                            <p className="text-muted-foreground">
                              {mode.description}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4 flex flex-wrap gap-2">
                              <Badge variant="secondary">{mode.players}</Badge>
                              <Badge variant="outline">{mode.difficulty}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {mode.time}
                              </div>
                              <Button className="group/btn gap-1 rounded-xl">
                                <Play className="h-4 w-4" />
                                Play
                                <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </TabsContent>

            <TabsContent value="private">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={smoothTransition}
                className="grid gap-6 md:grid-cols-2"
              >
                {/* Create Room */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      Create Private Room
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Invite friends to battle in your own private room
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-xl bg-secondary p-4">
                      <p className="mb-2 text-xs text-muted-foreground">
                        Your Room Code
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold tracking-wider text-foreground">
                          SEARCH-2024
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopyCode}
                          className="rounded-lg p-2 hover:bg-background"
                        >
                          <AnimatePresence mode="wait">
                            {copied ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Copy className="h-5 w-5 text-muted-foreground" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>
                    <Button className="w-full rounded-xl">Create Room</Button>
                  </CardContent>
                </Card>

                {/* Join Room */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                      <ArrowRight className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      Join Private Room
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter a room code to join your friend&apos;s battle
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Enter room code..."
                      value={roomCode}
                      onChange={(e) =>
                        setRoomCode(e.target.value.toUpperCase())
                      }
                      className="mb-4 h-12 rounded-xl text-center text-lg font-medium tracking-wider"
                    />
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      disabled={roomCode.length < 4}
                    >
                      Join Room
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="history">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
              >
                {recentMatches.map((match, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    transition={{ ...smoothTransition, delay: index * 0.1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.01, x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border-border/50 shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-xl ${match.result === "Win" ? "bg-green-500/10" : "bg-red-500/10"}`}
                            >
                              <Swords
                                className={`h-6 w-6 ${match.result === "Win" ? "text-green-500" : "text-red-500"}`}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                vs {match.opponent}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {match.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge
                              variant={
                                match.result === "Win" ? "default" : "secondary"
                              }
                              className={
                                match.result === "Win"
                                  ? "bg-green-500/10 text-green-600"
                                  : ""
                              }
                            >
                              {match.result}
                            </Badge>
                            <span className="font-medium text-primary">
                              {match.xp}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  )
}
