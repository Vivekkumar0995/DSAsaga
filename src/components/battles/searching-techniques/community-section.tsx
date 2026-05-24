"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare } from "lucide-react"
import { testimonials, activities } from "@/lib/data"
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/motion"

export function CommunitySection() {
  return (
    <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            transition={smoothTransition}
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Join the Community
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ ...smoothTransition, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Learn from others and share your progress with fellow developers
          </motion.p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Testimonials */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              variants={fadeInUp}
              className="mb-6 flex items-center gap-2"
            >
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                What Coders Say
              </h3>
            </motion.div>

            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  variants={fadeInUp}
                  transition={{ ...smoothTransition, delay: index * 0.1 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-border/50 bg-card shadow-sm">
                      <CardContent className="p-5">
                        <p className="mb-4 text-muted-foreground">
                          &quot;{testimonial.content}&quot;
                        </p>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                              {testimonial.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {testimonial.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Live Activity */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              variants={fadeInUp}
              className="mb-6 flex items-center gap-2"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-green-500"
              />
              <h3 className="text-lg font-semibold text-foreground">
                Live Activity
              </h3>
            </motion.div>

            <Card className="border-border/50 bg-card shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {activities.map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 p-4"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"
                        >
                          <Icon className="h-5 w-5 text-primary" />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">
                            <span className="font-medium">{activity.user}</span>{" "}
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
