import { SensorSpec, TelescopeConfig } from "@/lib/astro-math";

export const IRAQ_LATITUDE = 33.3;
export const IRAQ_LOCATION = "العراق (خط عرض ~33°N)";

export const CAMERAS: (SensorSpec & {
  id: string;
  brand: string;
  model: string;
  cooling: boolean;
  bestFor: string[];
})[] = [
  {
    id: "asi2600mm",
    name: "ZWO ASI2600MM Pro",
    brand: "ZWO",
    model: "ASI2600MM Pro",
    pixelSizeUm: 3.76,
    widthPx: 9576,
    heightPx: 6388,
    cooling: true,
    bestFor: ["deep-sky", "nebula", "galaxy", "narrowband"],
  },
  {
    id: "asi178mm",
    name: "ZWO ASI178MM",
    brand: "ZWO",
    model: "ASI178MM",
    pixelSizeUm: 2.4,
    widthPx: 3096,
    heightPx: 2080,
    cooling: false,
    bestFor: ["planetary", "moon", "solar", "lucky-imaging"],
  },
  {
    id: "asi678mm",
    name: "ZWO ASI678MM",
    brand: "ZWO",
    model: "ASI678MM",
    pixelSizeUm: 2.0,
    widthPx: 3840,
    heightPx: 2160,
    cooling: false,
    bestFor: ["planetary", "moon", "solar", "video"],
  },
];

export const GUIDE_CAMERA = {
  id: "asi120mini",
  name: "ZWO ASI120MM Mini",
  brand: "ZWO",
  model: "ASI120MM Mini",
  pixelSizeUm: 3.75,
  widthPx: 1280,
  heightPx: 960,
};

export const GUIDE_SCOPE = {
  name: "ZWO Mini Guide Scope 30mm",
  focalLengthMm: 120,
  apertureMm: 30,
};

export const MOUNTS = [
  {
    id: "eq6r",
    name: "Sky-Watcher EQ6-R Pro",
    brand: "Sky-Watcher",
    model: "EQ6-R Pro",
    mountType: "equatorial",
    maxPayloadKg: 20,
    bestFor: ["SCA260", "C11", "Askar V80+Extender"],
    notes: "الحامل الرئيسي للتصوير العميق والأحمال المتوسطة- الثقيلة",
  },
  {
    id: "eq350",
    name: "Sky-Watcher EQ350 Pro",
    brand: "Sky-Watcher",
    model: "EQ350 Pro",
    mountType: "equatorial",
    maxPayloadKg: 25,
    bestFor: ["SCA260", "C11", "Askar V", "MiniCat"],
    notes: "حامل حديث عالي الدقة — ممتاز للتصوير طويل التعريض",
  },
];

export const TELESCOPE_CONFIGS: (TelescopeConfig & {
  brand: string;
  telescopeType: string;
  configName: string;
  bestTargets: string[];
  asiairProfile: string;
})[] = [
  {
    id: "askar-v60-native",
    name: "Askar V — V60",
    brand: "Askar",
    configName: "V60 f/4",
    focalLengthMm: 240,
    apertureMm: 60,
    telescopeType: "refractor",
    bestTargets: ["سدم واسعة", "M31", "M42", "NGC 7000"],
    asiairProfile: "Deep Sky Wide",
  },
  {
    id: "askar-v60-reducer",
    name: "Askar V — V60 + Reducer",
    brand: "Askar",
    configName: "V60 + Reducer 0.8×",
    focalLengthMm: 192,
    apertureMm: 60,
    telescopeType: "refractor",
    bestTargets: ["سدم كبيرة", "مجموعات نجمية"],
    asiairProfile: "Deep Sky Ultra-Wide",
  },
  {
    id: "askar-v60-extender",
    name: "Askar V — V60 + Extender",
    brand: "Askar",
    configName: "V60 + Extender 1.5×",
    focalLengthMm: 360,
    apertureMm: 60,
    telescopeType: "refractor",
    bestTargets: ["سدم متوسطة", "M51", "M81"],
    asiairProfile: "Deep Sky Medium",
  },
  {
    id: "askar-v80-native",
    name: "Askar V — V80",
    brand: "Askar",
    configName: "V80 f/4",
    focalLengthMm: 320,
    apertureMm: 80,
    telescopeType: "refractor",
    bestTargets: ["سدم", "مجرة", "M42", "Horsehead"],
    asiairProfile: "Deep Sky Standard",
  },
  {
    id: "askar-v80-reducer",
    name: "Askar V — V80 + Reducer",
    brand: "Askar",
    configName: "V80 + Reducer 0.8×",
    focalLengthMm: 256,
    apertureMm: 80,
    telescopeType: "refractor",
    bestTargets: ["سدم واسعة", "North America Nebula"],
    asiairProfile: "Deep Sky Wide",
  },
  {
    id: "askar-v80-extender",
    name: "Askar V — V80 + Extender",
    brand: "Askar",
    configName: "V80 + Extender 1.5×",
    focalLengthMm: 480,
    apertureMm: 80,
    telescopeType: "refractor",
    bestTargets: ["سدم متوسطة", "مجرة", "M33"],
    asiairProfile: "Deep Sky Medium",
  },
  {
    id: "sca260",
    name: "SharpStar SCA260",
    brand: "SharpStar",
    configName: "f/6.4",
    focalLengthMm: 1664,
    apertureMm: 260,
    telescopeType: "reflector",
    bestTargets: ["مجرة", "سديم", "عنقود", "M51", "M101"],
    asiairProfile: "Deep Sky High Resolution",
  },
  {
    id: "c11",
    name: "Celestron C11",
    brand: "Celestron",
    configName: "f/10",
    focalLengthMm: 2800,
    apertureMm: 279,
    telescopeType: "sct",
    bestTargets: ["كواكب", "قمر", "مجرة ضيقة", "M13", "M57"],
    asiairProfile: "Planetary / Long FL Deep Sky",
  },
  {
    id: "minicat51",
    name: "William Optics MiniCat 51",
    brand: "William Optics",
    configName: "f/4.9",
    focalLengthMm: 250,
    apertureMm: 51,
    telescopeType: "refractor",
    bestTargets: ["سدم واسعة", "مجموعات", "Milky Way"],
    asiairProfile: "Deep Sky Wide Travel",
  },
  {
    id: "phoenix-ha",
    name: "Acuter Phoenix H-alpha 40mm",
    brand: "Acuter",
    configName: "H-alpha Solar",
    focalLengthMm: 400,
    apertureMm: 40,
    telescopeType: "solar",
    bestTargets: ["شمس H-alpha", "بروزات", "توربيدات"],
    asiairProfile: "Solar H-alpha",
  },
];

export const FILTERS = [
  { name: "ZWO L", filterType: "broadband", bandwidthNm: null, set: "LRGB" },
  { name: "ZWO R", filterType: "broadband", bandwidthNm: null, set: "LRGB" },
  { name: "ZWO G", filterType: "broadband", bandwidthNm: null, set: "LRGB" },
  { name: "ZWO B", filterType: "broadband", bandwidthNm: null, set: "LRGB" },
  { name: "ZWO Hα 7nm", filterType: "narrowband", bandwidthNm: 7, set: "SHO" },
  { name: "ZWO OIII 7nm", filterType: "narrowband", bandwidthNm: 7, set: "SHO" },
  { name: "ZWO SII 7nm", filterType: "narrowband", bandwidthNm: 7, set: "SHO" },
  { name: "Antlia Pro LRGB", filterType: "broadband", bandwidthNm: null, set: "Antlia" },
  { name: "Antlia 3nm Ha", filterType: "narrowband", bandwidthNm: 3, set: "Antlia" },
  { name: "Antlia 3nm OIII", filterType: "narrowband", bandwidthNm: 3, set: "Antlia" },
  { name: "Antlia 3nm SII", filterType: "narrowband", bandwidthNm: 3, set: "Antlia" },
];

export const FILTER_WHEEL = {
  name: "ZWO 7× Filter Wheel",
  slots: 7,
  notes: "يدعم LRGB + Ha + OIII + SII مع Antlia/ZWO",
};

export const SOFTWARE = [
  { name: "ASIAIR", category: "capture", role: "التقاط وتوجيه وتحكم كامل" },
  { name: "PixInsight", category: "processing", role: "معالجة Deep Sky احترافية" },
  { name: "AutoStakkert!", category: "processing", role: "تكديس كواكب/قمر/شمس" },
  { name: "AstroSurface", category: "processing", role: "معالجة على الهاتف/سطح المكتب" },
];

export const ZWO_CAMERA_SETTINGS = {
  asi2600mm: {
    deepSky: { gain: 100, offset: 50, temp: -10, exposure: "180-600s" },
    narrowband: { gain: 120, offset: 30, temp: -10, exposure: "300-900s" },
    unityGain: 100,
    fullWell: "51ke-",
  },
  asi178mm: {
    planetary: { gain: 200, offset: 50, temp: 0, exposure: "8-33ms" },
    lunar: { gain: 100, offset: 50, temp: 0, exposure: "0.5-5ms" },
    solar: { gain: 60, offset: 30, temp: 0, exposure: "1-10ms" },
  },
  asi678mm: {
    planetary: { gain: 250, offset: 50, temp: 0, exposure: "5-16ms" },
    lunar: { gain: 150, offset: 50, temp: 0, exposure: "0.3-3ms" },
    solar: { gain: 80, offset: 30, temp: 0, exposure: "0.5-5ms" },
  },
};

export const GUIDING_SETTINGS = [
  { focalLength: "192-256mm", exposure: "2s", gain: 100, calibrationSteps: 3000, raAgg: 0.6, decAgg: 0.7 },
  { focalLength: "240-360mm", exposure: "2s", gain: 100, calibrationSteps: 3500, raAgg: 0.55, decAgg: 0.65 },
  { focalLength: "480-600mm", exposure: "2-3s", gain: 100, calibrationSteps: 4000, raAgg: 0.5, decAgg: 0.6 },
  { focalLength: "1664mm (SCA260)", exposure: "3s", gain: 100, calibrationSteps: 5000, raAgg: 0.45, decAgg: 0.55 },
  { focalLength: "2800mm (C11)", exposure: "3-4s", gain: 120, calibrationSteps: 6000, raAgg: 0.4, decAgg: 0.5 },
];

export const ASIAIR_PROFILES: Record<
  string,
  { focuser: string; meridian: string; dither: string; guide: string; cooling: string }
> = {
  "Deep Sky Ultra-Wide": {
    focuser: "Auto @ ±5000 steps",
    meridian: "Stop & Flip",
    dither: "Every 3 frames, 15-20px",
    guide: "2s / Gain 100",
    cooling: "-10°C",
  },
  "Deep Sky Wide": {
    focuser: "Auto @ ±5000 steps",
    meridian: "Stop & Flip",
    dither: "Every 3 frames, 12-18px",
    guide: "2s / Gain 100",
    cooling: "-10°C",
  },
  "Deep Sky Standard": {
    focuser: "Auto @ ±8000 steps",
    meridian: "Stop & Flip",
    dither: "Every 2 frames, 10-15px",
    guide: "2-3s / Gain 100",
    cooling: "-10°C",
  },
  "Deep Sky Medium": {
    focuser: "Auto @ ±8000 steps",
    meridian: "Stop & Flip",
    dither: "Every 2 frames, 8-12px",
    guide: "2-3s / Gain 100",
    cooling: "-10°C",
  },
  "Deep Sky High Resolution": {
    focuser: "Auto @ ±10000 steps",
    meridian: "Stop & Flip",
    dither: "Every 2 frames, 5-10px",
    guide: "3s / Gain 100",
    cooling: "-10°C",
  },
  "Planetary / Long FL Deep Sky": {
    focuser: "Manual fine + Auto coarse",
    meridian: "Stop & Flip",
    dither: "Off (planetary) / 5px (DS)",
    guide: "3-4s / Gain 120",
    cooling: "0°C (planet) / -10°C (DS)",
  },
  "Solar H-alpha": {
    focuser: "Manual fine",
    meridian: "N/A (نهار)",
    dither: "Off",
    guide: "Off",
    cooling: "0°C",
  },
};
