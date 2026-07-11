import Link from "next/link";
import { getReleaseSchedule } from "@/services/otakudesu";
import { Calendar, Search } from "lucide-react";
import ScheduleImage from "@/components/ScheduleImage";

export default async function SchedulePage() {
  const schedule = await getReleaseSchedule();

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
            <Link href="/schedule" className="text-zinc-100 font-semibold border-b-2 border-red-500 pb-1">Jadwal Rilis</Link>
            <Link href="/genres" className="hover:text-zinc-100 transition">Genres</Link>
          </nav>
        </div>
      </header>

      {/* Main Schedule Container */}
      <main className="px-6 md:px-12 mt-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-10">
          <Calendar className="text-red-500 size-6" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Jadwal Rilis Harian</h1>
        </div>

        {schedule.length > 0 ? (
          <div className="flex flex-col gap-12">
            {schedule.map((item) => (
              <section key={item.day} className="flex flex-col gap-6">
                {/* Day Divider Label */}
                <div className="flex items-center gap-4">
                  <h2 className="font-extrabold text-xl md:text-2xl text-red-500 min-w-[100px]">
                    Hari {item.day}
                  </h2>
                  <div className="h-px bg-zinc-900 flex-grow" />
                </div>
                
                {/* Grid List with Cards (Visualized with Cover Images) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {item.animes.map((anime) => (
                    <Link
                      key={anime.slug}
                      href={`/watch/${anime.slug}`}
                      className="group flex flex-col gap-2 relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                        <ScheduleImage src={anime.image} alt={anime.title} />
                        <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Update {item.day}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-xs md:text-sm line-clamp-2 group-hover:text-red-500 transition text-zinc-200 leading-snug">
                          {anime.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500 text-sm">
            Gagal mengambil jadwal rilis dari server Otakudesu. Silakan coba beberapa saat lagi.
          </div>
        )}
      </main>
    </div>
  );
}
