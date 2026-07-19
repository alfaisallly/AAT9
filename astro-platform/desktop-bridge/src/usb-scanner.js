const { execFile } = require("child_process");
const { promisify } = require("util");
const execFileAsync = promisify(execFile);
const { classifyUsbDevice } = require("./known-devices");

async function scanWindowsUsb() {
  const psScript = [
    "Get-PnpDevice -PresentOnly |",
    "Where-Object { $_.InstanceId -match 'USB\\\\VID_' } |",
    "Select-Object FriendlyName, InstanceId, Status, Class |",
    "ConvertTo-Json -Compress",
  ].join(" ");

  try {
    const { stdout } = await execFileAsync(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", psScript],
      { timeout: 15000, maxBuffer: 4 * 1024 * 1024 }
    );
    if (!stdout.trim()) return [];
    let parsed = JSON.parse(stdout);
    if (!Array.isArray(parsed)) parsed = [parsed];

    return parsed
      .filter((d) => d.FriendlyName)
      .map((d, index) => {
        const meta = classifyUsbDevice(d.FriendlyName, d.InstanceId);
        return {
          id: `usb-${index}-${meta.vendorId ?? "unk"}`,
          name: d.FriendlyName,
          instanceId: d.InstanceId,
          status: d.Status === "OK" ? "connected" : "offline",
          usbClass: d.Class ?? "",
          connection: "usb",
          ...meta,
        };
      });
  } catch (err) {
    return {
      error: err.message,
      devices: [],
      hint: "تأكد من تشغيل Bridge كمسؤول Admin على Windows إذا لم تظهر الأجهزة",
    };
  }
}

async function scanLinuxUsb() {
  try {
    const { stdout } = await execFileAsync("lsusb", [], { timeout: 8000 });
    return stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line, index) => {
        const match = line.match(/Bus \d+ Device \d+: ID ([0-9a-f]{4}):([0-9a-f]{4})\s*(.*)$/i);
        if (!match) return null;
        const [, vid, pid, name] = match;
        const instanceId = `USB\\VID_${vid.toUpperCase()}&PID_${pid.toUpperCase()}`;
        const meta = classifyUsbDevice(name.trim(), instanceId);
        return {
          id: `usb-${index}-${vid}`,
          name: name.trim() || `USB ${vid}:${pid}`,
          instanceId,
          status: "connected",
          usbClass: "",
          connection: "usb",
          vendorId: vid.toUpperCase(),
          productId: pid.toUpperCase(),
          ...meta,
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function scanUsbDevices() {
  if (process.platform === "win32") {
    const result = await scanWindowsUsb();
    if (result && !Array.isArray(result) && result.error) {
      return {
        devices: [],
        platform: "win32",
        error: result.error,
        hint: result.hint,
      };
    }
    return { devices: result, platform: "win32" };
  }
  const devices = await scanLinuxUsb();
  return { devices, platform: process.platform };
}

module.exports = { scanUsbDevices };
