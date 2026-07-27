import { NextRequest, NextResponse } from "next/server";
import {
  createTelescope,
  deleteTelescope,
  getAllTelescopes,
} from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(getAllTelescopes());
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch telescopes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const telescope = createTelescope(body);
    return NextResponse.json(telescope, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create telescope" },
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
    deleteTelescope(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete telescope" },
      { status: 500 }
    );
  }
}
