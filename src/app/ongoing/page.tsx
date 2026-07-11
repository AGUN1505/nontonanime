import React from "react";
import Link from "next/link";
import { Star, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { getOngoingAnime } from "@/services/otakudesu";
import Navbar from "@/components/Navbar";

interface OngoingProps {
  searchParams: {
    page?: string;
  };
}

export default async function OngoingPage({ searchParams }: OngoingProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const ongoingList = await getOngoingAnime(page);

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-zinc-950 text-zinc-50">
      <Navbar />

      {/* Main Content Area */}
      <main className="px-4 md:px-12 mt-8 w-full max-w-7xl mx-auto flex-1">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-8">
          <Flame className="text-red-500 size-6 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Anime Ongoing Terbaru</h1>
        </div>

        {ongoingList.length > 0 ? (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {ongoingList.map((anime) => (
                <Link
                  key={anime.slug}
                  href={`/watch/${anime.slug}`}
                  className="group flex flex-col gap-2 relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    {anime.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={anime.image}
                        alt={anime.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 text-xs">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-zinc-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                      {anime.rating || "N/A"}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {anime.status}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-red-500 transition">
                      {anime.title}
                    </h3>
                    <span className="text-[11px] text-zinc-500">{anime.episodes}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 border-t border-zinc-900 pt-6">
              {page > 1 ? (
                <Link
                  href={`/ongoing?page=${page - 1}`}
                  className="flex items-center gap-1 px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition text-sm text-zinc-300 hover:text-zinc-100"
                >
                  <ChevronLeft className="size-4" /> Sebelumnya
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1 px-4 py-2 rounded bg-zinc-950 border border-zinc-900 text-sm text-zinc-600 cursor-not-allowed"
                >
                  <ChevronLeft className="size-4" /> Sebelumnya
                </button>
              )}

              <span className="text-sm font-semibold text-zinc-400">
                Halaman {page}
              </span>

              {ongoingList.length >= 10 ? (
                <Link
                  href={`/ongoing?page=${page + 1}`}
                  className="flex items-center gap-1 px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition text-sm text-zinc-300 hover:text-zinc-100"
                >
                  Berikutnya <ChevronRight className="size-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1 px-4 py-2 rounded bg-zinc-950 border border-zinc-900 text-sm text-zinc-600 cursor-not-allowed"
                >
                  Berikutnya <ChevronRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            Tidak ada anime ongoing yang ditemukan.
          </div>
        )}
      </main>
    </div>
  );
}
