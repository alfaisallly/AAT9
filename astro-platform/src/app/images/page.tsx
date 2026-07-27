"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import {
  AstroImage,
  Filter,
  Session,
  Target,
} from "@/lib/types";
import { fetchJson, frameTypeColors, frameTypeLabels } from "@/lib/utils";

export default function ImagesPage() {
  const [images, setImages] = useState<AstroImage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterSession, setFilterSession] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set("frame_type", filterType);
    if (filterSession) params.set("session_id", filterSession);

    Promise.all([
      fetchJson<AstroImage[]>(`/api/images?${params}`),
      fetchJson<Session[]>("/api/sessions"),
      fetchJson<Target[]>("/api/targets"),
      fetchJson<Filter[]>("/api/filters"),
    ])
      .then(([i, s, t, f]) => {
        setImages(i);
        setSessions(s);
        setTargets(t);
        setFilters(f);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [filterType, filterSession]);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch(`/api/images?id=${id}`, { method: "DELETE" });
    loadData();
  };

  const handleToggleProcessed = async (id: number) => {
    await fetchJson("/api/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  return (
    <div>
      <PageHeader
        title="مكتبة الصور"
        description="إدارة إطارات Light و Dark و Flat و Bias"
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + إضافة صورة
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          className="input-field w-auto min-w-[160px]"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">كل الأنواع</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="flat">Flat</option>
          <option value="bias">Bias</option>
        </select>
        <select
          className="input-field w-auto min-w-[200px]"
          value={filterSession}
          onChange={(e) => setFilterSession(e.target.value)}
        >
          <option value="">كل الجلسات</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-[var(--muted)]">جاري التحميل...</div>
      ) : images.length === 0 ? (
        <div className="card text-center text-[var(--muted)]">
          لا توجد صور. أضف إطارات جديدة أو غيّر الفلاتر.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--card)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 text-right">الملف</th>
                <th className="px-4 py-3 text-right">النوع</th>
                <th className="px-4 py-3 text-right">الهدف</th>
                <th className="px-4 py-3 text-right">الفلتر</th>
                <th className="px-4 py-3 text-right">التعريض</th>
                <th className="px-4 py-3 text-right">Gain</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img) => (
                <tr
                  key={img.id}
                  className="border-t border-[var(--card-border)] hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{img.filename}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {img.session_name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${frameTypeColors[img.frame_type] || ""}`}
                    >
                      {frameTypeLabels[img.frame_type] || img.frame_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {img.target_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {img.filter_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {img.exposure_sec ? `${img.exposure_sec}s` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {img.gain ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleProcessed(img.id)}
                      className={`badge cursor-pointer ${
                        img.processed
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {img.processed ? "معالج ✓" : "خام"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(img.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ImageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sessions={sessions}
        targets={targets}
        filters={filters}
        onSaved={() => {
          setModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}

function ImageModal({
  open,
  onClose,
  sessions,
  targets,
  filters,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  sessions: Session[];
  targets: Target[];
  filters: Filter[];
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    frame_type: "light",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchJson("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: Number(form.session_id),
          target_id: form.target_id ? Number(form.target_id) : null,
          filter_id: form.filter_id ? Number(form.filter_id) : null,
          frame_type: form.frame_type || "light",
          filename: form.filename,
          file_path: form.file_path || null,
          exposure_sec: form.exposure_sec ? Number(form.exposure_sec) : null,
          gain: form.gain ? Number(form.gain) : null,
          offset: form.offset ? Number(form.offset) : null,
          temperature_c: form.temperature_c
            ? Number(form.temperature_c)
            : null,
          date_taken: form.date_taken || null,
          notes: form.notes || null,
        }),
      });
      setForm({ frame_type: "light" });
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="إضافة صورة جديدة">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">الجلسة *</label>
          <select
            className="input-field"
            required
            value={form.session_id || ""}
            onChange={(e) => setForm({ ...form, session_id: e.target.value })}
          >
            <option value="">— اختر —</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.session_date})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">اسم الملف *</label>
          <input
            className="input-field"
            required
            placeholder="M42_L_300s_001.fits"
            value={form.filename || ""}
            onChange={(e) => setForm({ ...form, filename: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">نوع الإطار</label>
            <select
              className="input-field"
              value={form.frame_type || "light"}
              onChange={(e) =>
                setForm({ ...form, frame_type: e.target.value })
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="flat">Flat</option>
              <option value="bias">Bias</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div>
            <label className="label">التعريض (ثانية)</label>
            <input
              type="number"
              className="input-field"
              value={form.exposure_sec || ""}
              onChange={(e) =>
                setForm({ ...form, exposure_sec: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">الهدف</label>
            <select
              className="input-field"
              value={form.target_id || ""}
              onChange={(e) => setForm({ ...form, target_id: e.target.value })}
            >
              <option value="">— لا يوجد —</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">الفلتر</label>
            <select
              className="input-field"
              value={form.filter_id || ""}
              onChange={(e) => setForm({ ...form, filter_id: e.target.value })}
            >
              <option value="">— لا يوجد —</option>
              {filters.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Gain</label>
            <input
              type="number"
              className="input-field"
              value={form.gain || ""}
              onChange={(e) => setForm({ ...form, gain: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Offset</label>
            <input
              type="number"
              className="input-field"
              value={form.offset || ""}
              onChange={(e) => setForm({ ...form, offset: e.target.value })}
            />
          </div>
          <div>
            <label className="label">الحرارة (°C)</label>
            <input
              type="number"
              className="input-field"
              value={form.temperature_c || ""}
              onChange={(e) =>
                setForm({ ...form, temperature_c: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="label">مسار الملف</label>
          <input
            className="input-field"
            placeholder="/data/sessions/..."
            value={form.file_path || ""}
            onChange={(e) => setForm({ ...form, file_path: e.target.value })}
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
