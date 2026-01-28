import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true });
}
fetch("/api/test", { method: "POST" });
