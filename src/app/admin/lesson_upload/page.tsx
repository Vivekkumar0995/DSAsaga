"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { learning_track } from "@/types/data_structure"
import toast from "react-hot-toast"


export default function LessonUpload()
{
    const [selectedDS, setSelectedDS] = useState<string>("")
    const [selectedDSIdx, setSelectedDSIdx] = useState<number>(0)
    const [selectedTrack, setSelectedTrack] = useState<string>("")
    const [selectedTrackIdx, setSelectedTrackIdx] = useState<number>(0)
    const [selectedLesson, setSelectedLesson] = useState<string>("")
    const [dataStructures, setDataStructures] = useState<
    {
        slug: string,
        name: string,
        learning_tracks: {
            title: string,
            lessons: {
                title: string
            }[]
        }[]
    }[]>([])
    const [content, setContent] = useState<string>("")

    useEffect(() => {
        axios.get("/api/data-structure", {
            params: {
                learn: "1"
            }
        })
        .then(res => {
            setDataStructures(res.data.data)
            setSelectedDS(res.data.data?.[0]?.slug)
            setSelectedDSIdx(0)
            setSelectedTrack(res.data.data?.[0]?.learning_tracks?.[0]?.title)
            setSelectedTrackIdx(0)
            setSelectedLesson(res.data.data?.[0]?.learning_tracks?.[0]?.lessons?.[0]?.title)
        })
        .catch(() => {})
    }, [])

    const handleSubmit = async () => {
        const loadingToast = toast.loading("Uploading to Database...")
        try {
            const response = await axios.post("/api/admin/lesson", 
                JSON.stringify({
                    selectedDS,
                    selectedTrack,
                    selectedLesson,
                    content
                })
            )
            if (response.data.success)
                toast.success("Uploaded successfully", { id: loadingToast })
            else
                toast.error("Failed to upload, please see console for more info", { id: loadingToast })
        }
        catch (error: any) {
            toast.error(error instanceof Error ? error.message : String(error), { id: loadingToast })
        }
    }

    return (
        <div className="min-h-screen">
            <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                <div className="flex align-middle justify-between">
                    <div className="flex gap-1 align-middle">
                        <p>Select DS:</p>
                        <select value={selectedDS} className="border-2 border-black px-1" onChange={e => {
                            const nextDS = e.target.value
                            const nextDSIdx = e.target.selectedIndex
                            const nextTrack = dataStructures?.[nextDSIdx]?.learning_tracks?.[0]?.title ?? ""
                            const nextLesson = dataStructures?.[nextDSIdx]?.learning_tracks?.[0]?.lessons?.[0]?.title ?? ""

                            setSelectedDS(nextDS)
                            setSelectedDSIdx(nextDSIdx)
                            setSelectedTrack(nextTrack)
                            setSelectedTrackIdx(0)
                            setSelectedLesson(nextLesson)
                        }}>
                            {
                                dataStructures && dataStructures.map((element) => 
                                    (
                                        <option key={element.name} value={element.slug}>{element.name}</option>
                                    )
                                )
                            }
                        </select>
                    </div>
                    <div className="flex gap-1 align-middle">
                        <p>Select Track:</p>
                        <select value={selectedTrack} className="border-2 border-black px-1" onChange={e => {
                            const nextTrack = e.target.value
                            const nextTrackIdx = e.target.selectedIndex
                            const nextLesson = dataStructures?.[selectedDSIdx]?.learning_tracks?.[nextTrackIdx]?.lessons?.[0]?.title ?? ""

                            setSelectedTrack(nextTrack)
                            setSelectedTrackIdx(nextTrackIdx)
                            setSelectedLesson(nextLesson)
                        }}>
                            {
                                dataStructures?.[selectedDSIdx]?.learning_tracks.map(element => 
                                    (
                                        <option key={element.title} value={element.title}>{element.title}</option>
                                    )
                                )
                            }
                        </select>
                    </div>
                    <div className="flex gap-1 align-middle">
                        <p>Select Lesson:</p>
                        <select value={selectedLesson} className="border-2 border-black px-1" onChange={e => setSelectedLesson(e.target.value)}>
                            {
                                dataStructures?.[selectedDSIdx]?.learning_tracks?.[selectedTrackIdx]?.lessons.map(element =>
                                    (
                                        <option key={element.title} value={element.title}>{element.title}</option>
                                    )
                                )
                            }
                        </select>
                    </div>
                </div>
                <div>
                    <p>Content (Markdown):</p>
                    <textarea value={content} className="border-black border-2 h-32 w-full p-2" rows={8} onChange={(e) => setContent(e.target.value)}/>
                    {/* <p>Quiz (Markdown):</p>
                    <textarea value={content} className="border-black border-2 h-32 w-full p-2" rows={8} onChange={(e) => setContent(e.target.value)}/> */}
                </div>
                <button className="bg-blue-500 hover:bg-blue-400 cursor-pointer text-white rounded-2xl mt-2 p-2" onClick={handleSubmit}>Upload</button>
                <div>
                    slug: {selectedDS} <br/>
                    track: {selectedTrack} <br/>
                    lesson: {selectedLesson}
                </div>
            </div>
        </div>
    )
}