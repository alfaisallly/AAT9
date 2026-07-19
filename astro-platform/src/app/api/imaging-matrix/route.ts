import { NextResponse } from "next/server";
import { getAllImagingMetrics } from "@/data/imaging-matrix";

export async function GET() {
  return NextResponse.json(getAllImagingMetrics());
}
