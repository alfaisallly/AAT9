import Database from "better-sqlite3";

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "offline";
export type DeviceKind =
  | "mount"
  | "camera"
  | "telescope"
  | "guider"
  | "filter_wheel"
  | "controller"
  | "custom";

export interface Controller {
  id: number;
  name: string;
  brand: string;
  model: string;
  ip_address: string | null;
  wifi_ssid: string | null;
  connection_status: ConnectionStatus;
  battery_pct: number;
  battery_voltage: number;
  is_charging: number;
  last_sync_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface FilterWheel {
  id: number;
  name: string;
  brand: string;
  model: string;
  slots: number;
  current_slot: number;
  current_filter: string | null;
  connection_status: ConnectionStatus;
  controller_id: number | null;
  notes: string | null;
  created_at: string;
}

export interface CustomEquipment {
  id: number;
  name: string;
  category: string;
  brand: string;
  model: string;
  specs_json: string | null;
  connection_status: ConnectionStatus;
  notes: string | null;
  created_at: string;
}

export interface ActiveRig {
  id: number;
  name: string;
  mount_id: number | null;
  camera_id: number | null;
  telescope_id: number | null;
  guider_id: number | null;
  filter_wheel_id: number | null;
  controller_id: number | null;
  asiair_profile: string | null;
  updated_at: string;
  mount_name?: string | null;
  camera_name?: string | null;
  telescope_name?: string | null;
  guider_name?: string | null;
  filter_wheel_name?: string | null;
  controller_name?: string | null;
}

export interface DeviceStripItem {
  id: string;
  kind: DeviceKind;
  name: string;
  type: string;
  status: "online" | "offline" | "idle";
  detail?: string;
}

export interface BatteryState {
  voltage: number;
  percent: number;
  isCharging: boolean;
  status: "full" | "good" | "low" | "critical";
  controllerId: number | null;
  controllerName: string | null;
  lastSyncAt: string | null;
}

export interface DeviceStatusPayload {
  connected: boolean;
  rig: ActiveRig | null;
  controller: Controller | null;
  battery: BatteryState;
  strip: DeviceStripItem[];
  cameraTempC: number | null;
  mountState: string;
  guideRms: string | null;
}

export function initDevicesSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS controllers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT 'ZWO',
      model TEXT NOT NULL DEFAULT '',
      ip_address TEXT,
      wifi_ssid TEXT,
      connection_status TEXT NOT NULL DEFAULT 'disconnected',
      battery_pct REAL NOT NULL DEFAULT 100,
      battery_voltage REAL NOT NULL DEFAULT 12.6,
      is_charging INTEGER NOT NULL DEFAULT 0,
      last_sync_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS filter_wheels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT 'ZWO',
      model TEXT NOT NULL DEFAULT '',
      slots INTEGER NOT NULL DEFAULT 7,
      current_slot INTEGER NOT NULL DEFAULT 1,
      current_filter TEXT,
      connection_status TEXT NOT NULL DEFAULT 'offline',
      controller_id INTEGER REFERENCES controllers(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      brand TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      specs_json TEXT,
      connection_status TEXT NOT NULL DEFAULT 'offline',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS active_rig (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT 'Rig 1',
      mount_id INTEGER REFERENCES mounts(id) ON DELETE SET NULL,
      camera_id INTEGER REFERENCES cameras(id) ON DELETE SET NULL,
      telescope_id INTEGER REFERENCES telescopes(id) ON DELETE SET NULL,
      guider_id INTEGER REFERENCES guiders(id) ON DELETE SET NULL,
      filter_wheel_id INTEGER REFERENCES filter_wheels(id) ON DELETE SET NULL,
      controller_id INTEGER REFERENCES controllers(id) ON DELETE SET NULL,
      asiair_profile TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS device_telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_type TEXT NOT NULL,
      device_id INTEGER NOT NULL,
      metric TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedDevicesIfEmpty(database);
}

function seedDevicesIfEmpty(database: Database.Database) {
  const controllerCount = (
    database.prepare("SELECT COUNT(*) as c FROM controllers").get() as { c: number }
  ).c;
  if (controllerCount > 0) return;

  const controller = database
    .prepare(
      `INSERT INTO controllers (name, brand, model, ip_address, wifi_ssid, connection_status, battery_pct, battery_voltage, is_charging, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "ASIAIR Plus",
      "ZWO",
      "ASIAIR Plus",
      "192.168.1.100",
      "ASIAIR-Plus-AP",
      "disconnected",
      87,
      12.18,
      0,
      "وحدة تحكم ASIAIR — WiFi + بطارية مدمجة"
    );

  database
    .prepare(
      `INSERT INTO filter_wheels (name, brand, model, slots, current_slot, current_filter, connection_status, controller_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "ZWO 7× Filter Wheel",
      "ZWO",
      "EFW 7×2",
      7,
      3,
      "Ha",
      "offline",
      controller.lastInsertRowid,
      "LRGB + Ha + OIII + SII"
    );

  const mount = database
    .prepare("SELECT id FROM mounts WHERE model LIKE '%EQ350%' LIMIT 1")
    .get() as { id: number } | undefined;
  const mainCamera = database
    .prepare("SELECT id FROM cameras WHERE model LIKE '%2600%' LIMIT 1")
    .get() as { id: number } | undefined;
  const telescope = database
    .prepare("SELECT id FROM telescopes WHERE name LIKE '%SCA260%' LIMIT 1")
    .get() as { id: number } | undefined;
  const guider = database
    .prepare("SELECT id FROM guiders LIMIT 1")
    .get() as { id: number } | undefined;

  database
    .prepare(
      `INSERT OR IGNORE INTO active_rig (id, name, mount_id, camera_id, telescope_id, guider_id, filter_wheel_id, controller_id, asiair_profile)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "Rig Ahmed — EQ350 + ASI2600",
      mount?.id ?? null,
      mainCamera?.id ?? null,
      telescope?.id ?? null,
      guider?.id ?? null,
      1,
      controller.lastInsertRowid,
      "sca260_2600"
    );
}

export function batteryStatusFromVoltage(voltage: number, pct: number): BatteryState["status"] {
  if (pct >= 90 || voltage >= 12.4) return "full";
  if (pct >= 40 || voltage >= 11.6) return "good";
  if (pct >= 20 || voltage >= 11.1) return "low";
  return "critical";
}

export function getAllControllers(database: Database.Database) {
  return database
    .prepare("SELECT * FROM controllers ORDER BY created_at DESC")
    .all() as Controller[];
}

export function createController(
  database: Database.Database,
  data: {
    name: string;
    brand?: string;
    model?: string;
    ip_address?: string | null;
    wifi_ssid?: string | null;
    notes?: string | null;
  }
) {
  const result = database
    .prepare(
      `INSERT INTO controllers (name, brand, model, ip_address, wifi_ssid, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.name,
      data.brand ?? "ZWO",
      data.model ?? "",
      data.ip_address ?? null,
      data.wifi_ssid ?? null,
      data.notes ?? null
    );
  return database
    .prepare("SELECT * FROM controllers WHERE id = ?")
    .get(result.lastInsertRowid) as Controller;
}

export function updateController(
  database: Database.Database,
  id: number,
  data: Partial<{
    name: string;
    brand: string;
    model: string;
    ip_address: string | null;
    wifi_ssid: string | null;
    connection_status: ConnectionStatus;
    battery_pct: number;
    battery_voltage: number;
    is_charging: number;
    last_sync_at: string;
    notes: string | null;
  }>
) {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value as string | number | null);
  }
  if (fields.length === 0) return getController(database, id);
  values.push(id);
  database
    .prepare(`UPDATE controllers SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
  return getController(database, id);
}

export function deleteController(database: Database.Database, id: number) {
  database.prepare("DELETE FROM controllers WHERE id = ?").run(id);
}

export function getController(database: Database.Database, id: number) {
  return (
    (database.prepare("SELECT * FROM controllers WHERE id = ?").get(id) as
      | Controller
      | undefined) ?? null
  );
}

export function getAllFilterWheels(database: Database.Database) {
  return database
    .prepare("SELECT * FROM filter_wheels ORDER BY created_at DESC")
    .all() as FilterWheel[];
}

export function createFilterWheel(
  database: Database.Database,
  data: {
    name: string;
    brand?: string;
    model?: string;
    slots?: number;
    current_filter?: string | null;
    controller_id?: number | null;
    notes?: string | null;
  }
) {
  const result = database
    .prepare(
      `INSERT INTO filter_wheels (name, brand, model, slots, current_filter, controller_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.name,
      data.brand ?? "ZWO",
      data.model ?? "",
      data.slots ?? 7,
      data.current_filter ?? null,
      data.controller_id ?? null,
      data.notes ?? null
    );
  return database
    .prepare("SELECT * FROM filter_wheels WHERE id = ?")
    .get(result.lastInsertRowid) as FilterWheel;
}

export function updateFilterWheel(
  database: Database.Database,
  id: number,
  data: Partial<{
    name: string;
    brand: string;
    model: string;
    slots: number;
    current_slot: number;
    current_filter: string | null;
    connection_status: ConnectionStatus;
    controller_id: number | null;
    notes: string | null;
  }>
) {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value as string | number | null);
  }
  if (fields.length === 0) return null;
  values.push(id);
  database
    .prepare(`UPDATE filter_wheels SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
  return database.prepare("SELECT * FROM filter_wheels WHERE id = ?").get(id) as FilterWheel;
}

export function deleteFilterWheel(database: Database.Database, id: number) {
  database.prepare("DELETE FROM filter_wheels WHERE id = ?").run(id);
}

export function getAllCustomEquipment(database: Database.Database) {
  return database
    .prepare("SELECT * FROM custom_equipment ORDER BY created_at DESC")
    .all() as CustomEquipment[];
}

export function createCustomEquipment(
  database: Database.Database,
  data: {
    name: string;
    category?: string;
    brand?: string;
    model?: string;
    specs_json?: string | null;
    notes?: string | null;
  }
) {
  const result = database
    .prepare(
      `INSERT INTO custom_equipment (name, category, brand, model, specs_json, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.name,
      data.category ?? "other",
      data.brand ?? "",
      data.model ?? "",
      data.specs_json ?? null,
      data.notes ?? null
    );
  return database
    .prepare("SELECT * FROM custom_equipment WHERE id = ?")
    .get(result.lastInsertRowid) as CustomEquipment;
}

export function deleteCustomEquipment(database: Database.Database, id: number) {
  database.prepare("DELETE FROM custom_equipment WHERE id = ?").run(id);
}

export function createGuider(
  database: Database.Database,
  data: {
    name: string;
    brand?: string;
    model?: string;
    pixel_size_um?: number | null;
    resolution?: string | null;
    notes?: string | null;
  }
) {
  const result = database
    .prepare(
      "INSERT INTO guiders (name, brand, model, pixel_size_um, resolution, notes) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.name,
      data.brand ?? "",
      data.model ?? "",
      data.pixel_size_um ?? null,
      data.resolution ?? null,
      data.notes ?? null
    );
  return database
    .prepare("SELECT * FROM guiders WHERE id = ?")
    .get(result.lastInsertRowid);
}

export function deleteGuider(database: Database.Database, id: number) {
  database.prepare("DELETE FROM guiders WHERE id = ?").run(id);
}

export function getActiveRig(database: Database.Database): ActiveRig | null {
  return (
    (database
      .prepare(
        `SELECT r.*,
          m.name as mount_name,
          c.name as camera_name,
          t.name as telescope_name,
          g.name as guider_name,
          fw.name as filter_wheel_name,
          ctrl.name as controller_name
        FROM active_rig r
        LEFT JOIN mounts m ON r.mount_id = m.id
        LEFT JOIN cameras c ON r.camera_id = c.id
        LEFT JOIN telescopes t ON r.telescope_id = t.id
        LEFT JOIN guiders g ON r.guider_id = g.id
        LEFT JOIN filter_wheels fw ON r.filter_wheel_id = fw.id
        LEFT JOIN controllers ctrl ON r.controller_id = ctrl.id
        WHERE r.id = 1`
      )
      .get() as ActiveRig | undefined) ?? null
  );
}

export function updateActiveRig(
  database: Database.Database,
  data: Partial<{
    name: string;
    mount_id: number | null;
    camera_id: number | null;
    telescope_id: number | null;
    guider_id: number | null;
    filter_wheel_id: number | null;
    controller_id: number | null;
    asiair_profile: string | null;
  }>
) {
  const existing = getActiveRig(database);
  if (!existing) {
    database
      .prepare(
        `INSERT INTO active_rig (id, name, mount_id, camera_id, telescope_id, guider_id, filter_wheel_id, controller_id, asiair_profile, updated_at)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
      .run(
        data.name ?? "Rig 1",
        data.mount_id ?? null,
        data.camera_id ?? null,
        data.telescope_id ?? null,
        data.guider_id ?? null,
        data.filter_wheel_id ?? null,
        data.controller_id ?? null,
        data.asiair_profile ?? null
      );
    return getActiveRig(database);
  }

  const fields = ["updated_at = datetime('now')"];
  const values: (string | number | null)[] = [];
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value as string | number | null);
  }
  database.prepare(`UPDATE active_rig SET ${fields.join(", ")} WHERE id = 1`).run(...values);
  return getActiveRig(database);
}

export function recordTelemetry(
  database: Database.Database,
  deviceType: string,
  deviceId: number,
  metric: string,
  value: number,
  unit?: string
) {
  database
    .prepare(
      "INSERT INTO device_telemetry (device_type, device_id, metric, value, unit) VALUES (?, ?, ?, ?, ?)"
    )
    .run(deviceType, deviceId, metric, value, unit ?? null);
}

export function getLatestTelemetry(
  database: Database.Database,
  deviceType: string,
  deviceId: number,
  metric: string,
  limit = 60
) {
  return database
    .prepare(
      `SELECT * FROM device_telemetry
       WHERE device_type = ? AND device_id = ? AND metric = ?
       ORDER BY recorded_at DESC LIMIT ?`
    )
    .all(deviceType, deviceId, metric, limit);
}

export function buildDeviceStatus(database: Database.Database): DeviceStatusPayload {
  const rig = getActiveRig(database);
  const controller = rig?.controller_id
    ? getController(database, rig.controller_id)
    : getAllControllers(database)[0] ?? null;

  const connected = controller?.connection_status === "connected";
  const battery: BatteryState = {
    voltage: controller?.battery_voltage ?? 0,
    percent: controller?.battery_pct ?? 0,
    isCharging: Boolean(controller?.is_charging),
    status: batteryStatusFromVoltage(
      controller?.battery_voltage ?? 0,
      controller?.battery_pct ?? 0
    ),
    controllerId: controller?.id ?? null,
    controllerName: controller?.name ?? null,
    lastSyncAt: controller?.last_sync_at ?? null,
  };

  const strip: DeviceStripItem[] = [];
  const connStatus = (online: boolean): DeviceStripItem["status"] =>
    online ? "online" : controller ? "idle" : "offline";

  if (rig?.mount_name) {
    strip.push({
      id: `mount-${rig.mount_id}`,
      kind: "mount",
      name: rig.mount_name,
      type: "Mount",
      status: connStatus(connected),
      detail: connected ? "Parked" : "Offline",
    });
  }
  if (rig?.camera_name) {
    strip.push({
      id: `camera-${rig.camera_id}`,
      kind: "camera",
      name: rig.camera_name,
      type: "Main Cam",
      status: connStatus(connected),
      detail: connected ? "-10°C" : "—",
    });
  }
  if (rig?.telescope_name) {
    const tel = database
      .prepare("SELECT focal_length_mm FROM telescopes WHERE id = ?")
      .get(rig.telescope_id!) as { focal_length_mm: number | null } | undefined;
    strip.push({
      id: `telescope-${rig.telescope_id}`,
      kind: "telescope",
      name: rig.telescope_name.split(" (")[0],
      type: "Scope",
      status: connStatus(connected),
      detail: tel?.focal_length_mm ? `${tel.focal_length_mm}mm` : undefined,
    });
  }
  if (rig?.filter_wheel_name) {
    const wheel = rig.filter_wheel_id
      ? (database
          .prepare("SELECT current_filter, slots FROM filter_wheels WHERE id = ?")
          .get(rig.filter_wheel_id) as { current_filter: string | null; slots: number })
      : null;
    strip.push({
      id: `wheel-${rig.filter_wheel_id}`,
      kind: "filter_wheel",
      name: `${wheel?.slots ?? 7}× Wheel`,
      type: "Filter",
      status: connStatus(connected),
      detail: wheel?.current_filter ?? "—",
    });
  }
  if (rig?.guider_name) {
    strip.push({
      id: `guider-${rig.guider_id}`,
      kind: "guider",
      name: rig.guider_name,
      type: "Guide",
      status: connStatus(connected),
      detail: connected ? "RMS 0.4″" : "—",
    });
  }
  if (controller) {
    strip.push({
      id: `controller-${controller.id}`,
      kind: "controller",
      name: controller.name,
      type: "ASIAIR",
      status: connStatus(connected),
      detail: `${controller.battery_voltage.toFixed(2)}V`,
    });
  }

  for (const item of getAllCustomEquipment(database)) {
    strip.push({
      id: `custom-${item.id}`,
      kind: "custom",
      name: item.name,
      type: item.category,
      status: item.connection_status === "connected" ? "online" : "offline",
    });
  }

  return {
    connected,
    rig,
    controller,
    battery,
    strip,
    cameraTempC: connected ? -10 : null,
    mountState: connected ? "parked" : "unknown",
    guideRms: connected ? "0.4″" : null,
  };
}
