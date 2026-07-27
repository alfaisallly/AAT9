import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  createFilterWheel,
  deleteFilterWheel,
  getAllFilterWheels,
  initDevicesSchema,
} from "@/lib/devices";

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
    return NextResponse.json(getAllFilterWheels(db));
  } finally {
    db.close();
  }
}

export async function POST(request: NextRequest) {
  const db = getDb();
  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }
    const wheel = createFilterWheel(db, body);
    return NextResponse.json(wheel, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل إضافة عجلة الفلاتر" }, { status: 500 });
  } finally {
    db.close();
  }
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  try {
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
    deleteFilterWheel(db, id);
    return NextResponse.json({ success: true });
  } finally {
    db.close();
  }
}
