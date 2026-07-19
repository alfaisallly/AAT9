/** Seasonal sky visibility from Iraq (~33°N) */

export interface MonthlySkyEntry {
  month: number;
  monthName: string;
  season: string;
  highlights: string[];
  bestTargets: string[];
  constellations: string[];
  imagingNotes: string;
  moonPhaseTip: string;
}

export const SEASONAL_SKY_IRAQ: MonthlySkyEntry[] = [
  {
    month: 1,
    monthName: "يناير",
    season: "شتاء",
    highlights: ["M42 Orion", "M45 Pleiades", "M31 Andromeda"],
    bestTargets: ["M42", "M45", "M81/82", "M78", "Horsehead", "Flame Nebula"],
    constellations: ["Orion", "Taurus", "Gemini", "Canis Major", "Auriga"],
    imagingNotes:
      "أفضل شهر للشتاء — Orion في الذروة. رطوبة منخفضة في الصحراء. استخدم Askar V80 أو SCA260.",
    moonPhaseTip: "صوّر Deep Sky عند البدر الجديد (9-16 يناير 2026)",
  },
  {
    month: 2,
    monthName: "فبراير",
    season: "شتاء",
    highlights: ["M42", "Rosette Nebula", "M81 Group"],
    bestTargets: ["M42", "NGC 2244", "M81", "M82", "M35", "M36/37/38"],
    constellations: ["Orion", "Monoceros", "Ursa Major", "Gemini"],
    imagingNotes: "Orion ما زال مرتفعاً. Rosette وMonoceros ممتازان بـ ASI2600MM + Ha.",
    moonPhaseTip: "البدر: 8-14 فبراير — خطط للأهداف الشرقية بعد منتصف الليل",
  },
  {
    month: 3,
    monthName: "مارس",
    season: "ربيع",
    highlights: ["Galaxies in Leo", "M51 Whirlpool", "M101"],
    bestTargets: ["M51", "M63", "M106", "M65/66", "M104 Sombrero"],
    constellations: ["Leo", "Ursa Major", "Canes Venatici", "Coma Berenices"],
    imagingNotes: "موسم المجرات يبدأ. SCA260 مثالي. LRGB أو Antlia Pro.",
    moonPhaseTip: "البدر: 9-15 مارس",
  },
  {
    month: 4,
    monthName: "أبريل",
    season: "ربيع",
    highlights: ["Virgo Cluster", "M3", "M13"],
    bestTargets: ["M87", "M86/84", "M104", "M3", "M13", "M5"],
    constellations: ["Virgo", "Boötes", "Hercules", "Leo"],
    imagingNotes: "Virgo Cluster — SCA260 أو C11. رؤية ليلية أقصر.",
    moonPhaseTip: "البدر: 8-14 أبريل",
  },
  {
    month: 5,
    monthName: "مايو",
    season: "ربيع",
    highlights: ["M13 Hercules", "M57 Ring", "M51"],
    bestTargets: ["M13", "M57", "M51", "M27 Dumbbell", "M5"],
    constellations: ["Hercules", "Lyra", "Boötes", "Serpens"],
    imagingNotes: "M13 وM57 في الذروة. C11 ممتاز لـ M57.",
    moonPhaseTip: "البدر: 7-13 مايو",
  },
  {
    month: 6,
    monthName: "يونيو",
    season: "صيف",
    highlights: ["M57", "M27", "Rho Ophiuchi (منخفض)"],
    bestTargets: ["M57", "M27", "M13", "M11 Wild Duck", "M16 (منخفض)"],
    constellations: ["Lyra", "Hercules", "Scutum", "Ophiuchus"],
    imagingNotes: "بداية موسم Milky Way — رطوبة أعلى. enfriamiento -10°C ضروري.",
    moonPhaseTip: "البدر: 6-12 يونيو — أيام قصيرة",
  },
  {
    month: 7,
    monthName: "يوليو",
    season: "صيف",
    highlights: ["M16 Eagle", "M17 Swan", "M20 Trifid"],
    bestTargets: ["M16", "M17", "M20", "M8 Lagoon", "M27"],
    constellations: ["Sagittarius", "Scutum", "Serpens", "Lyra"],
    imagingNotes: "قلب المجرة مرئي منخفضاً — Askar V80 أو MiniCat للسدم الواسعة.",
    moonPhaseTip: "البدر: 5-11 يوليو",
  },
  {
    month: 8,
    monthName: "أغسطس",
    season: "صيف",
    highlights: ["M8 Lagoon", "M20 Trifid", "North America Nebula"],
    bestTargets: ["M8", "M20", "NGC 7000", "IC 1396", "M16"],
    constellations: ["Sagittarius", "Cygnus", "Scutum", "Cepheus"],
    imagingNotes: "أفضل شهر للسدم الصيفية. NB: Ha/OIII/SII مع ASI2600MM.",
    moonPhaseTip: "البدر: 4-10 أغسطس",
  },
  {
    month: 9,
    monthName: "سبتمبر",
    season: "خريف",
    highlights: ["NGC 7000", "IC 1396", "M31 Andromeda"],
    bestTargets: ["NGC 7000", "IC 1396", "M31", "M33", "Veil Nebula"],
    constellations: ["Cygnus", "Cepheus", "Andromeda", "Pegasus"],
    imagingNotes: "Cygnus في الذروة. M31 يعود — Askar V80 + L-Pro.",
    moonPhaseTip: "البدر: 2-8 سبتمبر",
  },
  {
    month: 10,
    monthName: "أكتوبر",
    season: "خريف",
    highlights: ["M31", "M33", "Veil Nebula"],
    bestTargets: ["M31", "M33", "NGC 6888", "IC 1805", "NGC 7822"],
    constellations: ["Andromeda", "Triangulum", "Cygnus", "Cassiopeia"],
    imagingNotes: "موسم M31 — MiniCat 51 أو Askar V80. رطوبة معتدلة.",
    moonPhaseTip: "البدر: 1-7 و 31 أكتوبر",
  },
  {
    month: 11,
    monthName: "نوفمبر",
    season: "خريف",
    highlights: ["M31", "Pleiades M45", "California Nebula"],
    bestTargets: ["M31", "M45", "NGC 1499", "M33", "M76"],
    constellations: ["Andromeda", "Taurus", "Perseus", "Auriga"],
    imagingNotes: "M45 يعود. California Nebula بـ Ha — SCA260 أو Askar V80.",
    moonPhaseTip: "البدر: 30 نوفمبر - 6 ديسمبر",
  },
  {
    month: 12,
    monthName: "ديسمبر",
    season: "شتاء",
    highlights: ["M45 Pleiades", "M1 Crab", "M78"],
    bestTargets: ["M45", "M1", "M78", "M42 (يظهر متأخراً)", "NGC 2264"],
    constellations: ["Taurus", "Orion", "Auriga", "Perseus"],
    imagingNotes: "Orion يعود في نهاية الشهر. M45 widefield بـ MiniCat.",
    moonPhaseTip: "البدر: 29 ديسمبر - 4 يناير",
  },
];

export const PLANETARY_SEASONS_IRAQ = [
  { object: "Mercury", visibleMonths: [1, 2, 3, 9, 10, 11], notes: "قريب من الأفق — ASI678MM" },
  { object: "Venus", visibleMonths: [1, 2, 3, 4, 5, 10, 11, 12], notes: "مساء أو فجر — ASI678MM" },
  { object: "Mars", visibleMonths: [6, 7, 8, 9, 10, 11, 12], notes: "C11 + ASI678MM Barlow 2×" },
  { object: "Jupiter", visibleMonths: [1, 2, 3, 4, 11, 12], notes: "C11 + ASI678MM — أفضل للكواكب" },
  { object: "Saturn", visibleMonths: [5, 6, 7, 8, 9, 10], notes: "C11 + ASI678MM — حلقات واضحة" },
  { object: "Sun H-alpha", visibleMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], notes: "Phoenix 40mm + ASI678MM — نهار فقط" },
  { object: "Moon", visibleMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], notes: "ASI178MM أو ASI678MM — AutoStakkert!" },
];
