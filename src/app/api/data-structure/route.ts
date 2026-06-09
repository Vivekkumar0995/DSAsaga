import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DataStructureModel from "@/models/data_structure_model";

export const dynamic = "force-dynamic";

// POST /api/data-structure
// Creates a new data structure document, or updates it if the slug already exists.
// This is used by the Admin UI page (/admin/data-structure).
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const { slug, name, learning_tracks, battle_modes, problems, testimonials, live_activity } = body;

    if (!slug || !name) {
      return NextResponse.json(
        { message: "slug and name are required" },
        { status: 400 }
      );
    }

    // upsert: if slug exists → update it, if not → create it
    const doc = await DataStructureModel.findOneAndUpdate(
      { slug: slug.toLowerCase().trim() },
      {
        slug: slug.toLowerCase().trim(),
        name,
        learning_tracks: learning_tracks ?? [],
        battle_modes:    battle_modes    ?? [],
        problems:        problems        ?? [],
        testimonials:    testimonials    ?? [],
        live_activity:   live_activity   ?? [],
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { message: `Data structure "${doc.slug}" saved successfully`, data: doc },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// GET /api/data-structure
// Returns a list of all data structure slugs currently in the DB.
// Used by the Admin UI to show which ones exist.
export async function GET() {
  try {
    await connectDB();

    const docs = await DataStructureModel.find({}, { slug: 1, name: 1, _id: 0 }).lean();

    return NextResponse.json({ data: docs }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}


