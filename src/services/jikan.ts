export interface JikanAnime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score: number;
  type: string;
  episodes: number | null;
  status: string;
  genres: Array<{ name: string }>;
  synopsis: string;
  background: string | null;
  trailer: {
    youtube_id: string | null;
    embed_url: string | null;
  };
}

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// Helper to handle Jikan API rate limit (delay between requests if needed, but simple fetch is usually fine)
async function fetchJikan(endpoint: string) {
  const res = await fetch(`${JIKAN_BASE_URL}${endpoint}`, {
    next: { revalidate: 3600 }, // Cache results for 1 hour
  });

  if (!res.ok) {
    if (res.status === 429) {
      // Rate limited
      throw new Error("Jikan API rate limit exceeded. Please try again in a moment.");
    }
    throw new Error(`Failed to fetch Jikan API: ${res.statusText}`);
  }

  return res.json();
}

export async function getTopAnime(): Promise<JikanAnime[]> {
  try {
    const data = await fetchJikan("/top/anime?limit=12");
    return data.data || [];
  } catch (error) {
    console.error("Error fetching top anime:", error);
    return [];
  }
}

export async function searchAnime(query: string): Promise<JikanAnime[]> {
  try {
    const data = await fetchJikan(`/anime?q=${encodeURIComponent(query)}&limit=12`);
    return data.data || [];
  } catch (error) {
    console.error("Error searching anime:", error);
    return [];
  }
}

export async function getAnimeById(id: string): Promise<JikanAnime | null> {
  try {
    const data = await fetchJikan(`/anime/${id}`);
    return data.data || null;
  } catch (error) {
    console.error(`Error fetching anime with ID ${id}:`, error);
    return null;
  }
}
