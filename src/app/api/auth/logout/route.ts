import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/jose_auth";
import { deleteSession } from "@/lib/session";
import dbconnect from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await dbconnect();

    const token = req.cookies.get("token")?.value;
    if (token) {
      const payload = await decrypt(token);
      const sessionId = payload?.sessionId as string | undefined;
      if (sessionId) {
        await deleteSession(sessionId);
      }
    }

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
