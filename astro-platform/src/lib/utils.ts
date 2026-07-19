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
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: "include",
      ...options,
    });
  } catch {
    throw new Error("تعذّر الاتصال بالخادم. تأكد أن الرابط يعمل وحاول مجدداً.");
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    if (isJson) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        typeof err.error === "string" && err.error
          ? err.error
          : `فشل الطلب (${res.status})`
      );
    }

    if (res.status === 503 || res.status === 502) {
      throw new Error("الرابط العام غير متاح حالياً. اطلب رابطاً جديداً أو جرّب لاحقاً.");
    }

    throw new Error(`فشل الطلب (${res.status}). حاول مجدداً.`);
  }

  if (!isJson) {
    throw new Error("استجابة غير متوقعة من الخادم. قد يكون الرابط منتهياً.");
  }

  return res.json();
}
