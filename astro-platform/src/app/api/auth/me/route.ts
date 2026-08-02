import { NextRequest, NextResponse } from "next/server";
import { APP_OWNER, getUsernameFromCookie, SESSION_COOKIE } from "@/lib/auth";
import { getUserByUsername } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const username = getUsernameFromCookie(token);

  if (!username) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = getUserByUsername(username);

  return NextResponse.json({
    authenticated: true,
    username: user?.username ?? username,
    displayName: user?.display_name ?? APP_OWNER.title,
    role: user?.role ?? "user",
    owner: APP_OWNER.name,
  });
}
