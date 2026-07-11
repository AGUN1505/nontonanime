"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Ongoing", href: "/ongoing" },
    { name: "Completed", href: "/complete" },
    { name: "Anime List", href: "/anime-list" },
    { name: "Jadwal Rilis", href: "/schedule" },
    { name: "Genres", href: "/genres" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-red-500 tracking-wider">
          NONTONANIME
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <form action="/" method="GET" className="relative">
            <input
              type="text"
              name="q"
              placeholder="Cari judul anime..."
              className="bg-zinc-900 border border-zinc-800 text-xs px-4 py-2 pl-10 pr-8 rounded-full w-60 focus:outline-none focus:border-red-500 text-zinc-100 placeholder-zinc-500"
            />
            <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
          </form>

          <nav className="flex items-center gap-5 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 ${
                  isActive(link.href)
                    ? "text-red-500 font-semibold border-b-2 border-red-500"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-zinc-400 hover:text-zinc-100 focus:outline-none p-1"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-zinc-900 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <form action="/" method="GET" className="relative w-full">
            <input
              type="text"
              name="q"
              placeholder="Cari judul anime..."
              className="bg-zinc-900 border border-zinc-800 text-sm px-4 py-2.5 pl-10 pr-8 rounded-lg w-full focus:outline-none focus:border-red-500 text-zinc-100 placeholder-zinc-500"
            />
            <Search className="absolute left-3 top-3 size-4 text-zinc-500" />
          </form>

          <nav className="flex flex-col gap-3 pb-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "bg-red-500/10 text-red-500 font-semibold"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
