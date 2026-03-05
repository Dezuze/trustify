# Trustify: The AI-Powered News Analyzer

Trustify is an intelligence-driven news platform designed to cut through media slant and give you the unfiltered truth about current global events. Rather than simply listing news articles, Trustify actively scrapes top global headlines, mathematically groups related stories together, and uses Artificial Intelligence to analyze the hidden biases behind every publication's phrasing and narrative.

## 🌟 Core Features

### 1. Dynamic Narrative Clustering
Trustify doesn't show you ten different articles about the same event scattered across a feed. Instead, the application intelligently groups articles covering the same story into unified **Clusters**. For every cluster, the AI generates a completely neutral, factual summary of the event based purely on the overlapping details across all sources.

### 2. The Interactive Bias Spectrum
Every article processed by Trustify undergoes deep linguistic analysis by Google Gemini. Trustify evaluates the headline's wording, framing, and subjective language to generate a **Bias Score** ranging from -100 (Extreme Left) to +100 (Extreme Right). These scores are plotted interactively on a beautiful, color-coded visual spectrum map, allowing you to instantly visualize the media slant of a specific event at a glance.

### 3. Automated Media Sourcing
A premium news reading experience requires high-quality imagery. When Trustify scrapes an article that is missing a header image, or if a source provides a low-resolution thumbnail, the application intercepts it and dynamically generates a relevant stock photo. It does this by feeding the AI's core event summary directly into the Unsplash API, guaranteeing that the dashboard always looks pristine and contextually relevant.

## ⚙️ How It Works Under the Hood

Trustify is built as a highly robust, server-side data pipeline running on React Router 7. 

**Phase 1: Concurrent Data Ingestion**
When the dashboard is requested, Trustify spins up 9 concurrent web scrapers targeting the top global and Indian news outlets (CNN, BBC, Fox News, NYT, NDTV, Times of India, Hindustan Times, Indian Express, and The Hindu). These scrapers utilize strict 5-second timeouts and heavily optimized `cheerio` parsers to instantly extract titles, links, and high-resolution media attributes, ignoring layout noise and tiny lazy-loaded thumbnails.

**Phase 2: Semantic Intelligence (Google Gemini)**
The raw scraped data is batched and sent to Google Gemini 2.5 Flash over a secure server connection. A meticulously crafted prompt forces the AI to cross-reference the headlines, identify overarching topics, construct the neutral event summaries, and calculate the numeric bias scores based on journalistic tone analysis.

**Phase 3: Client Presentation & Caching**
The analyzed payload is returned to the client where it is rendered using Tailwind CSS and Framer Motion for a deeply animated, editorial aesthetic. To ensure the platform remains incredibly fast and avoids exhausting API rate limits, the entire intelligent payload is cached in a V8 memory store for 15 minutes, meaning page reloads and subsequent visits are absolutely instantaneous.
