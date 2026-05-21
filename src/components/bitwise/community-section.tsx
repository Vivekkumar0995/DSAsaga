"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/bitwise/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/bitwise/ui/avatar"
import { Badge } from "@/components/bitwise/ui/badge"
import { Star, Trophy, Target, Flame, Zap, Award } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Alex Chen",
    role: "Software Engineer @ Google",
    avatar: "AC",
    content:
      "Bitwise Master completely changed how I approach bit manipulation problems. The structured learning paths are incredibly well-designed.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Kim",
    role: "Competitive Programmer",
    avatar: "SK",
    content:
      "The battle mode is addictive! I've improved my ranking from Bit Beginner to XOR Warrior in just 2 months.",
    rating: 5,
  },
  {
    id: 3,
    name: "James Martinez",
    role: "CS Student @ MIT",
    avatar: "JM",
    content:
      "Perfect platform for interview prep. The practice problems cover every bitwise pattern I encountered in technical interviews.",
    rating: 5,
  },
]

const activities = [
  {
    id: 1,
    user: "ByteNinja42",
    action: "completed XOR Mastery track",
    icon: Trophy,
    time: "2m ago",
    iconColor: "text-amber-500",
  },
  {
    id: 2,
    user: "BitHunter",
    action: "won ranked battle against CodeMaster",
    icon: Zap,
    time: "5m ago",
    iconColor: "text-teal-500",
  },
  {
    id: 3,
    user: "AlgoQueen",
    action: "unlocked Elite Manipulator rank",
    icon: Award,
    time: "8m ago",
    iconColor: "text-indigo-500",
  },
  {
    id: 4,
    user: "BinaryWizard",
    action: "achieved 30-day streak",
    icon: Flame,
    time: "12m ago",
    iconColor: "text-orange-500",
  },
  {
    id: 5,
    user: "XORMaster",
    action: "solved 100 problems milestone",
    icon: Target,
    time: "15m ago",
    iconColor: "text-teal-600",
  },
]

export function CommunitySection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Testimonials */}
          <div>
            <Badge className="mb-4 border-teal-200 bg-teal-50 text-teal-700">
              Testimonials
            </Badge>
            <h2 className="mb-8 text-balance text-3xl font-bold tracking-tight text-slate-900">
              What Coders Say
            </h2>

            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="rounded-2xl border-slate-200 bg-white p-5 transition-all hover:shadow-md">
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-teal-50 text-sm font-medium text-teal-700">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {testimonial.role}
                        </p>
                      </div>
                      <div className="ml-auto flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {testimonial.content}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Activity */}
          <div>
            <Badge className="mb-4 border-indigo-200 bg-indigo-50 text-indigo-700">
              Live Feed
            </Badge>
            <h2 className="mb-8 text-balance text-3xl font-bold tracking-tight text-slate-900">
              Live Activity
            </h2>

            <Card className="rounded-2xl border-slate-200 bg-white">
              <div className="divide-y divide-slate-100">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 ${activity.iconColor}`}
                    >
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-900">
                          {activity.user}
                        </span>{" "}
                        {activity.action}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-slate-400">
                      {activity.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
