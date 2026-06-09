import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DataStructureModel from "@/models/data_structure_model";

export const dynamic = "force-dynamic";

// GET /api/data-structure/[slug]
// Returns the full content document for a given data structure slug (e.g. "array")
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    const doc = await DataStructureModel.findOne({ slug: slug.toLowerCase() }).lean();

    if (!doc) {
      return NextResponse.json(
        { message: `Data structure "${slug}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: doc }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}


