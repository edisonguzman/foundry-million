import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "FoundryMillion API is active" });
}