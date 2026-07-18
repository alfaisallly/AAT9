"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Target } from "@/lib/types";
import { fetchJson, targetTypeLabels } from "@/lib/utils";

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetchJson<Target[]>("/api/targets")
      .then(setTargets)
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch(`/api/targets?id=${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div>
      <PageHeader
        title="الأهداف السماوية"
        description="كتalog الأهداف التي تصورها"
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + هدف جديد
          </button>
        }
      />

      {loading ? (
        <div className="text-[var(--muted)]">جاري التحميل...</div>
      ) : targets.length === 0 ? (
        <div className="card text-center text-[var(--muted)]">
          لا توجد أهداف. أضف أهدافك السماوية.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {targets.map((target) => (
            <div key={target.id} className="card">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{target.name}</h3>
                  {target.designation && (
                    <p className="text-sm text-indigo-400">
                      {target.designation}
                    </p>
                  )}
                </div>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(target.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  <span className="badge bg-purple-500/20 text-purple-300">
                    {targetTypeLabels[target.target_type] || target.target_type}
                  </span>
                </p>
                {target.constellation && (
                  <p>
                    <span className="text-[var(--muted)]">الكوكبة: </span>
                    {target.constellation}
                  </p>
                )}
                {(target.ra || target.dec) && (
                  <p className="font-mono text-xs text-[var(--muted)]">
                    RA: {target.ra || "—"} | Dec: {target.dec || "—"}
                  </p>
                )}
                {target.notes && (
                  <p className="text-[var(--muted)]">{target.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TargetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}

function TargetModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    target_type: "nebula",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchJson("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ target_type: "nebula" });
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="هدف سماوي جديد">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">الاسم *</label>
          <input
            className="input-field"
            required
            placeholder="مثال: سديم Orion"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">التسمية</label>
            <input
              className="input-field"
              placeholder="M42, NGC 7000"
              value={form.designation || ""}
              onChange={(e) =>
                setForm({ ...form, designation: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">النوع</label>
            <select
              className="input-field"
              value={form.target_type || "nebula"}
              onChange={(e) =>
                setForm({ ...form, target_type: e.target.value })
              }
            >
              <option value="galaxy">مجرة</option>
              <option value="nebula">سديم</option>
              <option value="cluster">كرة/عنقود</option>
              <option value="planet">كوكب</option>
              <option value="moon">قمر</option>
              <option value="sun">شمس</option>
              <option value="comet">مذنب</option>
              <option value="other">أخرى</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">الكوكبة</label>
          <input
            className="input-field"
            placeholder="Orion, Cygnus"
            value={form.constellation || ""}
            onChange={(e) =>
              setForm({ ...form, constellation: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">RA</label>
            <input
              className="input-field"
              placeholder="05h 35m 17s"
              value={form.ra || ""}
              onChange={(e) => setForm({ ...form, ra: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Dec</label>
            <input
              className="input-field"
              placeholder="-05° 23′ 28″"
              value={form.dec || ""}
              onChange={(e) => setForm({ ...form, dec: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">ملاحظات</label>
          <textarea
            className="input-field"
            rows={2}
            value={form.notes || ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
