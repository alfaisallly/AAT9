import { NextResponse } from "next/server";
import {
  fetchUsbBridge,
  triggerUsbScan,
  USB_BRIDGE_DEFAULT_URL,
} from "@/lib/usb-bridge-client";

export async function GET() {
  const bridge = await fetchUsbBridge(USB_BRIDGE_DEFAULT_URL, 3000);
  if (!bridge) {
    return NextResponse.json({
      bridgeOnline: false,
      version: "1.0.0-trial",
      message:
        "USB Bridge غير متصل — شغّل start-trial-windows.bat على Windows",
      installHint: "desktop-bridge → npm install → npm start",
    });
  }
  return NextResponse.json(bridge);
}

export async function POST() {
  const bridge = await triggerUsbScan(USB_BRIDGE_DEFAULT_URL);
  if (!bridge) {
    return NextResponse.json(
      { error: "USB Bridge غير متصل على http://127.0.0.1:18881" },
      { status: 503 }
    );
  }
  return NextResponse.json(bridge);
}
