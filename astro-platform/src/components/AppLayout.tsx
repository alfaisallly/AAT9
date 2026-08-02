"use client";

import { usePathname } from "next/navigation";
import AsiairShell from "@/components/asiair/AsiairShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return <AsiairShell>{children}</AsiairShell>;
}
