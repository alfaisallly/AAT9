"use client";

import { useEffect, useState } from "react";
import {
  Focus,
  Move,
  Play,
  RefreshCw,
  RotateCw,
  Square,
  Target,
} from "lucide-react";
import FitsPreview from "@/components/imaging/FitsPreview";
import {
  DEFAULT_IMAGING_SETTINGS,
  ImagingSettings,
  loadImagingSettings,
  saveImagingSettings,
} from "@/lib/imaging-settings";

type Tab = "exposure" | "autofocus" | "dither" | "meridian" | "guiding";

export default function ImagingPage() {
  const [settings, setSettings] = useState<ImagingSettings>(DEFAULT_IMAGING_SETTINGS);
  const [tab, setTab] = useState<Tab>("exposure");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadImagingSettings());
  }, []);

  const update = (patch: Partial<ImagingSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      saveImagingSettings(next);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const runAutoFocus = () => {
    update({
      autoFocus: {
        ...settings.autoFocus,
        status: "running",
        currentHfd: null,
      },
    });
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const hfd = 4.5 - step * 0.15 + Math.random() * 0.2;
      setSettings((s) => {
        const next = {
          ...s,
          autoFocus: {
            ...s.autoFocus,
            currentHfd: Math.max(1.8, hfd),
            status: (step >= 12 ? "done" : "running") as ImagingSettings["autoFocus"]["status"],
          },
        };
        saveImagingSettings(next);
        return next;
      });
      if (step >= 12) clearInterval(interval);
    }, 400);
  };

  const toggleSequence = () => {
    const running = !settings.sequence.running;
    update({
      sequence: {
        ...settings.sequence,
        running,
        currentFrame: running ? 1 : 0,
      },
    });
    if (running) {
      let frame = 1;
      const iv = setInterval(() => {
        setSettings((s) => {
          if (!s.sequence.running) {
            clearInterval(iv);
            return s;
          }
          frame++;
          if (frame > s.sequence.totalFrames) {
            const next = {
              ...s,
              sequence: { ...s.sequence, running: false, currentFrame: s.sequence.totalFrames },
            };
            saveImagingSettings(next);
            clearInterval(iv);
            return next;
          }
          const next = { ...s, sequence: { ...s.sequence, currentFrame: frame } };
          saveImagingSettings(next);
          return next;
        });
      }, 1500);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "exposure", label: "Exposure", icon: Target },
    { id: "autofocus", label: "Auto Focus", icon: Focus },
    { id: "dither", label: "Dither", icon: Move },
    { id: "meridian", label: "Meridian", icon: RotateCw },
    { id: "guiding", label: "Guiding", icon: RefreshCw },
  ];

  const progress =
    settings.sequence.totalFrames > 0
      ? (settings.sequence.currentFrame / settings.sequence.totalFrames) * 100
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Imaging</h1>
          <p className="text-xs text-[var(--muted)]">
            Auto Focus • Dither • Meridian Flip • FITS Preview
          </p>
        </div>
        {saved && (
          <span className="text-xs text-[var(--success)]">✓ تم الحفظ</span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Preview */}
        <div className="lg:col-span-3">
          <FitsPreview />

          {/* Sequence bar */}
          <div className="mt-3 asiair-panel">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-white">
                {settings.sequence.target} — Frame{" "}
                {settings.sequence.currentFrame}/{settings.sequence.totalFrames}
              </span>
              <span className="text-[var(--zwo-orange)]">{Math.round(progress)}%</span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-[var(--card-border)]">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[var(--zwo-orange)] to-orange-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-4">
              {!settings.sequence.running ? (
                <button className="btn-asiair-round !h-14 !w-14" onClick={toggleSequence}>
                  <Play size={24} fill="white" />
                </button>
              ) : (
                <button className="btn-asiair-stop !h-14 !w-14" onClick={toggleSequence}>
                  <Square size={22} fill="white" />
                </button>
              )}
              <div className="text-center text-xs text-[var(--muted)]">
                <p>{settings.exposure}s × G{settings.gain}</p>
                <p>{settings.filter} @ {settings.temperature}°C</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex flex-wrap gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                  tab === id
                    ? "bg-[var(--zwo-orange)] text-white"
                    : "bg-[var(--card)] text-[var(--muted)]"
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div className="asiair-panel min-h-[320px] space-y-4">
            {tab === "exposure" && (
              <>
                <ToggleRow
                  label="Frame Type"
                  value={settings.frameType}
                  options={["light", "dark", "flat", "bias"]}
                  onChange={(v) => update({ frameType: v as ImagingSettings["frameType"] })}
                />
                <SliderRow label="Exposure (s)" value={settings.exposure} min={1} max={900} step={1}
                  onChange={(v) => update({ exposure: v })} />
                <SliderRow label="Gain" value={settings.gain} min={0} max={300} step={1}
                  onChange={(v) => update({ gain: v })} />
                <SliderRow label="Offset" value={settings.offset} min={0} max={100} step={1}
                  onChange={(v) => update({ offset: v })} />
                <SliderRow label="Cooling (°C)" value={settings.temperature} min={-20} max={20} step={1}
                  onChange={(v) => update({ temperature: v })} />
                <SelectRow label="Filter" value={settings.filter}
                  options={["L", "R", "G", "B", "Ha", "OIII", "SII", "L-Pro"]}
                  onChange={(v) => update({ filter: v })} />
                <SliderRow label="Total Frames" value={settings.sequence.totalFrames} min={1} max={200} step={1}
                  onChange={(v) => update({ sequence: { ...settings.sequence, totalFrames: v } })} />
              </>
            )}

            {tab === "autofocus" && (
              <>
                <SwitchRow label="Auto Focus" checked={settings.autoFocus.enabled}
                  onChange={(v) => update({ autoFocus: { ...settings.autoFocus, enabled: v } })} />
                <SelectRow label="Mode" value={settings.autoFocus.mode}
                  options={["auto", "on", "off"]}
                  onChange={(v) => update({ autoFocus: { ...settings.autoFocus, mode: v as "auto" | "on" | "off" } })} />
                <SliderRow label="Step Size" value={settings.autoFocus.stepSize} min={100} max={2000} step={50}
                  onChange={(v) => update({ autoFocus: { ...settings.autoFocus, stepSize: v } })} />
                <SliderRow label="Max Steps" value={settings.autoFocus.maxSteps} min={5} max={50} step={1}
                  onChange={(v) => update({ autoFocus: { ...settings.autoFocus, maxSteps: v } })} />
                <SliderRow label="Target HFD" value={settings.autoFocus.targetHfd} min={1.5} max={5} step={0.1}
                  onChange={(v) => update({ autoFocus: { ...settings.autoFocus, targetHfd: v } })} />
                <div className="rounded-xl bg-[var(--card-elevated)] p-3 text-center">
                  <p className="asiair-stat-label">Current HFD</p>
                  <p className="asiair-stat-value text-[var(--zwo-orange)]">
                    {settings.autoFocus.currentHfd?.toFixed(2) ?? "—"}″
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    Status: {settings.autoFocus.status}
                  </p>
                </div>
                <button className="btn-primary w-full" onClick={runAutoFocus}
                  disabled={settings.autoFocus.status === "running"}>
                  {settings.autoFocus.status === "running" ? "جاري التركيز..." : "Run Auto Focus"}
                </button>
              </>
            )}

            {tab === "dither" && (
              <>
                <SwitchRow label="Dither Enabled" checked={settings.dither.enabled}
                  onChange={(v) => update({ dither: { ...settings.dither, enabled: v } })} />
                <SliderRow label="Dither Pixels" value={settings.dither.pixels} min={1} max={30} step={1}
                  onChange={(v) => update({ dither: { ...settings.dither, pixels: v } })} />
                <SliderRow label="Every N Frames" value={settings.dither.everyNFrames} min={1} max={10} step={1}
                  onChange={(v) => update({ dither: { ...settings.dither, everyNFrames: v } })} />
                <SwitchRow label="RA Only" checked={settings.dither.raOnly}
                  onChange={(v) => update({ dither: { ...settings.dither, raOnly: v } })} />
                <div className="rounded-xl border border-dashed border-[var(--card-border)] p-4 text-center text-xs text-[var(--muted)]">
                  ASIAIR: Dither {settings.dither.pixels}px كل {settings.dither.everyNFrames} إطار
                  {settings.dither.raOnly ? " (RA only)" : ""}
                </div>
              </>
            )}

            {tab === "meridian" && (
              <>
                <SwitchRow label="Meridian Flip" checked={settings.meridianFlip.enabled}
                  onChange={(v) => update({ meridianFlip: { ...settings.meridianFlip, enabled: v } })} />
                <SelectRow label="Mode" value={settings.meridianFlip.mode}
                  options={["stop_flip", "pause_flip", "disabled"]}
                  labels={["Stop & Flip", "Pause & Flip", "Disabled"]}
                  onChange={(v) => update({ meridianFlip: { ...settings.meridianFlip, mode: v as ImagingSettings["meridianFlip"]["mode"] } })} />
                <SliderRow label="Flip Angle (°)" value={settings.meridianFlip.flipAngle} min={-5} max={5} step={0.5}
                  onChange={(v) => update({ meridianFlip: { ...settings.meridianFlip, flipAngle: v } })} />
                <div className="rounded-xl bg-[var(--card-elevated)] p-3">
                  <p className="asiair-stat-label">Time to Meridian</p>
                  <p className="asiair-stat-value">
                    {settings.meridianFlip.minutesToFlip ?? "—"}
                    {settings.meridianFlip.minutesToFlip != null && (
                      <span className="text-sm text-[var(--muted)]"> min</span>
                    )}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--success)]">
                    Status: {settings.meridianFlip.status}
                  </p>
                </div>
                <button className="btn-secondary w-full flex items-center justify-center gap-2"
                  onClick={() => update({ meridianFlip: { ...settings.meridianFlip, status: "flipping" } })}>
                  <RotateCw size={14} />
                  Simulate Flip Now
                </button>
              </>
            )}

            {tab === "guiding" && (
              <>
                <div className="rounded-xl bg-[var(--card-elevated)] p-3 text-center">
                  <p className="asiair-stat-label">Guiding RMS</p>
                  <p className={`asiair-stat-value ${settings.guiding.rms < 0.6 ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>
                    {settings.guiding.rms.toFixed(2)}″
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    {settings.guiding.status}
                  </p>
                </div>
                <SliderRow label="Guide Exposure (s)" value={settings.guiding.exposure} min={1} max={5} step={0.5}
                  onChange={(v) => update({ guiding: { ...settings.guiding, exposure: v } })} />
                <SliderRow label="Guide Gain" value={settings.guiding.gain} min={0} max={200} step={5}
                  onChange={(v) => update({ guiding: { ...settings.guiding, gain: v } })} />
                <p className="text-[10px] text-[var(--muted)]">
                  ASI120MM Mini • Mini Guide Scope 30mm
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="tabular-nums text-white">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--zwo-orange)]" />
    </div>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-white">{label}</span>
      <button type="button" role="switch" aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[var(--zwo-orange)]" : "bg-[var(--card-border)]"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "left-0.5" : "left-5"}`} />
      </button>
    </label>
  );
}

function SelectRow({
  label, value, options, labels, onChange,
}: {
  label: string; value: string; options: string[]; labels?: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o, i) => (
          <option key={o} value={o}>{labels?.[i] ?? o}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-1">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)}
            className={`flex-1 rounded-lg py-1.5 text-xs capitalize ${
              value === o ? "bg-[var(--zwo-orange)] text-white" : "bg-[var(--card-elevated)] text-[var(--muted)]"
            }`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
