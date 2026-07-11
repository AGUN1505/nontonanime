import React from "react";
import Link from "next/link";
import { Star, CheckCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getCompleteAnime } from "@/services/otakudesu";

interface CompleteProps {
  searchParams: {
    page?: string;
  };
}

export default async function CompletePage({ searchParams }: CompleteProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const completeList = await getCompleteAnime(page);

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-red-500 tracking-wider">
          NONTONANIME
        </Link>
        <div className="flex items-center gap-6">
          <form action="/" method="GET" className="relative hidden md:block">
            <input
              type="text"
              name="q"
              placeholder="Cari judul anime..."
              className="bg-zinc-900 border border-zinc-800 text-sm px-4 py-2 pl-10 pr-8 rounded-full w-64 focus:outline-none focus:border-red-500 text-zinc-100 placeholder-zinc-500"
            />
            <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
          </form>
          <nav className="flex items-center gap-4 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-zinc-100 transition">Home</Link>
            <Link href="/ongoing" className="hover:text-zinc-100 transition">Ongoing</Link>
            <Link href="/complete" className="text-zinc-100 font-semibold border-b-2 border-red-500 pb-1">Completed</Link>
            <Link href="/anime-list" className="hover:text-zinc-100 transition">Anime List</Link>
            <Link href="/schedule" className="hover:text-zinc-100 transition">Jadwal Rilis</Link>
            <Link href="/genres" className="hover:text-zinc-100 transition">Genres</Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-6 md:px-12 mt-8 w-full max-w-7xl mx-auto flex-1">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-8">
          <CheckCircle className="text-red-500 size-6" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Anime Tamat (Completed)</h1>
        </div>

        {completeList.length > 0 ? (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {completeList.map((anime) => (
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
                    <div className="absolute top-2 right-2 bg-zinc-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-yellow-500 flex items-center gap-0.5">
                      <Star className="size-3 fill-yellow-500" /> {anime.rating || "N/A"}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
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
                  href={`/complete?page=${page - 1}`}
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

              {completeList.length >= 10 ? (
                <Link
                  href={`/complete?page=${page + 1}`}
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
            Tidak ada anime tamat yang ditemukan.
          </div>
        )}
      </main>
    </div>
  );
}
