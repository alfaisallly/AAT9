export interface ImagingSettings {
  exposure: number;
  gain: number;
  offset: number;
  temperature: number;
  filter: string;
  frameType: "light" | "dark" | "flat" | "bias";
  autoFocus: {
    enabled: boolean;
    mode: "auto" | "on" | "off";
    stepSize: number;
    maxSteps: number;
    targetHfd: number;
    status: "idle" | "running" | "done" | "failed";
    currentHfd: number | null;
  };
  dither: {
    enabled: boolean;
    pixels: number;
    everyNFrames: number;
    raOnly: boolean;
  };
  meridianFlip: {
    enabled: boolean;
    mode: "stop_flip" | "pause_flip" | "disabled";
    flipAngle: number;
    minutesToFlip: number | null;
    status: "waiting" | "flipping" | "done";
  };
  guiding: {
    exposure: number;
    gain: number;
    rms: number;
    status: "idle" | "guiding" | "lost";
  };
  sequence: {
    running: boolean;
    currentFrame: number;
    totalFrames: number;
    target: string;
  };
}

export const DEFAULT_IMAGING_SETTINGS: ImagingSettings = {
  exposure: 300,
  gain: 100,
  offset: 50,
  temperature: -10,
  filter: "Ha",
  frameType: "light",
  autoFocus: {
    enabled: true,
    mode: "auto",
    stepSize: 500,
    maxSteps: 20,
    targetHfd: 2.5,
    status: "idle",
    currentHfd: null,
  },
  dither: {
    enabled: true,
    pixels: 12,
    everyNFrames: 3,
    raOnly: false,
  },
  meridianFlip: {
    enabled: true,
    mode: "stop_flip",
    flipAngle: 0,
    minutesToFlip: 47,
    status: "waiting",
  },
  guiding: {
    exposure: 2,
    gain: 100,
    rms: 0.42,
    status: "guiding",
  },
  sequence: {
    running: false,
    currentFrame: 0,
    totalFrames: 30,
    target: "M42",
  },
};

export interface FitsHeaderInfo {
  object?: string;
  exptime?: string;
  filter?: string;
  gain?: string;
  temp?: string;
  naxis1?: number;
  naxis2?: number;
  bitpix?: number;
  instrument?: string;
  dateObs?: string;
}

const STORAGE_KEY = "astrolab_imaging_settings";

export function loadImagingSettings(): ImagingSettings {
  if (typeof window === "undefined") return DEFAULT_IMAGING_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_IMAGING_SETTINGS;
    return { ...DEFAULT_IMAGING_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_IMAGING_SETTINGS;
  }
}

export function saveImagingSettings(settings: ImagingSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/** Parse FITS header cards from ArrayBuffer */
export function parseFitsHeader(buffer: ArrayBuffer): FitsHeaderInfo {
  const view = new DataView(buffer);
  const info: FitsHeaderInfo = {};
  let offset = 0;

  for (let block = 0; block < 50 && offset + 80 <= buffer.byteLength; block++) {
    for (let i = 0; i < 36; i++) {
      const cardOffset = offset + i * 80;
      if (cardOffset + 80 > buffer.byteLength) break;

      let card = "";
      for (let j = 0; j < 80; j++) {
        card += String.fromCharCode(view.getUint8(cardOffset + j));
      }

      if (card.startsWith("END")) return finalize(info);

      const eq = card.indexOf("=");
      if (eq === -1) continue;
      const key = card.slice(0, 8).trim();
      const val = card.slice(10).split("/")[0].trim().replace(/'/g, "").trim();

      switch (key) {
        case "OBJECT":
          info.object = val;
          break;
        case "EXPTIME":
          info.exptime = val;
          break;
        case "FILTER":
          info.filter = val;
          break;
        case "GAIN":
          info.gain = val;
          break;
        case "CCD-TEMP":
          info.temp = val;
          break;
        case "NAXIS1":
          info.naxis1 = parseInt(val, 10);
          break;
        case "NAXIS2":
          info.naxis2 = parseInt(val, 10);
          break;
        case "BITPIX":
          info.bitpix = parseInt(val, 10);
          break;
        case "INSTRUME":
          info.instrument = val;
          break;
        case "DATE-OBS":
          info.dateObs = val;
          break;
      }
    }
    offset += 2880;
    if (info.naxis1 && info.naxis2 && info.bitpix) break;
  }
  return finalize(info);
}

function finalize(info: FitsHeaderInfo): FitsHeaderInfo {
  return info;
}

/** Render 2D FITS image data to canvas ImageData (16-bit mono common case) */
export function renderFitsToCanvas(
  buffer: ArrayBuffer,
  canvas: HTMLCanvasElement,
  maxSize = 800
): FitsHeaderInfo {
  const header = parseFitsHeader(buffer);
  const n1 = header.naxis1 || 0;
  const n2 = header.naxis2 || 0;
  const bitpix = header.bitpix || 16;

  if (!n1 || !n2) throw new Error("Not a 2D FITS image");

  let dataOffset = 0;
  while (dataOffset + 2880 <= buffer.byteLength) {
    const slice = new Uint8Array(buffer, dataOffset, 80);
    const end = String.fromCharCode(slice[0], slice[1], slice[2]);
    if (end === "END") {
      dataOffset += 2880;
      break;
    }
    dataOffset += 2880;
  }

  const view = new DataView(buffer);
  const pixels: number[] = [];
  let pos = dataOffset;

  for (let y = 0; y < n2; y++) {
    for (let x = 0; x < n1; x++) {
      let val = 0;
      if (bitpix === 16) {
        val = view.getInt16(pos, false);
        pos += 2;
      } else if (bitpix === 8) {
        val = view.getUint8(pos);
        pos += 1;
      } else if (bitpix === -32) {
        val = view.getFloat32(pos, false);
        pos += 4;
      } else {
        val = view.getInt16(pos, false);
        pos += 2;
      }
      pixels.push(val);
    }
  }

  // Percentile stretch (simple)
  const sorted = [...pixels].sort((a, b) => a - b);
  const lo = sorted[Math.floor(sorted.length * 0.01)] || 0;
  const hi = sorted[Math.floor(sorted.length * 0.99)] || 65535;
  const range = hi - lo || 1;

  const scale = Math.min(maxSize / n1, maxSize / n2, 1);
  const w = Math.round(n1 * scale);
  const h = Math.round(n2 * scale);

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.floor(x / scale);
      const sy = Math.floor(y / scale);
      const raw = pixels[sy * n1 + sx] || 0;
      const norm = Math.max(0, Math.min(255, ((raw - lo) / range) * 255));
      const idx = (y * w + x) * 4;
      imageData.data[idx] = norm;
      imageData.data[idx + 1] = norm;
      imageData.data[idx + 2] = norm;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return header;
}
