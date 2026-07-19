"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { AstroImage, Session } from "@/lib/types";
import { fetchJson, frameTypeColors, frameTypeLabels } from "@/lib/utils";

const typeGradients: Record<string, string> = {
  light: "from-indigo-900 via-purple-900 to-blue-900",
  dark: "from-gray-900 to-gray-800",
  flat: "from-blue-900 to-cyan-900",
  bias: "from-purple-900 to-pink-900",
  other: "from-amber-900 to-orange-900",
};

export default function GalleryPage() {
  const [images, setImages] = useState<AstroImage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<AstroImage | null>(null);
  const [frameFilter, setFrameFilter] = useState("light");
  const [sessionFilter, setSessionFilter] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
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
      processed: images.filter((i) => i.processed).length,
    };
  }, [images]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Sidebar — NINA/ASIAIR style */}
      <aside className="w-full shrink-0 space-y-4 lg:w-56">
        <div className="card p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase text-[var(--muted)]">
            نوع الإطار
          </h3>
          {["light", "dark", "flat", "bias", ""].map((f) => (
            <button
              key={f || "all"}
              onClick={() => setFrameFilter(f)}
              className={`mb-1 block w-full rounded px-2 py-1.5 text-right text-sm ${
                frameFilter === f ? "bg-indigo-600/30 text-indigo-300" : "hover:bg-white/5"
              }`}
            >
              {f ? frameTypeLabels[f] : "الكل"}
            </button>
          ))}
        </div>

        <div className="card p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase text-[var(--muted)]">
            الجلسات
          </h3>
          <button
            onClick={() => setSessionFilter("")}
            className={`mb-1 block w-full rounded px-2 py-1.5 text-right text-sm ${
              !sessionFilter ? "bg-indigo-600/30 text-indigo-300" : "hover:bg-white/5"
            }`}
          >
            كل الجلسات
          </button>
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSessionFilter(String(s.id))}
              className={`mb-1 block w-full rounded px-2 py-1.5 text-right text-sm ${
                sessionFilter === String(s.id)
                  ? "bg-indigo-600/30 text-indigo-300"
                  : "hover:bg-white/5"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Main gallery */}
      <div className="min-w-0 flex-1">
        <PageHeader
          title="معرض الصور"
          description="واجهة عرض متكاملة — شبيه ASIAIR/NINA"
          action={
            <div className="flex gap-2">
              <button
                className={`btn-secondary ${view === "grid" ? "ring-1 ring-indigo-500" : ""}`}
                onClick={() => setView("grid")}
              >
                شبكة
              </button>
              <button
                className={`btn-secondary ${view === "list" ? "ring-1 ring-indigo-500" : ""}`}
                onClick={() => setView("list")}
              >
                قائمة
              </button>
            </div>
          }
        />

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card py-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.frames}</p>
            <p className="text-xs text-[var(--muted)]">إطارات</p>
          </div>
          <div className="card py-3 text-center">
            <p className="text-2xl font-bold text-indigo-300">{stats.lights}</p>
            <p className="text-xs text-[var(--muted)]">Light</p>
          </div>
          <div className="card py-3 text-center">
            <p className="text-2xl font-bold text-green-300">{stats.totalMin}′</p>
            <p className="text-xs text-[var(--muted)]">تعريض Light</p>
          </div>
          <div className="card py-3 text-center">
            <p className="text-2xl font-bold text-amber-300">{stats.processed}</p>
            <p className="text-xs text-[var(--muted)]">معالج</p>
          </div>
        </div>

        {loading ? (
          <p className="text-[var(--muted)]">جاري التحميل...</p>
        ) : images.length === 0 ? (
          <div className="card text-center text-[var(--muted)]">
            لا توجد صور — أضف إطارات من جلسات المراقبة
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelected(img)}
                className={`overflow-hidden rounded-xl border text-right transition hover:border-indigo-500/50 ${
                  selected?.id === img.id
                    ? "border-indigo-500 ring-1 ring-indigo-500"
                    : "border-[var(--card-border)]"
                }`}
              >
                <div
                  className={`flex h-32 items-center justify-center bg-gradient-to-br ${
                    typeGradients[img.frame_type] || typeGradients.other
                  }`}
                >
                  <div className="text-center">
                    <p className="text-lg font-bold text-white/90">
                      {img.target_name || img.frame_type.toUpperCase()}
                    </p>
                    <p className="text-xs text-white/60">{img.exposure_sec}s</p>
                  </div>
                </div>
                <div className="bg-[var(--card)] p-3">
                  <p className="truncate text-sm font-medium text-white">
                    {img.filename}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span
                      className={`badge ${frameTypeColors[img.frame_type]}`}
                    >
                      {frameTypeLabels[img.frame_type]}
                    </span>
                    <span
                      className={`text-xs ${
                        img.processed ? "text-green-400" : "text-yellow-400"
                      }`}
                    >
                      {img.processed ? "✓" : "○"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelected(img)}
                className="card flex w-full items-center justify-between text-right hover:border-indigo-500/30"
              >
                <div>
                  <p className="font-medium text-white">{img.filename}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {img.session_name} • {img.exposure_sec}s • G{img.gain}
                  </p>
                </div>
                <span className={`badge ${frameTypeColors[img.frame_type]}`}>
                  {frameTypeLabels[img.frame_type]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <aside className="w-full shrink-0 lg:w-64">
          <div className="card sticky top-4">
            <h3 className="mb-3 font-semibold text-white">تفاصيل الإطار</h3>
            <dl className="space-y-2 text-sm">
              {[
                ["الملف", selected.filename],
                ["الجلسة", selected.session_name],
                ["الهدف", selected.target_name || "—"],
                ["الفلتر", selected.filter_name || "—"],
                ["التعريض", selected.exposure_sec ? `${selected.exposure_sec}s` : "—"],
                ["Gain", selected.gain ?? "—"],
                ["Offset", selected.offset ?? "—"],
                ["الحرارة", selected.temperature_c ? `${selected.temperature_c}°C` : "—"],
                ["المسار", selected.file_path || "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[var(--muted)]">{k}</dt>
                  <dd className="break-all text-white">{v}</dd>
                </div>
              ))}
            </dl>
            <button
              className="btn-secondary mt-4 w-full"
              onClick={() => setSelected(null)}
            >
              إغلاق
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
