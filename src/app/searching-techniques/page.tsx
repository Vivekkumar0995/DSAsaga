"use client"

import { motion } from "framer-motion"
import { HeroSection } from "@/components/searching-techniques/hero-section"
import { TechniquesSection } from "@/components/searching-techniques/techniques-section"
import { BattleSection } from "@/components/searching-techniques/battle-section"
import { CommunitySection } from "@/components/searching-techniques/community-section"

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSection />
      <TechniquesSection />
      <BattleSection />
      <CommunitySection />
    </motion.div>
  )
}
