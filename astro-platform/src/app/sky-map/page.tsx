"use client";

import PageHeader from "@/components/PageHeader";
import {
  PLANETARY_SEASONS_IRAQ,
  SEASONAL_SKY_IRAQ,
} from "@/data/seasonal-sky-iraq";

export default function SkyMapPage() {
  const currentMonth = new Date().getMonth() + 1;
  const monthData = SEASONAL_SKY_IRAQ.find((m) => m.month === currentMonth);

  return (
    <div>
      <PageHeader
        title="خريطة السماء الموسمية — العراق"
        description="ماذا تصوّر في كل شهر من خط عرض ~33°N"
      />

      {monthData && (
        <div className="mb-6 card border-green-500/30 bg-green-500/5">
          <h2 className="mb-2 font-semibold text-green-300">
            الشهر الحالي: {monthData.monthName} ({monthData.season})
          </h2>
          <p className="text-sm">{monthData.imagingNotes}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">{monthData.moonPhaseTip}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SEASONAL_SKY_IRAQ.map((m) => (
          <div
            key={m.month}
            className={`card ${m.month === currentMonth ? "ring-2 ring-indigo-500" : ""}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">
                {m.monthName}
              </h3>
              <span className="badge bg-purple-500/20 text-purple-300">
                {m.season}
              </span>
            </div>

            <div className="mb-3">
              <p className="mb-1 text-xs text-[var(--muted)]">أبرز الأهداف</p>
              <div className="flex flex-wrap gap-1">
                {m.bestTargets.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="rounded bg-white/5 px-2 py-0.5 text-xs text-indigo-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="mb-1 text-xs text-[var(--muted)]">الكوكبات</p>
              <p className="text-xs">{m.constellations.join(" • ")}</p>
            </div>

            <p className="text-xs text-[var(--muted)]">{m.imagingNotes}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">الكواكب — مواسم الرؤية</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLANETARY_SEASONS_IRAQ.map((p) => (
            <div key={p.object} className="card">
              <h3 className="font-medium text-white">{p.object}</h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                أشهر: {p.visibleMonths.map((m) => SEASONAL_SKY_IRAQ[m - 1]?.monthName.slice(0, 3)).join(", ")}
              </p>
              <p className="mt-2 text-sm">{p.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
