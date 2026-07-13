import * as cheerio from "cheerio";

export const OTAKUDESU_BASE = "https://otakudesu-news.translate.goog";

const SUFFIX = "Link bypass Google Translate"; // just a placeholder to replace easily

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

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
  number: string;
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
  quality: string;
  mirror: string;
  content: string; // Encoded /go/ string
}

// Helper to construct translated URL with required query parameters
function getProxiedUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(path, OTAKUDESU_BASE);
  url.searchParams.set("_x_tr_sl", "auto");
  url.searchParams.set("_x_tr_tl", "id");
  url.searchParams.set("_x_tr_hl", "id");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

async function fetchHtml(url: string, init?: RequestInit): Promise<string> {
  const res = await fetch(url, {
    ...init,
    headers: { ...HEADERS, ...(init?.headers || {}) }
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

function cleanSlug(href: string): string {
  const cleanHref = href.split("?")[0];
  return cleanHref.split("/").filter(Boolean).pop() || "";
}

// Decrypt /go/ link
export function decryptGoLink(encoded: string): string {
  try {
    const reversed = encoded.split("").reverse().join("");
    let decrypted = "";
    for (let n = 0; n < reversed.length; n += 2) {
      decrypted += String.fromCharCode(parseInt(reversed.substr(n, 2), 36) - (Math.floor(n / 2) % 7 + 5));
    }
    return decodeURIComponent(decrypted);
  } catch (e) {
    console.error("Failed to decrypt go link:", e);
    return "";
  }
}

// 1. Fetch latest updates/popular from homepage
export async function getOngoingAnime(page: number = 1): Promise<OtakuAnimeCard[]> {
  try {
    const url = page > 1 
      ? getProxiedUrl(`/ongoing/page/${page}/`)
      : getProxiedUrl("/ongoing/");
    const html = await fetchHtml(url, { next: { revalidate: 1800 } });
    const $ = cheerio.load(html);
    const list: OtakuAnimeCard[] = [];

    $(".xrelated").each((_, div) => {
      const a = $(div).find("a");
      const href = a.attr("href") || "";
      const slug = cleanSlug(href);
      const title = a.find("img").attr("alt") || a.text().trim();
      const image = a.find("img").attr("src") || "";
      const episodes = $(div).find(".eplist").text().trim();
      const rating = $(div).find(".starlist").text().trim() || "N/A";
      
      if (slug) {
        list.push({
          title,
          image,
          slug,
          url: href,
          status: "Ongoing",
          episodes,
          rating
        });
      }
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
    const url = page > 1 
      ? getProxiedUrl(`/complete/page/${page}/`)
      : getProxiedUrl("/complete/");
    const html = await fetchHtml(url, { next: { revalidate: 3600 } });
    const $ = cheerio.load(html);
    const list: OtakuAnimeCard[] = [];

    $(".xrelated").each((_, div) => {
      const a = $(div).find("a");
      const href = a.attr("href") || "";
      const slug = cleanSlug(href);
      const title = a.find("img").attr("alt") || a.text().trim();
      const image = a.find("img").attr("src") || "";
      const episodes = $(div).find(".eplist").text().trim();
      const rating = $(div).find(".starlist").text().trim() || "N/A";
      
      if (slug) {
        list.push({
          title,
          image,
          slug,
          url: href,
          status: "Completed",
          episodes,
          rating
        });
      }
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
    const searchUrl = getProxiedUrl("/search/", { q: cleanQuery });
    
    const html = await fetchHtml(searchUrl, { next: { revalidate: 3600 } });
    const $ = cheerio.load(html);
    const list: OtakuAnimeCard[] = [];

    $(".xrelated").each((_, div) => {
      const a = $(div).find("a");
      const href = a.attr("href") || "";
      const slug = cleanSlug(href);
      const title = a.find("img").attr("alt") || a.text().trim();
      const image = a.find("img").attr("src") || "";
      const episodes = $(div).find(".eplist").text().trim() || "? Eps";
      const rating = $(div).find(".starlist").text().trim() || "N/A";

      if (slug) {
        list.push({
          title,
          image,
          slug,
          url: href,
          status: "Ongoing",
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
    const detailUrl = getProxiedUrl(`/${slug}/`);
    const html = await fetchHtml(detailUrl, { next: { revalidate: 3600 } });
    const $ = cheerio.load(html);

    const title = $(".infol li:contains('Judul') span").text().trim() || $(".htitle h1").text().replace("Subtitle Indonesia", "").replace("Sub Indo", "").trim();
    const synopsis = $(".sinopsis p, .sinopc p, .entry-content p").text().trim();
    const image = $(".ifc img").attr("src") || "";
    const status = $(".infol li:contains('Status') span").text().trim();
    const type = $(".infol li:contains('Tipe') span").text().trim();
    const score = $(".infol li:contains('Score') span").text().trim() || "N/A";
    const japanese = $(".infol li:contains('Japanese') span").text().trim();
    const producer = $(".infol li:contains('Produser') span").text().trim();
    const duration = $(".infol li:contains('Durasi') span").text().trim();
    const studio = $(".infol li:contains('Studio') span").text().trim();

    const genres: string[] = [];
    $(".infol li:contains('Genre') a").each((_, a) => {
      genres.push($(a).text().trim());
    });

    const episodes: OtakuEpisode[] = [];
    const episodeUrlsTrack = new Set<string>();

    $("#ctlist li").each((_, li) => {
      const a = $(li).find("a");
      const epUrl = a.attr("href") || "";
      const epTitle = a.text().trim();

      if (epUrl && !epUrl.includes("/batch/") && !epUrl.includes("/lengkap/") && !epTitle.toLowerCase().includes("batch") && !epTitle.toLowerCase().includes("lengkap")) {
        const cleanEpUrl = epUrl.split("?")[0];
        if (episodeUrlsTrack.has(cleanEpUrl)) return;
        episodeUrlsTrack.add(cleanEpUrl);

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
          url: cleanEpUrl,
          number: numberStr,
          type,
        });
      }
    });

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
    const proxiedEpUrl = getProxiedUrl(episodeUrl);
    const html = await fetchHtml(proxiedEpUrl, { next: { revalidate: 3600 } });
    const $ = cheerio.load(html);

    const resolutions: OtakuResolution[] = [];

    $(".dlist ul li").each((_, li) => {
      const qualityText = $(li).find("strong").text().trim();
      const quality = qualityText.replace(/(Mp4|MKV)\s*/i, "").trim();

      $(li).find("a").each((_, a) => {
        const mirror = $(a).text().trim();
        const href = $(a).attr("href") || "";
        
        if (href.includes("/go/")) {
          const encoded = href.split("/go/")[1];
          resolutions.push({
            quality,
            mirror,
            content: encoded
          });
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
    // Content holds the encoded /go/ slug string. Simply decrypt it locally!
    const decryptedUrl = decryptGoLink(content);
    if (!decryptedUrl) return null;

    // Convert Mega, Kraken, Acefile, etc. links directly to player/embed if necessary
    if (decryptedUrl.includes("mega.nz/file/")) {
      return decryptedUrl.replace("mega.nz/file/", "mega.nz/embed/");
    }
    if (decryptedUrl.includes("mega.nz/#!")) {
      return decryptedUrl.replace("mega.nz/#!", "mega.nz/embed/#!");
    }
    if (decryptedUrl.includes("acefile.co/f/")) {
      const match = decryptedUrl.match(/acefile\.co\/f\/(\d+)/);
      if (match) return `https://acefile.co/player/${match[1]}`;
    }
    if (decryptedUrl.includes("krakenfiles.com/view/")) {
      const match = decryptedUrl.match(/krakenfiles\.com\/view\/([^/]+)/);
      if (match) return `https://krakenfiles.com/embed-video/${match[1]}`;
    }

    return decryptedUrl;
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
    image?: string;
  }[];
}

// 4. Fetch Release Schedule from Otakudesu
export async function getReleaseSchedule(): Promise<OtakuScheduleDay[]> {
  try {
    const url = getProxiedUrl("/jadwal-rilis/");
    const html = await fetchHtml(url, { next: { revalidate: 3600 } });
    const $ = cheerio.load(html);
    const schedule: OtakuScheduleDay[] = [];

    // Helper: Map title or slug to ongoing list to find image thumbnail
    const ongoingList = await getOngoingAnime(1);

    const findImage = (slug: string) => {
      const match = ongoingList.find(o => o.slug === slug);
      if (match) return match.image;
      return "";
    };

    $(".kglist321").each((_, div) => {
      const day = $(div).find("h2").text().trim();
      const animes: { title: string; slug: string; url: string; image?: string }[] = [];

      $(div).find("ul li a").each((_, a) => {
        const title = $(a).text().trim();
        const aUrl = $(a).attr("href") || "";
        const slug = cleanSlug(aUrl);
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
    const url = getProxiedUrl("/genre-list/");
    const html = await fetchHtml(url, { next: { revalidate: 86400 } });
    const $ = cheerio.load(html);
    const genres: OtakuGenre[] = [];

    $(".genres li a, ul.genres li a").each((_, a) => {
      const name = $(a).text().trim();
      const aUrl = $(a).attr("href") || "";
      const slug = cleanSlug(aUrl);
      
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

// 6. Fetch Anime List by Genre
export async function getAnimeByGenre(genreSlug: string, page: number = 1): Promise<OtakuAnimeCard[]> {
  try {
    const url = page > 1 
      ? getProxiedUrl(`/genres/${genreSlug}/page/${page}/`)
      : getProxiedUrl(`/genres/${genreSlug}/`);

    const html = await fetchHtml(url, { next: { revalidate: 3600 } });
    const $ = cheerio.load(html);
    const list: OtakuAnimeCard[] = [];

    $(".xrelated").each((_, div) => {
      const a = $(div).find("a");
      const href = a.attr("href") || "";
      const slug = cleanSlug(href);
      const title = a.find("img").attr("alt") || a.text().trim();
      const image = a.find("img").attr("src") || "";
      const episodes = $(div).find(".eplist").text().trim() || "? Eps";
      const rating = $(div).find(".starlist").text().trim() || "N/A";

      if (slug) {
        list.push({
          title,
          image,
          slug,
          url: href,
          status: "Ongoing",
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
    const url = getProxiedUrl("/anime-list/");
    const html = await fetchHtml(url, { next: { revalidate: 86400 } });
    const $ = cheerio.load(html);
    const groups: OtakuAlphabetGroup[] = [];

    $(".maxlist").each((_, div) => {
      const letter = $(div).find("a").attr("name") || $(div).find("a").text().trim().toUpperCase();
      const animes: { title: string; slug: string; url: string }[] = [];
      
      const ul = $(div).next("ul.maxullink");
      ul.find("li div a").each((_, a) => {
        const title = $(a).text().trim();
        const href = $(a).attr("href") || "";
        const slug = cleanSlug(href);
        if (title && slug) {
          animes.push({ title, slug, url: href });
        }
      });

      if (letter && animes.length > 0) {
        groups.push({ letter, animes });
      }
    });

    return groups;
  } catch (error) {
    console.error("Error scraping anime list:", error);
    return [];
  }
}
