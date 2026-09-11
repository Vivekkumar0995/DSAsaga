import DataStructureModel from "@/models/data_structure_model";
import LessonContentModel from "@/models/lesson_content_model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest)
{
    const body = await req.json();
    const { selectedDS, selectedTrack, selectedLesson, content } = body;

    try {
        const normalizedDS = selectedDS.toLowerCase().trim();
        
        const oldLesson = await DataStructureModel.aggregate([
            // 1. Find the main document
            { $match: { slug: normalizedDS } },
            
            // 2. Flatten the tracks array
            { $unwind: "$learning_tracks" },
            { $match: { "learning_tracks.title": selectedTrack } },
            
            // 3. Flatten the lessons array
            { $unwind: "$learning_tracks.lessons" },
            { $match: { "learning_tracks.lessons.title": selectedLesson } },
            
            // 4. Shape the final output to just give you the lesson details
            { 
                $project: { 
                _id: 0, 
                contentRef: "$learning_tracks.lessons.contentRef",
                } 
            }
        ]);

        if (oldLesson[0] && oldLesson[0].contentRef)
        {
            const oldLessonContent = await LessonContentModel.findOne(
                { _id: oldLesson[0].contentRef }
            )
            if (oldLessonContent) {
                oldLessonContent.content = JSON.stringify(content)
                await oldLessonContent.save()
                return NextResponse.json({ success: true }, { status: 200 })
            }
        }
        
        const lessonContent = await LessonContentModel.create({
            content: JSON.stringify(content)
        })
        
        // console.log("Attempting to update with:", {
        //     slug: normalizedDS,
        //     track: selectedTrack,
        //     lesson: selectedLesson,
        //     newRefId: lessonContent._id
        // })

        const updatedDS = await DataStructureModel.findOneAndUpdate(
            {
                slug: normalizedDS,
            }, 
            {
                $set: { "learning_tracks.$[track].lessons.$[lesson].contentRef": lessonContent._id }
            },
            {
                returnDocument: 'after',
                timestamps: false,
                arrayFilters: [
                    { "track.title": selectedTrack },
                    { "lesson.title": selectedLesson }
                ]
            }
        )
                    
        if (!updatedDS) {
            console.error("Failed to update data structure with lesson ref")
            return NextResponse.json({ success: false, error: "Failed to update lesson reference" }, { status: 500 })
        }
        return NextResponse.json({ success: true }, { status: 200 })
    }
    catch (e) {
        console.log(e)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}