import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { getActiveRig, initDevicesSchema, updateActiveRig } from "@/lib/devices";

function getDb(): Database.Database {
  const DB_DIR = path.join(process.cwd(), "data");
  const DB_PATH = path.join(DB_DIR, "astro.db");
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  initDevicesSchema(db);
  return db;
}

export async function GET() {
  const db = getDb();
  try {
    return NextResponse.json(getActiveRig(db));
  } finally {
    db.close();
  }
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  try {
    const body = await request.json();
    const rig = updateActiveRig(db, {
      name: body.name,
      mount_id: body.mount_id ?? null,
      camera_id: body.camera_id ?? null,
      telescope_id: body.telescope_id ?? null,
      guider_id: body.guider_id ?? null,
      filter_wheel_id: body.filter_wheel_id ?? null,
      controller_id: body.controller_id ?? null,
      asiair_profile: body.asiair_profile ?? null,
    });
    return NextResponse.json(rig);
  } catch {
    return NextResponse.json({ error: "فشل تحديث الـ Rig" }, { status: 500 });
  } finally {
    db.close();
  }
}
