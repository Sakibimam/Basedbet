"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <section className="bg-black min-h-screen p-4 sm:p-6 font-mono">
      <nav className="w-full h-fit py-3 sm:py-5 bg-black/50 backdrop-blur-xl border-2 border-neon-purple rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row justify-between items-center relative text-neon-blue px-4 sm:px-10 mb-6">
        <div className="flex justify-between items-center w-full sm:w-auto">
          <Link
            href={"/"}
            className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple animate-pulse cursor-pointer"
          >
            Meme Battles
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden text-neon-blue hover:text-neon-purple transition-colors duration-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } sm:flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-7 w-full sm:w-auto mt-4 sm:mt-0`}
        >
          <Link
            href={"/battles"}
            className="text-neon-green hover:text-neon-blue font-semibold transition-all duration-300 cursor-pointer text-base sm:text-lg relative group"
          >
            Battle Page
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue transition-all group-hover:w-full"></span>
          </Link>
          <Link
            href={"/profile"}
            className="text-neon-green hover:text-neon-blue font-semibold transition-all duration-300 cursor-pointer text-base sm:text-lg relative group"
          >
            Profile
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue transition-all group-hover:w-full"></span>
          </Link>
        </div>
      </nav>
      <main className="relative">
        <div className="absolute inset-0 bg-grid-neon-blue/10 animate-grid-flow pointer-events-none"></div>
        {children}
      </main>
    </section>
  );
}
