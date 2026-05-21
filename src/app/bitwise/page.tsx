import { BitwiseMenu } from "@/components/bitwise/BitwiseMenu"
import { HeroSection } from "@/components/bitwise/hero-section"
import { TopicsSection } from "@/components/bitwise/topics-section"
import { BattleSection } from "@/components/bitwise/battle-section"
import { CommunitySection } from "@/components/bitwise/community-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <BitwiseMenu />
      <main>
        <HeroSection />
        <TopicsSection />
        <BattleSection />
        <CommunitySection />
      </main>
    </div>
  )
}
