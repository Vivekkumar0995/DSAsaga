import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Login route is working" }, { status: 200 });
}