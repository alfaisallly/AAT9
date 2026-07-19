"use client";

import { useEffect, useState } from "react";
import { Calendar, Layers, MapPin, Play, Trash2 } from "lucide-react";
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Plan / Sequence</h1>
          <p className="text-xs text-[var(--muted)]">جلسات التصوير والتسلسلات</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Layers size={16} />
          Plan جديد
        </button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--zwo-orange)] border-t-transparent" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="asiair-panel py-12 text-center text-[var(--muted)]">
          No plans yet — create your first sequence
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="asiair-panel overflow-hidden"
            >
              <div className="flex items-stretch gap-4">
                {/* ASIAIR sequence progress block */}
                <div className="flex w-16 shrink-0 flex-col items-center justify-center border-l border-[var(--card-border)] bg-[var(--card-elevated)]">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#252a36" strokeWidth="2" />
                      <circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke="#ff6a00" strokeWidth="2"
                        strokeDasharray={`${(session.image_count ?? 0) * 10} 100`}
                      />
                    </svg>
                    <Play size={14} className="absolute text-[var(--zwo-orange)]" fill="currentColor" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 py-3 pl-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white">{session.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {session.session_date}
                        </span>
                        {session.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {session.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="btn-danger shrink-0" onClick={() => handleDelete(session.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.mount_name && (
                      <span className="rounded-lg bg-[var(--zwo-orange-dim)] px-2 py-1 text-[10px] text-[var(--zwo-orange)]">
                        {session.mount_name}
                      </span>
                    )}
                    {session.camera_name && (
                      <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white">
                        {session.camera_name}
                      </span>
                    )}
                    {session.telescope_name && (
                      <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-cyan-300">
                        {session.telescope_name}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <span className="text-[var(--zwo-orange)]">
                      {session.image_count ?? 0} frames
                    </span>
                    {session.weather && <span>{session.weather}</span>}
                    {session.seeing && <span>Seeing {session.seeing}</span>}
                  </div>
                </div>
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
    <Modal open={open} onClose={onClose} title="Plan جديد">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">اسم الخطة *</label>
          <input
            className="input-field"
            required
            placeholder="M42 Ha Sequence"
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
              onChange={(e) => setForm({ ...form, session_date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">الموقع</label>
            <input
              className="input-field"
              placeholder="العراق"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">Mount</label>
          <select className="input-field" value={form.mount_id || ""} onChange={(e) => setForm({ ...form, mount_id: e.target.value })}>
            <option value="">—</option>
            {mounts.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Camera</label>
          <select className="input-field" value={form.camera_id || ""} onChange={(e) => setForm({ ...form, camera_id: e.target.value })}>
            <option value="">—</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Telescope</label>
          <select className="input-field" value={form.telescope_id || ""} onChange={(e) => setForm({ ...form, telescope_id: e.target.value })}>
            <option value="">—</option>
            {telescopes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Weather</label>
            <input className="input-field" value={form.weather || ""} onChange={(e) => setForm({ ...form, weather: e.target.value })} />
          </div>
          <div>
            <label className="label">Seeing</label>
            <input className="input-field" placeholder="2/5" value={form.seeing || ""} onChange={(e) => setForm({ ...form, seeing: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>إلغاء</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "..." : "Save Plan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
