const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const https = require("https");

const NODE_VERSION = "20.18.0";
const root = path.join(__dirname, "..");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn("Skip missing:", src);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function findStandaloneServer(base) {
  const direct = path.join(base, "server.js");
  if (fs.existsSync(direct)) return base;
  const nested = path.join(base, "astro-platform", "server.js");
  if (fs.existsSync(nested)) return path.join(base, "astro-platform");
  throw new Error("standalone server.js not found — run npm run build first");
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          file.close();
          return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed ${res.statusCode}: ${url}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);
  });
}

async function ensurePortableNode(arch) {
  const nodeDir = path.join(root, "dist-staging", "node");
  if (fs.existsSync(path.join(nodeDir, "node.exe"))) {
    console.log("Portable Node already present");
    return;
  }

  if (process.platform !== "win32") {
    console.log("Skip Node download (not Windows) — CI/build script must provide dist-staging/node");
    fs.mkdirSync(nodeDir, { recursive: true });
    fs.writeFileSync(
      path.join(nodeDir, "README.txt"),
      "Place portable Node.js win build here as node.exe before electron-builder on Windows."
    );
    return;
  }

  const tag = arch === "ia32" ? "win-x86" : "win-x64";
  const folder = `node-v${NODE_VERSION}-${tag}`;
  const zipName = `${folder}.zip`;
  const url = `https://nodejs.org/dist/v${NODE_VERSION}/${zipName}`;
  const zipPath = path.join(root, "dist-staging", zipName);

  console.log(`Downloading Node.js ${NODE_VERSION} (${tag})...`);
  fs.mkdirSync(path.join(root, "dist-staging"), { recursive: true });
  await downloadFile(url, zipPath);

  execSync(
    `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${path.join(root, "dist-staging")}' -Force"`,
    { stdio: "inherit" }
  );

  copyRecursive(path.join(root, "dist-staging", folder), nodeDir);
  fs.rmSync(zipPath, { force: true });
  console.log("Portable Node ready:", nodeDir);
}

async function main() {
  console.log("Preparing standalone bundle for Electron...");

  const standaloneBase = path.join(root, ".next", "standalone");
  const standaloneDir = findStandaloneServer(standaloneBase);

  copyRecursive(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"));
  if (fs.existsSync(path.join(root, "public"))) {
    copyRecursive(path.join(root, "public"), path.join(standaloneDir, "public"));
  }

  const dataDir = path.join(standaloneDir, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const bridgeDir = path.join(root, "dist-staging", "desktop-bridge");
  fs.rmSync(path.join(root, "dist-staging"), { recursive: true, force: true });
  fs.mkdirSync(bridgeDir, { recursive: true });

  copyRecursive(path.join(root, "desktop-bridge", "src"), path.join(bridgeDir, "src"));
  fs.copyFileSync(
    path.join(root, "desktop-bridge", "package.json"),
    path.join(bridgeDir, "package.json")
  );

  console.log("Installing desktop-bridge production deps...");
  execSync("npm install --omit=dev", { cwd: bridgeDir, stdio: "inherit" });

  const electronStandalone = path.join(root, "dist-staging", "standalone");
  copyRecursive(standaloneDir, electronStandalone);

  const arch = process.env.TARGET_ARCH === "ia32" ? "ia32" : "x64";
  await ensurePortableNode(arch);

  console.log("Standalone ready:", electronStandalone);
  console.log("Bridge ready:", bridgeDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
