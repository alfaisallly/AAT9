"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calculator,
  CheckSquare,
  Crosshair,
  Home,
  ImageIcon,
  Layers,
  Map,
  Scan,
  Settings2,
  Smartphone,
} from "lucide-react";
import AsiairTopBar from "./AsiairTopBar";
import AsiairTabBar from "./AsiairTabBar";
import CopyrightFooter from "@/components/CopyrightFooter";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";

const sideNav = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/imaging", label: "Imaging", icon: Scan },
  { href: "/equipment", label: "المعدات", icon: Settings2 },
  { href: "/sessions", label: "Plan / Sequence", icon: Layers },
  { href: "/gallery", label: "Album", icon: ImageIcon },
  { href: "/targets", label: "Targets", icon: Crosshair },
  { href: "/guide", label: "Guide", icon: BookOpen },
  { href: "/quick-ref", label: "Quick Ref", icon: Smartphone },
  { href: "/sky-map", label: "Sky Map", icon: Map },
  { href: "/calculator", label: "FOV Calc", icon: Calculator },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
];

function SidebarStatus() {
  const { status } = useDeviceStatus(6000);
  const connected = status?.connected;
  const rig = status?.rig;
  const battery = status?.battery;

  const summary = [
    rig?.mount_name?.split(" ")[0],
    rig?.camera_name?.split(" ")[0],
    rig?.controller_name?.split(" ")[0],
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="rounded-xl bg-[var(--card-elevated)] p-3">
      <div className="flex items-center gap-2">
        <span className={`status-dot ${connected ? "status-dot-online" : "bg-gray-600"}`} />
        <span className={`text-xs ${connected ? "text-[var(--success)]" : "text-[var(--muted)]"}`}>
          {connected ? "All Connected" : "Disconnected"}
        </span>
      </div>
      <p className="mt-1 text-[10px] text-[var(--muted)]">
        {summary || "اضبط Active Rig"}
      </p>
      {battery && battery.voltage > 0 && (
        <p className="mt-1 tabular-nums text-[10px] text-[var(--zwo-orange)]">
          🔋 {battery.voltage.toFixed(2)}V ({Math.round(battery.percent)}%)
        </p>
      )}
    </div>
  );
}

export default function AsiairShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <AsiairTopBar />

      <div className="flex flex-1">
        <aside className="hidden w-[220px] shrink-0 flex-col border-l border-[var(--card-border)] bg-[#0a0b0f] lg:flex">
          <div className="border-b border-[var(--card-border)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--zwo-orange)] to-orange-700 shadow-asiair">
                <span className="text-lg font-black text-white">A</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">AstroLab</h1>
                <p className="text-[10px] text-[var(--muted)]">Powered by ZWO Style</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {sideNav.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-[var(--zwo-orange-dim)] font-semibold text-[var(--zwo-orange)]"
                      : "text-[var(--muted)] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[var(--card-border)] p-4 space-y-3">
            <SidebarStatus />
            <CopyrightFooter compact />
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-auto px-4 py-4 pb-20 lg:px-6 lg:py-5 lg:pb-5">
            {children}
          </div>
          <footer className="hidden border-t border-[var(--card-border)] bg-[#0a0b0f] px-6 py-3 lg:block">
            <CopyrightFooter />
          </footer>
        </main>
      </div>

      <AsiairTabBar />
    </div>
  );
}
