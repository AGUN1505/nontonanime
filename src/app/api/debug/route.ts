import { NextResponse } from "next/server";
import { OTAKUDESU_BASE } from "@/services/otakudesu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = `${OTAKUDESU_BASE}/ongoing/?_x_tr_sl=auto&_x_tr_tl=id&_x_tr_hl=id`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 0 },
    });
    
    const html = await res.text();
    return NextResponse.json({
      success: res.ok,
      status: res.status,
      htmlLength: html.length,
      preview: html.substring(0, 1500)
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || String(error)
    }, { status: 500 });
  }
}
