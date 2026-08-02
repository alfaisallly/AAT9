const { classifySerialPort } = require("./known-devices");

let SerialPort = null;
try {
  SerialPort = require("serialport").SerialPort;
} catch {
  // serialport native module not built — COM scan unavailable
}

async function scanSerialPorts() {
  if (!SerialPort) {
    return {
      ports: [],
      available: false,
      error: "serialport غير مثبت — شغّل: npm install في desktop-bridge",
    };
  }

  try {
    const list = await SerialPort.list();
    const ports = list.map((port, index) => ({
      id: `com-${index}-${port.path.replace(/[^a-zA-Z0-9]/g, "")}`,
      ...classifySerialPort(port),
      status: "connected",
    }));

    return { ports, available: true, count: ports.length };
  } catch (err) {
    return { ports: [], available: false, error: err.message };
  }
}

module.exports = { scanSerialPorts };
