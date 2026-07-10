export interface ConsumetAnime {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate: string | null;
  subOrDub: string;
}

export interface ConsumetEpisode {
  id: string;
  number: number;
  url?: string;
  title?: string;
}

export interface ConsumetStreamSource {
  url: string;
  isM3U8: boolean;
  quality: string;
}

export interface ConsumetStream {
  headers: {
    Referer: string;
    [key: string]: string;
  };
  sources: ConsumetStreamSource[];
}

const CONSUMET_BASE_URL = "https://api.consumet.org/anime/gogoanime";

// Secondary public instance in case the main one is down
const CONSUMET_FALLBACK_URL = "https://c.delusionz.xyz/anime/gogoanime";

async function fetchFromConsumet(endpoint: string) {
  const urls = [CONSUMET_BASE_URL, CONSUMET_FALLBACK_URL];
  let error: any = null;

  for (const baseUrl of urls) {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        next: { revalidate: 1800 }, // Cache 30 minutes
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      error = e;
    }
  }
  throw error || new Error("Failed to fetch from Consumet instances.");
}

export async function searchConsumetAnime(title: string): Promise<ConsumetAnime[]> {
  try {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
      .trim();
    const data = await fetchFromConsumet(`/${encodeURIComponent(cleanTitle)}`);
    return data.results || [];
  } catch (error) {
    console.error("Error searching Consumet:", error);
    return [];
  }
}

export async function getConsumetAnimeDetails(id: string): Promise<{ episodes: ConsumetEpisode[] } | null> {
  try {
    const data = await fetchFromConsumet(`/info/${id}`);
    return data || null;
  } catch (error) {
    console.error("Error getting Consumet details:", error);
    return null;
  }
}

export async function getConsumetStream(episodeId: string): Promise<ConsumetStream | null> {
  try {
    const data = await fetchFromConsumet(`/watch/${episodeId}`);
    return data || null;
  } catch (error) {
    console.error("Error getting Consumet stream:", error);
    return null;
  }
}
