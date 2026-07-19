const SECRET =
  process.env.ASTROLAB_SECRET || "astrolab-ahmed-alfaisal-secret-2026";

async function sign(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return hexFromBuffer(sig);
}

function hexFromBuffer(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function decodeBase64Url(token: string): string {
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  return atob(padded);
}

export async function verifySessionTokenEdge(
  token: string
): Promise<string | null> {
  try {
    const decoded = decodeBase64Url(token);
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return null;

    const signature = decoded.slice(lastColon + 1);
    const payload = decoded.slice(0, lastColon);
    const expected = await sign(payload);
    if (signature !== expected) return null;

    const colonIdx = payload.indexOf(":");
    const username = payload.slice(0, colonIdx);
    const exp = Number(payload.slice(colonIdx + 1));
    if (!username || Number.isNaN(exp) || Date.now() > exp) return null;

    return username;
  } catch {
    return null;
  }
}
