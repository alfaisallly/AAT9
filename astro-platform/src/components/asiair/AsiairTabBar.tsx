"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Crosshair,
  Home,
  ImageIcon,
  Layers,
  MoreHorizontal,
  Scan,
} from "lucide-react";
import { useState } from "react";

const mainTabs = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/imaging", label: "Imaging", icon: Scan },
  { href: "/gallery", label: "المعرض", icon: ImageIcon },
  { href: "/sessions", label: "التسلسل", icon: Layers },
  { href: "/targets", label: "الأهداف", icon: Crosshair },
];

const moreLinks = [
  { href: "/guide", label: "الدليل", icon: BookOpen },
  { href: "/quick-ref", label: "بطاقات", icon: BookOpen },
  { href: "/sky-map", label: "السماء", icon: BookOpen },
  { href: "/calculator", label: "FOV", icon: BookOpen },
  { href: "/checklist", label: "فحص", icon: BookOpen },
];

export default function AsiairTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--card-border)] bg-[#0a0b0f] lg:hidden">
        {moreOpen && (
          <div className="border-b border-[var(--card-border)] bg-[var(--card)] p-3">
            <div className="grid grid-cols-3 gap-2">
              {moreLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className="rounded-xl bg-[var(--card-elevated)] py-2 text-center text-xs text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex h-14 items-stretch">
          {mainTabs.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition ${
                isActive(href)
                  ? "text-[var(--zwo-orange)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <Icon size={20} strokeWidth={isActive(href) ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive(href) && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-[var(--zwo-orange)]" />
              )}
            </Link>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 ${
              moreOpen ? "text-[var(--zwo-orange)]" : "text-[var(--muted)]"
            }`}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-medium">المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
}
