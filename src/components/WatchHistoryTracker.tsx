"use client";

import { useEffect } from "react";

interface TrackerProps {
  anime: {
    slug: string;
    title: string;
    image: string;
  };
  episode: {
    number: string;
  } | null;
}

export interface HistoryItem {
  slug: string;
  title: string;
  image: string;
  episodeNumber: string;
  timestamp: number;
}

export default function WatchHistoryTracker({ anime, episode }: TrackerProps) {
  useEffect(() => {
    if (!anime.slug || !episode) return;

    try {
      const stored = localStorage.getItem("watch-history");
      let history: HistoryItem[] = stored ? JSON.parse(stored) : [];

      // Remove existing entry for the same anime slug to update it to the top
      history = history.filter((item) => item.slug !== anime.slug);

      const newItem: HistoryItem = {
        slug: anime.slug,
        title: anime.title,
        image: anime.image,
        episodeNumber: episode.number,
        timestamp: Date.now(),
      };

      // Push to front of history list
      history.unshift(newItem);

      // Keep only last 10 entries
      if (history.length > 10) {
        history = history.slice(0, 10);
      }

      localStorage.setItem("watch-history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to update watch history:", e);
    }
  }, [anime.slug, anime.title, anime.image, episode]);

  return null; // Silent tracker component
}
