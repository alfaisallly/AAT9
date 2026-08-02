/** Astrophotography optical calculations */

export interface SensorSpec {
  name: string;
  pixelSizeUm: number;
  widthPx: number;
  heightPx: number;
}

export interface TelescopeConfig {
  id: string;
  name: string;
  focalLengthMm: number;
  apertureMm: number;
}

export interface ImagingMetrics {
  telescopeId: string;
  telescopeName: string;
  configName: string;
  focalLengthMm: number;
  cameraId: string;
  cameraName: string;
  pixelSizeUm: number;
  resolution: string;
  pixelScaleArcsec: number;
  imageScaleArcsecPerPx: number;
  fovWidthArcmin: number;
  fovHeightArcmin: number;
  fovWidthDeg: number;
  fovHeightDeg: number;
  fRatio: number;
}

/** arcsec/pixel = (pixel_size_um / focal_length_mm) * 206.265 */
export function pixelScaleArcsec(
  pixelSizeUm: number,
  focalLengthMm: number
): number {
  return (pixelSizeUm / focalLengthMm) * 206.265;
}

export function fovArcmin(
  pixels: number,
  pixelScale: number
): number {
  return (pixels * pixelScale) / 60;
}

export function computeImagingMetrics(
  telescope: TelescopeConfig & { configName?: string },
  camera: SensorSpec
): ImagingMetrics {
  const scale = pixelScaleArcsec(camera.pixelSizeUm, telescope.focalLengthMm);
  const fovW = fovArcmin(camera.widthPx, scale);
  const fovH = fovArcmin(camera.heightPx, scale);

  return {
    telescopeId: telescope.id,
    telescopeName: telescope.name,
    configName: telescope.configName || "افتراضي",
    focalLengthMm: telescope.focalLengthMm,
    cameraId: camera.name,
    cameraName: camera.name,
    pixelSizeUm: camera.pixelSizeUm,
    resolution: `${camera.widthPx}×${camera.heightPx}`,
    pixelScaleArcsec: Math.round(scale * 100) / 100,
    imageScaleArcsecPerPx: Math.round(scale * 100) / 100,
    fovWidthArcmin: Math.round(fovW * 10) / 10,
    fovHeightArcmin: Math.round(fovH * 10) / 10,
    fovWidthDeg: Math.round((fovW / 60) * 100) / 100,
    fovHeightDeg: Math.round((fovH / 60) * 100) / 100,
    fRatio: Math.round((telescope.focalLengthMm / telescope.apertureMm) * 10) / 10,
  };
}

export function formatArcsec(value: number): string {
  return `${value.toFixed(2)}″/px`;
}

export function formatArcmin(value: number): string {
  if (value >= 60) return `${(value / 60).toFixed(2)}°`;
  return `${value.toFixed(1)}′`;
}
