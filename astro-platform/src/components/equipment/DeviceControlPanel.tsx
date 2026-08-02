"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Disc,
  Power,
  RefreshCw,
  Snowflake,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Controller } from "@/lib/types";
import { fetchJson } from "@/lib/utils";

interface Props {
  controller: Controller | null;
  connected: boolean;
  onUpdated: () => void;
}

export default function DeviceControlPanel({ controller, connected, onUpdated }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (endpoint: string, body: Record<string, unknown>) => {
    if (!controller) return;
    setBusy((body.command as string) ?? (body.action as string) ?? "cmd");
    setMessage(null);
    try {
      const result = await fetchJson<{ ok: boolean; message: string }>(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ controllerId: controller.id, ...body }),
      });
      setMessage(result.message);
      onUpdated();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "فشل الأمر");
    } finally {
      setBusy(null);
    }
  };

  if (!controller) {
    return (
      <div className="asiair-panel text-center text-sm text-[var(--muted)]">
        أضف وحدة ASIAIR من Equipment → ASIAIR
      </div>
    );
  }

  return (
    <div className="asiair-panel space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="label">ASIAIR Control</p>
          <p className="text-sm text-white">{controller.name}</p>
          <p className="text-[10px] text-[var(--muted)]">
            {controller.ip_address ?? "—"} • {controller.wifi_ssid ?? "WiFi AP"}
          </p>
        </div>
        <span
          className={`badge ${connected ? "bg-green-500/20 text-green-400" : "bg-white/10 text-[var(--muted)]"}`}
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <button
          className="btn-secondary flex items-center justify-center gap-2 py-3"
          disabled={!!busy || connected}
          onClick={() => run("/api/asiair/connect", { action: "connect" })}
        >
          <Wifi size={16} />
          {busy === "connect" ? "..." : "Connect"}
        </button>
        <button
          className="btn-secondary flex items-center justify-center gap-2 py-3"
          disabled={!!busy || !connected}
          onClick={() => run("/api/asiair/connect", { action: "disconnect" })}
        >
          <WifiOff size={16} />
          Disconnect
        </button>
        <button
          className="btn-secondary flex items-center justify-center gap-2 py-3"
          disabled={!!busy || !connected}
          onClick={() => run("/api/asiair/control", { command: "sync" })}
        >
          <RefreshCw size={16} className={busy === "sync" ? "animate-spin" : ""} />
          Sync
        </button>
        <button
          className="btn-secondary flex items-center justify-center gap-2 py-3"
          disabled={!!busy || !connected}
          onClick={() => run("/api/asiair/control", { command: "park_mount" })}
        >
          <Disc size={16} />
          Park
        </button>
        <button
          className="btn-secondary flex items-center justify-center gap-2 py-3"
          disabled={!!busy || !connected}
          onClick={() => run("/api/asiair/control", { command: "unpark_mount" })}
        >
          <Disc size={16} />
          Unpark
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          className="btn-secondary flex items-center justify-center gap-2 py-2 text-xs"
          disabled={!!busy || !connected}
          onClick={() => run("/api/asiair/control", { command: "cooling_on" })}
        >
          <Snowflake size={14} />
          Cooling ON
        </button>
        <button
          className="btn-secondary flex items-center justify-center gap-2 py-2 text-xs"
          disabled={!!busy || !connected}
          onClick={() => run("/api/asiair/control", { command: "cooling_off" })}
        >
          <Power size={14} />
          Cooling OFF
        </button>
        <button
          className="btn-secondary flex items-center justify-center gap-2 py-2 text-xs"
          disabled={!!busy || !connected}
          onClick={() => run("/api/asiair/control", { command: "filter_prev" })}
        >
          <ChevronRight size={14} />
          Filter −
        </button>
        <button
          className="btn-secondary flex items-center justify-center gap-2 py-2 text-xs"
          disabled={!!busy || !connected}
          onClick={() => run("/api/asiair/control", { command: "filter_next" })}
        >
          <ChevronLeft size={14} />
          Filter +
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-[var(--zwo-orange)]/30 bg-[var(--zwo-orange-dim)] px-3 py-2 text-xs text-[var(--zwo-orange)]">
          {message}
        </div>
      )}
    </div>
  );
}
