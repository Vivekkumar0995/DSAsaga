import MarkdownKatex from "@/components/data_structure/learn/MarkdownKatex"
import { getLesson } from "@/lib/mongodb"
import { _ToSpace } from "@/lib/utils"
import LessonContentModel, { LessonContentType, LessonMeta } from "@/models/lesson_content_model"
import Link from "next/link"
import { notFound } from "next/navigation"


export default async function Lesson ({
    params
}: {
    params: Promise<{data_structure: string, track: string, lesson: string}>
})
{
    const { data_structure, track, lesson } = await params
    const LessonMetaData: LessonMeta | null = await getLesson(data_structure, track, lesson)

    if (!LessonMetaData){
        return notFound()
    }

    const lessonContent: LessonContentType | null = await LessonContentModel.findOne({ _id: LessonMetaData.lesson.contentRef }).lean();
    if (!lessonContent){
        return notFound()
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-100/70 via-background to-background">
            <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
                <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <Link href={`/${data_structure}`} className="transition-colors hover:text-slate-900">{_ToSpace(data_structure)}</Link>
                    <span aria-hidden="true" className="text-slate-300">/</span>
                    <Link href={`/${data_structure}/learn`} className="transition-colors hover:text-slate-900">Learn</Link>
                    <span aria-hidden="true" className="text-slate-300">/</span>
                    <Link href={`/${data_structure}/learn#${track}`} className="transition-colors hover:text-slate-900">{_ToSpace(track)}</Link>
                    <span aria-hidden="true" className="text-slate-300">/</span>
                    <span className="font-medium text-foreground">{_ToSpace(lesson)}</span>
                </nav>

                <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-8">
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-slate-700" aria-hidden="true" />
                    <div className="relative">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{_ToSpace(track)} lesson</p>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{_ToSpace(lesson)}</h1>
                            </div>
                            {LessonMetaData.category && (
                                <span className="w-fit rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {LessonMetaData.category}
                                </span>
                            )}
                        </div>
                        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 text-sm">
                            <span className="font-medium text-slate-600">{LessonMetaData.lesson.duration}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                LessonMetaData.difficulty === "Beginner" ? "bg-green-100 text-green-700" :
                                LessonMetaData.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                                }`}>
                                {LessonMetaData.difficulty}
                            </span>
                        </div>
                    </div>
                </header>
                <article className="prose prose-gray mt-6 min-w-full rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:no-underline hover:prose-a:underline prose-pre:rounded-xl prose-table:table-auto sm:p-8">
                    <MarkdownKatex content={lessonContent.content}></MarkdownKatex>
                </article>
            </main>
        </div>
    )
}