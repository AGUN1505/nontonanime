import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const target = "https://otakudesu.blog/ongoing-anime/";
  
  // High quality dynamic proxies
  const proxyList = [
    "https://cors.sh/", 
    "https://api.allorigins.win/raw?url=",
    "https://cors-anywhere.herokuapp.com/",
  ];

  const results: any[] = [];

  // Try direct fetch with custom/rotated User-Agent headers
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
  ];

  for (let i = 0; i < userAgents.length; i++) {
    try {
      const res = await fetch(target, {
        headers: {
          "User-Agent": userAgents[i],
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "Referer": "https://www.google.com/",
        },
        next: { revalidate: 0 },
      });
      const html = await res.text();
      results.push({
        method: `direct-ua-${i}`,
        success: res.ok,
        status: res.status,
        preview: html.substring(0, 300),
      });
    } catch (err: any) {
      results.push({ method: `direct-ua-${i}`, success: false, error: err.message });
    }
  }

  // Try AllOrigins raw
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`, {
      headers: { "User-Agent": userAgents[0] }
    });
    const html = await res.text();
    results.push({
      method: "allorigins",
      success: res.ok,
      status: res.status,
      preview: html.substring(0, 300),
    });
  } catch (err: any) {
    results.push({ method: "allorigins", success: false, error: err.message });
  }

  return NextResponse.json({ results });
}
