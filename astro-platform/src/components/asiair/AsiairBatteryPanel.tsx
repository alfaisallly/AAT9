"use client";

import { Battery, BatteryCharging, Zap } from "lucide-react";
import { BatteryState } from "@/lib/types";

const statusLabels: Record<BatteryState["status"], string> = {
  full: "ممتلئة",
  good: "جيدة",
  low: "منخفضة",
  critical: "حرجة",
};

const statusColors: Record<BatteryState["status"], string> = {
  full: "text-green-400",
  good: "text-cyan-400",
  low: "text-yellow-400",
  critical: "text-red-400",
};

interface Props {
  battery: BatteryState;
  connected?: boolean;
  compact?: boolean;
}

export default function AsiairBatteryPanel({ battery, connected, compact }: Props) {
  const pct = Math.round(battery.percent);
  const barColor =
    battery.status === "critical"
      ? "from-red-500 to-red-600"
      : battery.status === "low"
        ? "from-yellow-500 to-orange-500"
        : "from-[var(--zwo-orange)] to-orange-400";

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[var(--card-elevated)] px-2 py-1">
        {battery.isCharging ? (
          <BatteryCharging size={14} className="text-green-400" />
        ) : (
          <Battery size={14} className={statusColors[battery.status]} />
        )}
        <span className={`tabular-nums text-xs font-semibold ${statusColors[battery.status]}`}>
          {battery.voltage.toFixed(2)}V
        </span>
        <span className="text-[10px] text-[var(--muted)]">{pct}%</span>
      </div>
    );
  }

  return (
    <div className="asiair-panel overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="label">Battery Monitor</p>
          <p className="text-sm text-[var(--muted)]">
            {battery.controllerName ?? "ASIAIR Controller"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {battery.isCharging ? (
            <span className="badge bg-green-500/20 text-green-400">شحن</span>
          ) : connected ? (
            <span className="badge bg-[var(--zwo-orange-dim)] text-[var(--zwo-orange)]">
              متصل
            </span>
          ) : (
            <span className="badge bg-white/10 text-[var(--muted)]">غير متصل</span>
          )}
        </div>
      </div>

      {/* Large voltage display — ASIAIR style */}
      <div className="relative mb-6 rounded-2xl border border-[var(--card-border)] bg-black/40 p-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--zwo-orange)]/5 to-transparent" />
        <div className="relative">
          <div className="mb-1 flex items-center justify-center gap-2 text-[var(--muted)]">
            <Zap size={16} className="text-[var(--zwo-orange)]" />
            <span className="text-xs uppercase tracking-widest">Voltage</span>
          </div>
          <p
            className={`tabular-nums text-5xl font-black tracking-tight sm:text-6xl ${statusColors[battery.status]}`}
          >
            {battery.voltage.toFixed(2)}
            <span className="mr-1 text-2xl font-semibold text-[var(--muted)]">V</span>
          </p>
          <p className={`mt-2 text-sm font-medium ${statusColors[battery.status]}`}>
            {statusLabels[battery.status]} — {pct}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-[10px] text-[var(--muted)]">
          <span>0%</span>
          <span>{pct}%</span>
          <span>100%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--card-border)]">
          <div
            className={`h-full rounded-full bg-gradient-to-l ${barColor} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Scale markers */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="rounded-lg bg-[var(--card-elevated)] p-2">
          <p className="text-[var(--muted)]">Min</p>
          <p className="tabular-nums text-white">10.8V</p>
        </div>
        <div className="rounded-lg bg-[var(--card-elevated)] p-2">
          <p className="text-[var(--muted)]">Current</p>
          <p className={`tabular-nums font-semibold ${statusColors[battery.status]}`}>
            {battery.voltage.toFixed(2)}V
          </p>
        </div>
        <div className="rounded-lg bg-[var(--card-elevated)] p-2">
          <p className="text-[var(--muted)]">Max</p>
          <p className="tabular-nums text-white">12.6V</p>
        </div>
      </div>

      {battery.lastSyncAt && (
        <p className="mt-4 text-center text-[10px] text-[var(--muted)]">
          آخر مزامنة: {new Date(battery.lastSyncAt).toLocaleString("ar-IQ")}
        </p>
      )}
    </div>
  );
}
