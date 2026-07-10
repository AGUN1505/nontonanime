import Link from "next/link";
import { getTopAnime, searchAnime } from "@/services/jikan";
import { Play, Star, TrendingUp, Search } from "lucide-react";

interface HomeProps {
  searchParams: {
    q?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const query = searchParams.q || "";
  
  // Fetch data on server
  const featuredList = await getTopAnime();
  const animeList = query ? await searchAnime(query) : featuredList;
  const trendingList = featuredList.slice(0, 5);
  
  const featured = featuredList[0] || null;

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
            <Link href="/genres" className="hover:text-zinc-100 transition">Genres</Link>
            <Link href="/new" className="hover:text-zinc-100 transition">New</Link>
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

      {/* Hero Banner (Only show when not searching) */}
      {!query && featured && (
        <section className="relative w-full h-[50vh] md:h-[65vh] flex items-end px-6 md:px-12 pb-10 bg-zinc-950">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40" 
            style={{ backgroundImage: `url(${featured.images.jpg.large_image_url})` }}
          />
          <div className="relative z-20 max-w-2xl flex flex-col gap-4">
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded w-fit">
              FEATURED
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight line-clamp-2">
              {featured.title}
            </h1>
            <p className="text-sm md:text-base text-zinc-300 line-clamp-3">
              {featured.synopsis}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-zinc-400">
              <span className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star className="size-4 fill-yellow-500" /> {featured.score || "N/A"}
              </span>
              <span>•</span>
              <span>{featured.type}</span>
              <span>•</span>
              <span>{featured.episodes || "?"} Episodes</span>
              <span>•</span>
              <span className="text-emerald-500">{featured.status}</span>
            </div>
            <Link 
              href={`/watch/${featured.mal_id}`} 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg w-fit transition shadow-lg shadow-red-600/20"
            >
              <Play className="size-5 fill-white" /> Detail Anime
            </Link>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Popular list / Search results */}
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {query ? `Hasil Pencarian: "${query}"` : "Rekomendasi Anime"}
            </h2>
          </div>

          {animeList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {animeList.map((anime) => (
                <Link 
                  key={anime.mal_id} 
                  href={`/watch/${anime.mal_id}`}
                  className="group flex flex-col gap-2 relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={anime.images.jpg.large_image_url || anime.images.jpg.image_url} 
                      alt={anime.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-zinc-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-yellow-500 flex items-center gap-0.5">
                      <Star className="size-3 fill-yellow-500" /> {anime.score || "N/A"}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {anime.type}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-red-500 transition">
                      {anime.title}
                    </h3>
                    <span className="text-[11px] text-zinc-500">{anime.episodes || "?"} Episodes</span>
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
        </section>

        {/* Right: Sidebar trending */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <TrendingUp className="text-red-500 size-5" />
            <h2 className="text-lg font-bold tracking-tight">Trending Teratas</h2>
          </div>
          <div className="flex flex-col gap-4">
            {trendingList.map((anime, index) => (
              <Link 
                key={anime.mal_id}
                href={`/watch/${anime.mal_id}`}
                className="flex gap-3 group items-center"
              >
                <div className="text-2xl font-black text-zinc-700 group-hover:text-red-500 w-6 text-center transition">
                  {index + 1}
                </div>
                <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={anime.images.jpg.image_url} 
                    alt={anime.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-red-500 transition text-zinc-200">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {anime.genres.length > 0 && (
                      <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {anime.genres[0].name}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-500 flex items-center gap-0.5">
                      <Star className="size-3 fill-yellow-500 text-yellow-500" /> {anime.score || "N/A"}
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
