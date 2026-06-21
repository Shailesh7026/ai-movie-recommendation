import { NextRequest, NextResponse } from 'next/server'
import { Movie } from '@/lib/mock-data'

const SIMILAR_BASE_MOVIES = [
  { id: 'tt1375666', title: 'Inception', genres: ['Action', 'Sci-Fi', 'Thriller'], rating: 8.8, year: 2010, poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg' },
  { id: 'tt0814155', title: 'Interstellar', genres: ['Adventure', 'Drama', 'Sci-Fi'], rating: 8.6, year: 2014, poster: 'https://m.media-amazon.com/images/M/MV5BYzdjM2E0OTEtYzFlYy00MDUzLTkyM2QtODdlMDU2NDFiNTczXkEyXkFqcGc@._V1_SX300.jpg' },
  { id: 'tt0468569', title: 'The Dark Knight', genres: ['Action', 'Crime', 'Drama'], rating: 9.0, year: 2008, poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg' },
  { id: 'tt15398776', title: 'Oppenheimer', genres: ['Biography', 'Drama', 'History'], rating: 8.4, year: 2023, poster: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGc@._V1_SX300.jpg' },
  { id: 'tt0111161', title: 'The Shawshank Redemption', genres: ['Drama'], rating: 9.3, year: 1994, poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxNzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzlhMzgzXkEyXkFqcGc@._V1_SX300.jpg' },
  { id: 'tt0068646', title: 'The Godfather', genres: ['Crime', 'Drama'], rating: 9.2, year: 1972, poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGc@._V1_SX300.jpg' },
  { id: 'tt0110912', title: 'Pulp Fiction', genres: ['Crime', 'Drama'], rating: 8.9, year: 1994, poster: 'https://m.media-amazon.com/images/M/MV5BMTkxMTA5OTAzMl5BMl5BanBnXkFtZTgwNjA5MDc3NjE@._V1_SX300.jpg' },
  { id: 'tt0109830', title: 'Forrest Gump', genres: ['Drama', 'Romance'], rating: 8.8, year: 1994, poster: 'https://m.media-amazon.com/images/M/MV5BMTgxOTY4Mjc0OF5BMl5BanBnXkFtZTcwNTAyNDk2Mw@@._V1_SX300.jpg' },
  { id: 'tt0137523', title: 'Fight Club', genres: ['Drama'], rating: 8.8, year: 1999, poster: 'https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtODk5YS00MjViLTk5Dy00ZTk2ZTRjYWQ5YzM0XkEyXkFqcGc@._V1_SX300.jpg' },
  { id: 'tt0120737', title: 'The Lord of the Rings: The Fellowship of the Ring', genres: ['Action', 'Adventure', 'Drama'], rating: 8.8, year: 2001, poster: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGc@._V1_SX300.jpg' }
]

function mapOMDbToMovie(t: any): Movie {
  const ratingVal = t.imdbRating && t.imdbRating !== 'N/A' ? parseFloat(t.imdbRating) : 0
  const yearVal = t.Year ? parseInt(t.Year) : 0
  const runtime = t.Runtime && t.Runtime !== 'N/A' ? parseInt(t.Runtime) : undefined
  const genresList = t.Genre && t.Genre !== 'N/A' ? t.Genre.split(',').map((g: string) => g.trim()) : []
  const castList = t.Actors && t.Actors !== 'N/A' ? t.Actors.split(',').map((a: string) => a.trim()) : []

  const posterUrl = t.Poster && t.Poster !== 'N/A' 
    ? t.Poster 
    : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop'

  return {
    id: t.imdbID,
    title: t.Title || 'Untitled',
    poster: posterUrl,
    backdrop: posterUrl,
    rating: ratingVal,
    year: yearVal,
    genres: genresList,
    overview: t.Plot && t.Plot !== 'N/A' ? t.Plot : '',
    runtime,
    releaseDate: t.Released && t.Released !== 'N/A' ? t.Released : undefined,
    cast: castList.length > 0 ? castList : undefined,
    youtubeUrl: undefined
  }
}

async function searchYoutubeTrailer(title: string, year: number, apiKey: string): Promise<string> {
  if (!apiKey) return ''
  try {
    const query = `${title} ${year || ''} official trailer`
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      const videoId = data.items?.[0]?.id?.videoId
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`
      }
    }
  } catch (e) {
    console.error('Failed to search YouTube trailer:', e)
  }
  return ''
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiKey = process.env.OMDB_API_KEY
  const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'OMDB_API_KEY is not configured.' }, { status: 500 })
  }

  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}&plot=full`)
    if (!res.ok) throw new Error(`OMDb details fetch failed: ${res.status}`)

    const data = await res.json()
    if (data.Response !== 'True') {
      return NextResponse.json({ error: data.Error || 'Movie not found' }, { status: 404 })
    }

    const movie = mapOMDbToMovie(data)

    // 1. Dynamic YouTube trailer fetch
    if (youtubeApiKey) {
      const trailerUrl = await searchYoutubeTrailer(movie.title, movie.year, youtubeApiKey)
      if (trailerUrl) {
        movie.youtubeUrl = trailerUrl
      }
    }

    // 2. Similar movies matching primary genre
    const similar = SIMILAR_BASE_MOVIES
      .filter(m => m.id !== id && m.genres.some(g => movie.genres.includes(g)))
      .slice(0, 6)
      .map(sm => ({
        id: sm.id,
        title: sm.title,
        poster: sm.poster,
        backdrop: sm.poster,
        rating: sm.rating,
        year: sm.year,
        genres: sm.genres,
        overview: ''
      }))

    return NextResponse.json({
      ...movie,
      similarMovies: similar
    })

  } catch (error: any) {
    console.error(`OMDb detail error for ${id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
