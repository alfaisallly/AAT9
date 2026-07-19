import { NextRequest, NextResponse } from "next/server";
import { TARGET_CATALOG } from "@/data/targets-catalog";

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const month = params.get("month");
  const type = params.get("type");
  const q = params.get("q")?.toLowerCase();

  let results = TARGET_CATALOG;

  if (month) {
    const m = Number(month);
    results = results.filter((t) => t.bestMonths.includes(m));
  }
  if (type) {
    results = results.filter((t) => t.targetType === type);
  }
  if (q) {
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.designation.toLowerCase().includes(q) ||
        t.constellation.includes(q)
    );
  }

  return NextResponse.json({
    total: results.length,
    targets: results,
  });
}
