"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Thermometer, User, Wifi } from "lucide-react";

export default function AsiairTopBar() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [username, setUsername] = useState<string | null>(null);

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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.username) setUsername(data.username);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[var(--card-border)] bg-[#0a0b0f]/95 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--zwo-orange)] text-xs font-black text-white">
            A
          </div>
          <div>
            <span className="text-sm font-bold tracking-wide text-white">
              AstroLab
            </span>
            <span className="mr-2 hidden text-[9px] text-[var(--muted)] sm:inline">
              | Eng. Ahmed alfaisal
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {username && (
          <div className="hidden items-center gap-1.5 rounded-lg bg-[var(--card-elevated)] px-2 py-1 sm:flex">
            <User size={12} className="text-[var(--zwo-orange)]" />
            <span className="text-white">{username}</span>
          </div>
        )}
        <div className="hidden items-center gap-1.5 text-[var(--success)] sm:flex">
          <span className="status-dot status-dot-online" />
          <span>متصل</span>
        </div>
        <div className="hidden items-center gap-1 text-[var(--muted)] md:flex">
          <Thermometer size={12} className="text-cyan-400" />
          <span className="tabular-nums text-cyan-300">-10°C</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--muted)]">
          <Wifi size={12} className="text-[var(--zwo-orange)]" />
        </div>
        <span className="tabular-nums font-medium text-white">{time}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-400"
          title="تسجيل الخروج"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
