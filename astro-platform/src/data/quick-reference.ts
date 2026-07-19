import {
  ASIAIR_PROFILES,
  CAMERAS,
  GUIDE_CAMERA,
  GUIDE_SCOPE,
  GUIDING_SETTINGS,
  TELESCOPE_CONFIGS,
  ZWO_CAMERA_SETTINGS,
} from "@/data/equipment-catalog";
import { getMetricsByTelescope } from "@/data/imaging-matrix";

export interface QuickRefCard {
  id: string;
  title: string;
  subtitle: string;
  mount: string;
  sections: { label: string; value: string }[];
}

const primaryScopes = [
  "askar-v80-native",
  "askar-v60-native",
  "sca260",
  "c11",
  "minicat51",
  "phoenix-ha",
];

export const QUICK_REF_CARDS: QuickRefCard[] = primaryScopes.map((scopeId) => {
  const tel = TELESCOPE_CONFIGS.find((t) => t.id === scopeId)!;
  const metrics = getMetricsByTelescope(scopeId);
  const asiair = ASIAIR_PROFILES[tel.asiairProfile];
  const guiding = GUIDING_SETTINGS.find((g) =>
    tel.focalLengthMm <= 360
      ? g.focalLength.includes("192") || g.focalLength.includes("240")
      : tel.focalLengthMm <= 600
        ? g.focalLength.includes("480")
        : tel.focalLengthMm <= 1700
          ? g.focalLength.includes("1664")
          : g.focalLength.includes("2800")
  );

  const bestCam =
    tel.telescopeType === "solar" || tel.name.includes("C11")
      ? "ASI678MM (كواكب) / ASI2600MM (DS)"
      : tel.focalLengthMm <= 360
        ? "ASI2600MM"
        : "ASI2600MM";

  return {
    id: scopeId,
    title: tel.name,
    subtitle: `${tel.configName} — f/${(tel.focalLengthMm / tel.apertureMm).toFixed(1)}`,
    mount: tel.focalLengthMm >= 1664 ? "EQ350 Pro / EQ6-R" : "EQ350 Pro",
    sections: [
      { label: "البعد البؤري", value: `${tel.focalLengthMm} mm` },
      { label: "الفتحة", value: `${tel.apertureMm} mm` },
      { label: "أفضل كاميرا", value: bestCam },
      {
        label: "Pixel Scale (2600MM)",
        value: metrics.find((m) => m.cameraName.includes("2600"))
          ? `${metrics.find((m) => m.cameraName.includes("2600"))!.pixelScaleArcsec}″/px`
          : "—",
      },
      {
        label: "FOV (2600MM)",
        value: metrics.find((m) => m.cameraName.includes("2600"))
          ? `${metrics.find((m) => m.cameraName.includes("2600"))!.fovWidthArcmin}′ × ${metrics.find((m) => m.cameraName.includes("2600"))!.fovHeightArcmin}′`
          : "—",
      },
      { label: "ASIAIR Profile", value: tel.asiairProfile },
      { label: "Dither", value: asiair?.dither || "—" },
      { label: "Guide", value: asiair?.guide || "—" },
      { label: "Cooling", value: asiair?.cooling || "—" },
      {
        label: "Guiding",
        value: guiding
          ? `${guiding.exposure} G${guiding.gain} RA:${guiding.raAgg} DEC:${guiding.decAgg}`
          : "Off (Solar)",
      },
      { label: "أفضل أهداف", value: tel.bestTargets.join("، ") },
    ],
  };
});

export const GLOBAL_QUICK_REF = {
  guideCamera: GUIDE_CAMERA.name,
  guideScope: `${GUIDE_SCOPE.name} (${GUIDE_SCOPE.focalLengthMm}mm)`,
  cameras: CAMERAS.map((c) => c.name),
  asi2600: ZWO_CAMERA_SETTINGS.asi2600mm,
  asi678: ZWO_CAMERA_SETTINGS.asi678mm,
};
