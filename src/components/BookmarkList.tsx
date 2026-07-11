"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Play } from "lucide-react";
import { BookmarkItem } from "./BookmarkButton";

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookmarks");
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (bookmarks.length === 0) return null;

  return (
    <section className="mb-10 border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6 border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="text-red-500 size-5 fill-red-500/20" />
          <h2 className="text-xl font-bold tracking-tight">Koleksi Favorit Anda</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {bookmarks.map((item) => (
          <Link
            key={item.slug}
            href={`/watch/${item.slug}`}
            className="group flex flex-col gap-2 relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 text-xs">
                  No Cover
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                <div className="bg-red-600 p-2 rounded-full text-white transform translate-y-2 group-hover:translate-y-0 transition duration-300">
                  <Play className="size-5 fill-white" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                {item.status}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-xs md:text-sm line-clamp-1 group-hover:text-red-500 transition text-zinc-200 leading-snug">
                {item.title}
              </h3>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {item.episodesCount} Episode
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
