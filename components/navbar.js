"use client"; // needed for interactivity
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 text-xl font-bold">
            <Link href="/">ANIMA-LIST</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link href="/home" className="hover:text-gray-300">Anime List</Link>
            <Link href="/anime" className="hover:text-gray-300">Your List</Link>
          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-gray-700">
          <Link href="/" className="block hover:text-gray-300">Home</Link>
          <Link href="/anime" className="block hover:text-gray-300">Anime</Link>
          <Link href="/about" className="block hover:text-gray-300">About</Link>
        </div>
      )}
    </nav>
  );
}
