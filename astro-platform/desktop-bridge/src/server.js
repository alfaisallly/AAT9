const http = require("http");
const { scanUsbDevices } = require("./usb-scanner");
const { scanSerialPorts } = require("./serial-scanner");

const VERSION = "1.0.0-trial";
const PORT = Number(process.env.ASTROLAB_BRIDGE_PORT || 18881);

let cache = {
  lastScan: null,
  usb: [],
  serial: [],
  identified: [],
  errors: [],
};

function mergeIdentified(usbResult, serialResult) {
  const items = [];
  const usbDevices = usbResult?.devices ?? (Array.isArray(usbResult) ? usbResult : []);
  const serialPorts = serialResult?.ports ?? [];

  for (const u of usbDevices) {
    items.push({
      source: "usb",
      id: u.id,
      name: u.name,
      brand: u.brand,
      deviceType: u.deviceType,
      status: u.status,
      detail: u.vendorId ? `VID_${u.vendorId}` : u.connection,
      path: null,
    });
  }

  for (const s of serialPorts) {
    items.push({
      source: "serial",
      id: s.id,
      name: s.friendlyName,
      brand: s.brand,
      deviceType: s.deviceType,
      status: s.status,
      detail: s.path,
      path: s.path,
    });
  }

  return items;
}

async function runScan() {
  const errors = [];
  const usbResult = await scanUsbDevices();
  const serialResult = await scanSerialPorts();

  if (usbResult?.error) errors.push(usbResult.error);
  if (serialResult?.error) errors.push(serialResult.error);

  const usbDevices = usbResult?.devices ?? [];
  const serialPorts = serialResult?.ports ?? [];
  const identified = mergeIdentified(usbResult, serialResult);

  cache = {
    lastScan: new Date().toISOString(),
    usb: usbDevices,
    serial: serialPorts,
    identified,
    errors,
    usbMeta: { platform: usbResult?.platform, hint: usbResult?.hint },
    serialMeta: {
      available: serialResult?.available ?? false,
      count: serialResult?.count ?? 0,
    },
  };

  return cache;
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data, null, 2));
}

async function handleRequest(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/health" || url.pathname === "/api/v1/health") {
    sendJson(res, 200, {
      ok: true,
      name: "AstroLab USB Bridge",
      version: VERSION,
      platform: process.platform,
      port: PORT,
      lastScan: cache.lastScan,
    });
    return;
  }

  if (url.pathname === "/api/v1/scan" && req.method === "POST") {
    const data = await runScan();
    sendJson(res, 200, { ...data, version: VERSION });
    return;
  }

  if (url.pathname === "/api/v1/devices" || url.pathname === "/api/v1/devices/all") {
    if (!cache.lastScan) await runScan();
    sendJson(res, 200, { ...cache, version: VERSION, bridgeOnline: true });
    return;
  }

  if (url.pathname === "/api/v1/devices/usb") {
    if (!cache.lastScan) await runScan();
    sendJson(res, 200, { usb: cache.usb, lastScan: cache.lastScan, version: VERSION });
    return;
  }

  if (url.pathname === "/api/v1/devices/serial") {
    if (!cache.lastScan) await runScan();
    sendJson(res, 200, {
      serial: cache.serial,
      meta: cache.serialMeta,
      lastScan: cache.lastScan,
      version: VERSION,
    });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

async function main() {
  await runScan();

  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      sendJson(res, 500, { error: err.message });
    });
  });

  server.listen(PORT, "127.0.0.1", () => {
    console.log("");
    console.log("  ╔══════════════════════════════════════════════╗");
    console.log("  ║  AstroLab USB Bridge  v1.0.0-trial           ║");
    console.log("  ║  Eng. Ahmed alfaisal                         ║");
    console.log("  ╚══════════════════════════════════════════════╝");
    console.log("");
    console.log(`  Platform : ${process.platform}`);
    console.log(`  URL      : http://127.0.0.1:${PORT}`);
    console.log(`  Devices  : ${cache.identified.length} detected`);
    console.log("");
    console.log("  USB/COM scan ready — connect equipment via USB");
    console.log("");
  });

  setInterval(() => {
    runScan().catch(() => {});
  }, 10000);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
