'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Movie } from '@/lib/mock-data'
import { Star, Play } from 'lucide-react'

interface MovieCardProps {
  movie: Movie
  showDetails?: boolean
}

export default function MovieCard({ movie, showDetails = false }: MovieCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg transition duration-300">
      <Link href={`/movie/${movie.id}`}>
        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-900 sm:h-80">
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
        </div>
      </Link>

      <div className="mt-3">
        <h3 className="font-semibold text-white line-clamp-1 group-hover:text-red-600 transition">
          {movie.title}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm text-gray-300">{movie.rating}</span>
            <span className="text-sm text-gray-500">({movie.year})</span>
          </div>
        </div>

        {showDetails && (
          <>
            <div className="mt-2 flex flex-wrap gap-2">
              {movie.genres.map(genre => (
                <span key={genre} className="inline-block rounded bg-red-600/20 px-2 py-1 text-xs text-red-400">
                  {genre}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-400 line-clamp-2">{movie.overview}</p>
            <Link
              href={`/movie/${movie.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              <Play className="h-4 w-4" />
              Learn More
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
