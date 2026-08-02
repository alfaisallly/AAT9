"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Info } from "lucide-react";
import {
  FitsHeaderInfo,
  renderFitsToCanvas,
} from "@/lib/imaging-settings";

export default function FitsPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [header, setHeader] = useState<FitsHeaderInfo | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [liveMode, setLiveMode] = useState(true);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);
    setLiveMode(false);
    try {
      const buffer = await file.arrayBuffer();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const info = renderFitsToCanvas(buffer, canvas);
      setHeader(info);
      setFilename(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل قراءة ملف FITS");
      setLiveMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="preview-frame flex flex-col">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-3 py-2">
        <div>
          <p className="text-xs font-semibold text-white">
            {liveMode ? "Live View" : "FITS Preview"}
          </p>
          {filename && (
            <p className="text-[10px] text-[var(--muted)]">{filename}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-white/5"
            onClick={() => setShowInfo(!showInfo)}
            title="FITS Header"
          >
            <Info size={16} />
          </button>
          <label className="cursor-pointer rounded-lg bg-[var(--zwo-orange-dim)] p-1.5 text-[var(--zwo-orange)] hover:bg-[var(--zwo-orange)] hover:text-white">
            <Upload size={16} />
            <input
              type="file"
              accept=".fits,.fit,.fts"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
          {liveMode ? null : (
            <button
              className="rounded-lg p-1.5 text-xs text-[var(--muted)] hover:text-white"
              onClick={() => {
                setLiveMode(true);
                setHeader(null);
                setFilename(null);
              }}
            >
              Live
            </button>
          )}
        </div>
      </div>

      <div
        className="relative flex min-h-[280px] flex-1 items-center justify-center p-2 lg:min-h-[360px]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <canvas
          ref={canvasRef}
          className={`max-h-[360px] max-w-full rounded-lg ${liveMode ? "hidden" : "block"}`}
        />

        {liveMode && (
          <div className="relative flex h-full w-full items-center justify-center">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: i % 5 === 0 ? 2 : 1,
                  height: i % 5 === 0 ? 2 : 1,
                  top: `${10 + ((i * 13) % 80)}%`,
                  left: `${10 + ((i * 19) % 80)}%`,
                  opacity: 0.2 + (i % 4) * 0.15,
                }}
              />
            ))}
            <div className="text-center">
              <p className="text-sm text-[var(--muted)]">Live View — ASIAIR</p>
              <p className="mt-1 text-xs text-[var(--muted)]/60">
                اسحب ملف .fits هنا للمعاينة
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--zwo-orange)] border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}
      </div>

      {showInfo && header && (
        <div className="border-t border-[var(--card-border)] p-3 text-[10px]">
          <div className="grid grid-cols-2 gap-1 text-[var(--muted)]">
            {Object.entries(header).map(([k, v]) => (
              <span key={k}>
                <span className="text-white">{k}:</span> {String(v)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
