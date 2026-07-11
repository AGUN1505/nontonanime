"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronUp } from "lucide-react";
import { getAnimeList, OtakuAlphabetGroup } from "@/services/otakudesu";

export default function AnimeListPage() {
  const [data, setData] = useState<OtakuAlphabetGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/anime-list");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter groups & items based on search query
  const filteredData = data
    .map((group) => {
      const filteredAnimes = group.animes.filter((anime) =>
        anime.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return {
        ...group,
        animes: filteredAnimes,
      };
    })
    .filter((group) => group.animes.length > 0);

  // Available letters for navigation index header
  const letters = data.map((g) => g.letter);

  const handleLetterClick = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-red-500 tracking-wider">
          NONTONANIME
        </Link>
        <div className="flex items-center gap-6">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul anime..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-full pl-9 pr-4 py-2 text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-all"
            />
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-zinc-100 transition">Home</Link>
            <Link href="/ongoing" className="hover:text-zinc-100 transition">Ongoing</Link>
            <Link href="/complete" className="hover:text-zinc-100 transition">Completed</Link>
            <Link href="/anime-list" className="text-zinc-100 font-semibold border-b-2 border-red-500 pb-1">Anime List</Link>
            <Link href="/schedule" className="hover:text-zinc-100 transition">Jadwal Rilis</Link>
            <Link href="/genres" className="hover:text-zinc-100 transition">Genres</Link>
          </nav>
        </div>
      </header>

      <main className="px-6 md:px-12 mt-8 w-full max-w-7xl mx-auto flex-1">
        {/* Header Title */}
        <div className="flex flex-col gap-2 border-b border-zinc-900 pb-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Daftar Anime Terlengkap
          </h1>
          <p className="text-sm text-zinc-400">
            Cari dan telusuri anime favorit Anda secara berurutan abjad (A-Z).
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            Gagal memuat daftar anime. Silakan coba kembali nanti.
          </div>
        ) : (
          <>
            {/* Quick Letter Navigation bar (sticky-like, friendly design) */}
            <div className="sticky top-20 z-20 bg-zinc-950/90 backdrop-blur-md border border-zinc-900 rounded-xl p-4 mb-8 shadow-lg">
              <p className="text-xs text-zinc-400 font-semibold mb-2 uppercase tracking-wider">
                Lompat ke Huruf:
              </p>
              <div className="flex flex-wrap gap-2">
                {letters.map((letter) => {
                  const hasMatches = filteredData.some((g) => g.letter === letter);
                  return (
                    <button
                      key={letter}
                      disabled={!hasMatches}
                      onClick={() => handleLetterClick(letter)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        hasMatches
                          ? "bg-zinc-900 text-red-500 hover:bg-red-500 hover:text-white"
                          : "bg-zinc-950 text-zinc-700 cursor-not-allowed border border-zinc-900/50"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alphabet Groups List */}
            {filteredData.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                Tidak ada anime yang cocok dengan pencarian &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="space-y-12">
                {filteredData.map((group) => (
                  <div
                    key={group.letter}
                    id={`letter-${group.letter}`}
                    className="scroll-mt-36 border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-4 mb-6 border-b border-zinc-900 pb-3">
                      <span className="text-3xl font-black bg-gradient-to-br from-red-500 to-orange-500 bg-clip-text text-transparent">
                        {group.letter}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                        {group.animes.length} Anime
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {group.animes.map((anime) => (
                        <Link
                          key={anime.slug}
                          href={`/watch/${anime.slug}`}
                          className="group block p-3 rounded-lg border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900 hover:border-red-500/30 transition-all duration-300"
                        >
                          <p className="text-sm font-medium text-zinc-300 group-hover:text-red-500 line-clamp-2 transition-colors">
                            {anime.title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Scroll to Top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 focus:outline-none z-50"
          aria-label="Scroll ke atas"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
