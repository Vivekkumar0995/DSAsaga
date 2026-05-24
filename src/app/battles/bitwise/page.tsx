import { BitwiseMenu } from "@/components/battles/bitwise/BitwiseMenu"
import { HeroSection } from "@/components/battles/bitwise/hero-section"
import { TopicsSection } from "@/components/battles/bitwise/topics-section"
import { BattleSection } from "@/components/battles/bitwise/battle-section"
import { CommunitySection } from "@/components/battles/bitwise/community-section"

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
