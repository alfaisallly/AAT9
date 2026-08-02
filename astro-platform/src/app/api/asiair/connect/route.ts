import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { connectAsiair, disconnectAsiair } from "@/lib/asiair-bridge";
import { getAllControllers, initDevicesSchema } from "@/lib/devices";

function getDb(): Database.Database {
  const DB_DIR = path.join(process.cwd(), "data");
  const DB_PATH = path.join(DB_DIR, "astro.db");
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  initDevicesSchema(db);
  return db;
}

export async function POST(request: NextRequest) {
  const db = getDb();
  try {
    const body = await request.json();
    let controllerId = Number(body.controllerId);

    if (!controllerId) {
      const controllers = getAllControllers(db);
      controllerId = controllers[0]?.id;
    }
    if (!controllerId) {
      return NextResponse.json({ error: "لا توجد وحدة ASIAIR" }, { status: 400 });
    }

    const result =
      body.action === "disconnect"
        ? await disconnectAsiair(db, controllerId)
        : await connectAsiair(db, controllerId);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ error: "فشل الاتصال بـ ASIAIR" }, { status: 500 });
  } finally {
    db.close();
  }
}
