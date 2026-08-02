/**
 * AstroLab USB Bridge v1.0.0-trial
 * Known astronomy USB vendor/product IDs and heuristics.
 */

const KNOWN_VENDORS = {
  "03C3": { brand: "ZWO", types: ["camera", "filter_wheel", "focuser", "guide"] },
  "185C": { brand: "QHY", types: ["camera"] },
  "0403": { brand: "FTDI", types: ["serial_adapter", "mount", "focuser"] },
  "067B": { brand: "Prolific", types: ["serial_adapter"] },
  "10C4": { brand: "Silicon Labs", types: ["serial_adapter", "mount"] },
  "1A86": { brand: "CH340", types: ["serial_adapter", "mount"] },
  "040D": { brand: "Vixen", types: ["mount"] },
  "16C0": { brand: "Ludicrous", types: ["mount"] },
};

const SERIAL_KEYWORDS = {
  mount: [/synscan/i, /eqmod/i, /mount/i, /celestron/i, /skywatcher/i, /ioptron/i, /vixen/i, /zwo.*am/i],
  camera: [/asi/i, /zwo/i, /qhy/i, /ccd/i, /cmos/i, /camera/i],
  guider: [/guide/i, /120mm/i, /174mm/i, /178mm/i],
  focuser: [/focuser/i, /focus/i, /eef/i, /zwo.*ea/i],
  filter_wheel: [/efw/i, /filter.*wheel/i, /wheel/i],
};

function classifyByName(name) {
  if (!name) return "unknown";
  for (const [type, patterns] of Object.entries(SERIAL_KEYWORDS)) {
    if (patterns.some((p) => p.test(name))) return type;
  }
  return "serial_device";
}

function classifyUsbDevice(name, instanceId) {
  const vidMatch = instanceId?.match(/VID_([0-9A-F]{4})/i);
  const pidMatch = instanceId?.match(/PID_([0-9A-F]{4})/i);
  const vid = vidMatch?.[1]?.toUpperCase();
  const pid = pidMatch?.[1]?.toUpperCase();
  const vendor = vid ? KNOWN_VENDORS[vid] : null;
  const byName = classifyByName(name);

  let deviceType = byName;
  if (vendor && byName === "unknown") {
    deviceType = vendor.types[0];
  }

  return {
    vendorId: vid ?? null,
    productId: pid ?? null,
    brand: vendor?.brand ?? guessBrand(name),
    deviceType,
    suggestedTypes: vendor?.types ?? [deviceType],
  };
}

function guessBrand(name) {
  if (!name) return "";
  if (/zwo|asi/i.test(name)) return "ZWO";
  if (/qhy/i.test(name)) return "QHY";
  if (/skywatcher|synscan/i.test(name)) return "Sky-Watcher";
  if (/celestron/i.test(name)) return "Celestron";
  if (/ioptron/i.test(name)) return "iOptron";
  return "";
}

function classifySerialPort(port) {
  const label = [port.manufacturer, port.friendlyName, port.path].filter(Boolean).join(" ");
  const deviceType = classifyByName(label);
  return {
    path: port.path,
    manufacturer: port.manufacturer ?? "",
    friendlyName: port.friendlyName ?? port.path,
    serialNumber: port.serialNumber ?? null,
    vendorId: port.vendorId ?? null,
    productId: port.productId ?? null,
    brand: guessBrand(label),
    deviceType,
    connection: "usb_serial",
  };
}

module.exports = {
  KNOWN_VENDORS,
  classifyUsbDevice,
  classifySerialPort,
  classifyByName,
};
