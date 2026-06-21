'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import MovieCard from '@/components/movie-card'
import { genres, Movie } from '@/lib/mock-data'
import { Filter, X, Sparkles, Link as LinkIcon, Loader, AlertCircle } from 'lucide-react'

function DiscoverContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'latest'>('popularity')
  const [showFilters, setShowFilters] = useState(false)

  // API States
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // AI States
  const [aiQuery, setAiQuery] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [aiReasoning, setAiReasoning] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [isAiMode, setIsAiMode] = useState(false)

  const years = Array.from({ length: 30 }, (_, i) => 2024 - i)

  // AI Vibe Search
  const handleAISearch = async (queryText: string) => {
    if (!queryText.trim()) return
    setAiLoading(true)
    setError(null)
    setAiReasoning(null)
    setIsAiMode(true)
    setLoading(true)

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: queryText })
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'AI search request failed')
      }
      const aiData = await res.json()
      setAiReasoning(aiData.reasoning)

      // Fetch details for each recommended title concurrently
      const moviePromises = (aiData.titles || []).map(async (title: string) => {
        const searchRes = await fetch(`/api/movies?type=search&query=${encodeURIComponent(title)}`)
        if (!searchRes.ok) return null
        const searchMovies = await searchRes.json()
        return searchMovies[0] || null
      })

      const fetchedMovies = (await Promise.all(moviePromises)).filter(Boolean) as Movie[]
      setMovies(fetchedMovies)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred during AI search.')
    } finally {
      setAiLoading(false)
      setLoading(false)
    }
  }

  // YouTube Trailer URL Search
  const handleYoutubeSearch = async (url: string) => {
    if (!url.trim()) return
    setAiLoading(true)
    setError(null)
    setAiReasoning(null)
    setIsAiMode(true)
    setLoading(true)

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url })
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'YouTube analyzer request failed')
      }
      const aiData = await res.json()
      setAiReasoning(aiData.reasoning)

      // Fetch TMDB details for each extracted title
      const moviePromises = (aiData.titles || []).map(async (title: string) => {
        const searchRes = await fetch(`/api/movies?type=search&query=${encodeURIComponent(title)}`)
        if (!searchRes.ok) return null
        const searchMovies = await searchRes.json()
        return searchMovies[0] || null
      })

      const fetchedMovies = (await Promise.all(moviePromises)).filter(Boolean) as Movie[]
      setMovies(fetchedMovies)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred during YouTube analysis.')
    } finally {
      setAiLoading(false)
      setLoading(false)
    }
  }

  // Standard TMDB Discover Fetch
  const loadDiscoverMovies = async (genresList: string[], yearVal: number | null, sortVal: string) => {
    setLoading(true)
    setError(null)
    setIsAiMode(false)
    setAiReasoning(null)
    try {
      const res = await fetch(
        `/api/movies?type=discover&genres=${encodeURIComponent(genresList.join(','))}&year=${yearVal || ''}&sort_by=${sortVal}`
      )
      if (!res.ok) throw new Error('Failed to load discover movies')
      const data = await res.json()
      setMovies(data || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while loading movies.')
    } finally {
      setLoading(false)
    }
  }

  // Sync Search Parameters
  useEffect(() => {
    const q = searchParams.get('q')
    const yt = searchParams.get('yt')

    if (q) {
      setAiQuery(q)
      setYoutubeUrl('')
      handleAISearch(q)
    } else if (yt) {
      setYoutubeUrl(yt)
      setAiQuery('')
      handleYoutubeSearch(yt)
    } else {
      setAiQuery('')
      setYoutubeUrl('')
      loadDiscoverMovies(selectedGenres, selectedYear, sortBy)
    }
  }, [searchParams])

  // Sync filters change (only if not currently triggered by a query param search)
  useEffect(() => {
    const q = searchParams.get('q')
    const yt = searchParams.get('yt')
    if (!q && !yt) {
      loadDiscoverMovies(selectedGenres, selectedYear, sortBy)
    }
  }, [selectedGenres, selectedYear, sortBy])

  const clearAiMode = () => {
    setAiQuery('')
    setYoutubeUrl('')
    setAiReasoning(null)
    setIsAiMode(false)
    router.push('/discover')
  }

  const toggleGenre = (genre: string) => {
    if (isAiMode) {
      setAiQuery('')
      setYoutubeUrl('')
      setAiReasoning(null)
      setIsAiMode(false)
      router.push('/discover')
    }
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const handleYearChange = (yearVal: number | null) => {
    if (isAiMode) {
      setAiQuery('')
      setYoutubeUrl('')
      setAiReasoning(null)
      setIsAiMode(false)
      router.push('/discover')
    }
    setSelectedYear(yearVal)
  }

  const handleSortChange = (sortVal: typeof sortBy) => {
    if (isAiMode) {
      setAiQuery('')
      setYoutubeUrl('')
      setAiReasoning(null)
      setIsAiMode(false)
      router.push('/discover')
    }
    setSortBy(sortVal)
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header and Search Area */}
        <div className="mb-12 max-w-4xl">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Movies</h1>
          <p className="text-gray-400 mb-8">Browse our collection of amazing movies or find the perfect movie using AI</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900/60 border border-gray-800 p-6 rounded-xl backdrop-blur">
            {/* AI Prompt Search */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-red-500 animate-pulse" />
                Search by Vibe, Plot, or Scene
              </h2>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (aiQuery.trim()) {
                    router.push(`/discover?q=${encodeURIComponent(aiQuery)}`)
                  }
                }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Describe your perfect movie..."
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  className="w-full bg-black/50 border border-gray-800 rounded-lg py-3 pl-4 pr-20 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="absolute right-2 top-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 text-white font-semibold px-4 py-1.5 rounded text-sm transition"
                >
                  {aiLoading && !youtubeUrl ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            {/* YouTube Link Analyzer */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-red-500" />
                Analyze YouTube Trailer Link
              </h2>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (youtubeUrl.trim()) {
                    router.push(`/discover?yt=${encodeURIComponent(youtubeUrl)}`)
                  }
                }}
                className="relative"
              >
                <input
                  type="url"
                  placeholder="Paste YouTube trailer URL..."
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  className="w-full bg-black/50 border border-gray-800 rounded-lg py-3 pl-4 pr-20 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="absolute right-2 top-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 text-white font-semibold px-4 py-1.5 rounded text-sm transition"
                >
                  {aiLoading && youtubeUrl ? 'Analyzing...' : 'Analyze'}
                </button>
              </form>
            </div>
          </div>

          {/* AI Reasoning Panel */}
          {aiReasoning && (
            <div className="mt-6 bg-red-600/10 border border-red-600/20 rounded-lg p-5 flex items-start gap-4 animate-fade-in">
              <Sparkles className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                  AI Recommendations
                  {searchParams.get('yt') && <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded">Trailer Analysed</span>}
                </h3>
                <p className="text-gray-300 text-sm italic leading-relaxed">{aiReasoning}</p>
              </div>
              <button
                onClick={clearAiMode}
                className="text-xs font-semibold text-red-600 hover:text-red-500 shrink-0 border border-red-600/20 rounded px-2.5 py-1 transition"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6 lg:mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Genre Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-white mb-3">Genre</h3>
                <div className="space-y-2">
                  {genres.map(genre => (
                    <label key={genre} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre)}
                        onChange={() => toggleGenre(genre)}
                        className="w-4 h-4 rounded accent-red-600"
                      />
                      <span className="text-sm text-gray-300 hover:text-white">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-white mb-3">Release Year</h3>
                <select
                  value={selectedYear || ''}
                  onChange={e => handleYearChange(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-red-600"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="font-semibold text-white mb-3">Sort By</h3>
                <div className="space-y-2">
                  {(['popularity', 'rating', 'latest'] as const).map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sort"
                        value={option}
                        checked={sortBy === option}
                        onChange={e => handleSortChange(e.target.value as typeof sortBy)}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span className="text-sm text-gray-300 hover:text-white capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedGenres.length > 0 || selectedYear) && (
                <button
                  onClick={() => {
                    setSelectedGenres([])
                    setSelectedYear(null)
                  }}
                  className="w-full mt-6 text-sm text-red-600 hover:text-red-500 font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Movie Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                {loading ? (
                  <span>Searching...</span>
                ) : (
                  <span>
                    Showing <span className="font-semibold text-white">{movies.length}</span> movies
                  </span>
                )}
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>

            {error ? (
              <div className="bg-red-600/10 border border-red-600/30 text-red-400 p-6 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-1">Search Error</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader className="h-12 w-12 text-red-600 animate-spin" />
                <p className="mt-4 text-gray-400">Loading movie results...</p>
              </div>
            ) : movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No movies found. Try clearing filters or typing a different search!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader className="h-12 w-12 text-red-600 animate-spin" />
          <p className="mt-4 text-gray-400 font-semibold animate-pulse">Loading Discover Screen...</p>
        </div>
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  )
}
