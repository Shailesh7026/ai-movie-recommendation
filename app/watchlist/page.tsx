'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import MovieCard from '@/components/movie-card'
import { Movie } from '@/lib/mock-data'
import { BookmarkX, Loader } from 'lucide-react'
import Link from 'next/link'

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('watchlist') || '[]')
        setWatchlist(saved)
      } catch (e) {
        console.error('Failed to parse watchlist from localStorage', e)
      } finally {
        setLoading(false)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-gray-400">Movies you&apos;ve saved to watch later</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader className="h-12 w-12 text-red-600 animate-spin" />
            <p className="mt-4 text-gray-400">Loading watchlist...</p>
          </div>
        ) : watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {watchlist.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookmarkX className="h-24 w-24 text-gray-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Start adding movies to your watchlist and keep track of movies you want to watch later.
            </p>
            <Link
              href="/discover"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded transition"
            >
              Discover Movies
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
