"use client";

import { useEffect, useState } from "react";
import { Camera, Monitor, Settings2, Telescope, Trash2, Crosshair, Battery, Smartphone, Layers, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Camera as CameraType, Mount, Telescope as TelescopeType } from "@/lib/types";
import { fetchJson, mountTypeLabels } from "@/lib/utils";
import {
  EquipmentAsiairPanel,
  EquipmentCustomPanel,
  EquipmentPowerPanel,
  EquipmentRigPanel,
} from "@/components/equipment/EquipmentDevicePanels";

type Tab = "mounts" | "cameras" | "telescopes" | "guiders" | "software" | "rig" | "asiair" | "power" | "custom";

interface Guider {
  id: number;
  name: string;
  brand: string;
  model: string;
  pixel_size_um: number | null;
  resolution: string | null;
  notes: string | null;
}

interface SoftwareItem {
  id: number;
  name: string;
  category: string;
  notes: string | null;
}

export default function EquipmentPage() {
  const [tab, setTab] = useState<Tab>("mounts");
  const [mounts, setMounts] = useState<Mount[]>([]);
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [telescopes, setTelescopes] = useState<TelescopeType[]>([]);
  const [guiders, setGuiders] = useState<Guider[]>([]);
  const [software, setSoftware] = useState<SoftwareItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [guiderModal, setGuiderModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchJson<Mount[]>("/api/mounts"),
      fetchJson<CameraType[]>("/api/cameras"),
      fetchJson<TelescopeType[]>("/api/telescopes"),
      fetchJson<Guider[]>("/api/guiders"),
      fetchJson<SoftwareItem[]>("/api/software"),
    ])
      .then(([m, c, t, g, s]) => {
        setMounts(m);
        setCameras(c);
        setTelescopes(t);
        setGuiders(g);
        setSoftware(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleDelete = async (type: string, id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch(`/api/${type}?id=${id}`, { method: "DELETE" });
    loadData();
  };

  const tabs = [
    { id: "rig" as Tab, label: "Active Rig", icon: Layers, count: 1 },
    { id: "power" as Tab, label: "Battery", icon: Battery, count: 0 },
    { id: "asiair" as Tab, label: "ASIAIR", icon: Smartphone, count: 0 },
    { id: "mounts" as Tab, label: "الحوامل", icon: Settings2, count: mounts.length },
    { id: "cameras" as Tab, label: "الكاميرات", icon: Camera, count: cameras.length },
    {
      id: "telescopes" as Tab,
      label: "التلسكopes",
      icon: Telescope,
      count: telescopes.length,
    },
    { id: "guiders" as Tab, label: "التوجيه", icon: Crosshair, count: guiders.length },
    { id: "custom" as Tab, label: "معدات إضافية", icon: Plus, count: 0 },
    { id: "software" as Tab, label: "البرامج", icon: Monitor, count: software.length },
  ];

  return (
    <div>
      <PageHeader
        title="Equipment"
        description="Mount • Camera • Filter Wheel • Guide — ASIAIR Device Manager"
        action={
          ["mounts", "cameras", "telescopes"].includes(tab) ? (
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + إضافة {tab === "mounts" ? "حامل" : tab === "cameras" ? "كamera" : "تلسكوب"}
          </button>
          ) : tab === "guiders" ? (
          <button className="btn-primary" onClick={() => setGuiderModal(true)}>
            + إضافة Guider
          </button>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
              tab === id
                ? "bg-[var(--zwo-orange-dim)] text-[var(--zwo-orange)]"
                : "text-[var(--muted)] hover:bg-white/5"
            }`}
          >
            <Icon size={16} />
            {label}
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[var(--muted)]">جاري التحميل...</div>
      ) : (
        <>
          {tab === "rig" && (
            <EquipmentRigPanel
              mounts={mounts}
              cameras={cameras}
              telescopes={telescopes}
              guiders={guiders}
              onSaved={loadData}
            />
          )}

          {tab === "power" && <EquipmentPowerPanel />}

          {tab === "asiair" && <EquipmentAsiairPanel />}

          {tab === "custom" && <EquipmentCustomPanel />}

          {tab === "mounts" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mounts.map((mount) => (
                <div key={mount.id} className="card">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{mount.name}</h3>
                      <p className="text-sm text-[var(--muted)]">
                        {mount.brand} {mount.model}
                      </p>
                    </div>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete("mounts", mount.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-[var(--muted)]">النوع: </span>
                      {mountTypeLabels[mount.mount_type] || mount.mount_type}
                    </p>
                    {mount.max_payload_kg && (
                      <p>
                        <span className="text-[var(--muted)]">الحمولة: </span>
                        {mount.max_payload_kg} kg
                      </p>
                    )}
                    {mount.notes && (
                      <p className="text-[var(--muted)]">{mount.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "cameras" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cameras.map((camera) => (
                <div key={camera.id} className="card">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{camera.name}</h3>
                      <p className="text-sm text-[var(--muted)]">
                        {camera.brand} {camera.model}
                      </p>
                    </div>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete("cameras", camera.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-[var(--muted)]">المستشعر: </span>
                      {camera.sensor_type}
                    </p>
                    {camera.resolution && (
                      <p>
                        <span className="text-[var(--muted)]">الدقة: </span>
                        {camera.resolution}
                      </p>
                    )}
                    {camera.pixel_size_um && (
                      <p>
                        <span className="text-[var(--muted)]">حجم البكسل: </span>
                        {camera.pixel_size_um} µm
                      </p>
                    )}
                    <p>
                      <span className="badge bg-[var(--zwo-orange-dim)] text-[var(--zwo-orange)]">
                        {camera.has_cooling ? "تبريد ❄️" : "بدون تبريد"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "telescopes" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {telescopes.map((tel) => (
                <div key={tel.id} className="card">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{tel.name}</h3>
                      <p className="text-sm text-[var(--muted)]">
                        {tel.brand} {tel.model}
                      </p>
                    </div>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete("telescopes", tel.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    {tel.focal_length_mm && (
                      <p>
                        <span className="text-[var(--muted)]">البعد البؤري: </span>
                        {tel.focal_length_mm} mm
                      </p>
                    )}
                    {tel.aperture_mm && (
                      <p>
                        <span className="text-[var(--muted)]">الفتحة: </span>
                        {tel.aperture_mm} mm
                      </p>
                    )}
                    <p>
                      <span className="text-[var(--muted)]">النوع: </span>
                      {tel.telescope_type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "guiders" && (
            <div className="grid gap-4 md:grid-cols-2">
              {guiders.map((g) => (
                <div key={g.id} className="card">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{g.name}</h3>
                      <p className="text-sm text-[var(--muted)]">{g.brand} {g.model}</p>
                    </div>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete("guiders", g.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    {g.resolution && <p>الدقة: {g.resolution}</p>}
                    {g.pixel_size_um && <p>البكسل: {g.pixel_size_um} µm</p>}
                    {g.notes && <p className="text-[var(--muted)]">{g.notes}</p>}
                  </div>
                </div>
              ))}
              <div className="card border-dashed">
                <h3 className="font-semibold text-white">ZWO Mini Guide Scope 30mm</h3>
                <p className="text-sm text-[var(--muted)]">120mm f/4 — OAG alternative</p>
              </div>
            </div>
          )}

          {tab === "software" && (
            <div className="grid gap-4 md:grid-cols-2">
              {software.map((s) => (
                <div key={s.id} className="card">
                  <h3 className="font-semibold text-white">{s.name}</h3>
                  <span className="badge bg-[var(--zwo-orange-dim)] text-[var(--zwo-orange)]">{s.category}</span>
                  <p className="mt-2 text-sm text-[var(--muted)]">{s.notes}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {["mounts", "cameras", "telescopes"].includes(tab) && (
      <EquipmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tab={tab as "mounts" | "cameras" | "telescopes"}
        onSaved={() => {
          setModalOpen(false);
          loadData();
        }}
      />
      )}

      <GuiderModal
        open={guiderModal}
        onClose={() => setGuiderModal(false)}
        onSaved={() => {
          setGuiderModal(false);
          loadData();
        }}
      />
    </div>
  );
}

function EquipmentModal({
  open,
  onClose,
  tab,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  tab: "mounts" | "cameras" | "telescopes";
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = `/api/${tab}`;
      const body: Record<string, unknown> = { ...form };
      if (tab === "cameras") {
        body.has_cooling = form.has_cooling === "true";
        if (form.pixel_size_um) body.pixel_size_um = Number(form.pixel_size_um);
      }
      if (tab === "mounts" && form.max_payload_kg) {
        body.max_payload_kg = Number(form.max_payload_kg);
      }
      if (tab === "telescopes") {
        if (form.focal_length_mm)
          body.focal_length_mm = Number(form.focal_length_mm);
        if (form.aperture_mm) body.aperture_mm = Number(form.aperture_mm);
      }
      await fetchJson(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setForm({});
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const titles = {
    mounts: "إضافة حامل جديد",
    cameras: "إضافة كاميرا جديدة",
    telescopes: "إضافة تلسكوب جديد",
  };

  return (
    <Modal open={open} onClose={onClose} title={titles[tab]}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">الاسم *</label>
          <input
            className="input-field"
            required
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">الشركة</label>
            <input
              className="input-field"
              value={form.brand || ""}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div>
            <label className="label">الموديل</label>
            <input
              className="input-field"
              value={form.model || ""}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>
        </div>

        {tab === "mounts" && (
          <>
            <div>
              <label className="label">نوع الحامل</label>
              <select
                className="input-field"
                value={form.mount_type || "equatorial"}
                onChange={(e) =>
                  setForm({ ...form, mount_type: e.target.value })
                }
              >
                <option value="equatorial">استوائي</option>
                <option value="altaz">ارتفاع-سمت</option>
                <option value="hybrid">هجين</option>
              </select>
            </div>
            <div>
              <label className="label">الحمولة القصوى (kg)</label>
              <input
                type="number"
                className="input-field"
                value={form.max_payload_kg || ""}
                onChange={(e) =>
                  setForm({ ...form, max_payload_kg: e.target.value })
                }
              />
            </div>
          </>
        )}

        {tab === "cameras" && (
          <>
            <div>
              <label className="label">نوع المستشعر</label>
              <select
                className="input-field"
                value={form.sensor_type || "CMOS"}
                onChange={(e) =>
                  setForm({ ...form, sensor_type: e.target.value })
                }
              >
                <option value="CMOS">CMOS</option>
                <option value="CCD">CCD</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">حجم البكسل (µm)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={form.pixel_size_um || ""}
                  onChange={(e) =>
                    setForm({ ...form, pixel_size_um: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">الدقة</label>
                <input
                  className="input-field"
                  placeholder="6248x4176"
                  value={form.resolution || ""}
                  onChange={(e) =>
                    setForm({ ...form, resolution: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">التبريد</label>
              <select
                className="input-field"
                value={form.has_cooling || "true"}
                onChange={(e) =>
                  setForm({ ...form, has_cooling: e.target.value })
                }
              >
                <option value="true">نعم</option>
                <option value="false">لا</option>
              </select>
            </div>
          </>
        )}

        {tab === "telescopes" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">البعد البؤري (mm)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.focal_length_mm || ""}
                  onChange={(e) =>
                    setForm({ ...form, focal_length_mm: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">الفتحة (mm)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.aperture_mm || ""}
                  onChange={(e) =>
                    setForm({ ...form, aperture_mm: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">النوع</label>
              <select
                className="input-field"
                value={form.telescope_type || "refractor"}
                onChange={(e) =>
                  setForm({ ...form, telescope_type: e.target.value })
                }
              >
                <option value="refractor">Refractor</option>
                <option value="newtonian">Newtonian</option>
                <option value="sct">SCT</option>
                <option value="rc">RC</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </>
        )}

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

function GuiderModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (form.pixel_size_um) body.pixel_size_um = Number(form.pixel_size_um);
      await fetchJson("/api/guiders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setForm({});
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="إضافة كاميرا توجيه">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">الاسم *</label>
          <input
            className="input-field"
            required
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input-field"
            placeholder="الشركة"
            value={form.brand || ""}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="الموديل"
            value={form.model || ""}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "..." : "حفظ"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
