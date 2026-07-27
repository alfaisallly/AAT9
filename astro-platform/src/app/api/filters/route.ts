import { NextResponse } from "next/server";
import { getAllFilters } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(getAllFilters());
  } catch {
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
  }
}
