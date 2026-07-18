export const frameTypeLabels: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  flat: "Flat",
  bias: "Bias",
  other: "أخرى",
};

export const frameTypeColors: Record<string, string> = {
  light: "bg-green-500/20 text-green-400",
  dark: "bg-gray-500/20 text-gray-400",
  flat: "bg-blue-500/20 text-blue-400",
  bias: "bg-purple-500/20 text-purple-400",
  other: "bg-yellow-500/20 text-yellow-400",
};

export const targetTypeLabels: Record<string, string> = {
  galaxy: "مجرة",
  nebula: "سديم",
  cluster: "كرة/عنقود",
  planet: "كوكب",
  moon: "قمر",
  sun: "شمس",
  comet: "مذنب",
  other: "أخرى",
};

export const mountTypeLabels: Record<string, string> = {
  equatorial: "استوائي",
  altaz: "ارتفاع-سمت",
  hybrid: "هجين",
};

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}
