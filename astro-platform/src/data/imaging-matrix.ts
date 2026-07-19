import {
  CAMERAS,
  TELESCOPE_CONFIGS,
} from "@/data/equipment-catalog";
import {
  computeImagingMetrics,
  ImagingMetrics,
} from "@/lib/astro-math";

export function getAllImagingMetrics(): ImagingMetrics[] {
  const results: ImagingMetrics[] = [];
  for (const tel of TELESCOPE_CONFIGS) {
    for (const cam of CAMERAS) {
      results.push(
        computeImagingMetrics(
          {
            id: tel.id,
            name: tel.name,
            focalLengthMm: tel.focalLengthMm,
            apertureMm: tel.apertureMm,
            configName: tel.configName,
          },
          cam
        )
      );
    }
  }
  return results;
}

export function getMetricsByTelescope(telescopeId: string): ImagingMetrics[] {
  return getAllImagingMetrics().filter((m) => m.telescopeId === telescopeId);
}

export function getMetricsByCamera(cameraName: string): ImagingMetrics[] {
  return getAllImagingMetrics().filter((m) => m.cameraName === cameraName);
}
