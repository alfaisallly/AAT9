"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { TargetRecommendation } from "@/data/targets-catalog";
import { targetTypeLabels, fetchJson } from "@/lib/utils";

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export default function TargetsPage() {
  const [targets, setTargets] = useState<TargetRecommendation[]>([]);
  const [total, setTotal] = useState(0);
  const [month, setMonth] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (type) params.set("type", type);
    if (search) params.set("q", search);
    fetchJson<{ total: number; targets: TargetRecommendation[] }>(
      `/api/targets-catalog?${params}`
    )
      .then((data) => {
        setTargets(data.targets);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [month, type, search]);

  return (
    <div>
      <PageHeader
        title="الأهداف السماوية"
        description={`${total} هدفاً — الفصل الثالث عشر من الدليل المرجعي`}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className="input-field min-w-[200px] flex-1"
          placeholder="بحث: M42, Orion, سديم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field w-auto"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">كل الأشهر</option>
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="input-field w-auto"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">كل الأنواع</option>
          <option value="galaxy">مجرة</option>
          <option value="nebula">سديم</option>
          <option value="cluster">عنقود</option>
          <option value="planet">كوكب</option>
          <option value="moon">قمر</option>
          <option value="sun">شمس</option>
        </select>
      </div>

      {loading ? (
        <p className="text-[var(--muted)]">جاري التحميل...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {targets.map((t) => (
            <div
              key={t.id}
              className="card cursor-pointer transition hover:border-indigo-500/30"
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{t.name}</h3>
                  <p className="text-sm text-indigo-400">{t.designation}</p>
                </div>
                <span className="badge bg-purple-500/20 text-purple-300">
                  {targetTypeLabels[t.targetType]}
                </span>
              </div>

              <p className="mt-1 text-xs text-[var(--muted)]">{t.constellation}</p>

              {expanded === t.id && (
                <div className="mt-3 space-y-1 border-t border-[var(--card-border)] pt-3 text-sm">
                  <p><span className="text-[var(--muted)]">أشهر:</span> {t.bestMonths.map((m) => MONTHS[m - 1]).join(", ")}</p>
                  <p><span className="text-[var(--muted)]">وقت:</span> {t.bestTime}</p>
                  <p><span className="text-[var(--muted)]">تلسكوب:</span> {t.bestTelescope}</p>
                  <p><span className="text-[var(--muted)]">كاميرا:</span> {t.bestCamera}</p>
                  <p><span className="text-[var(--muted)]">فلتر:</span> {t.bestFilter}</p>
                  <p><span className="text-[var(--muted)]">تعريض:</span> {t.exposure}</p>
                  {t.notes && <p className="text-xs text-[var(--muted)]">{t.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
