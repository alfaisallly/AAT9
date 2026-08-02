import { NextRequest, NextResponse } from "next/server";
import { createSession, deleteSession, getAllSessions } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(getAllSessions());
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name?.trim() || !body.session_date) {
      return NextResponse.json(
        { error: "Name and date are required" },
        { status: 400 }
      );
    }
    const session = createSession(body);
    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    deleteSession(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
