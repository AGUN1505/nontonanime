import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: any[] = [];
  const targets = [
    "http://otakudesu.blog/ongoing-anime/",
    "http://otakudesu.news/ongoing/",
  ];

  for (const target of targets) {
    try {
      const res = await fetch(target, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 0 },
      });
      
      const html = await res.text();
      results.push({
        target,
        status: res.status,
        htmlLength: html.length,
        preview: html.substring(0, 300)
      });
    } catch (error: any) {
      results.push({
        target,
        error: error.message || String(error)
      });
    }
  }

  return NextResponse.json({ results });
}
