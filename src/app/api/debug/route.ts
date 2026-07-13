import { NextResponse } from "next/server";
import { getOngoingAnime } from "@/services/otakudesu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getOngoingAnime(1);
    return NextResponse.json({
      success: list.length > 0,
      count: list.length,
      sample: list.slice(0, 3)
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || String(error)
    }, { status: 500 });
  }
}
