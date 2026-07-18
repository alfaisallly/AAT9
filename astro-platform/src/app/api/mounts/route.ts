import { NextRequest, NextResponse } from "next/server";
import { createMount, deleteMount, getAllMounts } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(getAllMounts());
  } catch {
    return NextResponse.json({ error: "Failed to fetch mounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const mount = createMount(body);
    return NextResponse.json(mount, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create mount" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    deleteMount(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete mount" }, { status: 500 });
  }
}
