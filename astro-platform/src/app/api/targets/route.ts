import { NextRequest, NextResponse } from "next/server";
import { createTarget, deleteTarget, getAllTargets } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(getAllTargets());
  } catch {
    return NextResponse.json({ error: "Failed to fetch targets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const target = createTarget(body);
    return NextResponse.json(target, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create target" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    deleteTarget(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete target" }, { status: 500 });
  }
}
