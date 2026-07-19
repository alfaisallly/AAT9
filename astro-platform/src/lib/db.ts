import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { migrateAndSeed, getAllGuiders, getAllSoftware } from "@/lib/seed";
import {
  findUserByUsername,
  findUserForLogin,
  initUsersSchema,
  seedDefaultUsers,
  UserRecord,
} from "@/lib/users";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "astro.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
    initUsersSchema(db);
    migrateAndSeed(db);
    seedDefaultUsers(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS mounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      mount_type TEXT NOT NULL DEFAULT 'equatorial',
      max_payload_kg REAL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cameras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      sensor_type TEXT NOT NULL DEFAULT 'CMOS',
      pixel_size_um REAL,
      resolution TEXT,
      has_cooling INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS telescopes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      focal_length_mm REAL,
      aperture_mm REAL,
      telescope_type TEXT NOT NULL DEFAULT 'refractor',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS filters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      filter_type TEXT NOT NULL DEFAULT 'broadband',
      bandwidth_nm REAL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      designation TEXT,
      target_type TEXT NOT NULL DEFAULT 'other',
      ra TEXT,
      dec TEXT,
      constellation TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      session_date TEXT NOT NULL,
      location TEXT,
      mount_id INTEGER REFERENCES mounts(id) ON DELETE SET NULL,
      camera_id INTEGER REFERENCES cameras(id) ON DELETE SET NULL,
      telescope_id INTEGER REFERENCES telescopes(id) ON DELETE SET NULL,
      weather TEXT,
      seeing TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      target_id INTEGER REFERENCES targets(id) ON DELETE SET NULL,
      filter_id INTEGER REFERENCES filters(id) ON DELETE SET NULL,
      frame_type TEXT NOT NULL DEFAULT 'light',
      filename TEXT NOT NULL,
      file_path TEXT,
      exposure_sec REAL,
      gain INTEGER,
      offset INTEGER,
      temperature_c REAL,
      date_taken TEXT,
      processed INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function authenticateUser(
  username: string,
  password: string
): UserRecord | null {
  return findUserForLogin(getDb(), username, password);
}

export function getUserByUsername(username: string): UserRecord | null {
  return findUserByUsername(getDb(), username);
}

export function getDashboardStats() {
  const database = getDb();
  const mounts = (
    database.prepare("SELECT COUNT(*) as c FROM mounts").get() as { c: number }
  ).c;
  const cameras = (
    database.prepare("SELECT COUNT(*) as c FROM cameras").get() as { c: number }
  ).c;
  const telescopes = (
    database.prepare("SELECT COUNT(*) as c FROM telescopes").get() as {
      c: number;
    }
  ).c;
  const sessions = (
    database.prepare("SELECT COUNT(*) as c FROM sessions").get() as { c: number }
  ).c;
  const images = (
    database.prepare("SELECT COUNT(*) as c FROM images").get() as { c: number }
  ).c;
  const lightFrames = (
    database
      .prepare("SELECT COUNT(*) as c FROM images WHERE frame_type = 'light'")
      .get() as { c: number }
  ).c;
  const calibrationFrames = (
    database
      .prepare(
        "SELECT COUNT(*) as c FROM images WHERE frame_type IN ('dark','flat','bias')"
      )
      .get() as { c: number }
  ).c;
  const targets = (
    database.prepare("SELECT COUNT(*) as c FROM targets").get() as { c: number }
  ).c;

  return {
    mounts,
    cameras,
    telescopes,
    sessions,
    images,
    lightFrames,
    calibrationFrames,
    targets,
  };
}

export function getAllMounts() {
  return getDb()
    .prepare("SELECT * FROM mounts ORDER BY created_at DESC")
    .all();
}

export function createMount(data: {
  name: string;
  brand?: string;
  model?: string;
  mount_type?: string;
  max_payload_kg?: number | null;
  notes?: string | null;
}) {
  const result = getDb()
    .prepare(
      "INSERT INTO mounts (name, brand, model, mount_type, max_payload_kg, notes) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.name,
      data.brand ?? "",
      data.model ?? "",
      data.mount_type ?? "equatorial",
      data.max_payload_kg ?? null,
      data.notes ?? null
    );
  return getDb()
    .prepare("SELECT * FROM mounts WHERE id = ?")
    .get(result.lastInsertRowid);
}

export function deleteMount(id: number) {
  getDb().prepare("DELETE FROM mounts WHERE id = ?").run(id);
}

export function getAllCameras() {
  return getDb()
    .prepare("SELECT * FROM cameras ORDER BY created_at DESC")
    .all();
}

export function createCamera(data: {
  name: string;
  brand?: string;
  model?: string;
  sensor_type?: string;
  pixel_size_um?: number | null;
  resolution?: string | null;
  has_cooling?: boolean;
  notes?: string | null;
}) {
  const result = getDb()
    .prepare(
      "INSERT INTO cameras (name, brand, model, sensor_type, pixel_size_um, resolution, has_cooling, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.name,
      data.brand ?? "",
      data.model ?? "",
      data.sensor_type ?? "CMOS",
      data.pixel_size_um ?? null,
      data.resolution ?? null,
      data.has_cooling ? 1 : 0,
      data.notes ?? null
    );
  return getDb()
    .prepare("SELECT * FROM cameras WHERE id = ?")
    .get(result.lastInsertRowid);
}

export function deleteCamera(id: number) {
  getDb().prepare("DELETE FROM cameras WHERE id = ?").run(id);
}

export function getAllTelescopes() {
  return getDb()
    .prepare("SELECT * FROM telescopes ORDER BY created_at DESC")
    .all();
}

export function createTelescope(data: {
  name: string;
  brand?: string;
  model?: string;
  focal_length_mm?: number | null;
  aperture_mm?: number | null;
  telescope_type?: string;
  notes?: string | null;
}) {
  const result = getDb()
    .prepare(
      "INSERT INTO telescopes (name, brand, model, focal_length_mm, aperture_mm, telescope_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.name,
      data.brand ?? "",
      data.model ?? "",
      data.focal_length_mm ?? null,
      data.aperture_mm ?? null,
      data.telescope_type ?? "refractor",
      data.notes ?? null
    );
  return getDb()
    .prepare("SELECT * FROM telescopes WHERE id = ?")
    .get(result.lastInsertRowid);
}

export function deleteTelescope(id: number) {
  getDb().prepare("DELETE FROM telescopes WHERE id = ?").run(id);
}

export function getAllFilters() {
  return getDb().prepare("SELECT * FROM filters ORDER BY name").all();
}

export function getGuiders() {
  return getAllGuiders(getDb());
}

export function getSoftwareList() {
  return getAllSoftware(getDb());
}

export function getAllTargets() {
  return getDb().prepare("SELECT * FROM targets ORDER BY name").all();
}

export function createTarget(data: {
  name: string;
  designation?: string | null;
  target_type?: string;
  ra?: string | null;
  dec?: string | null;
  constellation?: string | null;
  notes?: string | null;
}) {
  const result = getDb()
    .prepare(
      "INSERT INTO targets (name, designation, target_type, ra, dec, constellation, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.name,
      data.designation ?? null,
      data.target_type ?? "other",
      data.ra ?? null,
      data.dec ?? null,
      data.constellation ?? null,
      data.notes ?? null
    );
  return getDb()
    .prepare("SELECT * FROM targets WHERE id = ?")
    .get(result.lastInsertRowid);
}

export function deleteTarget(id: number) {
  getDb().prepare("DELETE FROM targets WHERE id = ?").run(id);
}

export function getAllSessions() {
  return getDb()
    .prepare(
      `SELECT s.*,
        m.name as mount_name,
        c.name as camera_name,
        t.name as telescope_name,
        (SELECT COUNT(*) FROM images i WHERE i.session_id = s.id) as image_count
      FROM sessions s
      LEFT JOIN mounts m ON s.mount_id = m.id
      LEFT JOIN cameras c ON s.camera_id = c.id
      LEFT JOIN telescopes t ON s.telescope_id = t.id
      ORDER BY s.session_date DESC`
    )
    .all();
}

export function createSession(data: {
  name: string;
  session_date: string;
  location?: string | null;
  mount_id?: number | null;
  camera_id?: number | null;
  telescope_id?: number | null;
  weather?: string | null;
  seeing?: string | null;
  notes?: string | null;
}) {
  const result = getDb()
    .prepare(
      "INSERT INTO sessions (name, session_date, location, mount_id, camera_id, telescope_id, weather, seeing, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.name,
      data.session_date,
      data.location ?? null,
      data.mount_id ?? null,
      data.camera_id ?? null,
      data.telescope_id ?? null,
      data.weather ?? null,
      data.seeing ?? null,
      data.notes ?? null
    );
  return getDb()
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .get(result.lastInsertRowid);
}

export function deleteSession(id: number) {
  getDb().prepare("DELETE FROM sessions WHERE id = ?").run(id);
}

export function getAllImages(filters?: {
  session_id?: number;
  frame_type?: string;
  target_id?: number;
}) {
  let query = `
    SELECT i.*,
      tg.name as target_name,
      f.name as filter_name,
      s.name as session_name
    FROM images i
    LEFT JOIN targets tg ON i.target_id = tg.id
    LEFT JOIN filters f ON i.filter_id = f.id
    LEFT JOIN sessions s ON i.session_id = s.id
    WHERE 1=1
  `;
  const params: (number | string)[] = [];

  if (filters?.session_id) {
    query += " AND i.session_id = ?";
    params.push(filters.session_id);
  }
  if (filters?.frame_type) {
    query += " AND i.frame_type = ?";
    params.push(filters.frame_type);
  }
  if (filters?.target_id) {
    query += " AND i.target_id = ?";
    params.push(filters.target_id);
  }

  query += " ORDER BY i.date_taken DESC, i.created_at DESC";
  return getDb()
    .prepare(query)
    .all(...params);
}

export function createImage(data: {
  session_id: number;
  target_id?: number | null;
  filter_id?: number | null;
  frame_type?: string;
  filename: string;
  file_path?: string | null;
  exposure_sec?: number | null;
  gain?: number | null;
  offset?: number | null;
  temperature_c?: number | null;
  date_taken?: string | null;
  processed?: boolean;
  notes?: string | null;
}) {
  const result = getDb()
    .prepare(
      `INSERT INTO images (session_id, target_id, filter_id, frame_type, filename, file_path, exposure_sec, gain, offset, temperature_c, date_taken, processed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.session_id,
      data.target_id ?? null,
      data.filter_id ?? null,
      data.frame_type ?? "light",
      data.filename,
      data.file_path ?? null,
      data.exposure_sec ?? null,
      data.gain ?? null,
      data.offset ?? null,
      data.temperature_c ?? null,
      data.date_taken ?? null,
      data.processed ? 1 : 0,
      data.notes ?? null
    );
  return getDb()
    .prepare("SELECT * FROM images WHERE id = ?")
    .get(result.lastInsertRowid);
}

export function deleteImage(id: number) {
  getDb().prepare("DELETE FROM images WHERE id = ?").run(id);
}

export function toggleImageProcessed(id: number) {
  getDb()
    .prepare(
      "UPDATE images SET processed = CASE WHEN processed = 1 THEN 0 ELSE 1 END WHERE id = ?"
    )
    .run(id);
  return getDb().prepare("SELECT * FROM images WHERE id = ?").get(id);
}
