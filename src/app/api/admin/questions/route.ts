import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DataStructureModel from "@/models/data_structure_model";
import Question from "@/models/question_model";

// POST /api/admin/questions
// Adds or updates a question inside MongoDB for a selected Data Structure target
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { dataStructureSlug, question } = body;

    if (!dataStructureSlug || !question) {
      return NextResponse.json(
        { success: false, message: "Missing dataStructureSlug or question details" },
        { status: 400 }
      );
    }

    const ds = await DataStructureModel.findOne({ slug: dataStructureSlug });
    if (!ds) {
      return NextResponse.json(
        { success: false, message: "Data Structure Target not found" },
        { status: 404 }
      );
    }

    // Use $set so we never accidentally wipe fields not in this payload
    const updatedQuestion = await Question.findOneAndUpdate(
      { slug: question.slug.toLowerCase().trim() },
      {
        $set: {
          ...question,
          data_structure_id: ds._id,
          slug: question.slug.toLowerCase().trim(),
        },
      },
      { returnDocument: 'after', upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Question uploaded/updated successfully",
      question: updatedQuestion,
    });
  } catch (error: any) {
    console.error("Admin Question upload endpoint failure:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process question" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/questions
// Update only the reference_solution for a question by slug
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { slug, reference_solution } = await req.json();

    if (!slug || reference_solution === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing slug or reference_solution" },
        { status: 400 }
      );
    }

    const updated = await Question.findOneAndUpdate(
      { slug: slug.toLowerCase().trim() },
      { $set: { reference_solution } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Reference solution updated" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update" },
      { status: 500 }
    );
  }
}

