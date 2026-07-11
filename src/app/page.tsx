import Link from "next/link";
import { getOngoingAnime, getCompleteAnime, searchOtakuAnime } from "@/services/otakudesu";
import { Star, TrendingUp, Search, ChevronLeft, ChevronRight, Flame, CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";

const HeroSlider = dynamic(() => import("@/components/HeroSlider"), {
  ssr: false,
});

interface HomeProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const query = searchParams.q || "";
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  // Fetch data directly from Otakudesu scrapers
  const ongoingList = await getOngoingAnime(page);
  const completeList = page === 1 ? await getCompleteAnime(1) : [];
  
  const animeList = query ? await searchOtakuAnime(query) : [];
  
  // Scrape page 1 for recommendation highlights
  const recommendationBaseList = ongoingList.length > 0 ? ongoingList : await getOngoingAnime(1);
  const sliderSlides = recommendationBaseList.slice(0, 5); // Take top 5 for hero slider
  const trendingList = recommendationBaseList.slice(0, 5);

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
              defaultValue={query}
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
            <Link href="/genres" className="hover:text-zinc-100 transition">Genres</Link>
          </nav>
        </div>
      </header>

      {/* Input mobile search */}
      <div className="px-6 mt-4 block md:hidden">
        <form action="/" method="GET" className="relative w-full">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari judul anime..."
            className="bg-zinc-900 border border-zinc-800 text-sm px-4 py-2.5 pl-10 pr-8 rounded-lg w-full focus:outline-none focus:border-red-500 text-zinc-100 placeholder-zinc-500"
          />
          <Search className="absolute left-3 top-3 size-4 text-zinc-500" />
        </form>
      </div>

      {/* Dynamic Hero Slider (Only show when not searching and on page 1) */}
      {!query && page === 1 && sliderSlides.length > 0 && (
        <HeroSlider slides={sliderSlides} />
      )}

      {/* Main Content Area */}
      <main className="px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Popular list / Search results */}
        <section className="lg:col-span-3">
          {query ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Hasil Pencarian: &quot;{query}&quot;
                </h2>
              </div>

              {animeList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {animeList.map((anime) => (
                    <Link 
                      key={anime.slug} 
                      href={`/watch/${anime.slug}`}
                      className="group flex flex-col gap-2 relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        {anime.image ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <p className="text-lg">Anime tidak ditemukan.</p>
                  <p className="text-sm">Coba cari dengan kata kunci lain.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {/* Ongoing Section */}
              <div>
                <div className="flex items-center justify-between mb-6 border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="text-red-500 size-5 animate-pulse" />
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                      Anime Ongoing Terbaru
                    </h2>
                  </div>
                  <Link href="/ongoing" className="text-sm text-red-500 hover:underline">Lihat Semua</Link>
                </div>

                {ongoingList.length > 0 ? (
                  <div className="flex flex-col gap-10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                      {ongoingList.slice(0, 12).map((anime) => (
                        <Link 
                          key={anime.slug} 
                          href={`/watch/${anime.slug}`}
                          className="group flex flex-col gap-2 relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition"
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden">
                            {anime.image ? (
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
                  </div>
                ) : (
                  <div className="py-10 text-zinc-500">Tidak ada anime ongoing terbaru.</div>
                )}
              </div>

              {/* Complete Section */}
              {page === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-6 border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-red-500 size-5" />
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                        Anime Tamat (Completed)
                      </h2>
                    </div>
                    <Link href="/complete" className="text-sm text-red-500 hover:underline">Lihat Semua</Link>
                  </div>

                  {completeList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                      {completeList.slice(0, 12).map((anime) => (
                        <Link 
                          key={anime.slug} 
                          href={`/watch/${anime.slug}`}
                          className="group flex flex-col gap-2 relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition"
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden">
                            {anime.image ? (
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
                  ) : (
                    <div className="py-10 text-zinc-500">Tidak ada anime tamat terbaru.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right: Sidebar trending */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <TrendingUp className="text-red-500 size-5" />
            <h2 className="text-lg font-bold tracking-tight">Rekomendasi Hari Ini</h2>
          </div>
          <div className="flex flex-col gap-4">
            {trendingList.map((anime, index) => (
              <Link 
                key={anime.slug}
                href={`/watch/${anime.slug}`}
                className="flex gap-3 group items-center"
              >
                <div className="text-2xl font-black text-zinc-700 group-hover:text-red-500 w-6 text-center transition">
                  {index + 1}
                </div>
                <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                  {anime.image ? (
                    <img 
                      src={anime.image} 
                      alt={anime.title}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 text-xs">
                      No
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-red-500 transition text-zinc-200">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                      {anime.episodes}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
