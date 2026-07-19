import { createHmac, timingSafeEqual } from "crypto";

const SECRET =
  process.env.ASTROLAB_SECRET || "astrolab-ahmed-alfaisal-secret-2026";
const DEFAULT_USER = process.env.ASTROLAB_USER || "ahmed.alfaisal";
const DEFAULT_PASS = process.env.ASTROLAB_PASSWORD || "AstroLab2026";

export const SESSION_COOKIE = "astrolab_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const APP_OWNER = {
  name: "Ahmed alfaisal",
  nameAr: "المهندس Ahmed alfaisal",
  title: "Eng. Ahmed alfaisal",
  copyright: `© ${new Date().getFullYear()} Eng. Ahmed alfaisal — جميع الحقوق محفوظة`,
  copyrightEn: `© ${new Date().getFullYear()} Eng. Ahmed alfaisal — All Rights Reserved`,
};

export function validateCredentials(
  username: string,
  password: string
): boolean {
  const u = username.trim().toLowerCase();
  const validUser = DEFAULT_USER.toLowerCase();
  return u === validUser && password === DEFAULT_PASS;
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(username: string): string {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${username.toLowerCase()}:${exp}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return null;

    const signature = decoded.slice(lastColon + 1);
    const payload = decoded.slice(0, lastColon);
    const expected = sign(payload);

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    const colonIdx = payload.indexOf(":");
    const username = payload.slice(0, colonIdx);
    const exp = Number(payload.slice(colonIdx + 1));
    if (!username || Number.isNaN(exp) || Date.now() > exp) return null;

    return username;
  } catch {
    return null;
  }
}

export function getUsernameFromCookie(
  cookieValue: string | undefined
): string | null {
  if (!cookieValue) return null;
  return verifySessionToken(cookieValue);
}
