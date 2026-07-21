import LearnClient from "@/components/data_structure/learn/LearnClient";
import { getDataStructure } from "@/lib/mongodb";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ data_structure: string }>;
}) {
  const { data_structure } = await params;
  const dsData = await getDataStructure(data_structure);

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

  return (
    <LearnClient
      ds_param={data_structure}
      learning_tracks={dsData.learning_tracks}
      learning_stats={[]} // user-specific stats — to be built later
    />
  );
}
