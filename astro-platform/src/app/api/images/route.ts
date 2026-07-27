import { NextRequest, NextResponse } from "next/server";
import {
  createImage,
  deleteImage,
  getAllImages,
  toggleImageProcessed,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const filters = {
      session_id: params.get("session_id")
        ? Number(params.get("session_id"))
        : undefined,
      frame_type: params.get("frame_type") || undefined,
      target_id: params.get("target_id")
        ? Number(params.get("target_id"))
        : undefined,
    };
    return NextResponse.json(getAllImages(filters));
  } catch {
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.filename?.trim() || !body.session_id) {
      return NextResponse.json(
        { error: "Filename and session are required" },
        { status: 400 }
      );
    }
    const image = createImage(body);
    return NextResponse.json(image, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create image" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const image = toggleImageProcessed(body.id);
    return NextResponse.json(image);
  } catch {
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    deleteImage(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
