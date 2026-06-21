'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Search, Sparkles, Link as LinkIcon } from 'lucide-react'

const suggestions = [
  'movie where dreams inside dreams happen',
  'sad sci-fi movie with emotional ending',
  'villain wins movie',
  'futuristic action movie',
  'psychological thriller',
]

export default function AISearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    router.push(`/discover?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (youtubeUrl.trim()) {
      router.push(`/discover?yt=${encodeURIComponent(youtubeUrl)}`)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-red-600 animate-pulse" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white">AI Movie Search</h1>
          </div>
          <p className="text-gray-400 text-lg">Describe any movie, plot, scene, or vibe you&apos;re looking for</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Search Section */}
          <div className="lg:col-span-2">
            {/* AI Search Box */}
            <div className="bg-gradient-to-r from-red-600/10 to-purple-600/10 border border-red-600/20 rounded-lg p-6 mb-8">
              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleSearch(query)
                }}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Describe any movie, plot, scene, or vibe…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </form>

              {/* Suggestions */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Try these searches</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleSearch(suggestion)}
                      className="text-left text-sm text-gray-400 bg-gray-900/50 hover:bg-gray-800 p-2 rounded border border-gray-800 hover:border-red-600/50 transition truncate"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* YouTube URL Input */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-white">Link Movie Trailer</h3>
              </div>

              <form onSubmit={handleYoutubeSubmit}>
                <input
                  type="url"
                  placeholder="Paste YouTube URL..."
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 mb-3"
                />
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
                >
                  Analyze & Redirect
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
