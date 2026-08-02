"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { ImagingMetrics } from "@/lib/astro-math";
import { fetchJson } from "@/lib/utils";

export default function CalculatorPage() {
  const [metrics, setMetrics] = useState<ImagingMetrics[]>([]);
  const [telFilter, setTelFilter] = useState("");
  const [camFilter, setCamFilter] = useState("");

  useEffect(() => {
    fetchJson<ImagingMetrics[]>("/api/imaging-matrix").then(setMetrics);
  }, []);

  const telescopes = Array.from(new Set(metrics.map((m) => m.telescopeName)));
  const cameras = Array.from(new Set(metrics.map((m) => m.cameraName)));

  const filtered = metrics.filter((m) => {
    if (telFilter && !m.telescopeName.includes(telFilter)) return false;
    if (camFilter && m.cameraName !== camFilter) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="حاسبة FOV و Pixel Scale"
        description="الفصل السادس — جميع تركيبات التلسكوب × الكاميرا"
      />

      <div className="mb-4 card text-sm">
        <p className="text-[var(--muted)]">
          <strong className="text-white">Pixel Scale</strong> = (µm / mm) × 206.265 = ″/px
          &nbsp;|&nbsp;
          <strong className="text-white">FOV</strong> = (px × scale) / 60 = ′
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="input-field w-auto min-w-[200px]"
          value={telFilter}
          onChange={(e) => setTelFilter(e.target.value)}
        >
          <option value="">كل التلسكopes</option>
          {telescopes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="input-field w-auto min-w-[180px]"
          value={camFilter}
          onChange={(e) => setCamFilter(e.target.value)}
        >
          <option value="">كل الكameras</option>
          {cameras.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="self-center text-sm text-[var(--muted)]">
          {filtered.length} تركيبة
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card)] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2 text-right">التلسكوب</th>
              <th className="px-3 py-2 text-right">الكاميرا</th>
              <th className="px-3 py-2 text-right">FL</th>
              <th className="px-3 py-2 text-right">f/</th>
              <th className="px-3 py-2 text-right">Pixel Scale</th>
              <th className="px-3 py-2 text-right">FOV (′)</th>
              <th className="px-3 py-2 text-right">FOV (°)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr
                key={i}
                className="border-t border-[var(--card-border)] hover:bg-white/[0.02]"
              >
                <td className="px-3 py-2 text-white">{m.telescopeName}</td>
                <td className="px-3 py-2">{m.cameraName.replace("ZWO ", "")}</td>
                <td className="px-3 py-2">{m.focalLengthMm}</td>
                <td className="px-3 py-2">{m.fRatio}</td>
                <td className="px-3 py-2 font-mono text-indigo-300">
                  {m.pixelScaleArcsec}″
                </td>
                <td className="px-3 py-2 font-mono">
                  {m.fovWidthArcmin}×{m.fovHeightArcmin}
                </td>
                <td className="px-3 py-2 font-mono">
                  {m.fovWidthDeg}×{m.fovHeightDeg}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
