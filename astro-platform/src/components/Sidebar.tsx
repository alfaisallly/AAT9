"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calculator,
  Camera,
  CheckSquare,
  Crosshair,
  Home,
  ImageIcon,
  Map,
  Moon,
  Settings2,
  Smartphone,
  Telescope,
} from "lucide-react";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: Home },
  { href: "/equipment", label: "المعدات", icon: Settings2 },
  { href: "/gallery", label: "معرض الصور", icon: ImageIcon },
  { href: "/sessions", label: "جلسات المراقبة", icon: Moon },
  { href: "/targets", label: "الأهداف (176)", icon: Crosshair },
  { href: "/guide", label: "الدليل المرجعي", icon: BookOpen },
  { href: "/quick-ref", label: "بطاقات سريعة", icon: Smartphone },
  { href: "/sky-map", label: "خريطة السماء", icon: Map },
  { href: "/calculator", label: "حاسبة FOV", icon: Calculator },
  { href: "/checklist", label: "قوائم الفحص", icon: CheckSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-l border-[var(--card-border)] bg-[#0a0e18] lg:block">
        <div className="flex h-full flex-col p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
              <Telescope size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AstroLab</h1>
              <p className="text-xs text-[var(--muted)]">منصة التصوير الفلكي</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-indigo-600/20 text-indigo-300"
                      : "text-[var(--muted)] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 text-xs text-[var(--muted)]">
            <Camera size={14} className="mb-1 inline" /> EQ6-R • EQ350 • ASIAIR
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--card-border)] bg-[#0a0e18] lg:hidden">
        {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
                active ? "text-indigo-400" : "text-[var(--muted)]"
              }`}
            >
              <Icon size={18} />
              {label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
