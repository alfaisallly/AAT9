import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import Database from "better-sqlite3";

export interface UserRecord {
  id: number;
  username: string;
  display_name: string;
  role: string;
  active: number;
  created_at: string;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const hashBuf = Buffer.from(hash, "hex");
    const testBuf = scryptSync(password, salt, 64);
    if (hashBuf.length !== testBuf.length) return false;
    return timingSafeEqual(hashBuf, testBuf);
  } catch {
    return false;
  }
}

export function initUsersSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function seedDefaultUsers(database: Database.Database) {
  const count = (
    database.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }
  ).c;
  if (count > 0) return;

  const insert = database.prepare(
    "INSERT INTO users (username, password_hash, display_name, role, active) VALUES (?, ?, ?, ?, 1)"
  );

  insert.run(
    "ahmed.alfaisal",
    hashPassword("AstroLab2026"),
    "Eng. Ahmed alfaisal",
    "owner"
  );

  insert.run(
    "astro",
    hashPassword("Astro2026"),
    "AstroLab User",
    "user"
  );
}

export function findUserForLogin(
  database: Database.Database,
  username: string,
  password: string
): UserRecord | null {
  const row = database
    .prepare(
      "SELECT id, username, display_name, role, active, password_hash, created_at FROM users WHERE username = ? COLLATE NOCASE"
    )
    .get(username.trim().toLowerCase()) as
    | (UserRecord & { password_hash: string })
    | undefined;

  if (!row || !row.active) return null;
  if (!verifyPassword(password, row.password_hash)) return null;

  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    role: row.role,
    active: row.active,
    created_at: row.created_at,
  };
}

export function findUserByUsername(
  database: Database.Database,
  username: string
): UserRecord | null {
  return (
    (database
      .prepare(
        "SELECT id, username, display_name, role, active, created_at FROM users WHERE username = ? COLLATE NOCASE"
      )
      .get(username.toLowerCase()) as UserRecord | undefined) ?? null
  );
}
