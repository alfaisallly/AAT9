export const USB_BRIDGE_VERSION = "1.0.0-trial";
export const USB_BRIDGE_DEFAULT_URL =
  process.env.ASTROLAB_USB_BRIDGE_URL ?? "http://127.0.0.1:18881";

export interface UsbBridgeDevice {
  source: "usb" | "serial";
  id: string;
  name: string;
  brand: string;
  deviceType: string;
  status: string;
  detail: string;
  path: string | null;
}

export interface UsbBridgePayload {
  bridgeOnline: boolean;
  version: string;
  platform?: string;
  lastScan: string | null;
  usb: Array<Record<string, unknown>>;
  serial: Array<Record<string, unknown>>;
  identified: UsbBridgeDevice[];
  errors?: string[];
  usbMeta?: { platform?: string; hint?: string };
  serialMeta?: { available?: boolean; count?: number };
}

export async function fetchUsbBridge(
  baseUrl = USB_BRIDGE_DEFAULT_URL,
  timeoutMs = 2500
): Promise<UsbBridgePayload | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${baseUrl}/api/v1/devices`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as UsbBridgePayload;
    return { ...data, bridgeOnline: true, version: data.version ?? USB_BRIDGE_VERSION };
  } catch {
    return null;
  }
}

export async function triggerUsbScan(
  baseUrl = USB_BRIDGE_DEFAULT_URL
): Promise<UsbBridgePayload | null> {
  try {
    const res = await fetch(`${baseUrl}/api/v1/scan`, { method: "POST" });
    if (!res.ok) return null;
    return (await res.json()) as UsbBridgePayload;
  } catch {
    return null;
  }
}
