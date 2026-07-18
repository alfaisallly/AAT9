"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  Crosshair,
  Home,
  ImageIcon,
  Moon,
  Settings2,
  Telescope,
} from "lucide-react";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: Home },
  { href: "/equipment", label: "المعدات", icon: Settings2 },
  { href: "/sessions", label: "جلسات المراقبة", icon: Moon },
  { href: "/images", label: "مكتبة الصور", icon: ImageIcon },
  { href: "/targets", label: "الأهداف السماوية", icon: Crosshair },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-l border-[var(--card-border)] bg-[#0a0e18] md:block">
      <div className="flex h-full flex-col p-5">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
            <Telescope size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AstroLab</h1>
            <p className="text-xs text-[var(--muted)]">إدارة التصوير الفلكي</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "text-[var(--muted)] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Camera size={14} />
            <span>حوامل • كاميرات • تلسكopes</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
