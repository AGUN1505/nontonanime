import * as cheerio from "cheerio";

export interface OtakuEpisode {
  title: string;
  url: string;
  number: number;
}

export interface OtakuAnimeDetail {
  slug: string;
  title: string;
  synopsis: string;
  image: string;
  episodes: OtakuEpisode[];
}

export interface OtakuResolution {
  quality: string; // e.g. "360p", "480p", "720p"
  mirror: string;  // e.g. "updesu", "odstream", "mega"
  content: string; // Base64 data-content payload
}

const OTAKUDESU_BASE = "https://otakudesu.blog";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": OTAKUDESU_BASE,
};

export async function searchAndGetAnimeEpisodes(title: string): Promise<OtakuAnimeDetail | null> {
  try {
    const cleanQuery = title.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const searchUrl = `${OTAKUDESU_BASE}/?s=${encodeURIComponent(cleanQuery)}&post_type=anime`;
    
    const searchRes = await fetch(searchUrl, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!searchRes.ok) return null;

    const searchHtml = await searchRes.text();
    const $search = cheerio.load(searchHtml);

    let animeUrl = "";
    const candidates: { title: string; url: string }[] = [];
    $search("a").each((_, a) => {
      const href = $search(a).attr("href");
      const text = $search(a).text().trim();
      if (href && href.includes("/anime/") && !href.includes("/genres/") && !href.includes("/anime-list/") && text) {
        if (!candidates.some(c => c.url === href)) {
          candidates.push({ title: text, url: href });
        }
      }
    });

    const isSeason2Requested = title.toLowerCase().includes("season 2") || title.toLowerCase().includes("s2");

    if (candidates.length > 0) {
      let bestMatch = candidates[0];
      const filtered = candidates.filter(c => {
        const hasSeason2Text = c.title.toLowerCase().includes("season 2") || c.title.toLowerCase().includes(" s2");
        return isSeason2Requested ? hasSeason2Text : !hasSeason2Text;
      });
      if (filtered.length > 0) {
        bestMatch = filtered[0];
      }
      animeUrl = bestMatch.url;
    }

    if (!animeUrl) return null;

    const detailRes = await fetch(animeUrl, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!detailRes.ok) return null;

    const detailHtml = await detailRes.text();
    const $detail = cheerio.load(detailHtml);

    const animeTitle = $detail(".infoanime span:contains('Judul'), .infoanime h1, .judul").first().text().replace("Judul:", "").trim() || title;
    const synopsis = $detail(".sinopsis p, .entry-content p").text().trim();
    const image = $detail(".fotoanime img").attr("src") || "";
    const slug = animeUrl.split("/").filter(Boolean).pop() || "";

    const episodes: OtakuEpisode[] = [];
    $detail(".episodelist ul li, .listeps ul li").each((_, li) => {
      const a = $detail(li).find("a");
      const epUrl = a.attr("href");
      const epTitle = a.text().trim();

      if (epUrl && !epUrl.includes("/batch/") && !epUrl.includes("/lengkap/") && !epTitle.toLowerCase().includes("batch") && !epTitle.toLowerCase().includes("lengkap")) {
        const numMatch = epTitle.match(/(?:Episode|Ep|Eps)\s*(\d+)/i);
        const number = numMatch ? parseInt(numMatch[1]) : 1;
        episodes.push({
          title: epTitle,
          url: epUrl,
          number: number,
        });
      }
    });

    episodes.sort((a, b) => a.number - b.number);

    const titleText = $detail(".infoanime span:contains('Judul'), .infoanime h1, .judul").first().text().replace("Judul:", "").trim() || title;

    return {
      slug,
      title: titleText,
      synopsis,
      image,
      episodes,
    };
  } catch (error) {
    console.error("Error scraping Otakudesu episodes directly:", error);
    return null;
  }
}

// Scrape resolution options from the episode page
export async function getEpisodeResolutions(episodeUrl: string): Promise<OtakuResolution[]> {
  try {
    const res = await fetch(episodeUrl, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);

    const resolutions: OtakuResolution[] = [];

    // Mirror Stream lists
    $(".mirrorstream ul").each((_, ul) => {
      const classAttr = $(ul).attr("class") || ""; // e.g. "m360p", "m480p", "m720p"
      const quality = classAttr.replace("m", "");

      $(ul).find("li a").each((_, a) => {
        const mirror = $(a).text().trim();
        const content = $(a).attr("data-content") || "";
        if (content) {
          resolutions.push({ quality, mirror, content });
        }
      });
    });

    return resolutions;
  } catch (error) {
    console.error("Error scraping resolutions:", error);
    return [];
  }
}

// Retrieve embed iframe using selected resolution base64 content
export async function getEmbedFromContent(episodeUrl: string, content: string): Promise<string | null> {
  try {
    const payload = JSON.parse(Buffer.from(content, "base64").toString("utf-8"));

    // 1. Get Nonce Session
    const nonceParams = new URLSearchParams();
    nonceParams.append("action", "aa1208d27f29ca340c92c66d1926f13f");

    const nonceRes = await fetch(`${OTAKUDESU_BASE}/wp-admin/admin-ajax.php`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": HEADERS["User-Agent"],
        "Referer": episodeUrl
      },
      body: nonceParams.toString(),
    });

    if (!nonceRes.ok) return null;
    const nonceData = await nonceRes.json();
    const sessionNonce = nonceData.data;

    // 2. Fetch Embed HTML
    const embedParams = new URLSearchParams();
    embedParams.append("id", payload.id.toString());
    embedParams.append("i", payload.i.toString());
    embedParams.append("q", payload.q);
    embedParams.append("nonce", sessionNonce);
    embedParams.append("action", "2a3505c93b0035d3f455df82bf976b84");

    const embedRes = await fetch(`${OTAKUDESU_BASE}/wp-admin/admin-ajax.php`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": HEADERS["User-Agent"],
        "Referer": episodeUrl
      },
      body: embedParams.toString(),
    });

    if (!embedRes.ok) return null;
    const embedData = await embedRes.json();
    const embedHtml = Buffer.from(embedData.data, "base64").toString("utf-8");

    const embed$ = cheerio.load(embedHtml);
    const iframeSrc = embed$("iframe").attr("src");

    return iframeSrc || null;
  } catch (error) {
    console.error("Error retrieving stream from content payload:", error);
    return null;
  }
}
