import Link from "next/link";
import { getOtakuGenres } from "@/services/otakudesu";
import { List, Search, ArrowRight } from "lucide-react";

export default async function GenresPage() {
  const genres = await getOtakuGenres();

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
            <Link href="/complete" className="hover:text-zinc-100 transition">Completed</Link>
            <Link href="/anime-list" className="hover:text-zinc-100 transition">Anime List</Link>
            <Link href="/schedule" className="hover:text-zinc-100 transition">Jadwal Rilis</Link>
            <Link href="/genres" className="text-zinc-100 font-semibold border-b-2 border-red-500 pb-1">Genres</Link>
          </nav>
        </div>
      </header>

      {/* Genres Main */}
      <main className="px-6 md:px-12 mt-8 w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-10">
          <List className="text-red-500 size-6" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Daftar Genre Anime</h1>
        </div>

        {genres.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {genres.map((genre) => (
              <Link
                key={genre.slug}
                href={`/genres/${genre.slug}`}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 hover:border-red-500/30 hover:bg-zinc-900 transition group"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm md:text-base text-zinc-200 group-hover:text-red-500 transition">
                    {genre.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Jelajahi anime</span>
                </div>
                <ArrowRight className="size-4 text-zinc-600 group-hover:text-red-500 group-hover:translate-x-1 transition" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500 text-sm">
            Gagal mengambil daftar genre. Silakan coba beberapa saat lagi.
          </div>
        )}
      </main>
    </div>
  );
}
