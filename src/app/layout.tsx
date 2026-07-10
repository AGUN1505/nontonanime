import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NontonAnime - Streaming Anime Sub Indo Terlengkap",
  description: "Website streaming nonton anime online sub indo gratis terbaru dan terlengkap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-50 min-h-screen">{children}</body>
    </html>
  );
}
