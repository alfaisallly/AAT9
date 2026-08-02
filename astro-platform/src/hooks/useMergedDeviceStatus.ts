"use client";

import { useCallback, useEffect, useState } from "react";
import { UsbBridgePayload } from "@/lib/usb-bridge-client";
import { DeviceStatusPayload } from "@/lib/types";
import { fetchJson } from "@/lib/utils";

export function useMergedDeviceStatus(pollMs = 5000) {
  const [status, setStatus] = useState<DeviceStatusPayload | null>(null);
  const [usbBridge, setUsbBridge] = useState<UsbBridgePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [deviceStatus, bridge] = await Promise.all([
        fetchJson<DeviceStatusPayload>("/api/devices/status"),
        fetchJson<UsbBridgePayload & { bridgeOnline?: boolean }>("/api/usb-bridge").catch(
          () => null
        ),
      ]);

      let strip = deviceStatus.strip;
      if (bridge?.bridgeOnline !== false && bridge?.identified?.length) {
        for (const dev of bridge.identified) {
          const match = strip.find(
            (s) =>
              s.kind === dev.deviceType ||
              s.name.toLowerCase().includes(dev.name.toLowerCase().slice(0, 8))
          );
          if (match) {
            match.status = dev.status === "connected" ? "online" : match.status;
            if (dev.path) match.detail = dev.path;
          } else if (dev.deviceType !== "unknown" && dev.deviceType !== "serial_adapter") {
            strip = [
              ...strip,
              {
                id: dev.id,
                kind: dev.deviceType,
                name: dev.name,
                type: dev.brand || "USB",
                status: dev.status === "connected" ? "online" : "offline",
                detail: dev.detail,
              },
            ];
          }
        }
      }

      setStatus({ ...deviceStatus, strip });
      setUsbBridge(bridge?.bridgeOnline === false ? null : bridge);
    } catch {
      /* keep last state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (pollMs <= 0) return;
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  return { status, usbBridge, loading, refresh };
}
