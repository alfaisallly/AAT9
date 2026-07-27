import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { getLatestTelemetry, initDevicesSchema } from "@/lib/devices";

function getDb(): Database.Database {
  const DB_DIR = path.join(process.cwd(), "data");
  const DB_PATH = path.join(DB_DIR, "astro.db");
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  initDevicesSchema(db);
  return db;
}

export async function GET(request: NextRequest) {
  const db = getDb();
  try {
    const deviceType = request.nextUrl.searchParams.get("device_type") ?? "controller";
    const deviceId = Number(request.nextUrl.searchParams.get("device_id") ?? "1");
    const metric = request.nextUrl.searchParams.get("metric") ?? "battery_voltage";
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "60");

    const rows = getLatestTelemetry(db, deviceType, deviceId, metric, limit);
    return NextResponse.json({ deviceType, deviceId, metric, readings: rows.reverse() });
  } finally {
    db.close();
  }
}
