import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Signup route is working" }, { status: 200 });
}