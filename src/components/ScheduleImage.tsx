"use client";

interface ScheduleImageProps {
  src?: string;
  alt: string;
}

export default function ScheduleImage({ src, alt }: ScheduleImageProps) {
  const defaultFallback = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || defaultFallback}
      alt={alt}
      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).src = defaultFallback;
      }}
    />
  );
}
