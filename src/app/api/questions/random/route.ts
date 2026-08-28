import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Question from '@/models/question_model';

export async function GET() {
  try {
    await connectDB();

    // Fetch questions randomly from MongoDB database
    let questions = await Question.aggregate([
      { $sample: { size: 4 } }
    ]);

    // If fewer than 4 questions returned, fallback to standard Question.find()
    if (!questions || questions.length === 0) {
      questions = await Question.find().limit(4).lean();
    }

    // Ensure we return up to 4 questions
    return NextResponse.json({
      success: true,
      questions: questions || []
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching random battle questions:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}
