import { NextResponse } from "next/server";
import { buildDeviceStatus } from "@/lib/devices";
import { getDatabase } from "@/lib/db";

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(buildDeviceStatus(db));
}
