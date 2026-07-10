"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { OtakuResolution } from "@/services/otakudesu";

interface ResolutionSelectorProps {
  resolutions: OtakuResolution[];
  activeContent: string;
  animeId: string;
  episodeNumber: number;
}

export default function ResolutionSelector({
  resolutions,
  activeContent,
  animeId,
  episodeNumber,
}: ResolutionSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Group resolutions by quality (e.g. 360p, 480p, 720p)
  const grouped = resolutions.reduce((acc, curr) => {
    if (!acc[curr.quality]) acc[curr.quality] = [];
    acc[curr.quality].push(curr);
    return acc;
  }, {} as Record<string, OtakuResolution[]>);

  const handleSelect = (contentPayload: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("content", contentPayload);
    router.push(`/watch/${animeId}?${params.toString()}`);
  };

  if (resolutions.length === 0) return null;

  return (
    <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-900/20 flex flex-col gap-4">
      <h3 className="font-bold text-sm tracking-wide text-zinc-400 uppercase">Pilih Kualitas / Server</h3>
      <div className="flex flex-col gap-3">
        {Object.entries(grouped).map(([quality, mirrors]) => (
          <div key={quality} className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-500">{quality}</span>
            <div className="flex flex-wrap gap-2">
              {mirrors.map((m) => (
                <button
                  key={m.mirror + m.content}
                  onClick={() => handleSelect(m.content)}
                  className={`px-3 py-1.5 rounded text-xs font-medium border transition ${
                    activeContent === m.content
                      ? "bg-red-600 border-red-500 text-white font-bold"
                      : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                  }`}
                >
                  {m.mirror}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
