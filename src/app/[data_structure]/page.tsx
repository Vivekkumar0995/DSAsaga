import { BattleArenaSection } from "@/components/data_structure/Battle";
import { LearningHubSection } from "@/components/data_structure/Learn";
import { CommunitySection } from "@/components/data_structure/Community";
import { getDataStructure } from "@/lib/mongodb";
import { notFound } from "next/navigation";

export default async function DataStructurePage({
  params,
}: {
  params: Promise<{ data_structure: string }>;
}) {
  const { data_structure } = await params;

  const dsData = await getDataStructure(data_structure);

  if (!dsData) {
    notFound();
  }

  return (
    <div className="array-battle-theme min-h-screen bg-white text-black">
      <main>
        <div className="top-25 relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-gray-200 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Season 3 Live Now</span>
          </div>
        </div>

        <BattleArenaSection ds_param={data_structure} battle_modes={dsData.battle_modes} />
        <LearningHubSection
          ds_param={data_structure}
          learning_tracks={dsData.learning_tracks}
          learning_stats={[]} // user-specific stats — to be built later
        />
        <CommunitySection
          ds_param={data_structure}
          testimonials={dsData.testimonials}
          live_activity={dsData.live_activity}
        />
      </main>
    </div>
  );
}

