#!/usr/bin/env node
/**
 * Generates src/data/targets-catalog.ts with M1-M110, planets, sun/moon, and NGC/IC targets.
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/targets-catalog.ts");

const TELESCOPES = {
  wide: "Askar V80 f/4",
  wideRed: "Askar V80 + Reducer 0.8×",
  medium: "Askar V80 + Extender 1.5×",
  ultraWide: "Askar V60 + Reducer 0.8×",
  askarV60: "Askar V60 f/4",
  sca: "SharpStar SCA260 f/6.4",
  c11: "Celestron C11 f/10",
  mini: "William Optics MiniCat 51",
  phoenix: "Acuter Phoenix H-alpha 40mm",
};

const CAM = {
  ds: "ASI2600MM",
  planet: "ASI178MM",
  planetVideo: "ASI678MM",
};

const FILTERS = {
  lrgb: "Antlia Pro LRGB",
  lrgbHa: "Antlia Pro LRGB + ZWO Hα 7nm",
  sho: "ZWO Hα 7nm + OIII 7nm + SII 7nm (SHO)",
  ha: "ZWO Hα 7nm",
  ha3: "Antlia 3nm Ha",
  oiii: "ZWO OIII 7nm",
  none: "بدون فلتر (Luminance)",
  irPass: "IR-Pass (كواكب)",
  solarHa: "H-alpha (Phoenix)",
};

function months(...m) {
  return m;
}

function entry(o) {
  return o;
}

/** @type {Record<number, Partial<import('../src/data/targets-catalog.ts').TargetRecommendation>>} */
const M_OVERRIDES = {
  1: {
    name: "سديم السرطان",
    targetType: "nebula",
    constellation: "الثور",
    bestMonths: months(11, 12, 1, 2),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.sho,
    exposure: "300-600 ثانية × 40-80 إطار SHO",
    notes: "بقايا مستعر أعظم — تفاصيل خيوط دقيقة بـ SCA260",
  },
  13: {
    name: "عنقود هرقل العظيم",
    targetType: "cluster",
    constellation: "هرقل",
    bestMonths: months(4, 5, 6, 7, 8),
    bestTelescope: TELESCOPES.c11,
    bestFilter: FILTERS.lrgb,
    exposure: "120-180 ثانية × 30-50 إطار LRGB",
    notes: "أفضل عنقود كروي شمالي — C11 يحلّ النجوم إلى المركز",
  },
  16: {
    name: "سديم النسر",
    targetType: "nebula",
    constellation: "القوس",
    bestMonths: months(6, 7, 8),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.ha3,
    exposure: "300-600 ثانية × 40-80 Ha، 180s LRGB",
    notes: "منخفض على أفق جنوب العراق — صوّر من تلال جنوبية",
  },
  17: {
    name: "سديم البجعة",
    targetType: "nebula",
    constellation: "القوس",
    bestMonths: months(6, 7, 8),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.ha,
    exposure: "300-600 ثانية × 50 Ha + OIII",
  },
  20: {
    name: "سديم ثلاثي الأقسام",
    targetType: "nebula",
    constellation: "القوس",
    bestMonths: months(6, 7, 8),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.lrgbHa,
    exposure: "300s Ha × 40 + 180s LRGB × 30",
  },
  27: {
    name: "سديم الدمبل",
    targetType: "nebula",
    constellation: "Lyra",
    bestMonths: months(5, 6, 7, 8, 9),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.sho,
    exposure: "300-600s × 40-60 SHO",
    notes: "سديم كوكبي — OIII قوي",
  },
  31: {
    name: "مجرة أندرومeda",
    targetType: "galaxy",
    constellation: "Andromeda",
    bestMonths: months(8, 9, 10, 11, 12, 1),
    bestTelescope: TELESCOPES.wide,
    bestFilter: FILTERS.lrgb,
    exposure: "180-300s × 60-100 LRGB",
    notes: "هدف واسع — Askar V80 أو MiniCat يكفيان للحقل الكامل",
  },
  42: {
    name: "سديم الجبار",
    targetType: "nebula",
    constellation: "الجبار",
    bestMonths: months(11, 12, 1, 2, 3),
    bestTelescope: TELESCOPES.wide,
    bestFilter: FILTERS.lrgbHa,
    exposure: "180-300s LRGB × 60 + 300-600s Ha × 40",
    notes: "أفضل هدف شتوي للعراق — M42 + M43 في نفس الحقل",
  },
  43: {
    name: "سديم دي ميران",
    targetType: "nebula",
    constellation: "الجبار",
    bestMonths: months(11, 12, 1, 2),
    bestTelescope: TELESCOPES.wide,
    bestFilter: FILTERS.ha,
    exposure: "300s Ha × 30-50",
  },
  44: {
    name: "عنقود خلايا النحل",
    targetType: "cluster",
    constellation: "السرطان",
    bestMonths: months(1, 2, 3, 4),
    bestTelescope: TELESCOPES.wideRed,
    bestFilter: FILTERS.lrgb,
    exposure: "120-180s × 40 LRGB",
  },
  45: {
    name: "الثريا",
    targetType: "cluster",
    constellation: "الثور",
    bestMonths: months(10, 11, 12, 1, 2, 3),
    bestTelescope: TELESCOPES.ultraWide,
    bestFilter: FILTERS.lrgb,
    exposure: "60-120s × 50-80 LRGB (تجنب التشبع)",
    notes: "سحابة انعكاسية — MiniCat أو Askar V60 reducer",
  },
  51: {
    name: "مجرة الدوامة",
    targetType: "galaxy",
    constellation: "كلب الصياد",
    bestMonths: months(3, 4, 5, 6),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.lrgb,
    exposure: "300-600s × 40-60 LRGB",
  },
  57: {
    name: "سديم حلقة ليرا",
    targetType: "nebula",
    constellation: "Lyra",
    bestMonths: months(5, 6, 7, 8),
    bestTelescope: TELESCOPES.c11,
    bestFilter: FILTERS.oiii,
    exposure: "300-600s OIII × 30-50",
    notes: "صغير لكن ساطع — C11 + OIII مثالي",
  },
  63: {
    name: "مجرة عباد الشمس",
    targetType: "galaxy",
    constellation: "كلب الصياد",
    bestMonths: months(3, 4, 5),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.lrgb,
    exposure: "300-600s × 40 LRGB",
  },
  81: {
    name: "مجرة بود",
    targetType: "galaxy",
    constellation: "دب أكبر",
    bestMonths: months(1, 2, 3, 4),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.lrgb,
    exposure: "300-600s × 40-60 LRGB",
  },
  82: {
    name: "مجرة السيجار",
    targetType: "galaxy",
    constellation: "دب أكبر",
    bestMonths: months(1, 2, 3, 4),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.ha,
    exposure: "300s Ha × 40 + 300s LRGB × 30",
    notes: "انفجار نجمي — Ha يبرز التيارات",
  },
  97: {
    name: "سديم البومة",
    targetType: "nebula",
    constellation: "دب أكبر",
    bestMonths: months(1, 2, 3, 4),
    bestTelescope: TELESCOPES.c11,
    bestFilter: FILTERS.oiii,
    exposure: "600-900s OIII × 30-40",
  },
  101: {
    name: "مجرة الدبابة",
    targetType: "galaxy",
    constellation: "دب أكبر",
    bestMonths: months(3, 4, 5),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.lrgb,
    exposure: "300-600s × 50-80 LRGB",
  },
  104: {
    name: "مجرة القبعة",
    targetType: "galaxy",
    constellation: "العذراء",
    bestMonths: months(3, 4, 5),
    bestTelescope: TELESCOPES.sca,
    bestFilter: FILTERS.lrgb,
    exposure: "300-600s × 40 LRGB",
    notes: "مائل — يحتاج ليالي شفافة",
  },
};

const M_META = [
  [1, "Crab Nebula", "nebula", "Taurus", "05:34:31.94", "-05:22:30.0", [11, 12, 1, 2], "9م-2ص"],
  [2, "Globular Cluster", "cluster", "Aquarius", "21:33:27.02", "-00:49:23.7", [6, 7, 8, 9], "10م-3ص"],
  [3, "Globular Cluster", "cluster", "Canes Venatici", "13:42:11.62", "+28:22:38.0", [3, 4, 5, 6], "10م-4ص"],
  [4, "Globular Cluster", "cluster", "Scorpius", "16:23:35.22", "-26:31:32.7", [5, 6, 7], "9م-1ص"],
  [5, "Globular Cluster", "cluster", "Serpens", "15:18:33.22", "+02:04:59.4", [4, 5, 6, 7], "10م-2ص"],
  [6, "Butterfly Cluster", "cluster", "Scorpius", "17:40:20.00", "-32:15:15.0", [5, 6, 7], "8م-12ص"],
  [7, "Ptolemy Cluster", "cluster", "Scorpius", "17:53:51.00", "-34:47:34.0", [5, 6, 7], "8م-12ص"],
  [8, "Lagoon Nebula", "nebula", "Sagittarius", "18:03:37.00", "-24:23:12.0", [6, 7, 8], "9م-1ص"],
  [9, "Globular Cluster", "cluster", "Ophiuchus", "17:19:11.78", "-18:30:58.5", [5, 6, 7, 8], "9م-1ص"],
  [10, "Globular Cluster", "cluster", "Ophiuchus", "16:57:09.00", "-04:03:58.0", [5, 6, 7], "10م-2ص"],
  [11, "Wild Duck Cluster", "cluster", "Scutum", "18:51:05.00", "-06:16:12.0", [6, 7, 8], "10م-2ص"],
  [12, "Globular Cluster", "cluster", "Ophiuchus", "16:47:14.40", "-01:56:54.8", [5, 6, 7], "10م-2ص"],
  [13, "Hercules Globular", "cluster", "Hercules", "16:41:41.63", "+36:27:40.7", [4, 5, 6, 7, 8], "10م-4ص"],
  [14, "Globular Cluster", "cluster", "Ophiuchus", "17:37:36.00", "-03:14:45.3", [5, 6, 7], "10م-2ص"],
  [15, "Globular Cluster", "cluster", "Pegasus", "21:29:58.33", "+12:10:01.2", [7, 8, 9, 10], "9م-3ص"],
  [16, "Eagle Nebula", "nebula", "Sagittarius", "18:18:48.00", "-13:49:00.0", [6, 7, 8], "9م-1ص"],
  [17, "Omega Nebula", "nebula", "Sagittarius", "18:20:26.00", "-16:10:36.0", [6, 7, 8], "9م-1ص"],
  [18, "Open Cluster", "cluster", "Sagittarius", "18:19:58.00", "-17:08:00.0", [6, 7, 8], "9م-1ص"],
  [19, "Globular Cluster", "cluster", "Ophiuchus", "17:02:37.69", "-26:16:04.6", [5, 6, 7], "9م-12ص"],
  [20, "Trifid Nebula", "nebula", "Sagittarius", "18:02:23.00", "-23:01:48.0", [6, 7, 8], "9م-1ص"],
  [21, "Open Cluster", "cluster", "Sagittarius", "18:04:13.00", "-22:29:24.0", [6, 7, 8], "9م-1ص"],
  [22, "Globular Cluster", "cluster", "Sagittarius", "18:36:24.21", "-23:54:12.2", [6, 7, 8], "9م-1ص"],
  [23, "Open Cluster", "cluster", "Sagittarius", "17:56:48.00", "-19:00:36.0", [6, 7, 8], "9م-1ص"],
  [24, "Sagittarius Star Cloud", "cluster", "Sagittarius", "18:16:48.00", "-18:29:00.0", [6, 7, 8], "9م-1ص"],
  [25, "Open Cluster", "cluster", "Sagittarius", "18:31:47.00", "-19:07:00.0", [6, 7, 8], "9م-1ص"],
  [26, "Open Cluster", "cluster", "Scutum", "18:45:18.00", "-09:24:00.0", [6, 7, 8], "10م-2ص"],
  [27, "Dumbbell Nebula", "nebula", "Lyra", "19:59:36.340", "+22:43:16.09", [5, 6, 7, 8, 9], "10م-3ص"],
  [28, "Globular Cluster", "cluster", "Sagittarius", "18:24:32.89", "-24:52:11.4", [6, 7, 8], "9م-1ص"],
  [29, "Open Cluster", "cluster", "Cygnus", "20:23:56.00", "+38:31:24.0", [6, 7, 8, 9], "10م-4ص"],
  [30, "Globular Cluster", "cluster", "Capricornus", "21:40:22.12", "-23:10:47.5", [7, 8, 9], "9م-2ص"],
  [31, "Andromeda Galaxy", "galaxy", "Andromeda", "00:42:44.33", "+41:16:09.4", [8, 9, 10, 11, 12, 1], "8م-4ص"],
  [32, "Elliptical Galaxy", "galaxy", "Andromeda", "00:42:41.82", "+40:51:54.7", [8, 9, 10, 11, 12, 1], "8م-4ص"],
  [33, "Triangulum Galaxy", "galaxy", "Triangulum", "01:33:50.02", "+30:39:36.7", [9, 10, 11, 12], "8م-4ص"],
  [34, "Open Cluster", "cluster", "Perseus", "02:42:05.00", "+42:45:00.0", [10, 11, 12, 1], "8م-4ص"],
  [35, "Open Cluster", "cluster", "Gemini", "06:08:57.0", "+24:20:00.0", [11, 12, 1, 2, 3], "9م-3ص"],
  [36, "Open Cluster", "cluster", "Auriga", "05:36:12.0", "+34:08:24.0", [11, 12, 1, 2], "9م-4ص"],
  [37, "Open Cluster", "cluster", "Auriga", "05:52:18.0", "+32:33:12.0", [11, 12, 1, 2], "9م-4ص"],
  [38, "Open Cluster", "cluster", "Auriga", "05:28:42.0", "+35:51:18.0", [11, 12, 1, 2], "9م-4ص"],
  [39, "Open Cluster", "cluster", "Cygnus", "21:32:30.0", "+48:26:00.0", [6, 7, 8, 9], "10م-4ص"],
  [40, "Winnecke 4", "other", "Ursa Major", "12:22:12.5", "+58:05:00.0", [3, 4, 5, 6], "10م-4ص"],
  [41, "Open Cluster", "cluster", "Canis Major", "06:46:00.0", "-20:45:24.0", [12, 1, 2], "8م-12ص"],
  [42, "Orion Nebula", "nebula", "Orion", "05:35:17.3", "-05:23:28.0", [11, 12, 1, 2, 3], "8م-2ص"],
  [43, "De Mairan's Nebula", "nebula", "Orion", "05:35:31.0", "-05:16:54.0", [11, 12, 1, 2], "8م-2ص"],
  [44, "Beehive Cluster", "cluster", "Cancer", "08:40:24.0", "+19:40:00.0", [1, 2, 3, 4], "9م-3ص"],
  [45, "Pleiades", "cluster", "Taurus", "03:47:24.0", "+24:07:00.0", [10, 11, 12, 1, 2, 3], "8م-4ص"],
  [46, "Open Cluster", "cluster", "Puppis", "07:41:46.0", "-14:48:36.0", [12, 1, 2], "9م-1ص"],
  [47, "Open Cluster", "cluster", "Puppis", "07:36:36.0", "-14:29:00.0", [12, 1, 2], "9م-1ص"],
  [48, "Open Cluster", "cluster", "Hydra", "08:13:42.0", "-05:48:00.0", [1, 2, 3, 4], "9م-2ص"],
  [49, "Elliptical Galaxy", "galaxy", "Virgo", "12:29:46.7", "+08:00:01.2", [3, 4, 5], "10م-2ص"],
  [50, "Open Cluster", "cluster", "Monoceros", "07:02:48.0", "-08:23:24.0", [12, 1, 2], "9م-2ص"],
  [51, "Whirlpool Galaxy", "galaxy", "Canes Venatici", "13:29:52.7", "+47:11:43.0", [3, 4, 5, 6], "10م-4ص"],
  [52, "Open Cluster", "cluster", "Cassiopeia", "23:24:48.0", "+61:35:00.0", [9, 10, 11], "8م-4ص"],
  [53, "Globular Cluster", "cluster", "Coma Berenices", "13:12:55.25", "+18:10:05.4", [3, 4, 5, 6], "10م-3ص"],
  [54, "Globular Cluster", "cluster", "Sagittarius", "18:55:03.33", "-30:28:47.5", [6, 7, 8], "8م-12ص"],
  [55, "Globular Cluster", "cluster", "Sagittarius", "19:39:59.71", "-30:57:53.1", [6, 7, 8], "8م-12ص"],
  [56, "Globular Cluster", "cluster", "Lyra", "19:16:35.50", "+30:11:04.2", [6, 7, 8, 9], "10م-3ص"],
  [57, "Ring Nebula", "nebula", "Lyra", "18:53:35.079", "+33:01:45.03", [5, 6, 7, 8], "10م-3ص"],
  [58, "Barred Spiral Galaxy", "galaxy", "Virgo", "12:37:43.5", "+11:49:05.3", [3, 4, 5], "10م-2ص"],
  [59, "Elliptical Galaxy", "galaxy", "Virgo", "12:39:40.2", "+11:48:44.4", [3, 4, 5], "10م-2ص"],
  [60, "Elliptical Galaxy", "galaxy", "Virgo", "12:43:40.5", "+11:33:22.0", [3, 4, 5], "10م-2ص"],
  [61, "Spiral Galaxy", "galaxy", "Virgo", "12:21:54.9", "+04:28:25.0", [3, 4, 5], "10م-1ص"],
  [62, "Globular Cluster", "cluster", "Ophiuchus", "17:01:12.60", "-30:06:44.5", [5, 6, 7], "9م-12ص"],
  [63, "Sunflower Galaxy", "galaxy", "Canes Venatici", "13:15:49.3", "+42:01:45.0", [3, 4, 5], "10م-4ص"],
  [64, "Black Eye Galaxy", "galaxy", "Coma Berenices", "12:56:43.7", "+21:40:58.0", [3, 4, 5, 6], "10م-3ص"],
  [65, "Leo Triplet", "galaxy", "Leo", "11:18:55.9", "+13:05:32.0", [2, 3, 4], "10م-2ص"],
  [66, "Leo Triplet", "galaxy", "Leo", "11:20:15.0", "+12:59:24.0", [2, 3, 4], "10م-2ص"],
  [67, "Open Cluster", "cluster", "Cancer", "08:50:24.0", "+11:49:00.0", [1, 2, 3, 4], "9م-3ص"],
  [68, "Globular Cluster", "cluster", "Hydra", "12:39:27.98", "-26:44:38.6", [3, 4, 5], "9م-12ص"],
  [69, "Globular Cluster", "cluster", "Sagittarius", "18:31:23.23", "-32:20:53.1", [6, 7, 8], "8م-12ص"],
  [70, "Globular Cluster", "cluster", "Sagittarius", "18:43:12.76", "-32:17:31.6", [6, 7, 8], "8م-12ص"],
  [71, "Globular Cluster", "cluster", "Sagittarius", "19:53:46.49", "-18:46:42.3", [6, 7, 8], "9م-1ص"],
  [72, "Globular Cluster", "cluster", "Aquarius", "20:53:27.91", "-12:32:13.4", [7, 8, 9], "9م-2ص"],
  [73, "Asterism", "other", "Aquarius", "20:58:56.0", "-12:38:24.0", [7, 8, 9], "9م-2ص"],
  [74, "Phantom Galaxy", "galaxy", "Pisces", "01:36:41.8", "+15:47:01.0", [9, 10, 11], "8م-4ص"],
  [75, "Globular Cluster", "cluster", "Capricornus", "20:06:04.75", "-21:55:16.2", [7, 8, 9], "9م-2ص"],
  [76, "Little Dumbbell", "nebula", "Perseus", "01:42:19.695", "+51:34:31.79", [10, 11, 12], "8م-4ص"],
  [77, "Spiral Galaxy", "galaxy", "Cetus", "02:42:40.7", "-00:00:47.0", [10, 11, 12, 1], "8م-3ص"],
  [78, "Reflection Nebula", "nebula", "Orion", "05:46:45.0", "+00:02:00.0", [11, 12, 1, 2], "9م-2ص"],
  [79, "Globular Cluster", "cluster", "Lepus", "05:24:10.59", "-24:31:27.1", [11, 12, 1, 2], "8م-12ص"],
  [80, "Globular Cluster", "cluster", "Scorpius", "16:17:02.41", "-22:58:30.4", [5, 6, 7], "9م-1ص"],
  [81, "Bode's Galaxy", "galaxy", "Ursa Major", "09:55:33.2", "+69:03:55.0", [1, 2, 3, 4], "10م-4ص"],
  [82, "Cigar Galaxy", "galaxy", "Ursa Major", "09:55:52.2", "+69:40:47.0", [1, 2, 3, 4], "10م-4ص"],
  [83, "Southern Pinwheel", "galaxy", "Hydra", "13:37:00.5", "-29:51:57.0", [3, 4, 5], "9م-12ص"],
  [84, "Elliptical Galaxy", "galaxy", "Virgo", "12:25:03.7", "+12:53:13.0", [3, 4, 5], "10م-2ص"],
  [85, "Elliptical Galaxy", "galaxy", "Coma Berenices", "12:25:24.0", "+18:11:27.0", [3, 4, 5, 6], "10م-3ص"],
  [86, "Elliptical Galaxy", "galaxy", "Virgo", "12:26:11.6", "+12:56:46.0", [3, 4, 5], "10م-2ص"],
  [87, "Virgo A", "galaxy", "Virgo", "12:30:49.4", "+12:23:28.0", [3, 4, 5], "10م-2ص"],
  [88, "Spiral Galaxy", "galaxy", "Coma Berenices", "12:32:04.9", "+14:25:01.0", [3, 4, 5, 6], "10م-3ص"],
  [89, "Elliptical Galaxy", "galaxy", "Virgo", "12:35:39.8", "+12:33:09.0", [3, 4, 5], "10م-2ص"],
  [90, "Spiral Galaxy", "galaxy", "Virgo", "12:36:49.8", "+13:09:46.0", [3, 4, 5], "10م-2ص"],
  [91, "Spiral Galaxy", "galaxy", "Coma Berenices", "12:35:26.4", "+14:29:47.0", [3, 4, 5, 6], "10م-3ص"],
  [92, "Globular Cluster", "cluster", "Hercules", "17:17:07.27", "+43:08:11.5", [5, 6, 7, 8], "10م-4ص"],
  [93, "Open Cluster", "cluster", "Puppis", "07:44:30.0", "-23:51:24.0", [12, 1, 2], "9م-1ص"],
  [94, "Spiral Galaxy", "galaxy", "Canes Venatici", "12:50:53.1", "+41:07:14.0", [3, 4, 5, 6], "10م-4ص"],
  [95, "Barred Spiral Galaxy", "galaxy", "Leo", "10:43:57.7", "+11:42:14.0", [2, 3, 4], "10م-2ص"],
  [96, "Spiral Galaxy", "galaxy", "Leo", "10:46:45.7", "+11:49:12.0", [2, 3, 4], "10م-2ص"],
  [97, "Owl Nebula", "nebula", "Ursa Major", "11:14:47.9", "+55:01:08.0", [1, 2, 3, 4], "10م-4ص"],
  [98, "Spiral Galaxy", "galaxy", "Coma Berenices", "12:13:48.3", "+14:54:01.0", [3, 4, 5, 6], "10م-3ص"],
  [99, "Spiral Galaxy", "galaxy", "Coma Berenices", "12:18:49.6", "+14:25:00.0", [3, 4, 5, 6], "10م-3ص"],
  [100, "Spiral Galaxy", "galaxy", "Coma Berenices", "12:22:54.9", "+15:49:21.0", [3, 4, 5, 6], "10م-3ص"],
  [101, "Pinwheel Galaxy", "galaxy", "Ursa Major", "14:03:12.6", "+54:21:00.0", [3, 4, 5], "10م-4ص"],
  [102, "Spindle Galaxy", "galaxy", "Draco", "15:06:29.5", "+55:45:48.0", [4, 5, 6], "10م-4ص"],
  [103, "Open Cluster", "cluster", "Cassiopeia", "01:33:12.0", "+60:42:00.0", [9, 10, 11], "8م-4ص"],
  [104, "Sombrero Galaxy", "galaxy", "Virgo", "12:39:59.4", "-11:37:23.0", [3, 4, 5], "10م-1ص"],
  [105, "Elliptical Galaxy", "galaxy", "Leo", "10:47:49.6", "+12:34:54.0", [2, 3, 4], "10م-2ص"],
  [106, "Spiral Galaxy", "galaxy", "Canes Venatici", "12:18:57.5", "+47:18:15.0", [3, 4, 5, 6], "10م-4ص"],
  [107, "Globular Cluster", "cluster", "Ophiuchus", "16:32:31.86", "-13:03:13.6", [5, 6, 7], "10م-2ص"],
  [108, "Spiral Galaxy", "galaxy", "Ursa Major", "11:11:30.7", "+55:40:27.0", [3, 4, 5], "10م-4ص"],
  [109, "Barred Spiral Galaxy", "galaxy", "Ursa Major", "11:57:36.0", "+53:22:28.0", [3, 4, 5], "10م-4ص"],
  [110, "Dwarf Elliptical", "galaxy", "Andromeda", "00:40:22.1", "+41:41:07.0", [8, 9, 10, 11, 12, 1], "8م-4ص"],
];

function defaultForType(type, num) {
  const isGlobular = type === "cluster" && num !== 6 && num !== 7 && num !== 11 && num !== 24 && num !== 39 && num !== 44 && num !== 45 && ![34,35,36,37,38,41,46,47,48,50,52,67,93,103].includes(num);
  const isOpen = type === "cluster" && !isGlobular;
  const isGalaxy = type === "galaxy";
  const isNebula = type === "nebula";
  const isOther = type === "other";

  if (isGalaxy) {
    const wide = num === 31 || num === 33;
    return {
      bestTelescope: wide ? TELESCOPES.wide : TELESCOPES.sca,
      bestCamera: CAM.ds,
      bestFilter: FILTERS.lrgb,
      exposure: wide ? "180-300s × 50-80 LRGB" : "300-600s × 40-60 LRGB",
    };
  }
  if (isNebula) {
    const small = num === 57 || num === 76 || num === 97;
    return {
      bestTelescope: small ? TELESCOPES.c11 : num === 78 ? TELESCOPES.medium : TELESCOPES.sca,
      bestCamera: CAM.ds,
      bestFilter: num === 78 ? FILTERS.lrgb : FILTERS.lrgbHa,
      exposure: small ? "300-900s narrowband × 30-50" : "300s Ha × 40 + 180s LRGB × 30",
    };
  }
  if (isGlobular) {
    return {
      bestTelescope: num === 13 || num === 92 ? TELESCOPES.c11 : TELESCOPES.sca,
      bestCamera: CAM.ds,
      bestFilter: FILTERS.lrgb,
      exposure: "120-180s × 30-50 LRGB",
    };
  }
  if (isOpen) {
    return {
      bestTelescope: num === 45 ? TELESCOPES.ultraWide : TELESCOPES.wide,
      bestCamera: CAM.ds,
      bestFilter: FILTERS.lrgb,
      exposure: "120-180s × 30-50 LRGB",
    };
  }
  return {
    bestTelescope: TELESCOPES.wide,
    bestCamera: CAM.ds,
    bestFilter: FILTERS.lrgb,
    exposure: "180s × 30 LRGB",
  };
}

function parseRa(raStr) {
  const parts = raStr.split(":");
  const h = parseFloat(parts[0]);
  const m = parseFloat(parts[1]);
  const s = parseFloat(parts[2]);
  return +(h + m / 60 + s / 3600).toFixed(4);
}

function parseDec(decStr) {
  const sign = decStr.startsWith("-") ? -1 : 1;
  const parts = decStr.replace(/^[+-]/, "").split(":");
  const d = parseFloat(parts[0]);
  const m = parseFloat(parts[1]);
  const s = parseFloat(parts[2] || "0");
  return +(sign * (d + m / 60 + s / 3600)).toFixed(4);
}

const ARABIC_NAMES = {
  8: "سديم البحيرة",
  16: "سديم النسر",
  17: "سديم أوميغا",
  20: "سديم ثلاثي الأقسام",
  27: "سديم الدمبل",
  31: "مجرة أندرومeda",
  42: "سديم الجبار",
  44: "عنقود خلايا النحل",
  45: "الثريا",
  51: "مجرة الدوامة",
  57: "سديم حلقة ليرا",
  63: "مجرة عباد الشمس",
  81: "مجرة بود",
  82: "مجرة السيجار",
  97: "سديم البومة",
  101: "مجرة الدبابة",
  104: "مجرة القبعة",
  1: "سديم السرطان",
  13: "عنقود هرقل العظيم",
};

const messierEntries = M_META.map(([num, enName, type, constellation, ra, dec, bestMonths, bestTime]) => {
  const ov = M_OVERRIDES[num] || {};
  const defs = defaultForType(type, num);
  const arabicName = ov.name || ARABIC_NAMES[num] || enName;
  return entry({
    id: `m${num}`,
    name: arabicName,
    designation: `M${num}`,
    targetType: ov.targetType || type,
    constellation: ov.constellation || constellation,
    ra: parseRa(ra),
    dec: parseDec(dec),
    bestMonths: ov.bestMonths || bestMonths,
    bestTime: `من ${bestTime} (توقيت العراق)`,
    bestTelescope: ov.bestTelescope || defs.bestTelescope,
    bestCamera: ov.bestCamera || defs.bestCamera,
    bestFilter: ov.bestFilter || defs.bestFilter,
    exposure: ov.exposure || defs.exposure,
    ...(ov.notes ? { notes: ov.notes } : {}),
  });
});

const NGC_IC = [
  { id: "ngc7000", name: "سديم أمريكا الشمالية", designation: "NGC 7000", targetType: "nebula", constellation: "الجبانة", ra: 20.991, dec: 44.517, bestMonths: months(6, 7, 8, 9), bestTime: "10م-4ص", bestTelescope: TELESCOPES.wideRed, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300-600s Ha × 50-80", notes: "حقل واسع — reducer ضروري" },
  { id: "ngc6888", name: "سديم الهلال", designation: "NGC 6888", targetType: "nebula", constellation: "الجبانة", ra: 20.2, dec: 38.355, bestMonths: months(6, 7, 8), bestTime: "10م-3ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha3, exposure: "300-600s Ha × 40" },
  { id: "ic1805", name: "سديم القلب", designation: "IC 1805", targetType: "nebula", constellation: "قلب أثير", ra: 2.733, dec: 61.45, bestMonths: months(10, 11, 12), bestTime: "8م-4ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 50 + LRGB" },
  { id: "ic1848", name: "سديم الروح", designation: "IC 1848", targetType: "nebula", constellation: "قلب أثير", ra: 2.85, dec: 60.45, bestMonths: months(10, 11, 12), bestTime: "8م-4ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ngc2237", name: "سديم الوردة", designation: "NGC 2237", targetType: "nebula", constellation: "Monoceros", ra: 6.52, dec: 4.95, bestMonths: months(12, 1, 2), bestTime: "9م-2ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgbHa, exposure: "300s Ha × 50 + 180s LRGB × 40" },
  { id: "ngc2244", name: "عنقود الوردة", designation: "NGC 2244", targetType: "cluster", constellation: "Monoceros", ra: 6.533, dec: 4.9, bestMonths: months(12, 1, 2), bestTime: "9م-2ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "180s × 40 LRGB" },
  { id: "ngc2264", name: "سديم المخروط", designation: "NGC 2264", targetType: "nebula", constellation: "Monoceros", ra: 6.68, dec: 9.9, bestMonths: months(12, 1, 2), bestTime: "9م-3ص", bestTelescope: TELESCOPES.medium, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ngc6960", name: "سديم الحجاب (غرب)", designation: "NGC 6960", targetType: "nebula", constellation: "الجبانة", ra: 20.758, dec: 30.717, bestMonths: months(6, 7, 8), bestTime: "10م-3ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300-600s Ha × 60", notes: "جزء غربي من Veil" },
  { id: "ngc6992", name: "سديم الحجاب (شرق)", designation: "NGC 6992", targetType: "nebula", constellation: "الجبانة", ra: 20.975, dec: 31.717, bestMonths: months(6, 7, 8), bestTime: "10م-3ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300-600s Ha × 60" },
  { id: "ngc7009", name: "سديم زحل", designation: "NGC 7009", targetType: "nebula", constellation: "الحوت", ra: 21.125, dec: -11.367, bestMonths: months(7, 8, 9), bestTime: "9م-2ص", bestTelescope: TELESCOPES.c11, bestCamera: CAM.ds, bestFilter: FILTERS.oiii, exposure: "300-600s OIII × 40" },
  { id: "ngc7293", name: "سديم الحلزون", designation: "NGC 7293", targetType: "nebula", constellation: "الماء", ra: 22.492, dec: -20.837, bestMonths: months(8, 9, 10), bestTime: "9م-1ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.oiii, exposure: "300s OIII × 50 + Ha", notes: "كبير — حقل واسع" },
  { id: "ngc7822", name: "سديم NGC 7822", designation: "NGC 7822", targetType: "nebula", constellation: "التيس", ra: 0.217, dec: 68.033, bestMonths: months(9, 10, 11), bestTime: "8م-4ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 50" },
  { id: "ngc1499", name: "سديم كاليفورنيا", designation: "NGC 1499", targetType: "nebula", constellation: "Perseus", ra: 4.033, dec: 36.417, bestMonths: months(10, 11, 12, 1), bestTime: "8م-4ص", bestTelescope: TELESCOPES.ultraWide, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 60", notes: "هدف واسع جداً — MiniCat أو reducer" },
  { id: "ngc7635", name: "سديم الفقاعة", designation: "NGC 7635", targetType: "nebula", constellation: "Cassiopeia", ra: 23.25, dec: 61.2, bestMonths: months(9, 10, 11), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300-600s Ha × 40" },
  { id: "ngc7023", name: "سديم السوسن", designation: "NGC 7023", targetType: "nebula", constellation: "Cepheus", ra: 21.017, dec: 68.15, bestMonths: months(8, 9, 10), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "180-300s LRGB × 40" },
  { id: "ic5146", name: "سديم الشرنوق", designation: "IC 5146", targetType: "nebula", constellation: "الجبانة", ra: 21.883, dec: 47.267, bestMonths: months(7, 8, 9), bestTime: "10م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ngc281", name: "سديم باكمان", designation: "NGC 281", targetType: "nebula", constellation: "Cassiopeia", ra: 0.833, dec: 56.633, bestMonths: months(9, 10, 11), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 50" },
  { id: "ngc7380", name: "سديم الساحر", designation: "NGC 7380", targetType: "nebula", constellation: "Cepheus", ra: 22.717, dec: 58.067, bestMonths: months(8, 9, 10), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ic434", name: "منطقة رأس الحصان", designation: "IC 434", targetType: "nebula", constellation: "الجبار", ra: 5.687, dec: -2.433, bestMonths: months(11, 12, 1, 2), bestTime: "8م-2ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300-600s Ha × 60", notes: "B33 رأس الحصان داخل Ha" },
  { id: "ngc2024", name: "سديم اللهب", designation: "NGC 2024", targetType: "nebula", constellation: "الجبار", ra: 5.692, dec: -1.969, bestMonths: months(11, 12, 1, 2), bestTime: "8م-2ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300-600s Ha × 40" },
  { id: "ic405", name: "سديم النجم المشتعل", designation: "IC 405", targetType: "nebula", constellation: "Auriga", ra: 5.267, dec: 34.25, bestMonths: months(11, 12, 1, 2), bestTime: "9م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40 + LRGB" },
  { id: "ic410", name: "سديم IC 410", designation: "IC 410", targetType: "nebula", constellation: "Auriga", ra: 5.367, dec: 33.5, bestMonths: months(11, 12, 1, 2), bestTime: "9م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ngc2359", name: "خوذة Thor", designation: "NGC 2359", targetType: "nebula", constellation: "Canis Major", ra: 7.167, dec: -13.133, bestMonths: months(12, 1, 2), bestTime: "8م-12ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300-600s Ha × 50" },
  { id: "ngc2174", name: "سديم رأس القرد", designation: "NGC 2174", targetType: "nebula", constellation: "الجبار", ra: 6.033, dec: 20.083, bestMonths: months(12, 1, 2), bestTime: "9م-3ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ngc1977", name: "سديم الرجل الجاري", designation: "NGC 1977", targetType: "nebula", constellation: "الجبار", ra: 5.583, dec: -4.85, bestMonths: months(11, 12, 1, 2), bestTime: "8م-2ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.lrgbHa, exposure: "180s LRGB + 300s Ha × 40" },
  { id: "ic1396", name: "سديم الجذع الفيل", designation: "IC 1396", targetType: "nebula", constellation: "Cepheus", ra: 21.65, dec: 57.5, bestMonths: months(7, 8, 9), bestTime: "8م-4ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 50" },
  { id: "ngc2403", name: "مجرة NGC 2403", designation: "NGC 2403", targetType: "galaxy", constellation: "Camelopardalis", ra: 7.617, dec: 65.6, bestMonths: months(11, 12, 1, 2), bestTime: "9م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc253", name: "مجرة نحات", designation: "NGC 253", targetType: "galaxy", constellation: "Sculptor", ra: 0.798, dec: -25.517, bestMonths: months(9, 10, 11), bestTime: "8م-12ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 50 LRGB", notes: "منخفض جنوباً — أفضل من صحراء جنوب العراق" },
  { id: "ngc2903", name: "مجرة NGC 2903", designation: "NGC 2903", targetType: "galaxy", constellation: "Leo", ra: 9.517, dec: 21.5, bestMonths: months(2, 3, 4), bestTime: "10م-2ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc4565", name: "مجرة الإبرة", designation: "NGC 4565", targetType: "galaxy", constellation: "Coma Berenices", ra: 12.633, dec: 25.987, bestMonths: months(3, 4, 5), bestTime: "10م-3ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 50 LRGB" },
  { id: "ngc3628", name: "مجرة Leo Triplet (3628)", designation: "NGC 3628", targetType: "galaxy", constellation: "Leo", ra: 11.283, dec: 13.589, bestMonths: months(2, 3, 4), bestTime: "10م-2ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc4631", name: "مجرة الحوت", designation: "NGC 4631", targetType: "galaxy", constellation: "Canes Venatici", ra: 12.683, dec: 32.542, bestMonths: months(3, 4, 5), bestTime: "10م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc4656", name: "مجرة الغراب", designation: "NGC 4656", targetType: "galaxy", constellation: "Canes Venatici", ra: 12.733, dec: 32.217, bestMonths: months(3, 4, 5), bestTime: "10م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc1333", name: "سديم NGC 1333", designation: "NGC 1333", targetType: "nebula", constellation: "Perseus", ra: 3.317, dec: 31.317, bestMonths: months(10, 11, 12, 1), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300s × 40 LRGB" },
  { id: "sh2-155", name: "سديم الكهف", designation: "Sh2-155", targetType: "nebula", constellation: "Cepheus", ra: 22.917, dec: 62.583, bestMonths: months(8, 9, 10), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "vdB141", name: "سديم الشبح", designation: "vdB 141", targetType: "nebula", constellation: "Cepheus", ra: 21.683, dec: 68.183, bestMonths: months(8, 9, 10), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc896", name: "سديم NGC 896", designation: "NGC 896", targetType: "nebula", constellation: "Cassiopeia", ra: 2.367, dec: 61.983, bestMonths: months(9, 10, 11), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ic59", name: "سديم IC 59", designation: "IC 59", targetType: "nebula", constellation: "Cassiopeia", ra: 0.983, dec: 61.15, bestMonths: months(9, 10, 11), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ic63", name: "سديم IC 63", designation: "IC 63", targetType: "nebula", constellation: "Cassiopeia", ra: 1.033, dec: 60.933, bestMonths: months(9, 10, 11), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ngc3576", name: "سديم NGC 3576", designation: "NGC 3576", targetType: "nebula", constellation: "القوس", ra: 11.033, dec: -61.283, bestMonths: months(4, 5), bestTime: "8م-12ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40", notes: "جنوبي جداً — صعب من 33°N" },
  { id: "ic5070", name: "سديم البجعة (Pelican)", designation: "IC 5070", targetType: "nebula", constellation: "الجبانة", ra: 20.883, dec: 44.367, bestMonths: months(6, 7, 8), bestTime: "10م-4ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 50" },
  { id: "ngc1491", name: "سديم NGC 1491", designation: "NGC 1491", targetType: "nebula", constellation: "Perseus", ra: 4.033, dec: 51.083, bestMonths: months(10, 11, 12), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40" },
  { id: "ngc3199", name: "سديم NGC 3199", designation: "NGC 3199", targetType: "nebula", constellation: "Carina", ra: 10.167, dec: -57.683, bestMonths: months(2, 3), bestTime: "8م-12ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40", notes: "هدف جنوبي — مرئي منخفضاً فقط" },
  { id: "ngc3324", name: "سديم NGC 3324", designation: "NGC 3324", targetType: "nebula", constellation: "Carina", ra: 10.617, dec: -58.683, bestMonths: months(2, 3), bestTime: "8م-12ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40", notes: "جنوبي — صعب من العراق" },
  { id: "ngc6188", name: "سديم NGC 6188", designation: "NGC 6188", targetType: "nebula", constellation: "Ara", ra: 16.517, dec: -48.767, bestMonths: months(5, 6), bestTime: "8م-12ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.ha, exposure: "300s Ha × 40", notes: "منخفض جنوباً" },
  { id: "ic4603", name: "سديم Rho Ophiuchi", designation: "IC 4603", targetType: "nebula", constellation: "Ophiuchus", ra: 16.433, dec: -26.067, bestMonths: months(5, 6, 7), bestTime: "9م-1ص", bestTelescope: TELESCOPES.wide, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "180s × 50 LRGB", notes: "منخفض — أفضل من جنوب العراق" },
  { id: "ngc6543", name: "سديم القط", designation: "NGC 6543", targetType: "nebula", constellation: "Dragon", ra: 17.983, dec: 66.633, bestMonths: months(5, 6, 7), bestTime: "10م-4ص", bestTelescope: TELESCOPES.c11, bestCamera: CAM.ds, bestFilter: FILTERS.oiii, exposure: "300-600s OIII × 30" },
  { id: "ngc2392", name: "سديم Eskimo", designation: "NGC 2392", targetType: "nebula", constellation: "Gemini", ra: 7.467, dec: 20.917, bestMonths: months(12, 1, 2), bestTime: "10م-3ص", bestTelescope: TELESCOPES.c11, bestCamera: CAM.ds, bestFilter: FILTERS.oiii, exposure: "300-600s OIII × 30" },
  { id: "ngc891", name: "مجرة NGC 891", designation: "NGC 891", targetType: "galaxy", constellation: "Andromeda", ra: 2.375, dec: 42.349, bestMonths: months(9, 10, 11), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 50 LRGB" },
  { id: "ngc2841", name: "مجرة NGC 2841", designation: "NGC 2841", targetType: "galaxy", constellation: "Ursa Major", ra: 9.267, dec: 50.983, bestMonths: months(2, 3, 4), bestTime: "10م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc4449", name: "مجرة NGC 4449", designation: "NGC 4449", targetType: "galaxy", constellation: "Canes Venatici", ra: 12.367, dec: 44.117, bestMonths: months(3, 4, 5), bestTime: "10م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc4725", name: "مجرة NGC 4725", designation: "NGC 4725", targetType: "galaxy", constellation: "Coma Berenices", ra: 12.633, dec: 25.283, bestMonths: months(3, 4, 5), bestTime: "10م-3ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc5033", name: "مجرة NGC 5033", designation: "NGC 5033", targetType: "galaxy", constellation: "Canes Venatici", ra: 13.283, dec: 36.583, bestMonths: months(3, 4, 5), bestTime: "10م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc5248", name: "مجرة NGC 5248", designation: "NGC 5248", targetType: "galaxy", constellation: "Boötes", ra: 13.683, dec: 8.883, bestMonths: months(4, 5, 6), bestTime: "10م-2ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ngc7331", name: "مجرة NGC 7331", designation: "NGC 7331", targetType: "galaxy", constellation: "Pegasus", ra: 22.617, dec: 34.417, bestMonths: months(8, 9, 10), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 50 LRGB" },
  { id: "ngc7479", name: "مجرة NGC 7479", designation: "NGC 7479", targetType: "galaxy", constellation: "Pegasus", ra: 23.083, dec: 12.317, bestMonths: months(8, 9, 10), bestTime: "8م-3ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 40 LRGB" },
  { id: "ic342", name: "مجرة IC 342", designation: "IC 342", targetType: "galaxy", constellation: "Camelopardalis", ra: 3.883, dec: 68.083, bestMonths: months(10, 11, 12), bestTime: "8م-4ص", bestTelescope: TELESCOPES.sca, bestCamera: CAM.ds, bestFilter: FILTERS.lrgb, exposure: "300-600s × 60 LRGB", notes: "خافت — يحتاج Bortle جيد" },
];

const ngcEntries = NGC_IC.map((t) =>
  entry({
    ...t,
    bestTime: `من ${t.bestTime} (توقيت العراق)`,
  })
);

const SOLAR_SYSTEM = [
  {
    id: "sun",
    name: "الشمس",
    designation: "Sun",
    targetType: "sun",
    constellation: "—",
    bestMonths: months(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
    bestTime: "نهاراً — تجنّب الغبار والرياح",
    bestTelescope: TELESCOPES.phoenix,
    bestCamera: CAM.planetVideo,
    bestFilter: FILTERS.solarHa,
    exposure: "1-5ms × 500-2000 إطار (AutoStakkert!)",
    notes: "Phoenix H-alpha فقط — لا تصوّر الشمس White Light بدون فلتر آمن",
  },
  {
    id: "moon",
    name: "القمر",
    designation: "Moon",
    targetType: "moon",
    constellation: "—",
    bestMonths: months(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
    bestTime: "الأطوار المتوسطة (8-15 يوم قمري) — قبل منتصف الليل",
    bestTelescope: TELESCOPES.c11,
    bestCamera: CAM.planet,
    bestFilter: FILTERS.none,
    exposure: "0.5-3ms × 2000-5000 إطار",
    notes: "C11 + ASI178MM — HDR لل terminator",
  },
  {
    id: "mercury",
    name: "عطارد",
    designation: "Mercury",
    targetType: "planet",
    constellation: "متغير",
    bestMonths: months(2, 3, 4, 9, 10, 11),
    bestTime: "الشفق — 30 دقيقة بعد الغروب/قبل الفجر",
    bestTelescope: TELESCOPES.c11,
    bestCamera: CAM.planetVideo,
    bestFilter: FILTERS.irPass,
    exposure: "5-16ms × 3000-8000 إطار",
    notes: "صعب — يحتاج أفق صافٍ",
  },
  {
    id: "venus",
    name: "الزهرة",
    designation: "Venus",
    targetType: "planet",
    constellation: "متغير",
    bestMonths: months(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
    bestTime: "الشفق — بعد الغروب أو قبل الفجر",
    bestTelescope: TELESCOPES.c11,
    bestCamera: CAM.planetVideo,
    bestFilter: FILTERS.irPass,
    exposure: "5-16ms × 2000-5000 إطار",
    notes: "UV/IR فلتر اختياري للتفاصيل",
  },
  {
    id: "mars",
    name: "المريخ",
    designation: "Mars",
    targetType: "planet",
    constellation: "متغير",
    bestMonths: months(11, 12, 1, 2, 3),
    bestTime: "10م-3ص عند المقابلة",
    bestTelescope: TELESCOPES.c11,
    bestCamera: CAM.planet,
    bestFilter: FILTERS.irPass,
    exposure: "8-33ms × 5000-15000 إطار",
    notes: "مقابلة 2027 — خطط مبكراً",
  },
  {
    id: "jupiter",
    name: "المشتري",
    designation: "Jupiter",
    targetType: "planet",
    constellation: "متغير",
    bestMonths: months(10, 11, 12, 1, 2, 3, 4),
    bestTime: "10م-4ص عند المقابلة",
    bestTelescope: TELESCOPES.c11,
    bestCamera: CAM.planet,
    bestFilter: FILTERS.irPass,
    exposure: "8-33ms × 8000-20000 إطار",
    notes: "Ganymede shadow transits — ASI178MM ممتاز",
  },
  {
    id: "saturn",
    name: "زحل",
    designation: "Saturn",
    targetType: "planet",
    constellation: "متغير",
    bestMonths: months(6, 7, 8, 9, 10, 11),
    bestTime: "10م-3ص",
    bestTelescope: TELESCOPES.c11,
    bestCamera: CAM.planet,
    bestFilter: FILTERS.irPass,
    exposure: "8-33ms × 10000-25000 إطار",
    notes: "C11 يحلّ الحلقات وEncke division",
  },
  {
    id: "uranus",
    name: "أورانوس",
    designation: "Uranus",
    targetType: "planet",
    constellation: "متغير",
    bestMonths: months(9, 10, 11, 12, 1, 2),
    bestTime: "10م-3ص",
    bestTelescope: TELESCOPES.c11,
    bestCamera: CAM.planet,
    bestFilter: FILTERS.none,
    exposure: "100-500ms × 500-1000 إطار",
    notes: "قرص صغير — لون أخضر-أزرق",
  },
  {
    id: "neptune",
    name: "نبتون",
    designation: "Neptune",
    targetType: "planet",
    constellation: "متغير",
    bestMonths: months(8, 9, 10, 11),
    bestTime: "10م-2ص",
    bestTelescope: TELESCOPES.c11,
    bestCamera: CAM.planet,
    bestFilter: FILTERS.none,
    exposure: "200-800ms × 300-800 إطار",
    notes: "أصعب كوكب — Triton مرئي كنجم",
  },
];

const solarEntries = SOLAR_SYSTEM.map((t) => entry({ ...t }));

const catalog = [...messierEntries, ...ngcEntries, ...solarEntries];

function serializeValue(v, indent) {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return `[${v.join(", ")}]`;
  return JSON.stringify(v);
}

function serializeEntry(e, indent = "  ") {
  const lines = [`${indent}{`];
  const keys = ["id", "name", "designation", "targetType", "constellation", "ra", "dec", "bestMonths", "bestTime", "bestTelescope", "bestCamera", "bestFilter", "exposure", "notes"];
  const present = keys.filter((k) => e[k] !== undefined);
  present.forEach((k, i) => {
    const comma = i < present.length - 1 ? "," : "";
    lines.push(`${indent}  ${k}: ${serializeValue(e[k])}${comma}`);
  });
  lines.push(`${indent}}`);
  return lines.join("\n");
}

const header = `/** Astrophotography target recommendations — Iraq ~33°N */

export interface TargetRecommendation {
  id: string;
  name: string;
  designation: string;
  targetType:
    | "galaxy"
    | "nebula"
    | "cluster"
    | "planet"
    | "moon"
    | "sun"
    | "comet"
    | "other";
  constellation: string;
  ra?: number;
  dec?: number;
  bestMonths: number[];
  bestTime: string;
  bestTelescope: string;
  bestCamera: string;
  bestFilter: string;
  exposure: string;
  notes?: string;
}

export const TARGET_CATALOG: TargetRecommendation[] = [
`;

const footer = `
];
`;

const body = catalog.map((e) => serializeEntry(e)).join(",\n");
const content = header + body + footer;

writeFileSync(OUT, content, "utf8");
console.log(`Wrote ${catalog.length} entries to ${OUT}`);
console.log(`  Messier: ${messierEntries.length}`);
console.log(`  NGC/IC: ${ngcEntries.length}`);
console.log(`  Solar system: ${solarEntries.length}`);
