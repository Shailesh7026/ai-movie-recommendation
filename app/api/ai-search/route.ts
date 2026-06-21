import { NextRequest, NextResponse } from 'next/server'

// YouTube video ID parser
function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export async function POST(req: NextRequest) {
  const geminiApiKey = process.env.GEMINI_API_KEY
  const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.GEMINI_API_KEY

  try {
    const { prompt, youtubeUrl } = await req.json()

    let targetPrompt = prompt || ''
    let sourceInfo = 'natural language query'

    // If YouTube URL is provided, call YouTube API to get details
    if (youtubeUrl) {
      const videoId = extractYoutubeVideoId(youtubeUrl)
      if (!videoId) {
        return NextResponse.json({ error: 'Invalid YouTube URL format' }, { status: 400 })
      }

      if (!youtubeApiKey) {
        return NextResponse.json({ error: 'YOUTUBE_API_KEY is not configured.' }, { status: 400 })
      }

      const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`
      const ytRes = await fetch(ytUrl)
      if (!ytRes.ok) {
        throw new Error(`YouTube API returned status: ${ytRes.status}`)
      }
      
      const ytData = await ytRes.json()
      const item = ytData.items?.[0]
      if (!item) {
        throw new Error('Video details not found in YouTube response')
      }

      const title = item.snippet.title || ''
      const description = item.snippet.description || ''
      const tags = item.snippet.tags || []
      targetPrompt = `Identify the movie associated with this YouTube video/trailer:
Title: "${title}"
Description: "${description}"
Tags: "${tags.join(', ')}"`
      sourceInfo = `YouTube: "${title}"`
    }

    if (!targetPrompt.trim()) {
      return NextResponse.json({ error: 'Empty search prompt' }, { status: 400 })
    }

    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 400 })
    }

    // Call Gemini API using fetch
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`

    const systemPrompt = `You are a movie recommendation assistant. Based on the user's movie search query or YouTube video trailer metadata, return structured recommendation parameters.
If the input is from a YouTube trailer, analyze the title, description, and tags to find the EXACT movie matching the trailer. Place that movie title first, followed by up to 4 highly similar recommendations.
Return a JSON object that satisfies this schema:
{
  "titles": Array of up to 5 exact movie titles that match the query or trailer.
  "genres": Array of relevant genre names.
  "year": Release year as a number if specifically requested/implied, or null.
  "reasoning": A short 1-2 sentence description explaining why these recommendations fit the prompt.
}`

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser Input: ${targetPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              titles: {
                type: 'ARRAY',
                items: {
                  type: 'STRING'
                },
                description: 'Up to 5 exact movie titles that match the user description, vibe, or keywords. Provide standard, well-known movie names that TMDB can search easily.'
              },
              genres: {
                type: 'ARRAY',
                items: {
                  type: 'STRING'
                },
                description: 'Genres associated with the search, e.g. Action, Sci-Fi, Horror, Thriller, Romance, Drama, Comedy, Crime.'
              },
              year: {
                type: 'INTEGER',
                nullable: true,
                description: 'Release year if mentioned or relevant, otherwise null.'
              },
              reasoning: {
                type: 'STRING',
                description: 'A short (1-2 sentences) engaging explanation of why these movies were recommended.'
              }
            },
            required: ['titles', 'genres', 'reasoning']
          }
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API returned status: ${response.status}`)
    }

    const geminiData = await response.json()
    const contentText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!contentText) {
      throw new Error('Empty response from Gemini API')
    }

    const result = JSON.parse(contentText)
    return NextResponse.json({
      ...result,
      source: sourceInfo
    })
  } catch (error: any) {
    console.error('Error in AI search route:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
