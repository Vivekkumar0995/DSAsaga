import { NextRequest, NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import { validateSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    await dbconnect();
    const valid = await validateSession(sessionId);

    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
