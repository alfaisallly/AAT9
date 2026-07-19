"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { AstroImage, Session } from "@/lib/types";
import { fetchJson, frameTypeLabels } from "@/lib/utils";

const frameTabs = [
  { id: "light", label: "Light", color: "text-[var(--zwo-orange)]" },
  { id: "dark", label: "Dark", color: "text-gray-400" },
  { id: "flat", label: "Flat", color: "text-cyan-400" },
  { id: "bias", label: "Bias", color: "text-purple-400" },
  { id: "", label: "All", color: "text-white" },
];

export default function GalleryPage() {
  const [images, setImages] = useState<AstroImage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<AstroImage | null>(null);
  const [frameFilter, setFrameFilter] = useState("light");
  const [sessionFilter, setSessionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (frameFilter) params.set("frame_type", frameFilter);
    if (sessionFilter) params.set("session_id", sessionFilter);
    Promise.all([
      fetchJson<AstroImage[]>(`/api/images?${params}`),
      fetchJson<Session[]>("/api/sessions"),
    ])
      .then(([imgs, sess]) => {
        setImages(imgs);
        setSessions(sess);
      })
      .finally(() => setLoading(false));
  }, [frameFilter, sessionFilter]);

  const stats = useMemo(() => {
    const lights = images.filter((i) => i.frame_type === "light");
    const totalExp = lights.reduce((s, i) => s + (i.exposure_sec || 0), 0);
    return {
      frames: images.length,
      lights: lights.length,
      totalMin: Math.round(totalExp / 60),
    };
  }, [images]);

  return (
    <div className="mx-auto max-w-6xl">
      {/* ASIAIR Album header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Album</h1>
          <p className="text-xs text-[var(--muted)]">
            {stats.frames} frames • {stats.totalMin} min exposure
          </p>
        </div>
      </div>

      {/* Frame type tabs — ASIAIR pill tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-[var(--card)] p-1">
        {frameTabs.map(({ id, label, color }) => (
          <button
            key={id || "all"}
            onClick={() => setFrameFilter(id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
              frameFilter === id
                ? "bg-[var(--zwo-orange)] text-white"
                : `${color} hover:bg-white/5`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Session filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSessionFilter("")}
          className={`rounded-full px-3 py-1 text-xs ${
            !sessionFilter
              ? "bg-[var(--zwo-orange-dim)] text-[var(--zwo-orange)]"
              : "bg-[var(--card)] text-[var(--muted)]"
          }`}
        >
          All Sessions
        </button>
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => setSessionFilter(String(s.id))}
            className={`rounded-full px-3 py-1 text-xs ${
              sessionFilter === String(s.id)
                ? "bg-[var(--zwo-orange-dim)] text-[var(--zwo-orange)]"
                : "bg-[var(--card)] text-[var(--muted)]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--zwo-orange)] border-t-transparent" />
        </div>
      ) : images.length === 0 ? (
        <div className="asiair-panel py-12 text-center text-[var(--muted)]">
          No images in album
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img)}
              className={`group relative aspect-square overflow-hidden rounded-xl border transition ${
                selected?.id === img.id
                  ? "border-[var(--zwo-orange)] ring-2 ring-[var(--zwo-orange)]/30"
                  : "border-[var(--card-border)] hover:border-[var(--zwo-orange)]/40"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0d1526] to-black" />
              {/* Star noise overlay */}
              <div className="absolute inset-0 opacity-30">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-px w-px rounded-full bg-white"
                    style={{
                      top: `${15 + i * 10}%`,
                      left: `${20 + i * 8}%`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                <p className="truncate text-[11px] font-semibold text-white">
                  {img.target_name || img.filename}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tabular-nums text-[var(--zwo-orange)]">
                    {img.exposure_sec}s
                  </span>
                  <span className="text-[9px] text-[var(--muted)]">
                    {frameTypeLabels[img.frame_type]}
                  </span>
                </div>
              </div>
              {img.processed ? (
                <span className="absolute right-1.5 top-1.5 rounded bg-[var(--success)]/20 px-1 text-[9px] text-[var(--success)]">
                  ✓
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen detail — ASIAIR image info sheet */}
      {selected && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 lg:hidden">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setSelected(null)}>
              <X className="text-white" />
            </button>
            <span className="text-sm text-[var(--zwo-orange)]">Image Info</span>
          </div>
          <div className="preview-frame mx-4 aspect-video">
            <div className="flex h-full items-center justify-center">
              <p className="text-white">{selected.target_name || selected.filename}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["File", selected.filename],
                ["Exp", `${selected.exposure_sec}s`],
                ["Gain", selected.gain],
                ["Temp", `${selected.temperature_c}°C`],
                ["Filter", selected.filter_name || "—"],
                ["Target", selected.target_name || "—"],
              ].map(([k, v]) => (
                <div key={k} className="asiair-panel">
                  <dt className="asiair-stat-label">{k}</dt>
                  <dd className="mt-1 text-sm font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* Desktop detail sidebar */}
      {selected && (
        <aside className="fixed bottom-24 left-4 right-4 z-50 hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 lg:static lg:mt-4 lg:block">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-white">{selected.filename}</h3>
            <button onClick={() => setSelected(null)} className="text-[var(--muted)]">
              <X size={18} />
            </button>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
            {[
              ["Exp", `${selected.exposure_sec}s`],
              ["Gain", selected.gain],
              ["Filter", selected.filter_name],
              ["Target", selected.target_name],
              ["Session", selected.session_name],
              ["Type", frameTypeLabels[selected.frame_type]],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="asiair-stat-label">{k}</dt>
                <dd className="text-white">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </div>
  );
}
