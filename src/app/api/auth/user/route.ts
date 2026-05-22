import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/jose_auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await decrypt(token);
    return NextResponse.json({ user: user ?? null }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
