import { NextResponse } from "next/server";
import { GUIDE_CHAPTERS } from "@/data/guide-content";

export async function GET() {
  return NextResponse.json(GUIDE_CHAPTERS);
}
