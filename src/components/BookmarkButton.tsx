"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface BookmarkButtonProps {
  anime: {
    slug: string;
    title: string;
    image: string;
    status: string;
    episodesCount: number;
  };
}

export interface BookmarkItem {
  slug: string;
  title: string;
  image: string;
  status: string;
  episodesCount: number;
  bookmarkedAt: number;
}

export default function BookmarkButton({ anime }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookmarks");
      const bookmarks: BookmarkItem[] = stored ? JSON.parse(stored) : [];
      setIsBookmarked(bookmarks.some((item) => item.slug === anime.slug));
    } catch (e) {
      console.error(e);
    }
  }, [anime.slug]);

  const toggleBookmark = () => {
    try {
      const stored = localStorage.getItem("bookmarks");
      let bookmarks: BookmarkItem[] = stored ? JSON.parse(stored) : [];

      if (isBookmarked) {
        bookmarks = bookmarks.filter((item) => item.slug !== anime.slug);
      } else {
        const newItem: BookmarkItem = {
          ...anime,
          bookmarkedAt: Date.now(),
        };
        bookmarks.unshift(newItem);
      }

      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(!isBookmarked);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition border ${
        isBookmarked
          ? "bg-red-600 border-red-500 text-white"
          : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
      }`}
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="size-4 fill-white" />
          Tersimpan
        </>
      ) : (
        <>
          <Bookmark className="size-4" />
          Simpan Favorit
        </>
      )}
    </button>
  );
}
