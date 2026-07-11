import * as cheerio from "cheerio";

export const OTAKUDESU_BASE = "https://otakudesu.blog";

const PROXY_URL = "https://api.allorigins.win/raw?url=";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": OTAKUDESU_BASE,
};

async function fetchWithProxy(url: string, init?: RequestInit): Promise<Response> {
  const proxiedUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
  const headers = { ...HEADERS, ...(init?.headers || {}) };
  return fetch(proxiedUrl, { ...init, headers });
}

export interface OtakuAnimeCard {
  title: string;
  image: string;
  slug: string;
  url: string;
  status: string;
  episodes: string;
  rating: string;
}

export interface OtakuEpisode {
  title: string;
  url: string;
  number: string; // Change to string to support "ONA 1", "OVA 2", "1"
  type: "regular" | "ona" | "ova" | "special";
}

export interface OtakuAnimeDetail {
  slug: string;
  title: string;
  synopsis: string;
  image: string;
  episodes: OtakuEpisode[];
  genres: string[];
  status: string;
  type: string;
  score: string;
  japanese?: string;
  producer?: string;
  duration?: string;
  studio?: string;
}

export interface OtakuResolution {
  quality: string; // e.g. "360p", "480p", "720p"
  mirror: string;  // e.g. "updesu", "odstream", "mega"
  content: string; // Base64 data-content payload
}

// 1. Fetch latest updates/popular from homepage
export async function getOngoingAnime(page: number = 1): Promise<OtakuAnimeCard[]> {
  try {
    const url = page > 1 ? `${OTAKUDESU_BASE}/ongoing-anime/page/${page}/` : `${OTAKUDESU_BASE}/ongoing-anime/`;
    const res = await fetchWithProxy(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const list: OtakuAnimeCard[] = [];

    // Select ongoing anime cards from page layout
    $(".venutama .detpost").each((_, div) => {
      const a = $(div).find("a");
      const title = $(div).find(".jdlflm").text().trim();
      const image = $(div).find("img").attr("src") || "";
      const url = a.attr("href") || "";
      const slug = url.split("/").filter(Boolean).pop() || "";
      const episodes = $(div).find(".epz").text().trim();
      const releaseDay = $(div).find(".epztipe").text().trim();
      
      list.push({
        title,
        image,
        slug,
        url,
        status: "Ongoing",
        episodes,
        rating: releaseDay || "N/A"
      });
    });

    return list;
  } catch (error) {
    console.error("Error scraping ongoing:", error);
    return [];
  }
}

// Fetch complete anime list
export async function getCompleteAnime(page: number = 1): Promise<OtakuAnimeCard[]> {
  try {
    const url = page > 1 ? `${OTAKUDESU_BASE}/complete-anime/page/${page}/` : `${OTAKUDESU_BASE}/complete-anime/`;
    const res = await fetchWithProxy(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const list: OtakuAnimeCard[] = [];

    $(".venutama .detpost").each((_, div) => {
      const a = $(div).find("a");
      const title = $(div).find(".jdlflm").text().trim();
      const image = $(div).find("img").attr("src") || "";
      const url = a.attr("href") || "";
      const slug = url.split("/").filter(Boolean).pop() || "";
      const episodes = $(div).find(".epz").text().trim();
      const rating = $(div).find(".epztipe").text().trim() || "N/A";
      
      list.push({
        title,
        image,
        slug,
        url,
        status: "Completed",
        episodes,
        rating
      });
    });

    return list;
  } catch (error) {
    console.error("Error scraping complete:", error);
    return [];
  }
}

// 2. Search anime directly on Otakudesu
export async function searchOtakuAnime(query: string): Promise<OtakuAnimeCard[]> {
  try {
    const cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const searchUrl = `${OTAKUDESU_BASE}/?s=${encodeURIComponent(cleanQuery)}&post_type=anime`;
    
    const res = await fetchWithProxy(searchUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const list: OtakuAnimeCard[] = [];

    // Parse the search result layout specifically
    $(".chivsrc li").each((_, li) => {
      const a = $(li).find("h2 a");
      const title = a.text().trim();
      const url = a.attr("href") || "";
      const slug = url.split("/").filter(Boolean).pop() || "";
      const image = $(li).find("img").attr("src") || "";

      // Extract episodes / rating status if available in meta text
      const text = $(li).text();
      const ratingMatch = text.match(/Rating\s*:\s*([\d.]+)/i);
      const rating = ratingMatch ? ratingMatch[1] : "N/A";
      
      const statusMatch = text.match(/Status\s*:\s*(\w+)/i);
      const status = statusMatch ? statusMatch[1] : "Completed";

      const epsMatch = text.match(/Episode\s*(\d+\s*–\s*\d+|\d+)/i);
      const episodes = epsMatch ? `Eps ${epsMatch[1]}` : "? Eps";

      if (url && title) {
        list.push({
          title,
          image,
          slug,
          url,
          status,
          episodes,
          rating
        });
      }
    });

    return list;
  } catch (error) {
    console.error("Error searching Otakudesu:", error);
    return [];
  }
}

// 3. Get Full detail of single Anime by slug
export async function getOtakuAnimeDetail(slug: string): Promise<OtakuAnimeDetail | null> {
  try {
    const detailUrl = `${OTAKUDESU_BASE}/anime/${slug}/`;
    const res = await fetchWithProxy(detailUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $(".infozingle p:contains('Judul')").text().replace("Judul", "").replace(":", "").trim() || $(".infoanime span:contains('Judul'), .infoanime h1, .judul").first().text().replace("Judul:", "").trim() || "";
    const synopsis = $(".sinopc p, .sinopc, .sinopsis p, .entry-content p").text().trim();
    const image = $(".fotoanime img").attr("src") || "";
    const status = $(".infozingle p:contains('Status')").text().replace("Status", "").replace(":", "").trim();
    const type = $(".infozingle p:contains('Tipe')").text().replace("Tipe", "").replace(":", "").trim();
    const score = $(".infozingle p:contains('Skor')").text().replace("Skor", "").replace(":", "").trim() || "N/A";
    const japanese = $(".infozingle p:contains('Japanese')").text().replace("Japanese", "").replace(":", "").trim();
    const producer = $(".infozingle p:contains('Produser')").text().replace("Produser", "").replace(":", "").trim();
    const duration = $(".infozingle p:contains('Durasi')").text().replace("Durasi", "").replace(":", "").trim();
    const studio = $(".infozingle p:contains('Studio')").text().replace("Studio", "").replace(":", "").trim();

    const genres: string[] = [];
    $(".infozingle p:contains('Genre') a").each((_, a) => {
      genres.push($(a).text().trim());
    });

    // 3. Extract episodes list
    const episodes: OtakuEpisode[] = [];
    const episodeUrlsTrack = new Set<string>();

    $(".episodelist ul li, .listeps ul li").each((_, li) => {
      const a = $(li).find("a");
      const epUrl = a.attr("href");
      const epTitle = a.text().trim();

      if (epUrl && !epUrl.includes("/batch/") && !epUrl.includes("/lengkap/") && !epTitle.toLowerCase().includes("batch") && !epTitle.toLowerCase().includes("lengkap")) {
        // Prevent duplicate URLs
        if (episodeUrlsTrack.has(epUrl)) return;
        episodeUrlsTrack.add(epUrl);

        let type: "regular" | "ona" | "ova" | "special" = "regular";
        let numberStr = "";
        
        const cleanTitle = epTitle.toLowerCase();
        if (cleanTitle.includes("ona") || cleanTitle.includes("twi-yaba")) {
          type = "ona";
          const match = epTitle.match(/(?:Episode|Ep|Eps)\s*(\d+)/i);
          numberStr = "ONA " + (match ? match[1] : "1");
        } else if (cleanTitle.includes("ova")) {
          type = "ova";
          const match = epTitle.match(/(?:Episode|Ep|Eps)\s*(\d+)/i);
          numberStr = "OVA " + (match ? match[1] : "1");
        } else if (cleanTitle.includes("special") || cleanTitle.includes("sp")) {
          type = "special";
          const match = epTitle.match(/(?:Episode|Ep|Eps)\s*(\d+)/i);
          numberStr = "Special " + (match ? match[1] : "1");
        } else {
          const match = epTitle.match(/(?:Episode|Ep|Eps)\s*(\d+)/i);
          numberStr = match ? match[1] : "1";
        }

        episodes.push({
          title: epTitle,
          url: epUrl,
          number: numberStr,
          type,
        });
      }
    });

    // Sort: Regular first, then ONA, OVA, Special. Each group sorted by inner episode number
    episodes.sort((a, b) => {
      const typeOrder = { regular: 1, ona: 2, ova: 3, special: 4 };
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      const numA = parseInt(a.number.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.number.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    return {
      slug,
      title,
      synopsis,
      image,
      episodes,
      genres,
      status,
      type,
      score,
      japanese,
      producer,
      duration,
      studio
    };
  } catch (error) {
    console.error("Error retrieving Otakudesu detail:", error);
    return null;
  }
}

// Scrape resolution options from the episode page
export async function getEpisodeResolutions(episodeUrl: string): Promise<OtakuResolution[]> {
  try {
    const res = await fetchWithProxy(episodeUrl, { next: { revalidate: 3600 } });
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

    const nonceRes = await fetchWithProxy(`${OTAKUDESU_BASE}/wp-admin/admin-ajax.php`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
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

    const embedRes = await fetchWithProxy(`${OTAKUDESU_BASE}/wp-admin/admin-ajax.php`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
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

export interface OtakuScheduleDay {
  day: string;
  animes: {
    title: string;
    slug: string;
    url: string;
    image?: string; // Optional image field
  }[];
}

// 4. Fetch Release Schedule from Otakudesu
export async function getReleaseSchedule(): Promise<OtakuScheduleDay[]> {
  try {
    const url = `${OTAKUDESU_BASE}/jadwal-rilis/`;
    const res = await fetchWithProxy(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const schedule: OtakuScheduleDay[] = [];

    // Helper: Map title or slug to general Otakudesu search to find image thumbnail
    // Since Otakudesu does not provide images directly on schedule page, we scrape them
    const ongoingList = await getOngoingAnime(1);

    const findImage = (slug: string) => {
      const match = ongoingList.find(o => o.slug === slug);
      if (match) return match.image;
      
      // Fallback: Generate structured path for image thumbnail if it fails (not always exact but helps)
      // Standard Otakudesu image matches slug path structure
      const formattedTitle = slug.replace("-sub-indo", "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("-");
      return `https://otakudesu.blog/wp-content/uploads/${formattedTitle}-Sub-Indo.jpg`;
    };

    $(".kglist321").each((_, div) => {
      const day = $(div).find("h2").text().trim();
      const animes: { title: string; slug: string; url: string; image?: string }[] = [];

      $(div).find("ul li a").each((_, a) => {
        const title = $(a).text().trim();
        const aUrl = $(a).attr("href") || "";
        const slug = aUrl.split("/").filter(Boolean).pop() || "";
        if (title && slug) {
          animes.push({ 
            title, 
            slug, 
            url: aUrl,
            image: findImage(slug)
          });
        }
      });

      if (day && animes.length > 0) {
        schedule.push({ day, animes });
      }
    });

    return schedule;
  } catch (error) {
    console.error("Error scraping release schedule:", error);
    return [];
  }
}

export interface OtakuGenre {
  name: string;
  slug: string;
  url: string;
}

// 5. Fetch Genre List
export async function getOtakuGenres(): Promise<OtakuGenre[]> {
  try {
    const url = `${OTAKUDESU_BASE}/genre-list/`;
    const res = await fetchWithProxy(url, { next: { revalidate: 86400 } }); // Cache genre list for 24h
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const genres: OtakuGenre[] = [];

    $(".genres li a, ul.genres li a").each((_, a) => {
      const name = $(a).text().trim();
      const aUrl = $(a).attr("href") || "";
      const slug = aUrl.split("/").filter(Boolean).pop() || "";
      
      if (name && slug) {
        genres.push({ name, slug, url: aUrl });
      }
    });

    return genres;
  } catch (error) {
    console.error("Error scraping genres:", error);
    return [];
  }
}

// 6. Fetch Anime List by Genre (with optional pagination support)
export async function getAnimeByGenre(genreSlug: string, page: number = 1): Promise<OtakuAnimeCard[]> {
  try {
    const url = page > 1 
      ? `${OTAKUDESU_BASE}/genres/${genreSlug}/page/${page}/`
      : `${OTAKUDESU_BASE}/genres/${genreSlug}/`;

    const res = await fetchWithProxy(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const list: OtakuAnimeCard[] = [];

    $(".col-anime-con").each((_, div) => {
      const a = $(div).find(".col-anime-title a");
      const title = a.text().trim();
      const aUrl = a.attr("href") || "";
      const slug = aUrl.split("/").filter(Boolean).pop() || "";
      const image = $(div).find(".col-anime-cover img").attr("src") || "";
      const rating = $(div).find(".col-anime-rating").text().trim() || "N/A";
      const episodes = $(div).find(".col-anime-eps").text().trim() || "? Eps";
      const status = $(div).find(".col-anime-genre").text().includes("Completed") ? "Completed" : "Ongoing";

      if (title && slug) {
        list.push({
          title,
          image,
          slug,
          url: aUrl,
          status,
          episodes,
          rating
        });
      }
    });

    return list;
  } catch (error) {
    console.error(`Error scraping anime from genre ${genreSlug}:`, error);
    return [];
  }
}

export interface OtakuAlphabetGroup {
  letter: string;
  animes: {
    title: string;
    slug: string;
    url: string;
  }[];
}

// 7. Fetch All Anime List (Alphabetical Groups)
export async function getAnimeList(): Promise<OtakuAlphabetGroup[]> {
  try {
    const url = `${OTAKUDESU_BASE}/anime-list/`;
    const res = await fetchWithProxy(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const groups: OtakuAlphabetGroup[] = [];

    // Otakudesu anime-list structure:
    // .bariskelom has letter index in .barispenz a, and items in .jdlbar ul li a.hodebgst
    if ($(".bariskelom").length > 0) {
      $(".bariskelom").each((_, div) => {
        const letter = $(div).find(".barispenz a").text().trim().toUpperCase();
        const animes: { title: string; slug: string; url: string }[] = [];

        $(div).find(".jdlbar ul li a.hodebgst").each((_, a) => {
          const title = $(a).text().trim();
          const href = $(a).attr("href") || "";
          const slug = href.split("/").filter(Boolean).pop() || "";
          if (title && slug) {
            animes.push({ title, slug, url: href });
          }
        });

        if (letter && animes.length > 0) {
          groups.push({ letter, animes });
        }
      });
    } else {
      // Fallback selector
      $("#abtext .baris").each((_, div) => {
        const letter = $(div).find(".huruf").text().trim().toUpperCase();
        const animes: { title: string; slug: string; url: string }[] = [];

        $(div).find("a").each((_, a) => {
          const title = $(a).text().trim();
          const href = $(a).attr("href") || "";
          const slug = href.split("/").filter(Boolean).pop() || "";
          if (title && slug) {
            animes.push({ title, slug, url: href });
          }
        });

        if (letter && animes.length > 0) {
          groups.push({ letter, animes });
        }
      });
    }

    return groups;
  } catch (error) {
    console.error("Error scraping anime list:", error);
    return [];
  }
}
