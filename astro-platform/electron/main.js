const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const APP_PORT = 3000;
const BRIDGE_PORT = 18881;
const isPackaged = app.isPackaged;

let mainWindow = null;
let nextProcess = null;
let bridgeProcess = null;

function resourcesRoot() {
  return isPackaged ? process.resourcesPath : path.join(__dirname, "..");
}

function standaloneDir() {
  const dir = path.join(resourcesRoot(), "standalone");
  if (fs.existsSync(path.join(dir, "server.js"))) return dir;
  const nested = path.join(dir, "astro-platform");
  if (fs.existsSync(path.join(nested, "server.js"))) return nested;
  return path.join(resourcesRoot(), ".next", "standalone", "astro-platform");
}

function bridgeEntry() {
  return path.join(resourcesRoot(), "desktop-bridge", "src", "server.js");
}

function nodeExecutable() {
  if (isPackaged) {
    const winNode = path.join(resourcesRoot(), "node", "node.exe");
    if (fs.existsSync(winNode)) return winNode;
  }
  return process.platform === "win32" ? "node.exe" : "node";
}

function spawnNode(script, cwd, extraEnv = {}) {
  return spawn(nodeExecutable(), [script], {
    cwd,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: isPackaged ? "ignore" : "inherit",
    windowsHide: true,
  });
}

function waitForUrl(url, attempts = 60, delayMs = 500) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const tick = () => {
      tries += 1;
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) resolve(true);
        else if (tries >= attempts) reject(new Error(`Service not ready: ${url}`));
        else setTimeout(tick, delayMs);
      });
      req.on("error", () => {
        if (tries >= attempts) reject(new Error(`Service not ready: ${url}`));
        else setTimeout(tick, delayMs);
      });
    };
    tick();
  });
}

async function startServices() {
  const standalone = standaloneDir();
  const serverScript = path.join(standalone, "server.js");
  const bridgeScript = bridgeEntry();

  if (!fs.existsSync(serverScript)) {
    throw new Error(`Missing server: ${serverScript}`);
  }

  bridgeProcess = spawnNode(bridgeScript, path.dirname(bridgeScript), {
    ASTROLAB_BRIDGE_PORT: String(BRIDGE_PORT),
  });

  nextProcess = spawnNode(serverScript, standalone, {
    PORT: String(APP_PORT),
    HOSTNAME: "127.0.0.1",
  });

  await waitForUrl(`http://127.0.0.1:${BRIDGE_PORT}/health`, 40, 400);
  await waitForUrl(`http://127.0.0.1:${APP_PORT}/login`, 80, 500);
}

function stopServices() {
  for (const proc of [nextProcess, bridgeProcess]) {
    if (proc && !proc.killed) {
      try {
        proc.kill();
      } catch {
        /* ignore */
      }
    }
  }
  nextProcess = null;
  bridgeProcess = null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: "AstroLab v1.0.0-trial — Eng. Ahmed alfaisal",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${APP_PORT}/login`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      await startServices();
      createWindow();
    } catch (err) {
      console.error(err);
      app.quit();
    }
  });

  app.on("window-all-closed", () => {
    stopServices();
    if (process.platform !== "darwin") app.quit();
  });

  app.on("before-quit", () => {
    stopServices();
  });
}
