import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeById } from "@/services/jikan";
import { searchAndGetAnimeEpisodes, getEpisodeResolutions, getEmbedFromContent } from "@/services/otakudesu";
import dynamic from "next/dynamic";
import { ChevronLeft, Star, Info } from "lucide-react";

// Dynamically load client-side components
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
  ssr: false,
});
const ResolutionSelector = dynamic(() => import("@/components/ResolutionSelector"), {
  ssr: false,
});

interface Props {
  params: {
    id: string;
  };
  searchParams: {
    ep?: string;
    content?: string;
  };
}

export default async function WatchPage({ params, searchParams }: Props) {
  // 1. Fetch metadata from Jikan API using MAL ID
  const anime = await getAnimeById(params.id);
  if (!anime) {
    notFound();
  }

  // 2. Fetch Otakudesu anime info & episode list
  const otakAnime = await searchAndGetAnimeEpisodes(anime.title);
  const episodes = otakAnime?.episodes || [];

  // 3. Determine active episode
  const activeEpisodeNumber = searchParams.ep ? parseInt(searchParams.ep) : 1;
  const currentEpisode = episodes.find((ep) => ep.number === activeEpisodeNumber) || episodes[0] || null;

  // 4. Scrape all resolutions / mirrors for the current episode
  let resolutions: any[] = [];
  if (currentEpisode) {
    resolutions = await getEpisodeResolutions(currentEpisode.url);
  }

  // 5. Select the default quality/mirror payload if not defined in query
  // Prioritize 480p updesu/desudesu or fallback to first option
  let activeContent = searchParams.content || "";
  if (!activeContent && resolutions.length > 0) {
    const defaultOption = 
      resolutions.find(r => r.quality === "480p" && (r.mirror.includes("desu") || r.mirror.includes("up"))) || 
      resolutions[0];
    activeContent = defaultOption.content;
  }

  // 6. Resolve embed stream URL using active content token
  let streamUrl = "";
  if (currentEpisode && activeContent) {
    const resolvedUrl = await getEmbedFromContent(currentEpisode.url, activeContent);
    if (resolvedUrl) {
      streamUrl = resolvedUrl;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 pb-12">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition text-sm">
          <ChevronLeft className="size-4" /> Kembali
        </Link>
        <span className="text-zinc-700">|</span>
        <h1 className="text-sm font-semibold truncate text-zinc-300">
          {anime.title} {currentEpisode ? `- Episode ${currentEpisode.number}` : ""}
        </h1>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-12 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Player & Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Video Player */}
          {streamUrl ? (
            <VideoPlayer src={streamUrl} />
          ) : anime.trailer.embed_url ? (
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-zinc-900">
              <iframe
                src={anime.trailer.embed_url}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title={`${anime.title} Trailer`}
              />
              <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-semibold px-3 py-1 rounded backdrop-blur">
                Memutar Trailer (Link Streaming Episode Belum Tersedia)
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden flex items-center justify-center border border-zinc-900">
              <div className="flex flex-col items-center gap-3 text-zinc-500">
                <span className="text-sm font-medium">Link Streaming Tidak Tersedia untuk Episode Ini</span>
              </div>
            </div>
          )}

          {/* Anime Detail */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold tracking-tight">{anime.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-zinc-400">
              <span className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star className="size-4 fill-yellow-500" /> {anime.score || "N/A"}
              </span>
              <span>•</span>
              <span>{anime.type}</span>
              <span>•</span>
              <span className="text-emerald-500">{anime.status}</span>
              {currentEpisode && (
                <>
                  <span>•</span>
                  <span className="text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    Episode {currentEpisode.number}
                  </span>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <span 
                  key={genre.name} 
                  className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed mt-2 border-t border-zinc-900 pt-4">
              {anime.synopsis || "No synopsis available."}
            </p>
          </div>
        </div>

        {/* Right Column: Episode & Resolution Lists */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Resolution Selector Component */}
          {currentEpisode && resolutions.length > 0 && (
            <ResolutionSelector
              resolutions={resolutions}
              activeContent={activeContent}
              animeId={params.id}
              episodeNumber={currentEpisode.number}
            />
          )}

          {/* Episode Selector */}
          <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-900/20 flex flex-col gap-4">
            <h3 className="font-bold text-lg border-b border-zinc-900 pb-2">Daftar Episode</h3>
            
            {episodes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2 max-h-[350px] overflow-y-auto pr-1">
                {episodes.map((ep) => (
                  <Link
                    key={ep.url}
                    href={`/watch/${params.id}?ep=${ep.number}`}
                    className={`py-3 px-2 text-center rounded text-sm font-semibold transition border ${
                      ep.number === activeEpisodeNumber
                        ? "bg-red-600 border-red-500 text-white font-bold"
                        : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                    }`}
                  >
                    Ep {ep.number}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-sm">
                Belum ada episode yang di-scrap.
              </div>
            )}
          </div>

          {/* Quick info card */}
          <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-900/20 flex flex-col gap-3">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-zinc-400">
              <Info className="size-4" /> Informasi Tambahan
            </h3>
            <div className="flex flex-col gap-2 text-xs text-zinc-400">
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span>Total Episode:</span>
                <span className="font-semibold text-zinc-200">{anime.episodes || "?"}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span>Status:</span>
                <span className="font-semibold text-zinc-200">{anime.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe:</span>
                <span className="font-semibold text-zinc-200">{anime.type}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
