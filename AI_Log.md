# AI_LOG.md

## Tools Used

* **ChatGPT** — Used for brainstorming architecture, feature planning, roadmap creation, and prompt engineering.
* **v0** — Used for generating frontend UI components and layouts using prompts.
* **Gemini API** — Planned for AI-powered semantic movie search (plot-based, vibe-based, and scene-based search).
* **OMDB API** — Planned as the main movie data source for movie details, trending, popular, and search functionality.

---

## Best Prompts

### Prompt 1 — UI Generation

Build a modern responsive React movie discovery web app UI using React + Tailwind CSS only. Focus ONLY on frontend UI, use mock JSON data, and create pages for Home, Discover, Movie Details, and AI Search.

**Why it worked:**
This prompt clearly restricted the AI to frontend-only development, preventing unnecessary backend or API implementation.

---

### Prompt 2 — AI Search Architecture

Create a roadmap for a React-based movie discovery app using TMDB and Gemini APIs. Explain how to implement AI-powered movie search by plot, social media descriptions, or story descriptions using frontend-only architecture.

**Why it worked:**
This helped define the core project vision and structured the app into practical development phases.

---

### Prompt 3 — AI Search UI

Design an AI search interface where users can describe a movie by plot, scene, mood, or vibe. Include search suggestions, search history, and AI result cards with confidence score.

**Why it worked:**
This prompt improved the uniqueness of the project by focusing on the standout feature: semantic AI movie discovery.

---

## What I Fixed Manually

* Refined the app scope to focus on **frontend-only architecture** for the internship task.
* Removed unnecessary backend features such as authentication and server-side processing.
* Decided to use **mock data first**, then integrate TMDB later for better development flow.
* Clarified AI search input modes:

  * Text search
  * Plot/story search
  * Social media style search
  * Screenshot / video-based search (future scope)
* Identified limitations of direct Instagram Reel URL analysis and decided not to include it in the MVP.
* Improved project structure by splitting development into weekly milestones instead of building everything at once.
