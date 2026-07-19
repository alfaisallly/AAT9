import Database from "better-sqlite3";
import {
  getActiveRig,
  getController,
  recordTelemetry,
  updateController,
  updateFilterWheel,
} from "@/lib/devices";

export type AsiairCommand =
  | "connect"
  | "disconnect"
  | "sync"
  | "park_mount"
  | "unpark_mount"
  | "cooling_on"
  | "cooling_off"
  | "filter_next"
  | "filter_prev"
  | "start_guiding"
  | "stop_guiding";

export interface AsiairCommandResult {
  ok: boolean;
  message: string;
  controllerId?: number;
}

function voltageFromPercent(pct: number): number {
  const min = 10.8;
  const max = 12.6;
  return Math.round((min + ((max - min) * pct) / 100) * 100) / 100;
}

export async function connectAsiair(
  database: Database.Database,
  controllerId: number
): Promise<AsiairCommandResult> {
  const controller = getController(database, controllerId);
  if (!controller) return { ok: false, message: "وحدة ASIAIR غير موجودة" };

  updateController(database, controllerId, {
    connection_status: "connecting",
  });

  await delay(800);

  updateController(database, controllerId, {
    connection_status: "connected",
    last_sync_at: new Date().toISOString(),
  });

  return syncAsiairDevices(database, controllerId);
}

export async function disconnectAsiair(
  database: Database.Database,
  controllerId: number
): Promise<AsiairCommandResult> {
  const controller = getController(database, controllerId);
  if (!controller) return { ok: false, message: "وحدة ASIAIR غير موجودة" };

  updateController(database, controllerId, {
    connection_status: "disconnected",
  });

  const rig = getActiveRig(database);
  if (rig?.filter_wheel_id) {
    updateFilterWheel(database, rig.filter_wheel_id, {
      connection_status: "offline",
    });
  }

  return { ok: true, message: "تم قطع الاتصال بـ ASIAIR", controllerId };
}

export async function syncAsiairDevices(
  database: Database.Database,
  controllerId: number
): Promise<AsiairCommandResult> {
  const controller = getController(database, controllerId);
  if (!controller) return { ok: false, message: "وحدة ASIAIR غير موجودة" };

  let pct = controller.battery_pct;
  if (!controller.is_charging && controller.connection_status === "connected") {
    pct = Math.max(15, pct - Math.random() * 0.3);
  } else if (controller.is_charging) {
    pct = Math.min(100, pct + Math.random() * 0.5);
  }

  const voltage = voltageFromPercent(pct);
  const now = new Date().toISOString();

  updateController(database, controllerId, {
    connection_status: "connected",
    battery_pct: Math.round(pct * 10) / 10,
    battery_voltage: voltage,
    last_sync_at: now,
  });

  recordTelemetry(database, "controller", controllerId, "battery_voltage", voltage, "V");
  recordTelemetry(database, "controller", controllerId, "battery_pct", pct, "%");

  const rig = getActiveRig(database);
  if (rig?.filter_wheel_id) {
    updateFilterWheel(database, rig.filter_wheel_id, {
      connection_status: "connected",
    });
  }

  return {
    ok: true,
    message: `تمت المزامنة — البطارية ${voltage.toFixed(2)}V (${Math.round(pct)}%)`,
    controllerId,
  };
}

export async function sendAsiairCommand(
  database: Database.Database,
  controllerId: number,
  command: AsiairCommand,
  params?: { filterName?: string; slot?: number }
): Promise<AsiairCommandResult> {
  const controller = getController(database, controllerId);
  if (!controller) return { ok: false, message: "وحدة ASIAIR غير موجودة" };

  if (command === "connect") return connectAsiair(database, controllerId);
  if (command === "disconnect") return disconnectAsiair(database, controllerId);
  if (command === "sync") return syncAsiairDevices(database, controllerId);

  if (controller.connection_status !== "connected") {
    return { ok: false, message: "ASIAIR غير متصل — اضغط Connect أولاً" };
  }

  const rig = getActiveRig(database);
  const messages: Record<AsiairCommand, string> = {
    connect: "",
    disconnect: "",
    sync: "",
    park_mount: "تم ركن الحامل (Park)",
    unpark_mount: "تم فك ركن الحامل (Unpark)",
    cooling_on: "تم تشغيل تبريد الكاميرا — الهدف -10°C",
    cooling_off: "تم إيقاف التبريد",
    filter_next: "تم التبديل للفلتر التالي",
    filter_prev: "تم التبديل للفلتر السابق",
    start_guiding: "تم بدء التوجيه — RMS 0.4″",
    stop_guiding: "تم إيقاف التوجيه",
  };

  if (
    (command === "filter_next" || command === "filter_prev") &&
    rig?.filter_wheel_id
  ) {
    const wheel = database
      .prepare("SELECT * FROM filter_wheels WHERE id = ?")
      .get(rig.filter_wheel_id) as {
      slots: number;
      current_slot: number;
      current_filter: string | null;
    };

    const filters = ["L", "R", "G", "B", "Ha", "OIII", "SII"];
    let slot = wheel.current_slot;
    if (command === "filter_next") slot = slot >= wheel.slots ? 1 : slot + 1;
    else slot = slot <= 1 ? wheel.slots : slot - 1;

    const filterName =
      params?.filterName ?? filters[(slot - 1) % filters.length] ?? `Slot ${slot}`;

    updateFilterWheel(database, rig.filter_wheel_id, {
      current_slot: slot,
      current_filter: filterName,
    });
    messages[command] = `الفلتر: ${filterName} (Slot ${slot}/${wheel.slots})`;
  }

  await delay(400);
  await syncAsiairDevices(database, controllerId);

  return { ok: true, message: messages[command], controllerId };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
