"use client";

import { useEffect, useState } from "react";
import {
  ActiveRig,
  Camera,
  Controller,
  CustomEquipment,
  FilterWheel,
  Mount,
  Telescope,
} from "@/lib/types";
import { fetchJson } from "@/lib/utils";
import AsiairBatteryPanel from "@/components/asiair/AsiairBatteryPanel";
import DeviceControlPanel from "@/components/equipment/DeviceControlPanel";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";

interface Guider {
  id: number;
  name: string;
}

interface Props {
  mounts: Mount[];
  cameras: Camera[];
  telescopes: Telescope[];
  guiders: Guider[];
  onSaved: () => void;
}

export function EquipmentRigPanel({
  mounts,
  cameras,
  telescopes,
  guiders,
  onSaved,
}: Props) {
  const [rig, setRig] = useState<ActiveRig | null>(null);
  const [wheels, setWheels] = useState<FilterWheel[]>([]);
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [form, setForm] = useState<Partial<ActiveRig>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchJson<ActiveRig | null>("/api/rigs/active"),
      fetchJson<FilterWheel[]>("/api/filter-wheels"),
      fetchJson<Controller[]>("/api/controllers"),
    ]).then(([r, w, c]) => {
      setRig(r);
      setWheels(w);
      setControllers(c);
      if (r) setForm(r);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await fetchJson<ActiveRig>("/api/rigs/active", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setRig(updated);
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const sel = (key: keyof ActiveRig, value: string) =>
    setForm({ ...form, [key]: value ? Number(value) : null });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card space-y-4">
        <h3 className="font-semibold text-white">Active Rig — الإعداد النشط</h3>
        <p className="text-xs text-[var(--muted)]">
          اختر المعدات المتصلة بالـ ASIAIR — تظهر في شريط الأجهزة والرئيسية
        </p>
        <div>
          <label className="label">اسم الـ Rig</label>
          <input
            className="input-field"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">الحامل</label>
            <select
              className="input-field"
              value={form.mount_id ?? ""}
              onChange={(e) => sel("mount_id", e.target.value)}
            >
              <option value="">—</option>
              {mounts.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">الكاميرا</label>
            <select
              className="input-field"
              value={form.camera_id ?? ""}
              onChange={(e) => sel("camera_id", e.target.value)}
            >
              <option value="">—</option>
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">التلسكوب</label>
            <select
              className="input-field"
              value={form.telescope_id ?? ""}
              onChange={(e) => sel("telescope_id", e.target.value)}
            >
              <option value="">—</option>
              {telescopes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">التوجيه</label>
            <select
              className="input-field"
              value={form.guider_id ?? ""}
              onChange={(e) => sel("guider_id", e.target.value)}
            >
              <option value="">—</option>
              {guiders.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">عجلة الفلاتر</label>
            <select
              className="input-field"
              value={form.filter_wheel_id ?? ""}
              onChange={(e) => sel("filter_wheel_id", e.target.value)}
            >
              <option value="">—</option>
              {wheels.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">ASIAIR</label>
            <select
              className="input-field"
              value={form.controller_id ?? ""}
              onChange={(e) => sel("controller_id", e.target.value)}
            >
              <option value="">—</option>
              {controllers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-primary w-full" onClick={save} disabled={saving}>
          {saving ? "جاري الحفظ..." : "حفظ الـ Rig النشط"}
        </button>
        {rig && (
          <p className="text-[10px] text-[var(--muted)]">
            آخر تحديث: {new Date(rig.updated_at).toLocaleString("ar-IQ")}
          </p>
        )}
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold text-white">ملخص الـ Rig</h3>
        <ul className="space-y-2 text-sm">
          {[
            ["الحامل", rig?.mount_name],
            ["الكاميرا", rig?.camera_name],
            ["التلسكوب", rig?.telescope_name],
            ["التوجيه", rig?.guider_name],
            ["الفلاتر", rig?.filter_wheel_name],
            ["ASIAIR", rig?.controller_name],
          ].map(([label, value]) => (
            <li key={label as string} className="flex justify-between border-b border-[var(--card-border)] py-2 last:border-0">
              <span className="text-[var(--muted)]">{label}</span>
              <span className="text-white">{value || "—"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function EquipmentPowerPanel() {
  const { status, refresh } = useDeviceStatus(4000);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AsiairBatteryPanel
        battery={
          status?.battery ?? {
            voltage: 0,
            percent: 0,
            isCharging: false,
            status: "good",
            controllerId: null,
            controllerName: null,
            lastSyncAt: null,
          }
        }
        connected={status?.connected}
      />
      <DeviceControlPanel
        controller={status?.controller ?? null}
        connected={status?.connected ?? false}
        onUpdated={refresh}
      />
    </div>
  );
}

export function EquipmentCustomPanel() {
  const [items, setItems] = useState<CustomEquipment[]>([]);
  const [form, setForm] = useState({ name: "", category: "other", brand: "", model: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetchJson<CustomEquipment[]>("/api/custom-equipment").then(setItems);

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchJson("/api/custom-equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", category: "other", brand: "", model: "", notes: "" });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل الإضافة");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("حذف المعدة؟")) return;
    await fetch(`/api/custom-equipment?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={add} className="card space-y-3">
        <h3 className="font-semibold text-white">إضافة معدة مستقبلية</h3>
        <p className="text-xs text-[var(--muted)]">
          Dew Heater • Focuser • Power Box • أي جهاز جديد
        </p>
        <input
          className="input-field"
          placeholder="الاسم *"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          className="input-field"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="focuser">Focuser</option>
          <option value="dew_heater">Dew Heater</option>
          <option value="power">Power Box</option>
          <option value="rotator">Rotator</option>
          <option value="other">أخرى</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="input-field"
            placeholder="الشركة"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="الموديل"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />
        </div>
        <textarea
          className="input-field"
          rows={2}
          placeholder="ملاحظات"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? "..." : "+ إضافة"}
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card flex items-start justify-between">
            <div>
              <h4 className="font-medium text-white">{item.name}</h4>
              <p className="text-xs text-[var(--muted)]">
                {item.category} • {item.brand} {item.model}
              </p>
              {item.notes && <p className="mt-1 text-xs text-[var(--muted)]">{item.notes}</p>}
            </div>
            <button className="btn-danger" onClick={() => remove(item.id)}>
              ×
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-[var(--muted)]">لا توجد معدات مخصصة بعد</p>
        )}
      </div>
    </div>
  );
}

export function EquipmentAsiairPanel() {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [wheels, setWheels] = useState<FilterWheel[]>([]);
  const { status, refresh } = useDeviceStatus(4000);

  const load = () =>
    Promise.all([
      fetchJson<Controller[]>("/api/controllers"),
      fetchJson<FilterWheel[]>("/api/filter-wheels"),
    ]).then(([c, w]) => {
      setControllers(c);
      setWheels(w);
    });

  useEffect(() => {
    load();
  }, []);

  const addController = async () => {
    const name = prompt("اسم وحدة ASIAIR:", "ASIAIR Mini");
    if (!name) return;
    await fetchJson("/api/controllers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        model: name,
        ip_address: "192.168.1.101",
        wifi_ssid: "ASIAIR-AP",
      }),
    });
    load();
    refresh();
  };

  const addWheel = async () => {
    const name = prompt("اسم عجلة الفلاتر:", "EFW 7×");
    if (!name) return;
    await fetchJson("/api/filter-wheels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slots: 7 }),
    });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={addController}>
          + ASIAIR Controller
        </button>
        <button className="btn-secondary" onClick={addWheel}>
          + Filter Wheel
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {controllers.map((c) => (
          <div key={c.id} className="card">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-white">{c.name}</h3>
              <span
                className={`badge ${c.connection_status === "connected" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-[var(--muted)]"}`}
              >
                {c.connection_status}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {c.ip_address} • {c.wifi_ssid}
            </p>
            <p className="mt-2 tabular-nums text-lg font-bold text-[var(--zwo-orange)]">
              {c.battery_voltage.toFixed(2)}V — {Math.round(c.battery_pct)}%
            </p>
          </div>
        ))}
        {wheels.map((w) => (
          <div key={w.id} className="card">
            <h3 className="font-semibold text-white">{w.name}</h3>
            <p className="text-xs text-[var(--muted)]">
              {w.slots} slots • {w.connection_status}
            </p>
            <p className="mt-2 text-sm text-cyan-400">
              {w.current_filter ?? "—"} (Slot {w.current_slot})
            </p>
          </div>
        ))}
      </div>

      <DeviceControlPanel
        controller={status?.controller ?? controllers[0] ?? null}
        connected={status?.connected ?? false}
        onUpdated={() => {
          refresh();
          load();
        }}
      />
    </div>
  );
}
