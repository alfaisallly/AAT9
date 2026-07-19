import { NextRequest, NextResponse } from "next/server";
import { APP_OWNER, getUsernameFromCookie, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const username = getUsernameFromCookie(token);

  if (!username) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    username,
    owner: APP_OWNER.name,
    displayName: APP_OWNER.title,
  });
}
