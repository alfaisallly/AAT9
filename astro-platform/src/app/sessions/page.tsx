"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import {
  Camera as CameraType,
  Mount,
  Session,
  Telescope as TelescopeType,
} from "@/lib/types";
import { fetchJson } from "@/lib/utils";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mounts, setMounts] = useState<Mount[]>([]);
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [telescopes, setTelescopes] = useState<TelescopeType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchJson<Session[]>("/api/sessions"),
      fetchJson<Mount[]>("/api/mounts"),
      fetchJson<CameraType[]>("/api/cameras"),
      fetchJson<TelescopeType[]>("/api/telescopes"),
    ])
      .then(([s, m, c, t]) => {
        setSessions(s);
        setMounts(m);
        setCameras(c);
        setTelescopes(t);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleDelete = async (id: number) => {
    if (!confirm("حذف الجلسة سيحذف جميع صورها. هل أنت متأكد؟")) return;
    await fetch(`/api/sessions?id=${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div>
      <PageHeader
        title="جلسات المراقبة"
        description="سجّل ليالي المراقبة واربط المعدات المستخدمة"
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + جلسة جديدة
          </button>
        }
      />

      {loading ? (
        <div className="text-[var(--muted)]">جاري التحميل...</div>
      ) : sessions.length === 0 ? (
        <div className="card text-center text-[var(--muted)]">
          لا توجد جلسات. أنشئ جلسة مراقبة جديدة للبدء.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {session.name}
                    </h3>
                    <span className="badge bg-indigo-500/20 text-indigo-300">
                      {session.image_count ?? 0} صورة
                    </span>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {session.session_date}
                    </span>
                    {session.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {session.location}
                      </span>
                    )}
                    {session.weather && <span>🌤 {session.weather}</span>}
                    {session.seeing && <span>👁 رؤية: {session.seeing}</span>}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    {session.mount_name && (
                      <span className="rounded-lg bg-white/5 px-3 py-1">
                        🔄 {session.mount_name}
                      </span>
                    )}
                    {session.camera_name && (
                      <span className="rounded-lg bg-white/5 px-3 py-1">
                        📷 {session.camera_name}
                      </span>
                    )}
                    {session.telescope_name && (
                      <span className="rounded-lg bg-white/5 px-3 py-1">
                        🔭 {session.telescope_name}
                      </span>
                    )}
                  </div>

                  {session.notes && (
                    <p className="mt-3 text-sm text-[var(--muted)]">
                      {session.notes}
                    </p>
                  )}
                </div>

                <button
                  className="btn-danger shrink-0"
                  onClick={() => handleDelete(session.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mounts={mounts}
        cameras={cameras}
        telescopes={telescopes}
        onSaved={() => {
          setModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}

function SessionModal({
  open,
  onClose,
  mounts,
  cameras,
  telescopes,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  mounts: Mount[];
  cameras: CameraType[];
  telescopes: TelescopeType[];
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    session_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchJson("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          session_date: form.session_date,
          location: form.location || null,
          mount_id: form.mount_id ? Number(form.mount_id) : null,
          camera_id: form.camera_id ? Number(form.camera_id) : null,
          telescope_id: form.telescope_id ? Number(form.telescope_id) : null,
          weather: form.weather || null,
          seeing: form.seeing || null,
          notes: form.notes || null,
        }),
      });
      setForm({ session_date: new Date().toISOString().split("T")[0] });
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="جلسة مراقبة جديدة">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">اسم الجلسة *</label>
          <input
            className="input-field"
            required
            placeholder="مثال: ليلة Orion"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">التاريخ *</label>
            <input
              type="date"
              className="input-field"
              required
              value={form.session_date || ""}
              onChange={(e) =>
                setForm({ ...form, session_date: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">الموقع</label>
            <input
              className="input-field"
              placeholder="موقع المراقبة"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">الحامل</label>
          <select
            className="input-field"
            value={form.mount_id || ""}
            onChange={(e) => setForm({ ...form, mount_id: e.target.value })}
          >
            <option value="">— اختر —</option>
            {mounts.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.brand} {m.model})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">الكاميرا</label>
          <select
            className="input-field"
            value={form.camera_id || ""}
            onChange={(e) => setForm({ ...form, camera_id: e.target.value })}
          >
            <option value="">— اختر —</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.brand} {c.model})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">التلسكوب</label>
          <select
            className="input-field"
            value={form.telescope_id || ""}
            onChange={(e) =>
              setForm({ ...form, telescope_id: e.target.value })
            }
          >
            <option value="">— اختر —</option>
            {telescopes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.brand} {t.model})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">الطقس</label>
            <input
              className="input-field"
              placeholder="صافٍ / غائم"
              value={form.weather || ""}
              onChange={(e) => setForm({ ...form, weather: e.target.value })}
            />
          </div>
          <div>
            <label className="label">الرؤية (Seeing)</label>
            <input
              className="input-field"
              placeholder="1/5 - 5/5"
              value={form.seeing || ""}
              onChange={(e) => setForm({ ...form, seeing: e.target.value })}
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
