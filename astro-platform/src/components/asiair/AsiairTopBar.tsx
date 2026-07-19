"use client";

import { useEffect, useState } from "react";
import { Thermometer, Wifi } from "lucide-react";

export default function AsiairTopBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("ar-IQ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[var(--card-border)] bg-[#0a0b0f]/95 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--zwo-orange)] text-xs font-black text-white">
            Z
          </div>
          <span className="text-sm font-bold tracking-wide text-white">
            AstroLab
          </span>
          <span className="hidden text-[10px] text-[var(--muted)] sm:inline">
            ASIAIR Style
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="hidden items-center gap-1.5 text-[var(--success)] sm:flex">
          <span className="status-dot status-dot-online" />
          <span>متصل</span>
        </div>
        <div className="hidden items-center gap-1 text-[var(--muted)] md:flex">
          <Thermometer size={12} className="text-cyan-400" />
          <span className="tabular-nums text-cyan-300">-10°C</span>
        </div>
        <div className="hidden items-center gap-1 text-[var(--muted)] md:flex">
          <span className="text-[var(--success)]">RMS</span>
          <span className="tabular-nums text-white">0.42″</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--muted)]">
          <Wifi size={12} className="text-[var(--zwo-orange)]" />
        </div>
        <span className="tabular-nums font-medium text-white">{time}</span>
      </div>
    </header>
  );
}
