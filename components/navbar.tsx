'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film, Search, Bookmark, User } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Film className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-white">MovieAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`transition ${
                isActive('/') ? 'text-red-600 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/discover"
              className={`transition ${
                isActive('/discover') ? 'text-red-600 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Discover
            </Link>
            <Link
              href="/ai-search"
              className={`transition ${
                isActive('/ai-search') ? 'text-red-600 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              AI Search
            </Link>
            <Link
              href="/watchlist"
              className={`transition ${
                isActive('/watchlist') ? 'text-red-600 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Watchlist
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/discover" className="p-2 hover:bg-gray-900 rounded-full transition" aria-label="Search and Discover">
              <Search className="h-5 w-5 text-gray-300" />
            </Link>
            <button className="p-2 hover:bg-gray-900 rounded-full transition">
              <User className="h-5 w-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
