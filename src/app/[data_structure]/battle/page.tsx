import BattleClient from "@/components/data_structure/battle/BattleClient";
import { getDataStructure } from "@/lib/mongodb";
import { DataStructureType } from "@/models/data_structure_model";
import { notFound } from "next/navigation";

export default async function BattlePage({
  params,
}: {
  params: Promise<{ data_structure: string }>;
}) {
  const { data_structure } = await params;
  const dsData: DataStructureType | null = await getDataStructure(data_structure);

  if (!dsData) {
    notFound();
  }

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
