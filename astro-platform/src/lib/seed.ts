import Database from "better-sqlite3";
import { TARGET_CATALOG } from "@/data/targets-catalog";
import {
  CAMERAS,
  FILTERS,
  GUIDE_CAMERA,
  GUIDE_SCOPE,
  MOUNTS,
  SOFTWARE,
  TELESCOPE_CONFIGS,
} from "@/data/equipment-catalog";

export const SEED_VERSION = "2";

export function migrateAndSeed(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS guiders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      pixel_size_um REAL,
      resolution TEXT,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS software (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      notes TEXT
    );
  `);

  const current = database
    .prepare("SELECT value FROM meta WHERE key = 'seed_version'")
    .get() as { value: string } | undefined;

  if (current?.value === SEED_VERSION) return;

  database.exec(`
    DELETE FROM images;
    DELETE FROM sessions;
    DELETE FROM targets;
    DELETE FROM filters;
    DELETE FROM telescopes;
    DELETE FROM cameras;
    DELETE FROM mounts;
    DELETE FROM guiders;
    DELETE FROM software;
  `);

  const insertMount = database.prepare(
    "INSERT INTO mounts (name, brand, model, mount_type, max_payload_kg, notes) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const m of MOUNTS) {
    insertMount.run(
      m.name,
      m.brand,
      m.model,
      m.mountType,
      m.maxPayloadKg,
      m.notes
    );
  }

  const insertCamera = database.prepare(
    "INSERT INTO cameras (name, brand, model, sensor_type, pixel_size_um, resolution, has_cooling, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  for (const c of CAMERAS) {
    insertCamera.run(
      c.name,
      c.brand,
      c.model,
      "CMOS Mono",
      c.pixelSizeUm,
      `${c.widthPx}x${c.heightPx}`,
      c.cooling ? 1 : 0,
      c.bestFor.join(", ")
    );
  }

  const insertTelescope = database.prepare(
    "INSERT INTO telescopes (name, brand, model, focal_length_mm, aperture_mm, telescope_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const t of TELESCOPE_CONFIGS) {
    insertTelescope.run(
      `${t.name} (${t.configName})`,
      t.brand,
      t.configName,
      t.focalLengthMm,
      t.apertureMm,
      t.telescopeType,
      `${t.bestTargets.join(" | ")} | ASIAIR: ${t.asiairProfile}`
    );
  }

  const insertFilter = database.prepare(
    "INSERT INTO filters (name, filter_type, bandwidth_nm, notes) VALUES (?, ?, ?, ?)"
  );
  for (const f of FILTERS) {
    insertFilter.run(f.name, f.filterType, f.bandwidthNm, f.set);
  }

  const insertGuider = database.prepare(
    "INSERT INTO guiders (name, brand, model, pixel_size_um, resolution, notes) VALUES (?, ?, ?, ?, ?, ?)"
  );
  insertGuider.run(
    GUIDE_CAMERA.name,
    GUIDE_CAMERA.brand,
    GUIDE_CAMERA.model,
    GUIDE_CAMERA.pixelSizeUm,
    `${GUIDE_CAMERA.widthPx}x${GUIDE_CAMERA.heightPx}`,
    `Guide Scope: ${GUIDE_SCOPE.name} (${GUIDE_SCOPE.focalLengthMm}mm)`
  );

  const insertSoftware = database.prepare(
    "INSERT INTO software (name, category, notes) VALUES (?, ?, ?)"
  );
  for (const s of SOFTWARE) {
    insertSoftware.run(s.name, s.category, s.role);
  }

  const insertTarget = database.prepare(
    "INSERT INTO targets (name, designation, target_type, ra, dec, constellation, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const t of TARGET_CATALOG) {
    const notes = [
      `أشهر: ${t.bestMonths.join(",")}`,
      `وقت: ${t.bestTime}`,
      `تلسكوب: ${t.bestTelescope}`,
      `كاميرا: ${t.bestCamera}`,
      `فلتر: ${t.bestFilter}`,
      `تعريض: ${t.exposure}`,
      t.notes,
    ]
      .filter(Boolean)
      .join(" | ");
    insertTarget.run(
      t.name,
      t.designation,
      t.targetType,
      t.ra != null ? String(t.ra) : null,
      t.dec != null ? String(t.dec) : null,
      t.constellation,
      notes
    );
  }

  const insertSession = database.prepare(
    "INSERT INTO sessions (name, session_date, location, mount_id, camera_id, telescope_id, weather, seeing, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  insertSession.run(
    "ليلة Orion — M42",
    "2026-01-15",
    "العراق — صحراء",
    1,
    1,
    4,
    "صافٍ",
    "2/5",
    "Askar V80 + ASI2600MM + Ha/OIII"
  );
  insertSession.run(
    "M31 Widefield",
    "2026-10-20",
    "العراق",
    2,
    1,
    9,
    "صافٍ",
    "3/5",
    "MiniCat 51 + L-Pro"
  );

  const getTargetId = (designation: string) => {
    const row = database
      .prepare("SELECT id FROM targets WHERE designation = ?")
      .get(designation) as { id: number } | undefined;
    return row?.id ?? null;
  };

  const insertImage = database.prepare(
    "INSERT INTO images (session_id, target_id, filter_id, frame_type, filename, file_path, exposure_sec, gain, offset, temperature_c, date_taken, processed, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  insertImage.run(
    1, getTargetId("M42"), 5, "light", "M42_Ha_600s_001.fits", "/data/2026-01-15/M42", 600, 120, 30, -10, "2026-01-15T21:00:00", 0, "Ha 7nm"
  );
  insertImage.run(
    1, getTargetId("M42"), 6, "light", "M42_OIII_600s_001.fits", "/data/2026-01-15/M42", 600, 120, 30, -10, "2026-01-15T21:30:00", 0, "OIII"
  );
  insertImage.run(
    1, null, null, "dark", "dark_600s_001.fits", "/data/2026-01-15/cal", 600, 120, 30, -10, "2026-01-15T23:00:00", 0, "Dark"
  );
  insertImage.run(
    2, getTargetId("M31"), 8, "light", "M31_L_180s_001.fits", "/data/2026-10-20/M31", 180, 100, 50, -10, "2026-10-20T22:00:00", 1, "Antlia L"
  );

  database
    .prepare(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('seed_version', ?)"
    )
    .run(SEED_VERSION);
}

export function getAllGuiders(database: Database.Database) {
  return database.prepare("SELECT * FROM guiders ORDER BY name").all();
}

export function getAllSoftware(database: Database.Database) {
  return database.prepare("SELECT * FROM software ORDER BY name").all();
}
