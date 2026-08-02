"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import AsiairBatteryPanel from "@/components/asiair/AsiairBatteryPanel";
import AsiairDeviceStrip from "@/components/asiair/AsiairDeviceStrip";
import DeviceControlPanel from "@/components/equipment/DeviceControlPanel";
import { DashboardStats, Session, AstroImage } from "@/lib/types";
import { fetchJson } from "@/lib/utils";
import { useMergedDeviceStatus } from "@/hooks/useMergedDeviceStatus";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [recentImages, setRecentImages] = useState<AstroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imaging] = useState(false);
  const { status: deviceStatus, loading: deviceLoading, refresh } = useMergedDeviceStatus(5000);

  useEffect(() => {
    Promise.all([
      fetchJson<DashboardStats>("/api/dashboard"),
      fetchJson<Session[]>("/api/sessions"),
      fetchJson<AstroImage[]>("/api/images?frame_type=light"),
    ])
      .then(([statsData, sessionsData, imagesData]) => {
        setStats(statsData);
        setSessions(sessionsData.slice(0, 2));
        setRecentImages(imagesData.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--zwo-orange)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Equipment row — ASIAIR device strip (live from Active Rig) */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="label">Equipment</p>
          <Link href="/equipment" className="text-[10px] text-[var(--zwo-orange)]">
            إدارة →
          </Link>
        </div>
        <AsiairDeviceStrip
          items={deviceStatus?.strip ?? []}
          loading={deviceLoading}
        />
      </section>

      {/* Battery + ASIAIR control */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AsiairBatteryPanel
            battery={
              deviceStatus?.battery ?? {
                voltage: 0,
                percent: 0,
                isCharging: false,
                status: "good",
                controllerId: null,
                controllerName: null,
                lastSyncAt: null,
              }
            }
            connected={deviceStatus?.connected}
          />
        </div>
        <div className="lg:col-span-2">
          <DeviceControlPanel
            controller={deviceStatus?.controller ?? null}
            connected={deviceStatus?.connected ?? false}
            onUpdated={refresh}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Live preview — ASIAIR main view */}
        <div className="preview-frame lg:col-span-3">
          <div className="flex aspect-video flex-col justify-between p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">Target</p>
                <p className="text-lg font-bold text-white">
                  {recentImages[0]?.target_name || "M42 — Orion Nebula"}
                </p>
              </div>
              <span
                className={`badge ${imaging ? "bg-[var(--zwo-orange-dim)] text-[var(--zwo-orange)]" : "bg-white/10 text-[var(--muted)]"}`}
              >
                {imaging ? "● REC" : "IDLE"}
              </span>
            </div>

            {/* Simulated star field dots */}
            <div className="pointer-events-none absolute inset-0 opacity-40">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-0.5 w-0.5 rounded-full bg-white"
                  style={{
                    top: `${10 + ((i * 17) % 80)}%`,
                    left: `${5 + ((i * 23) % 90)}%`,
                    opacity: 0.3 + (i % 5) * 0.15,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 grid grid-cols-4 gap-2 rounded-xl bg-black/50 p-3 backdrop-blur-sm">
              <div>
                <p className="asiair-stat-label">Exp</p>
                <p className="asiair-stat-value text-lg">300s</p>
              </div>
              <div>
                <p className="asiair-stat-label">Gain</p>
                <p className="asiair-stat-value text-lg">100</p>
              </div>
              <div>
                <p className="asiair-stat-label">Temp</p>
                <p className="asiair-stat-value text-lg text-cyan-400">
                  {deviceStatus?.cameraTempC ?? "—"}°
                </p>
              </div>
              <div>
                <p className="asiair-stat-label">Filter</p>
                <p className="asiair-stat-value text-lg text-[var(--zwo-orange)]">Ha</p>
              </div>
            </div>
          </div>
        </div>

        {/* Control panel — ASIAIR right side */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="asiair-panel flex flex-1 flex-col items-center justify-center gap-4 py-6">
            <p className="text-xs text-[var(--muted)]">Sequence Control</p>
            <div className="flex items-center gap-6">
              {!imaging ? (
                <Link href="/imaging" className="btn-asiair-round">
                  <Play size={28} fill="white" className="mr-[-2px]" />
                </Link>
              ) : (
                <Link href="/imaging" className="btn-asiair-stop">
                  <Pause size={28} fill="white" />
                </Link>
              )}
            </div>
            <p className="text-sm text-white">
              {imaging ? "جاري التصوير..." : "جاهز للبدء"}
            </p>

            {/* Progress ring style */}
            <div className="w-full px-4">
              <div className="mb-1 flex justify-between text-[10px] text-[var(--muted)]">
                <span>Frame 12 / 30</span>
                <span>40%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--card-border)]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[var(--zwo-orange)] to-orange-400 transition-all"
                  style={{ width: imaging ? "40%" : "0%" }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Lights", value: stats?.lightFrames ?? 0, color: "text-[var(--zwo-orange)]" },
              { label: "Sessions", value: stats?.sessions ?? 0, color: "text-white" },
              { label: "Targets", value: stats?.targets ?? 0, color: "text-cyan-400" },
              { label: "Scopes", value: stats?.telescopes ?? 0, color: "text-white" },
            ].map(({ label, value, color }) => (
              <div key={label} className="asiair-panel text-center">
                <p className="asiair-stat-label">{label}</p>
                <p className={`asiair-stat-value ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Album strip — ASIAIR bottom gallery preview */}
      <section className="asiair-panel">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Album</p>
          <Link href="/gallery" className="text-xs text-[var(--zwo-orange)]">
            عرض الكل →
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {recentImages.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">لا توجد صور بعد</p>
          ) : (
            recentImages.map((img) => (
              <Link
                key={img.id}
                href="/gallery"
                className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-[var(--card-border)] bg-black"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black opacity-90" />
                <div className="relative flex h-full flex-col justify-end p-2">
                  <p className="truncate text-[10px] font-medium text-white">
                    {img.target_name || img.filename}
                  </p>
                  <p className="text-[9px] text-[var(--muted)]">
                    {img.exposure_sec}s
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Active sessions */}
      {sessions.length > 0 && (
        <section className="asiair-panel">
          <p className="label mb-2">Recent Plans</p>
          {sessions.map((s) => (
            <Link
              key={s.id}
              href="/sessions"
              className="mb-2 flex items-center justify-between rounded-xl bg-[var(--card-elevated)] px-4 py-3 last:mb-0 hover:border-[var(--zwo-orange)]/20"
            >
              <div>
                <p className="font-medium text-white">{s.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {s.mount_name} • {s.camera_name}
                </p>
              </div>
              <div className="text-left">
                <p className="text-xs text-[var(--muted)]">{s.session_date}</p>
                <p className="text-xs text-[var(--zwo-orange)]">
                  {s.image_count} frames
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
