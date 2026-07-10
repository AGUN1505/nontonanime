interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  return (
    <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-zinc-900 shadow-2xl">
      <iframe
        src={src}
        className="w-full h-full"
        allowFullScreen
        scrolling="no"
        sandbox="allow-scripts allow-pointer-lock allow-forms allow-same-origin allow-fullscreen"
      />
    </div>
  );
}
