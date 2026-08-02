"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { QUICK_REF_CARDS } from "@/data/quick-reference";

export default function QuickRefPage() {
  const [selected, setSelected] = useState(QUICK_REF_CARDS[0].id);
  const card = QUICK_REF_CARDS.find((c) => c.id === selected)!;

  return (
    <div>
      <PageHeader
        title="بطاقات مرجعية سريعة"
        description="صفحة واحدة لكل تلسكوب — للهاتف أثناء الرصد"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {QUICK_REF_CARDS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm ${
              selected === c.id
                ? "bg-indigo-600 text-white"
                : "bg-[var(--card)] text-[var(--muted)]"
            }`}
          >
            {c.title.split("—")[0].trim()}
          </button>
        ))}
      </div>

      <div className="card mx-auto max-w-lg border-2 border-indigo-500/30">
        <div className="mb-4 border-b border-[var(--card-border)] pb-4 text-center">
          <h2 className="text-xl font-bold text-white">{card.title}</h2>
          <p className="text-sm text-indigo-300">{card.subtitle}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Mount: {card.mount}</p>
        </div>

        <div className="space-y-3">
          {card.sections.map((s, i) => (
            <div
              key={i}
              className="flex justify-between gap-4 border-b border-[var(--card-border)] pb-2 text-sm last:border-0"
            >
              <span className="text-[var(--muted)]">{s.label}</span>
              <span className="text-left font-medium text-white">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        💡 افتح هذه الصفحة على هاتفك أثناء الرصد — لا حاجة للبحث في الدليل الكامل
      </p>
    </div>
  );
}
