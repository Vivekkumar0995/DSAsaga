import LearnClient from "@/components/data_structure/learn/LearnClient";
import { getDataStructure } from "@/lib/mongodb";
import { DataStructureType } from "@/models/data_structure_model";
import { notFound } from "next/navigation";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ data_structure: string }>;
}) {
  const { data_structure } = await params;
  const dsData: DataStructureType | null = await getDataStructure(data_structure);

  if (!dsData) {
    notFound();
  }

  return (
    <LearnClient
      ds_param={data_structure}
      learning_tracks={dsData.learning_tracks}
      learning_stats={[]} // user-specific stats — to be built later
    />
  );
}
