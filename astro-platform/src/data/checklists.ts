export interface ChecklistItem {
  id: string;
  text: string;
  category: string;
}

export const PRE_SESSION_CHECKLIST: ChecklistItem[] = [
  { id: "p1", text: "Polar Align — خطأ أقل من 2′", category: "Mount" },
  { id: "p2", text: "Balance RA/DEC — حركة سلسة", category: "Mount" },
  { id: "p3", text: "فحص الكابلات USB/Power", category: "Mount" },
  { id: "p4", text: "Filter Wheel — الفلاتر الصحيحة", category: "Camera" },
  { id: "p5", text: "Camera Cooling — -10°C (Deep Sky)", category: "Camera" },
  { id: "p6", text: "Guide Scope Alignment", category: "Guiding" },
  { id: "p7", text: "ASI120MM Focus على نجم", category: "Guiding" },
  { id: "p8", text: "Plate Solve Test", category: "ASIAIR" },
  { id: "p9", text: "Auto Focus على نجم ساطع", category: "ASIAIR" },
  { id: "p10", text: "Flat Panel جاهز", category: "Calibration" },
  { id: "p11", text: "Dew Heaters ON", category: "Environment" },
  { id: "p12", text: "ASIAIR WiFi + Battery", category: "ASIAIR" },
  { id: "p13", text: "Meridian Flip Plan", category: "ASIAIR" },
  { id: "p14", text: "Sequence loaded في ASIAIR", category: "ASIAIR" },
  { id: "p15", text: "Backup SSD متصل", category: "Storage" },
];

export const POST_SESSION_CHECKLIST: ChecklistItem[] = [
  { id: "a1", text: "Dark Frames — نفس Temp/Gain/Exposure", category: "Calibration" },
  { id: "a2", text: "Flat Frames — لكل فلتر", category: "Calibration" },
  { id: "a3", text: "Bias Frames (optional)", category: "Calibration" },
  { id: "a4", text: "Backup FITS إلى SSD", category: "Storage" },
  { id: "a5", text: "تسجيل الجلسة في AstroLab", category: "Log" },
  { id: "a6", text: "Park Mount", category: "Mount" },
  { id: "a7", text: "Cover Telescope", category: "Equipment" },
  { id: "a8", text: "Dew Heaters OFF", category: "Environment" },
  { id: "a9", text: "Charge ASIAIR", category: "ASIAIR" },
  { id: "a10", text: "Review RMS Guiding Log", category: "Guiding" },
];
