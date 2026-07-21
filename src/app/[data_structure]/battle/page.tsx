import BattleClient from "@/components/data_structure/battle/BattleClient";
import { getDataStructure } from "@/lib/mongodb";
import { DataStructureType } from "@/models/data_structure_model";

export default async function BattlePage({
  params,
}: {
  params: Promise<{ data_structure: string }>;
}) {
  const { data_structure } = await params;
  const dsData: DataStructureType | null = await getDataStructure(data_structure);

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
        <a href="/admin/data-structure" className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
          Add it via Admin Panel →
        </a>
      </div>
    );
  }

  // battle_stats and recent_matches are user-specific — to be built with user-progress tracking later
  const stats = { rating: 0, win_rate: 0, battles: 0, win_streak: 0 };
  const recent_matches: never[] = [];

  return (
    <BattleClient
      ds_param={data_structure}
      battle_stats={stats}
      battle_modes={dsData.battle_modes}
      recent_matches={recent_matches}
    />
  );
}
