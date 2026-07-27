"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { GuideChapter } from "@/data/guide-content";
import { fetchJson } from "@/lib/utils";

export default function GuidePage() {
  const [chapters, setChapters] = useState<GuideChapter[]>([]);

  useEffect(() => {
    fetchJson<GuideChapter[]>("/api/guide").then(setChapters);
  }, []);

  return (
    <div>
      <PageHeader
        title="الدليل المرجعي الاحترافي"
        description="15 فصلاً — من المعدات إلى المعالجة في PixInsight"
      />

      <div className="mb-6 card border-indigo-500/30 bg-indigo-500/5">
        <p className="text-sm text-indigo-200">
          دليل مخصص لمعداتك: EQ6-R + EQ350 | Askar V | SCA260 | C11 | MiniCat |
          Phoenix H-alpha | ASI2600MM/178/678 | ASIAIR + PixInsight
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {chapters.map((ch) => (
          <Link
            key={ch.id}
            href={`/guide/${ch.slug}`}
            className="card group transition hover:border-indigo-500/50"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="badge bg-indigo-500/20 text-indigo-300">
                فصل {ch.id}
              </span>
              <BookOpen
                size={16}
                className="text-[var(--muted)] group-hover:text-indigo-400"
              />
            </div>
            <h3 className="font-semibold text-white">{ch.title.replace(/^الفصل.*?— /, "")}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{ch.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
