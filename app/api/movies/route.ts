import { NextRequest, NextResponse } from 'next/server'
import { Movie } from '@/lib/mock-data'

const DISCOVER_BASE_IDS = [
  'tt1375666', // Inception
  'tt0814155', // Interstellar
  'tt0468569', // The Dark Knight
  'tt15398776', // Oppenheimer
  'tt15239678', // Dune: Part Two
  'tt1630029', // Avatar: The Way of Water
  'tt0111161', // The Shawshank Redemption
  'tt0068646', // The Godfather
  'tt0110912', // Pulp Fiction
  'tt0109830', // Forrest Gump
  'tt0137523', // Fight Club
  'tt0120737', // Lord of the Rings: Fellowship of the Ring
  'tt9214904', // Gladiator II
  'tt12037194', // Furiosa: A Mad Max Saga
  'tt22022452', // Inside Out 2
  'tt16426418', // Challengers
  'tt17279496', // Civil War
  'tt0816692',  // Dear John
  'tt0120800', // Saving Private Ryan
  'tt0133093', // The Matrix
  'tt0172495', // Gladiator
  'tt0087222', // Ghostbusters
  'tt0099685', // Goodfellas
  'tt0450259', // Blood Diamond
  'tt0088763', // Back to the Future
  'tt0095016', // Die Hard
  'tt0112462', // Bad Boys
  'tt0114709', // Toy Story
  'tt0120689', // The Green Mile
  'tt0144167', // Aquaman
  'tt0812703', // Twilight
  'tt1245526', // Red
  'tt1475582', // Sherlock Holmes
  'tt2278388', // The Grand Budapest Hotel
  'tt2488496'  // Star Wars: The Force Awakens
]

const popularIds = ['tt1375666', 'tt0814155', 'tt0468569', 'tt15398776', 'tt15239678', 'tt1630029']
const topRatedIds = ['tt0111161', 'tt0068646', 'tt0110912', 'tt0109830', 'tt0137523', 'tt0120737']
const trendingIds = ['tt9214904', 'tt12037194', 'tt22022452', 'tt16426418', 'tt17279496', 'tt0816692']

// Global cache variable in the server process
let cachedBaseMovies: Movie[] = []

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

async function ensureBaseCatalog(apiKey: string) {
  if (cachedBaseMovies.length > 0) return cachedBaseMovies

  console.log('Populating OMDb base movie catalog memory cache...');
  const promises = DISCOVER_BASE_IDS.map(async (id) => {
    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}&plot=full`)
      if (res.ok) {
        const data = await res.json()
        if (data.Response === 'True') {
          return mapOMDbToMovie(data)
        }
      }
    } catch (e) {
      console.error(`Failed to fetch OMDb details for ${id}:`, e)
    }
    return null
  })

  const results = (await Promise.all(promises)).filter(Boolean) as Movie[]
  cachedBaseMovies = results
  return cachedBaseMovies
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    console.error('OMDB_API_KEY is not set in environment variables.')
    return NextResponse.json({ error: 'OMDB_API_KEY is not configured.' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const query = searchParams.get('query') || ''
  const genresParam = searchParams.get('genres') || ''
  const yearParam = searchParams.get('year') || ''
  const sortByParam = searchParams.get('sort_by') || 'popularity'

  try {
    // Search Endpoint
    if (type === 'search') {
      const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${apiKey}`
      const res = await fetch(searchUrl)
      if (!res.ok) throw new Error(`OMDb API search failed: ${res.status}`)
      
      const searchData = await res.json()
      if (searchData.Response === 'True' && searchData.Search) {
        const detailPromises = searchData.Search.slice(0, 12).map(async (item: any) => {
          try {
            const detailRes = await fetch(`https://www.omdbapi.com/?i=${item.imdbID}&apikey=${apiKey}`)
            if (detailRes.ok) {
              const detailData = await detailRes.json()
              if (detailData.Response === 'True') {
                return mapOMDbToMovie(detailData)
              }
            }
          } catch (e) {
            console.error(`Failed to fetch search result detail for ${item.imdbID}:`, e)
          }
          // Fallback search listing map
          return {
            id: item.imdbID,
            title: item.Title,
            poster: item.Poster !== 'N/A' ? item.Poster : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
            backdrop: item.Poster !== 'N/A' ? item.Poster : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=400&fit=crop',
            rating: 0,
            year: item.Year ? parseInt(item.Year) : 0,
            genres: [],
            overview: ''
          }
        })
        const detailedResults = await Promise.all(detailPromises)
        return NextResponse.json(detailedResults)
      }
      return NextResponse.json([])
    }

    // Load Catalog
    const catalog = await ensureBaseCatalog(apiKey)

    // Discover Filter Endpoint
    if (type === 'discover') {
      let filtered = [...catalog]

      if (genresParam) {
        const activeGenres = genresParam.split(',').map(g => g.trim().toLowerCase())
        filtered = filtered.filter(m => 
          activeGenres.some(g => m.genres.some(mg => mg.toLowerCase() === g))
        )
      }

      if (yearParam) {
        const yr = parseInt(yearParam)
        if (!isNaN(yr)) {
          filtered = filtered.filter(m => m.year === yr)
        }
      }

      if (sortByParam === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating)
      } else if (sortByParam === 'latest') {
        filtered.sort((a, b) => b.year - a.year)
      } else {
        // default popularity
        filtered.sort((a, b) => b.rating - a.rating)
      }

      return NextResponse.json(filtered)
    }

    // Homepage categories
    const popular = catalog.filter(m => popularIds.includes(m.id))
    const topRated = catalog.filter(m => topRatedIds.includes(m.id))
    const trending = catalog.filter(m => trendingIds.includes(m.id))
    const featured = popular[0] || catalog[0] || null

    return NextResponse.json({
      featured,
      trending,
      popular,
      topRated
    })

  } catch (error: any) {
    console.error('OMDb Movies Route Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
