"use client"; // needed for interactivity
import { FaGithub } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import Link from 'next/link';
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
                    <div className="hidden md:flex space-x-6 items-center">
                        <Link href="/" className="hover:text-gray-300">
                            Anime List
                        </Link>
                        <Link href="/yourlist" className="hover:text-gray-300">
                            Your List
                        </Link>

                        {/* GitHub Logo and Link */}
                        <a href="https://github.com/LegendSilvia/anima-list" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                            <FaGithub size={24} />
                        </a>

                        {/* Profile Logo and Link */}
                        {/* <Link href="/profile" className="hover:text-gray-300">
                            <CgProfile size={24} />
                        </Link> */}
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
                    <Link href="/" className="block hover:text-gray-300">Anime List</Link>
                    <Link href="/yourlist" className="block hover:text-gray-300">Your List</Link>
                    <Link href="https://github.com/LegendSilvia/anima-list" className="block hover:text-gray-300">GitHub</Link>
                </div>
            )}
        </nav>
    );
}
