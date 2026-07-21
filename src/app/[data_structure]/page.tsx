import { BattleArenaSection } from "@/components/data_structure/Battle";
import { LearningHubSection } from "@/components/data_structure/Learn";
import { CommunitySection } from "@/components/data_structure/Community";
import { getDataStructure } from "@/lib/mongodb";

export default async function DataStructurePage({
  params,
}: {
  params: Promise<{ data_structure: string }>;
}) {
  const { data_structure } = await params;

  // Fetch this data structure's content from MongoDB
  const dsData = await getDataStructure(data_structure);

  // If not found in DB yet, show a "Coming Soon" message
  if (!dsData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
          {data_structure.replace(/-/g, " ")}
        </h1>
        <p className="text-gray-500 text-lg mb-6">
          This data structure hasn&apos;t been added yet.
        </p>
        <a
          href="/admin/data-structure"
          className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          Add it via Admin Panel →
        </a>
      </div>
    );
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

