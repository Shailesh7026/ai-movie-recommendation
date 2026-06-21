'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import MovieCard from '@/components/movie-card'
import { genres, Movie } from '@/lib/mock-data'
import { Play, Sparkles, ChevronRight, Loader } from 'lucide-react'

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null)
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true)
        const res = await fetch('/api/movies')
        if (!res.ok) throw new Error('Failed to fetch movies')
        const data = await res.json()
        setFeaturedMovie(data.featured)
        setTrendingMovies(data.trending || [])
        setPopularMovies(data.popular || [])
        setTopRatedMovies(data.topRated || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadMovies()
  }, [])

  const filterByGenre = (moviesList: Movie[]) => {
    if (!selectedGenre) return moviesList
    return moviesList.filter(movie => movie.genres.includes(selectedGenre))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader className="h-12 w-12 text-red-600 animate-spin" />
          <p className="mt-4 text-gray-400 font-semibold animate-pulse">Loading movies...</p>
        </div>
      </div>
    )
  }

  if (!featuredMovie) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <p className="text-gray-400 text-lg mb-4">No movies available. Please check your API key configuration.</p>
        </div>
      </div>
    )
  }

  const filteredTrending = filterByGenre(trendingMovies)
  const filteredPopular = filterByGenre(popularMovies)
  const filteredTopRated = filterByGenre(topRatedMovies)

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-96 sm:h-screen overflow-hidden">
        <Image
          src={featuredMovie.backdrop}
          alt={featuredMovie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-start justify-center px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4">{featuredMovie.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded">
                <span className="text-lg font-bold text-yellow-500">{featuredMovie.rating}</span>
                <span className="text-sm text-yellow-400">/10</span>
              </div>
              <span className="text-gray-400">{featuredMovie.year}</span>
              <span className="text-gray-400">{featuredMovie.runtime} min</span>
            </div>

            <p className="text-gray-300 text-lg mb-8 line-clamp-3">{featuredMovie.overview}</p>

            <div className="flex gap-4">
              {featuredMovie.youtubeUrl && (
                <a
                  href={featuredMovie.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded transition"
                >
                  <Play className="h-5 w-5" />
                  Watch Trailer
                </a>
              )}
              <Link
                href={`/movie/${featuredMovie.id}`}
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-3 rounded transition"
              >
                Explore
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* AI Search CTA */}
        <section className="mb-20 bg-gradient-to-r from-red-600/10 to-purple-600/10 border border-red-600/20 rounded-lg p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-red-600" />
            <h2 className="text-3xl font-bold text-white">Try AI Movie Search</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Describe any movie, plot, or vibe and let AI find the perfect match for you.
          </p>
          <Link
            href="/ai-search"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded transition"
          >
            Search with AI
            <Sparkles className="h-5 w-5" />
          </Link>
        </section>

        {/* Genre Chips */}
        <section className="mb-16">
          <h3 className="text-xl font-bold text-white mb-4">Browse by Genre</h3>
          <div className="flex flex-wrap gap-3">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  selectedGenre === genre
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        {/* Trending Movies */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Trending Now</h2>
            <Link href="/discover" className="text-red-600 hover:text-red-500 font-semibold flex items-center gap-2">
              View All <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredTrending.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Popular Movies */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Popular</h2>
            <Link href="/discover" className="text-red-600 hover:text-red-500 font-semibold flex items-center gap-2">
              View All <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredPopular.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Top Rated Movies */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Top Rated</h2>
            <Link href="/discover" className="text-red-600 hover:text-red-500 font-semibold flex items-center gap-2">
              View All <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredTopRated.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
