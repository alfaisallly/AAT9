import { NextResponse } from "next/server";
import { getSoftwareList } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getSoftwareList());
}
