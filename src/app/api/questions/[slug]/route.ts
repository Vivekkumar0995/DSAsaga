import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Question from "@/models/question_model";

type Params = Promise<{
  slug: string;
}>;

export async function GET(req: NextRequest,context: {params: Params}) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const question = await Question.findOne({slug}).lean();
    if (!question) {
      return NextResponse.json({success: false,message: "Question not found"},{ status: 404 });
    }

    const previousQuestion = await Question.findOne({order: question.order - 1,data_structure_id: question.data_structure_id}).select("title slug order").lean();

    const nextQuestion = await Question.findOne({order: question.order + 1,data_structure_id: question.data_structure_id}).select("title slug order").lean();

    return NextResponse.json({success: true,question,previousQuestion,nextQuestion});
  } 
  catch (error) {
    console.error(error);
    return NextResponse.json({success: false,message: "Internal server error",},{ status: 500 });
  }
}
