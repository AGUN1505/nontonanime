import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const target = "https://otakudesu.blog";
  const proxies = [
    { name: "allorigins", url: `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}` },
    { name: "codetabs", url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}` },
    { name: "corsproxy.io", url: `https://corsproxy.io/?${encodeURIComponent(target)}` },
  ];

  const results: any[] = [];

  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 0 },
      });

      const html = await res.text();
      results.push({
        proxy: proxy.name,
        success: res.ok,
        status: res.status,
        preview: html.substring(0, 500),
      });
    } catch (err: any) {
      results.push({
        proxy: proxy.name,
        success: false,
        error: err.message || String(err),
      });
    }
  }

  return NextResponse.json({ results });
}
