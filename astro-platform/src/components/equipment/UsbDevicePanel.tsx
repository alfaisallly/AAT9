"use client";

import { useCallback, useEffect, useState } from "react";
import { Cable, RefreshCw, Usb, WifiOff } from "lucide-react";
import { UsbBridgeDevice, UsbBridgePayload } from "@/lib/usb-bridge-client";
import { fetchJson } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  camera: "كاميرا",
  mount: "حامل",
  guider: "توجيه",
  focuser: "فوكسر",
  filter_wheel: "عجلة فلاتر",
  serial_adapter: "USB-Serial",
  serial_device: "COM",
  unknown: "جهاز USB",
};

export default function UsbDevicePanel() {
  const [data, setData] = useState<UsbBridgePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await fetchJson<UsbBridgePayload & { bridgeOnline?: boolean; message?: string }>(
        "/api/usb-bridge"
      );
      setData(result.bridgeOnline === false ? null : result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [load]);

  const scan = async () => {
    setScanning(true);
    try {
      const result = await fetchJson<UsbBridgePayload>("/api/usb-bridge", { method: "POST" });
      setData(result);
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل المسح");
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-[var(--muted)]">جاري البحث عن USB Bridge...</div>;
  }

  if (!data?.bridgeOnline && !data?.identified?.length) {
    return (
      <div className="asiair-panel text-center">
        <WifiOff size={32} className="mx-auto mb-3 text-[var(--muted)]" />
        <p className="font-semibold text-white">USB Bridge غير متصل</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          على Windows: شغّل{" "}
          <code className="rounded bg-black/40 px-1 text-[var(--zwo-orange)]">
            scripts\start-trial-windows.bat
          </code>
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          v1.0.0-trial — وصّل الكامeras والحوامل بكابلات USB ثم Scan
        </p>
        <button className="btn-secondary mt-4" onClick={load}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const devices = data?.identified ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label flex items-center gap-2">
            <Usb size={14} className="text-[var(--zwo-orange)]" />
            USB Bridge v{data?.version ?? "1.0.0-trial"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {devices.length} جهاز • {data?.platform ?? "local"} • COM:{" "}
            {data?.serialMeta?.count ?? 0}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={scan} disabled={scanning}>
          <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
          {scanning ? "جاري المسح..." : "Scan USB"}
        </button>
      </div>

      {data?.errors && data.errors.length > 0 && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
          {data.errors.join(" • ")}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {devices.length === 0 ? (
          <div className="card col-span-2 text-center text-sm text-[var(--muted)]">
            <Cable size={24} className="mx-auto mb-2 opacity-50" />
            لا أجهزة USB — وصّل المعدات واضغط Scan USB
          </div>
        ) : (
          devices.map((dev: UsbBridgeDevice) => (
            <div key={dev.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-white">{dev.name}</h4>
                  <p className="text-xs text-[var(--muted)]">
                    {dev.brand || "—"} • {typeLabels[dev.deviceType] ?? dev.deviceType}
                  </p>
                </div>
                <span
                  className={`badge ${dev.status === "connected" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-[var(--muted)]"}`}
                >
                  {dev.source === "serial" ? "COM" : "USB"}
                </span>
              </div>
              <p className="tabular-nums text-xs text-cyan-400">{dev.detail}</p>
              {dev.path && (
                <p className="mt-1 text-[10px] text-[var(--muted)]">Port: {dev.path}</p>
              )}
            </div>
          ))
        )}
      </div>

      {data?.lastScan && (
        <p className="text-center text-[10px] text-[var(--muted)]">
          آخر مسح: {new Date(data.lastScan).toLocaleString("ar-IQ")}
        </p>
      )}
    </div>
  );
}
