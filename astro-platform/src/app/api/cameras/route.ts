import { NextRequest, NextResponse } from "next/server";
import { createCamera, deleteCamera, getAllCameras } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(getAllCameras());
  } catch {
    return NextResponse.json({ error: "Failed to fetch cameras" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const camera = createCamera(body);
    return NextResponse.json(camera, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create camera" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    deleteCamera(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete camera" }, { status: 500 });
  }
}
