"use client";

import { useCallback, useEffect, useState } from "react";
import { DeviceStatusPayload } from "@/lib/types";
import { fetchJson } from "@/lib/utils";

export function useDeviceStatus(pollMs = 5000) {
  const [status, setStatus] = useState<DeviceStatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchJson<DeviceStatusPayload>("/api/devices/status");
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل قراءة حالة الأجهزة");
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

  return { status, loading, error, refresh };
}
