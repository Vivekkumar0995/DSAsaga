type Props = {
  params: Promise<{
    data_structure: string;
  }>;
};

async function getQuestions(slug: string) {
  const res = await fetch(
    `http://localhost:3000/api/questions?dsSlug=${slug}`,
    { cache: "no-store" },
  );
  return res.json();
}

export default async function PracticePage({ params }: Props) {
  const { data_structure } = await params;

  const data = await getQuestions(data_structure);

  return (
    <div className="pt-28 px-10">
      <h1 className="text-3xl font-bold mb-6">{data_structure} Practice</h1>
      <div className="space-y-5">
        {data.questions?.map((question: any) => (
          <a key={question._id} href={`/${data_structure}/practice/${question.slug}`} className="block border border-neutral-200 rounded-3xl p-6 bg-white hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-black">
                  {question.title}
                </h2>
                <div className="flex gap-3 mt-3">
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                    {question.difficulty}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
                    {question.xp} XP
                  </span>
                </div>
              </div>
              <div className="text-neutral-400">→</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
