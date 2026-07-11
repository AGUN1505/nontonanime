import { NextResponse } from "next/server";
import { OTAKUDESU_BASE } from "@/services/otakudesu";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, any> = {
    target: OTAKUDESU_BASE,
    success: false,
    status: 0,
    headers: {},
    error: null,
    preview: "",
  };

  try {
    const res = await fetch(OTAKUDESU_BASE, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": OTAKUDESU_BASE,
      },
      next: { revalidate: 0 },
    });

    result.status = res.status;
    result.success = res.ok;
    
    const headersObj: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      headersObj[key] = val;
    });
    result.headers = headersObj;

    const html = await res.text();
    result.preview = html.substring(0, 1000);
  } catch (err: any) {
    result.error = err.message || String(err);
  }

  return NextResponse.json(result);
}
