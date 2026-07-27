"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  POST_SESSION_CHECKLIST,
  PRE_SESSION_CHECKLIST,
} from "@/data/checklists";

export default function ChecklistPage() {
  const [tab, setTab] = useState<"pre" | "post">("pre");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const items = tab === "pre" ? PRE_SESSION_CHECKLIST : POST_SESSION_CHECKLIST;
  const done = items.filter((i) => checked[i.id]).length;

  const toggle = (id: string) =>
    setChecked((c) => ({ ...c, [id]: !c[id] }));

  const reset = () => setChecked({});

  return (
    <div>
      <PageHeader
        title="قوائم الفحص"
        description="الفصل الخامس عشر — قبل وبعد جلسة التصوير"
        action={
          <button className="btn-secondary" onClick={reset}>
            إعادة تعيين
          </button>
        }
      />

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("pre")}
          className={`rounded-lg px-4 py-2 text-sm ${
            tab === "pre" ? "bg-indigo-600 text-white" : "bg-[var(--card)]"
          }`}
        >
          قبل الجلسة ({PRE_SESSION_CHECKLIST.length})
        </button>
        <button
          onClick={() => setTab("post")}
          className={`rounded-lg px-4 py-2 text-sm ${
            tab === "post" ? "bg-indigo-600 text-white" : "bg-[var(--card)]"
          }`}
        >
          بعد الجلسة ({POST_SESSION_CHECKLIST.length})
        </button>
      </div>

      <div className="mb-4">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-indigo-500 transition-all"
            style={{ width: `${(done / items.length) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {done} / {items.length} مكتمل
        </p>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
              checked[item.id]
                ? "border-green-500/30 bg-green-500/10"
                : "border-[var(--card-border)] bg-[var(--card)]"
            }`}
          >
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => toggle(item.id)}
              className="h-5 w-5 rounded accent-indigo-500"
            />
            <div>
              <p className={checked[item.id] ? "text-green-300 line-through" : "text-white"}>
                {item.text}
              </p>
              <p className="text-xs text-[var(--muted)]">{item.category}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
