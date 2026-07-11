"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { OtakuAnimeCard } from "@/services/otakudesu";

interface HeroSliderProps {
  slides: OtakuAnimeCard[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // Slide every 5 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  const activeSlide = slides[current];

  return (
    <section className="relative w-full h-[50vh] md:h-[65vh] flex items-end px-6 md:px-12 pb-10 bg-zinc-950 overflow-hidden group">
      {/* Background slide */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-700 ease-in-out scale-105" 
        style={{ backgroundImage: `url(${activeSlide.image})` }}
      />
      
      {/* Slide Content */}
      <div className="relative z-20 max-w-2xl flex flex-col gap-4">
        <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded w-fit uppercase tracking-wider">
          Rekomendasi Hari Ini
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight line-clamp-2 transition duration-500">
          {activeSlide.title}
        </h1>
        <p className="text-sm md:text-base text-zinc-300 line-clamp-2">
          Streaming update episode terbaru untuk anime {activeSlide.title}. Tonton sekarang dengan resolusi terbaik.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-zinc-400">
          <span className="flex items-center gap-1 text-yellow-500 font-bold">
            <Star className="size-4 fill-yellow-500" /> {activeSlide.rating || "N/A"}
          </span>
          <span>•</span>
          <span>{activeSlide.episodes}</span>
          <span>•</span>
          <span className="text-emerald-500">{activeSlide.status}</span>
        </div>
        <Link 
          href={`/watch/${activeSlide.slug}`} 
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg w-fit transition shadow-lg shadow-red-600/20"
        >
          <Play className="size-5 fill-white" /> Tonton Sekarang
        </Link>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-zinc-900/60 border border-zinc-800 text-white opacity-0 group-hover:opacity-100 transition hover:bg-zinc-800 focus:outline-none"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-zinc-900/60 border border-zinc-800 text-white opacity-0 group-hover:opacity-100 transition hover:bg-zinc-800 focus:outline-none"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 right-12 z-30 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`size-2 rounded-full transition-all ${
                  i === current ? "bg-red-500 w-6" : "bg-zinc-600"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
