import { quiz_question } from "@/types/data_structure"
import mongoose, { Types } from "mongoose"

export type LessonMeta = {
    difficulty: string,
    category: string,
    lesson : {
        duration: string,
        contentRef: Types.ObjectId,
        quiz_questions: [quiz_question]
    }
}

const lessonContentSchema = new mongoose.Schema(
    {
        content: { type: String, required: true }
    }
)

export type LessonContentType = mongoose.InferSchemaType<typeof lessonContentSchema> & {
    _id: mongoose.Types.ObjectId;
};
const LessonContentModel = mongoose.models.lesson_content || mongoose.model("lesson_content", lessonContentSchema);

export default LessonContentModel