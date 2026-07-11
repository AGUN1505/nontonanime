import { NextResponse } from "next/server";
import { getAnimeList } from "@/services/otakudesu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getAnimeList();
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch anime list" }, { status: 500 });
  }
}
