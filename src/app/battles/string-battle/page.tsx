import { BattleArenaSection } from "@/components/battles/string-battle/battle-arena-section"
import { LearningHubSection } from "@/components/battles/string-battle/learning-hub-section"
import { CommunitySection } from '@/components/battles/string-battle/community-section'

export default function StringBattlePage() {
  return (
    <div className="string-battle-theme min-h-screen bg-white text-black">
      <main>
        <div className="top-25 relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-gray-200 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Season 3 Live Now</span>
          </div>
        </div>

        <BattleArenaSection />
        <LearningHubSection />
        <CommunitySection />
      </main>
    </div>
  )
}
