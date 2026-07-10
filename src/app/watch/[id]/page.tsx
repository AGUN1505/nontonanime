import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeById } from "@/services/jikan";
import { ChevronLeft, Star, Play, Info } from "lucide-react";

interface Props {
  params: {
    id: string;
  };
}

export default async function WatchPage({ params }: Props) {
  const anime = await getAnimeById(params.id);

  if (!anime) {
    notFound();
  }

  // Generate episodes array (Jikan does not provide direct streaming episode links, so we generate mock episode buttons based on total episodes)
  const totalEpisodes = anime.episodes || 12;
  const episodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 pb-12">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition text-sm">
          <ChevronLeft className="size-4" /> Kembali
        </Link>
        <span className="text-zinc-700">|</span>
        <h1 className="text-sm font-semibold truncate text-zinc-300">{anime.title}</h1>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-12 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Player & Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Video Player */}
          {anime.trailer.embed_url ? (
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-zinc-900">
              <iframe
                src={anime.trailer.embed_url}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title={`${anime.title} Trailer`}
              />
            </div>
          ) : (
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden flex items-center justify-center border border-zinc-900 group">
              <div className="absolute inset-0 bg-zinc-900/20 flex flex-col items-center justify-center gap-3">
                <div className="p-4 bg-red-600 rounded-full text-white cursor-pointer hover:bg-red-700 transition shadow-lg shadow-red-600/30">
                  <Play className="size-8 fill-white" />
                </div>
                <span className="text-sm text-zinc-400 font-medium">Video Player Placeholder (No Trailer Available)</span>
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
              <span>•</span>
              <span className="text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                Episode 1
              </span>
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

        {/* Right Column: Episode List */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-900/20 flex flex-col gap-4">
            <h3 className="font-bold text-lg border-b border-zinc-900 pb-2">Daftar Episode</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2 max-h-[350px] overflow-y-auto pr-1">
              {episodes.map((ep) => (
                <button
                  key={ep}
                  className={`py-3 px-2 text-center rounded text-sm font-semibold transition border ${
                    ep === 1
                      ? "bg-red-600 border-red-500 text-white font-bold"
                      : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                  }`}
                >
                  Ep {ep}
                </button>
              ))}
            </div>
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
