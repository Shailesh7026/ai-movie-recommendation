export interface Movie {
  id: string
  title: string
  poster: string
  backdrop: string
  rating: number
  year: number
  genres: string[]
  overview: string
  runtime?: number
  releaseDate?: string
  cast?: string[]
  youtubeUrl?: string
  similarMovies?: Movie[]
}

export const genres = ['Action', 'Sci-Fi', 'Horror', 'Thriller', 'Romance', 'Drama', 'Comedy', 'Crime']
