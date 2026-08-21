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

    const publicTestCases = (question.test_cases || [])
      .filter((tc: any) => !tc.is_hidden)
      .map((tc: any) => ({
        input: tc.input,
        output: tc.output,
        is_hidden: false,
      }));

    const sanitizedQuestion = {
      ...question,
      test_cases: publicTestCases,
    };

    return NextResponse.json({
      success: true,
      question: sanitizedQuestion,
      previousQuestion,
      nextQuestion
    });
  } 
  catch (error) {
    console.error(error);
    return NextResponse.json({success: false,message: "Internal server error",},{ status: 500 });
  }
}
