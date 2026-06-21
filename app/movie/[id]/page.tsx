'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import MovieCard from '@/components/movie-card'
import { Movie } from '@/lib/mock-data'
import { Play, Bookmark, Star, Clock, Calendar, ChevronLeft, Loader } from 'lucide-react'

// Interface extension to support similar movies from backend detail route
interface MovieDetails extends Movie {
  similarMovies?: Movie[]
}

export default function MovieDetailPage() {
  const params = useParams()
  const movieId = params?.id as string

  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isWatchlisted, setIsWatchlisted] = useState(false)

  useEffect(() => {
    async function loadMovieDetails() {
      if (!movieId) return
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/movies/${movieId}`)
        if (!res.ok) throw new Error('Failed to fetch movie details')
        const data = await res.json()
        setMovie(data)

        // Sync watchlist status from localStorage
        if (typeof window !== 'undefined') {
          const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
          setIsWatchlisted(watchlist.some((m: any) => m.id === data.id.toString()))
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'An error occurred while loading movie details.')
      } finally {
        setLoading(false)
      }
    }
    loadMovieDetails()
  }, [movieId])

  const toggleWatchlist = () => {
    if (!movie) return
    if (typeof window !== 'undefined') {
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
      let updated = []
      if (isWatchlisted) {
        updated = watchlist.filter((m: any) => m.id !== movie.id)
      } else {
        const movieSummary = {
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          backdrop: movie.backdrop,
          rating: movie.rating,
          year: movie.year,
          genres: movie.genres,
          overview: movie.overview
        }
        updated = [...watchlist, movieSummary]
      }
      localStorage.setItem('watchlist', JSON.stringify(updated))
      setIsWatchlisted(!isWatchlisted)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader className="h-12 w-12 text-red-600 animate-spin" />
          <p className="mt-4 text-gray-400 font-semibold animate-pulse">Loading movie details...</p>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <p className="text-gray-400 text-xl mb-4">{error || 'Movie not found'}</p>
            <Link href="/discover" className="text-red-600 hover:text-red-500 font-semibold">
              Back to Discover
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const similarMovies = movie.similarMovies || []

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-80 sm:h-96 overflow-hidden">
        <Image
          src={movie.backdrop}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />

        <Link
          href="/discover"
          className="absolute top-20 left-6 sm:left-8 flex items-center gap-2 text-white hover:text-red-600 transition z-10"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Discover
        </Link>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <div className="relative h-80 w-full rounded-lg overflow-hidden border-4 border-gray-800 shadow-2xl">
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{movie.title}</h1>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-400">Rating</p>
                  <p className="font-bold text-white">{movie.rating}/10</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Release</p>
                  <p className="font-bold text-white">{movie.year || 'N/A'}</p>
                </div>
              </div>
              {movie.runtime && (
                <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-bold text-white">{movie.runtime} min</p>
                  </div>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">Genres</p>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => (
                  <span key={genre} className="bg-red-600/20 text-red-400 px-3 py-1 rounded font-semibold text-sm">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-sm text-gray-400 mb-2">Description</p>
              <p className="text-gray-300 text-lg leading-relaxed">{movie.overview || 'No overview available.'}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {movie.youtubeUrl && (
                <a
                  href={movie.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded transition"
                >
                  <Play className="h-5 w-5" />
                  Watch Trailer
                </a>
              )}
              <button
                onClick={toggleWatchlist}
                className={`inline-flex items-center gap-2 font-semibold px-8 py-3 rounded transition border-2 ${
                  isWatchlisted
                    ? 'bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700'
                    : 'border-gray-600 text-white hover:border-red-600'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isWatchlisted ? 'fill-white' : ''}`} />
                {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {movie.cast.map((actor, idx) => (
                <div key={idx} className="bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-white font-semibold text-sm">{actor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-6">Similar Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {similarMovies.map(similarMovie => (
                <MovieCard key={similarMovie.id} movie={similarMovie} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
