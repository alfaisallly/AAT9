export interface GuideSection {
  title: string;
  content: string;
}

export interface GuideChapter {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  sections: GuideSection[];
}

export const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    id: 1,
    slug: "equipment-inventory",
    title: "الفصل الأول — جرد المعدات",
    subtitle: "قائمة كاملة بالحوامل والتلسكopes والكاميرات والفلاتر",
    sections: [
      {
        title: "الحوامل",
        content: `**Sky-Watcher EQ6-R Pro** — حامل استوائي GoTo، حمولة 20kg، ممتاز للتصوير العميق مع SCA260 وC11.\n\n**Sky-Watcher EQ350 Pro** — حامل حديث عالي الدقة، حمولة 25kg، مثالي لجميع تركيباتك.`,
      },
      {
        title: "التلسكopes",
        content: `**Askar V** — نظام معياري: V60 (240mm f/4) وV80 (320mm f/4) مع Reducer/Flattener/Extender.\n\n**SharpStar SCA260** — 260mm f/6.4 (1664mm) — مرآة تصحيحية للتصوير العميق عالي الدقة.\n\n**Celestron C11** — 279mm f/10 (2800mm) — كواكب وDeep Sky ضيق.\n\n**William Optics MiniCat 51** — 51mm f/4.9 (250mm) — Widefield محمول.\n\n**Acuter Phoenix H-alpha 40mm** — تلسكوب شمسي H-alpha.`,
      },
      {
        title: "الكاميرات",
        content: `**ASI2600MM Pro** — APS-C Mono، 3.76µm، 9576×6388، تبريد — Deep Sky رئيسية.\n\n**ASI178MM** — 2.4µm، 3096×2080 — قمر/شمس/كواكب Lucky Imaging.\n\n**ASI678MM** — 2.0µm، 3840×2160 — كواكب فيديو عالي السرعة.`,
      },
      {
        title: "التوجيه والفلاتر",
        content: `**ASI120MM Mini** + **ZWO Mini Guide Scope 30mm** (120mm f/4).\n\n**ZWO 7× Filter Wheel** — LRGB + Ha + OIII + SII + Antlia.\n\n**البرامج:** ASIAIR (التقاط)، PixInsight (معالجة)، AutoStakkert! (تكديس)، AstroSurface (معالجة سريعة).`,
      },
    ],
  },
  {
    id: 2,
    slug: "best-setup",
    title: "الفصل الثاني — أفضل تركيبة لكل هدف",
    subtitle: "اختيار Mount + Telescope + Camera + Filter",
    sections: [
      {
        title: "سدم واسعة (M42, NGC 7000)",
        content: `**Mount:** EQ350 Pro | **Scope:** Askar V80 + Reducer (256mm) أو MiniCat 51 | **Camera:** ASI2600MM | **Filter:** Ha/OIII/SII أو L-Pro`,
      },
      {
        title: "مجرة (M31, M51, M101)",
        content: `**Mount:** EQ6-R أو EQ350 | **Scope:** SCA260 أو Askar V80 Extender | **Camera:** ASI2600MM | **Filter:** LRGB Antlia Pro`,
      },
      {
        title: "كواكب (Jupiter, Saturn)",
        content: `**Mount:** EQ350 Pro | **Scope:** C11 + Barlow 2× | **Camera:** ASI678MM | **Filter:** IR/UV Cut | **Software:** AutoStakkert!`,
      },
      {
        title: "قمر",
        content: `**Mount:** EQ6-R | **Scope:** C11 أو Askar V80 | **Camera:** ASI178MM | **Filter:** None | **Exposure:** 0.5-5ms`,
      },
      {
        title: "شمس H-alpha",
        content: `**Mount:** EQ6-R (Alt tracking) | **Scope:** Phoenix 40mm H-alpha | **Camera:** ASI678MM | **Filter:** Built-in Etalon | **Software:** AutoStakkert!`,
      },
    ],
  },
  {
    id: 3,
    slug: "asiair-settings",
    title: "الفصل الثالث — إعدادات ASIAIR",
    subtitle: "ملف إعداد لكل تلسكوب",
    sections: [
      {
        title: "Askar V (Wide)",
        content: `Meridian Flip: Stop & Flip | Dither: 15px كل 3 إطارات | Guide: 2s Gain 100 | Cooling: -10°C | Focuser: Auto ±5000`,
      },
      {
        title: "SCA260",
        content: `Meridian Flip: Stop & Flip | Dither: 8px كل 2 إطار | Guide: 3s Gain 100 | Cooling: -10°C | Focuser: Auto ±10000 | Calibration: 5000 steps`,
      },
      {
        title: "C11",
        content: `Planetary: Guide Off, Gain 250, 8ms | Deep Sky: Guide 4s Gain 120, Dither 5px, Cooling -10°C`,
      },
      {
        title: "MiniCat 51",
        content: `Plate Solve: ON | Dither: 18px | Guide: 2s | Cooling: -10°C | Band: L-Pro للضوء المدين`,
      },
      {
        title: "Phoenix H-alpha",
        content: `Tracking: Solar | Guide: Off | Exposure: 1-10ms | Gain: 60-80 | لا Dither`,
      },
    ],
  },
  {
    id: 4,
    slug: "guiding-settings",
    title: "الفصل الرابع — إعدادات Guiding",
    subtitle: "لكل بعد بؤري مع ASI120MM Mini",
    sections: [
      {
        title: "192-360mm (Askar V Wide)",
        content: `Exposure: 2s | Gain: 100 | Calibration: 3000-3500 steps | RA Agg: 0.55-0.6 | DEC Agg: 0.65-0.7 | Min motion: 0.5px`,
      },
      {
        title: "480-600mm (Askar V Extender)",
        content: `Exposure: 2-3s | Gain: 100 | Calibration: 4000 steps | RA Agg: 0.5 | DEC Agg: 0.6`,
      },
      {
        title: "1664mm (SCA260)",
        content: `Exposure: 3s | Gain: 100 | Calibration: 5000 steps | RA Agg: 0.45 | DEC Agg: 0.55 | Star mass: >0.5`,
      },
      {
        title: "2800mm (C11)",
        content: `Exposure: 3-4s | Gain: 120 | Calibration: 6000 steps | RA Agg: 0.4 | DEC Agg: 0.5 | استخدم نجم ساطع`,
      },
    ],
  },
  {
    id: 5,
    slug: "zwo-camera-settings",
    title: "الفصل الخامس — إعدادات كاميرات ZWO",
    subtitle: "Gain, Offset, Temperature, Exposure",
    sections: [
      {
        title: "ASI2600MM Pro — Deep Sky",
        content: `Unity Gain: 100 | Offset: 50 | Temp: -10°C | LRGB: 180-300s | Narrowband: 300-900s | Dark: نفس التعريض | Flat: 1-3s`,
      },
      {
        title: "ASI2600MM Pro — Narrowband",
        content: `Gain: 120 | Offset: 30 | Temp: -10°C | Ha/OIII/SII: 600s × 20-40 إطار | Dither كل 2-3`,
      },
      {
        title: "ASI178MM — قمر/شمس",
        content: `Lunar: Gain 100, 0.5-5ms, 1000-3000 frame | Solar: Gain 60, 1-10ms | ROI: Full`,
      },
      {
        title: "ASI678MM — كواكب",
        content: `Jupiter/Saturn: Gain 250, 8-16ms, 10-15 sec video | Barlow 2× مع C11 | AutoStakkert! 30-50% best frames`,
      },
    ],
  },
  {
    id: 6,
    slug: "fov-calculations",
    title: "الفصل السادس — Pixel Scale و FOV",
    subtitle: "جميع القيم لكل تلسكوب × كاميرا",
    sections: [
      {
        title: "المعادلات",
        content: `**Pixel Scale** = (حجم البكسل µm / البعد البؤري mm) × 206.265 = ″/px\n\n**FOV (′)** = (عدد البكسل × Pixel Scale) / 60\n\n**Image Scale** = Pixel Scale (نفس الوحدة)`,
      },
      {
        title: "جدول تفاعلي",
        content: `استخدم صفحة **حاسبة FOV** في التطبيق لعرض جميع 30 تركيبة (10 تلسكopes × 3 كameras) مع القيم الدقيقة.`,
      },
    ],
  },
  {
    id: 7,
    slug: "solar-guide",
    title: "الفصل السابع — تصوير الشمس",
    subtitle: "Phoenix H-alpha + ASI678MM",
    sections: [
      {
        title: "السلامة",
        content: `لا تنظر أبداً للشمس بدون فلتر H-alpha معتمد. Phoenix 40mm مخصص لهذا. تحقق من Etalon قبل كل جلسة.`,
      },
      {
        title: "الإعداد",
        content: `Camera: ASI678MM | Gain: 60-80 | Exposure: 1-10ms | FPS: 30-60 | Software: AutoStakkert! + IMPPG/AstroSurface`,
      },
      {
        title: "الأهداف",
        content: `B prominences, filaments, sunspots, active regions. صوّر عندما AR > C-class activity.`,
      },
    ],
  },
  {
    id: 8,
    slug: "lunar-guide",
    title: "الفصل الثامن — تصوير القمر",
    subtitle: "ASI178MM / ASI678MM",
    sections: [
      {
        title: "Full Moon Mosaic",
        content: `MiniCat 51 + ASI2600MM أو ASI178MM | Overlap 30% | ASIAIR Mosaic أو manual pan | L channel only`,
      },
      {
        title: "High Resolution",
        content: `C11 + ASI178MM | Gain 100 | 0.5-3ms | 2000+ frames | AutoStakkert! | Wavelet in AstroSurface`,
      },
      {
        title: "Terminator Detail",
        content: `صوّر عند First/Last Quarter — ظلال أفضل على Craters. ISO/Gain منخفض.`,
      },
    ],
  },
  {
    id: 9,
    slug: "planetary-guide",
    title: "الفصل التاسع — تصوير الكواكب",
    subtitle: "C11 + ASI678MM + AutoStakkert!",
    sections: [
      {
        title: "Jupiter",
        content: `C11 + Barlow 2× | ASI678MM | Gain 250 | 8ms | 120 sec video | 30% stack | RGB optional`,
      },
      {
        title: "Saturn",
        content: `C11 + Barlow 2× | Gain 250 | 12ms | 180 sec | تركيز Cassini division | IR pass يرفع التباين`,
      },
      {
        title: "Mars",
        content: `عند المقابلة فقط | C11 + Barlow 3× | Gain 300 | 5ms | 60 sec bursts | Lucky imaging`,
      },
    ],
  },
  {
    id: 10,
    slug: "nebula-guide",
    title: "الفصل العاشر — تصوير السدم",
    subtitle: "Ha/OIII/SII + ASI2600MM",
    sections: [
      {
        title: "SHO (Hubble Palette)",
        content: `Ha: 600s×30 | OIII: 600s×20 | SII: 600s×20 | Gain 120 | -10°C | SCA260 أو Askar V80`,
      },
      {
        title: "Osc Widefield",
        content: `MiniCat + L-Pro | 300s×40 | Gain 100 | M42, NGC 7000, California Nebula`,
      },
      {
        title: "PixInsight Workflow",
        content: `WBPP → DynamicBackgroundExtraction → ChannelCombination (SHO) → SCNR → HistogramTransformation → CurvesTransformation → MorphologicalTransformation (stars)`,
      },
    ],
  },
  {
    id: 11,
    slug: "galaxy-guide",
    title: "الفصل الحادي عشر — تصوير المجرات",
    subtitle: "LRGB + SCA260",
    sections: [
      {
        title: "LRGB Workflow",
        content: `L: 300s×40 Gain 100 | RGB: 120s×15 each | Antlia Pro | SCA260 | EQ350 Pro`,
      },
      {
        title: "Virgo/Leo Cluster",
        content: `M86/84/87 — SCA260 | Plate solve | 300s L | مركز المجرة في ربع الإطار`,
      },
      {
        title: "M31 Wide",
        content: `Askar V80 Reducer + ASI2600MM | L-Pro | 180s×60 | Mosaic if needed`,
      },
    ],
  },
  {
    id: 12,
    slug: "pixinsight",
    title: "الفصل الثاني عشر — المعالجة في PixInsight",
    subtitle: "Workflow كامل Deep Sky",
    sections: [
      {
        title: "Calibration",
        content: `WBPP: Bias/Dark/Flat → Calibrated Lights → Integration (Sigma Clipping 2.5-3.5)`,
      },
      {
        title: "Linear Processing",
        content: `DBE/ABE → Deconvolution (PSF) → NoiseReduction (Multiscale) → ChannelCombination`,
      },
      {
        title: "Non-Linear",
        content: `HistogramTransformation → CurvesTransformation → ColorCalibration (PhotometricCC) → SCNR → MorphologicalTransformation → DarkStructureEnhance → Export TIFF 16-bit`,
      },
    ],
  },
  {
    id: 13,
    slug: "target-catalog",
    title: "الفصل الثالث عشر — 150+ هدف سماوي",
    subtitle: "أفضل شهر، وقت، تلسكوب، كاميرا، فلتر، تعريض",
    sections: [
      {
        title: "كيفية الاستخدام",
        content: `انتقل لصفحة **الأهداف السماوية** في التطبيق — 176 هدفاً مع توصيات كاملة. فلتر حسب الشهر أو النوع.`,
      },
      {
        title: "أمثلة",
        content: `M42: يناير-فبراير | Askar V80 | ASI2600MM | Ha+OIII | 300s×30\nM31: أكتوبر-نوفمبر | MiniCat/Askar V | ASI2600MM | L-Pro | 180s×60\nM51: مارس-مايو | SCA260 | ASI2600MM | LRGB | L 300s×40`,
      },
    ],
  },
  {
    id: 14,
    slug: "troubleshooting",
    title: "الفصل الرابع عشر — حل مشاكل ASIAIR وGuiding",
    subtitle: "دليل استكشاف الأخطاء",
    sections: [
      {
        title: "Guiding Failed",
        content: `1. تحقق من Mini Guide Scope alignment\n2. زد Calibration steps\n3. قلل Aggressiveness\n4. اختر نجم أ سطع\n5. تحقق من cable USB`,
      },
      {
        title: "Star Lost / Dither Failed",
        content: `قلل Dither pixels | زد Guide exposure | تحقق من flexure | أعد Calibration بعد Meridian Flip`,
      },
      {
        title: "ASIAIR Plate Solve Failed",
        content: `حدّث index files | Field of View صحيح | Focus أولاً | Exposure 2-3s للـ solve`,
      },
      {
        title: "Meridian Flip Issues",
        content: `Stop & Flip mode | أعد Guiding بعد Flip | تحقق from DEC balance | Focuser position save`,
      },
      {
        title: "Haze / Dew",
        content: `Dew heater on | Pause session | تحقق humidity in ASIAIR | لا Flat بعد الندى`,
      },
    ],
  },
  {
    id: 15,
    slug: "checklists",
    title: "الفصل الخامس عشر — قوائم الفحص",
    subtitle: "قبل وبعد جلسة التصوير",
    sections: [
      {
        title: "قبل الجلسة",
        content: `☐ Polar align (<2′ error)\n☐ Balance RA/DEC\n☐ Cable management\n☐ Filter wheel loaded\n☐ Camera cooling target\n☐ Guide scope focused\n☐ Plate solve test\n☐ Flat panel ready\n☐ Battery/power check\n☐ ASIAIR WiFi`,
      },
      {
        title: "بعد الجلسة",
        content: `☐ Dark frames (same temp/exposure)\n☐ Flat frames\n☐ Backup to SSD\n☐ Cover telescope\n☐ Dew heaters off\n☐ Log session in AstroLab\n☐ Park mount\n☐ Charge ASIAIR`,
      },
    ],
  },
];

export function getChapterBySlug(slug: string): GuideChapter | undefined {
  return GUIDE_CHAPTERS.find((c) => c.slug === slug);
}

export function getChapterById(id: number): GuideChapter | undefined {
  return GUIDE_CHAPTERS.find((c) => c.id === id);
}
