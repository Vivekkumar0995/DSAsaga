"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/searching-techniques/ui/avatar"
import { Badge } from "@/components/searching-techniques/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/searching-techniques/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/searching-techniques/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/searching-techniques/ui/tabs"
import { Trophy, Medal, Flame, Target, TrendingUp } from "lucide-react"
import { leaderboardUsers } from "@/lib/data"
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/motion"

export default function LeaderboardPage() {
  const top3 = leaderboardUsers.slice(0, 3)
  const rest = leaderboardUsers.slice(3)

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-amber-500"
    if (rank === 2) return "text-slate-400"
    if (rank === 3) return "text-orange-600"
    return "text-muted-foreground"
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-amber-500/10 border-amber-500/30"
    if (rank === 2) return "bg-slate-400/10 border-slate-400/30"
    if (rank === 3) return "bg-orange-600/10 border-orange-600/30"
    return "bg-card"
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-amber-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />
    return null
  }

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
              Leaderboard
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              transition={{ ...smoothTransition, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Top performers in the Search Battle community
            </motion.p>
          </motion.div>

          <Tabs defaultValue="global" className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TabsList className="mb-6 rounded-xl">
                <TabsTrigger value="global" className="rounded-lg">
                  Global
                </TabsTrigger>
                <TabsTrigger value="weekly" className="rounded-lg">
                  This Week
                </TabsTrigger>
                <TabsTrigger value="friends" className="rounded-lg">
                  Friends
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="global">
              {/* Top 3 Podium */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="mb-10 flex items-end justify-center gap-4"
              >
                {/* Second Place */}
                <motion.div
                  variants={fadeInUp}
                  transition={{ ...smoothTransition, delay: 0.2 }}
                  className="order-1"
                >
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`w-36 border-2 ${getRankBg(2)} sm:w-44`}
                    >
                      <CardContent className="flex flex-col items-center p-4 text-center">
                        {getRankIcon(2)}
                        <Avatar className="mt-2 h-14 w-14 border-2 border-slate-400/50">
                          <AvatarFallback className="bg-slate-400/20 font-medium">
                            {top3[1]?.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <p className="mt-2 truncate text-sm font-semibold text-foreground">
                          {top3[1]?.username}
                        </p>
                        <p className="text-lg font-bold text-slate-400">
                          {top3[1]?.xp.toLocaleString()} XP
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* First Place */}
                <motion.div
                  variants={fadeInUp}
                  transition={{ ...smoothTransition, delay: 0.1 }}
                  className="order-2"
                >
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`w-40 border-2 ${getRankBg(1)} sm:w-52`}
                    >
                      <CardContent className="flex flex-col items-center p-5 text-center">
                        <motion.div
                          animate={{ rotate: [0, -5, 5, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                        >
                          {getRankIcon(1)}
                        </motion.div>
                        <Avatar className="mt-2 h-16 w-16 border-2 border-amber-500/50">
                          <AvatarFallback className="bg-amber-500/20 font-medium">
                            {top3[0]?.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <p className="mt-2 truncate text-base font-semibold text-foreground">
                          {top3[0]?.username}
                        </p>
                        <p className="text-xl font-bold text-amber-500">
                          {top3[0]?.xp.toLocaleString()} XP
                        </p>
                        <Badge
                          variant="secondary"
                          className="mt-2 bg-amber-500/20 text-amber-600"
                        >
                          Champion
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Third Place */}
                <motion.div
                  variants={fadeInUp}
                  transition={{ ...smoothTransition, delay: 0.3 }}
                  className="order-3"
                >
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`w-36 border-2 ${getRankBg(3)} sm:w-44`}
                    >
                      <CardContent className="flex flex-col items-center p-4 text-center">
                        {getRankIcon(3)}
                        <Avatar className="mt-2 h-14 w-14 border-2 border-orange-600/50">
                          <AvatarFallback className="bg-orange-600/20 font-medium">
                            {top3[2]?.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <p className="mt-2 truncate text-sm font-semibold text-foreground">
                          {top3[2]?.username}
                        </p>
                        <p className="text-lg font-bold text-orange-600">
                          {top3[2]?.xp.toLocaleString()} XP
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Leaderboard Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-0">
                    <h3 className="text-lg font-semibold text-foreground">
                      Full Rankings
                    </h3>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-20">Rank</TableHead>
                          <TableHead>Player</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              Win Rate
                            </div>
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            <div className="flex items-center gap-1">
                              <Flame className="h-4 w-4" />
                              Streak
                            </div>
                          </TableHead>
                          <TableHead className="hidden lg:table-cell">
                            Problems
                          </TableHead>
                          <TableHead className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TrendingUp className="h-4 w-4" />
                              XP
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboardUsers.map((user, index) => (
                          <motion.tr
                            key={user.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            className="group"
                          >
                            <TableCell>
                              <span
                                className={`font-bold ${getRankColor(user.rank)}`}
                              >
                                #{user.rank}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback
                                    className={`text-xs font-medium ${user.rank <= 3 ? getRankBg(user.rank) : "bg-primary/10"}`}
                                  >
                                    {user.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">
                                  {user.username}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <span className="text-muted-foreground">
                                {user.winRate}%
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <span className="text-muted-foreground">
                                  {user.streak}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden text-muted-foreground lg:table-cell">
                              {user.problemsSolved}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              {user.xp.toLocaleString()}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="weekly">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 text-center"
              >
                <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg text-muted-foreground">
                  Weekly leaderboard resets every Monday
                </p>
              </motion.div>
            </TabsContent>

            <TabsContent value="friends">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 text-center"
              >
                <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg text-muted-foreground">
                  Add friends to compare rankings
                </p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  )
}
