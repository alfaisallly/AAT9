import { NextResponse } from "next/server";
import { getGuiders } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getGuiders());
}
